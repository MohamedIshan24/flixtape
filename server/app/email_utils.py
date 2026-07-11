import os
import resend

resend.api_key = os.getenv("RESEND_API_KEY")

FROM_EMAIL = "Flixtape <onboarding@resend.dev>"


def send_welcome_email(to_email: str):
    try:
        resend.Emails.send({
            "from": FROM_EMAIL,
            "to": [to_email],
            "subject": "Welcome to Flixtape!",
            "html": """
                <div style="font-family: sans-serif; background: #000; color: #fff; padding: 24px;">
                    <h1 style="color: #dc2626;">Welcome to Flixtape</h1>
                    <p>Thanks for signing up! You're all set to start browsing movies and shows.</p>
                    <p>Enjoy your free plan, and upgrade anytime from Settings if you want more features.</p>
                </div>
            """,
        })
    except Exception as e:
        print(f"Failed to send welcome email: {e}")


def send_payment_receipt_email(to_email: str, plan: str, amount: str):
    try:
        resend.Emails.send({
            "from": FROM_EMAIL,
            "to": [to_email],
            "subject": "Your Flixtape subscription is confirmed",
            "html": f"""
                <div style="font-family: sans-serif; background: #000; color: #fff; padding: 24px;">
                    <h1 style="color: #dc2626;">Payment Confirmed</h1>
                    <p>Your <strong>{plan.capitalize()}</strong> plan subscription is now active.</p>
                    <p>Amount charged: <strong>{amount}</strong></p>
                    <p>Thanks for subscribing to Flixtape!</p>
                </div>
            """,
        })
    except Exception as e:
        print(f"Failed to send receipt email: {e}")


def send_payment_failed_email(to_email: str):
    try:
        resend.Emails.send({
            "from": FROM_EMAIL,
            "to": [to_email],
            "subject": "Flixtape payment failed",
            "html": """
                <div style="font-family: sans-serif; background: #000; color: #fff; padding: 24px;">
                    <h1 style="color: #dc2626;">Payment Failed</h1>
                    <p>We couldn't process your latest subscription payment.</p>
                    <p>Please update your payment method in Settings to keep your subscription active.</p>
                </div>
            """,
        })
    except Exception as e:
        print(f"Failed to send payment failed email: {e}")