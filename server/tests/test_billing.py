def test_checkout_invalid_plan_fails(client, auth_headers):
    res = client.post(
        "/billing/create-checkout-session",
        json={"plan": "not_a_real_plan"},
        headers=auth_headers,
    )
    assert res.status_code == 400


def test_checkout_requires_authentication(client):
    res = client.post("/billing/create-checkout-session", json={"plan": "basic"})
    assert res.status_code == 401


def test_portal_session_without_stripe_customer_fails(client, auth_headers):
    res = client.post("/billing/create-portal-session", headers=auth_headers)
    assert res.status_code == 400
    assert "no billing account" in res.json()["detail"].lower()


def test_webhook_rejects_invalid_signature(client):
    res = client.post(
        "/billing/webhook",
        data=b'{"type": "checkout.session.completed"}',
        headers={"stripe-signature": "invalid_signature"},
    )
    assert res.status_code == 400