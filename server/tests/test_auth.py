def test_signup_creates_user(client):
    res = client.post("/auth/signup", json={"email": "newuser@test.com", "password": "password123"})
    assert res.status_code == 201
    data = res.json()
    assert data["email"] == "newuser@test.com"
    assert data["role"] == "user"
    assert data["subscription_plan"] == "free"


def test_signup_duplicate_email_fails(client, test_user):
    res = client.post("/auth/signup", json={"email": test_user.email, "password": "password123"})
    assert res.status_code == 400
    assert "already registered" in res.json()["detail"].lower()


def test_login_with_correct_credentials(client, test_user):
    res = client.post("/auth/login", json={"email": test_user.email, "password": "testpass123"})
    assert res.status_code == 200
    assert "access_token" in res.json()


def test_login_with_wrong_password_fails(client, test_user):
    res = client.post("/auth/login", json={"email": test_user.email, "password": "wrongpassword"})
    assert res.status_code == 401


def test_login_with_nonexistent_email_fails(client):
    res = client.post("/auth/login", json={"email": "nobody@test.com", "password": "whatever"})
    assert res.status_code == 401


def test_get_current_user(client, auth_headers, test_user):
    res = client.get("/auth/me", headers=auth_headers)
    assert res.status_code == 200
    assert res.json()["email"] == test_user.email


def test_get_current_user_without_token_fails(client):
    res = client.get("/auth/me")
    assert res.status_code == 401


def test_change_password_success(client, auth_headers):
    res = client.post(
        "/auth/change-password",
        json={"current_password": "testpass123", "new_password": "newpassword456"},
        headers=auth_headers,
    )
    assert res.status_code == 204


def test_change_password_wrong_current_fails(client, auth_headers):
    res = client.post(
        "/auth/change-password",
        json={"current_password": "wrongpassword", "new_password": "newpassword456"},
        headers=auth_headers,
    )
    assert res.status_code == 400