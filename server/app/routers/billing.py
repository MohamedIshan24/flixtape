import os
import stripe
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.dependencies import get_current_user
from app.email_utils import send_payment_receipt_email, send_payment_failed_email

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

PRICE_MAP = {
    "basic": os.getenv("STRIPE_PRICE_BASIC"),
    "standard": os.getenv("STRIPE_PRICE_STANDARD"),
    "premium": os.getenv("STRIPE_PRICE_PREMIUM"),
}

router = APIRouter(prefix="/billing", tags=["billing"])


def _get_or_create_stripe_customer(user: models.User, db: Session) -> str:
    if user.stripe_customer_id:
        return user.stripe_customer_id

    customer = stripe.Customer.create(email=user.email, metadata={"user_id": str(user.id)})
    user.stripe_customer_id = customer.id
    db.commit()
    return customer.id


@router.post("/create-checkout-session", response_model=schemas.CheckoutSessionOut)
def create_checkout_session(
    payload: schemas.CheckoutSessionCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    price_id = PRICE_MAP.get(payload.plan)
    if not price_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid plan")

    customer_id = _get_or_create_stripe_customer(current_user, db)

    session = stripe.checkout.Session.create(
        customer=customer_id,
        mode="subscription",
        line_items=[{"price": price_id, "quantity": 1}],
        success_url=f"{FRONTEND_URL}/browse?subscription=success",
        cancel_url=f"{FRONTEND_URL}/browse?subscription=cancelled",
        metadata={"user_id": str(current_user.id), "plan": payload.plan},
    )
    return {"checkout_url": session.url}


@router.post("/create-portal-session", response_model=schemas.PortalSessionOut)
def create_portal_session(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if not current_user.stripe_customer_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No billing account found")

    session = stripe.billing_portal.Session.create(
        customer=current_user.stripe_customer_id,
        return_url=f"{FRONTEND_URL}/account",
    )
    return {"portal_url": session.url}


@router.post("/webhook", status_code=status.HTTP_200_OK)
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, STRIPE_WEBHOOK_SECRET)
    except (ValueError, stripe.error.SignatureVerificationError):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid webhook signature")

    event_type = event["type"]
    data = event["data"]["object"].to_dict()

    if event_type == "checkout.session.completed":
        user_id = data.get("metadata", {}).get("user_id")
        plan = data.get("metadata", {}).get("plan")
        subscription_id = data.get("subscription")
        if user_id:
            user = db.query(models.User).filter(models.User.id == user_id).first()
            if user:
                user.stripe_subscription_id = subscription_id
                user.subscription_status = "active"
                if plan in ("basic", "standard", "premium"):
                    user.subscription_plan = models.SubscriptionPlan(plan)
                db.commit()

                amount_total = data.get("amount_total")
                currency = data.get("currency", "usd").upper()
                amount_str = f"{amount_total / 100:.2f} {currency}" if amount_total else "N/A"
                send_payment_receipt_email(user.email, plan or user.subscription_plan.value, amount_str)

    elif event_type in ("customer.subscription.updated", "customer.subscription.deleted"):
        customer_id = data.get("customer")
        status_value = data.get("status")
        user = db.query(models.User).filter(models.User.stripe_customer_id == customer_id).first()
        if user:
            user.subscription_status = status_value
            if event_type == "customer.subscription.deleted" or status_value == "canceled":
                user.subscription_plan = models.SubscriptionPlan.free
                user.stripe_subscription_id = None
            db.commit()

    elif event_type == "invoice.payment_failed":
        customer_id = data.get("customer")
        user = db.query(models.User).filter(models.User.stripe_customer_id == customer_id).first()
        if user:
            send_payment_failed_email(user.email)

    return {"status": "success"}