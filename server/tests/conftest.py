import os
import sys
import uuid
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient
from dotenv import load_dotenv

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

load_dotenv()

TEST_DATABASE_URL = os.getenv("TEST_DATABASE_URL")

from app.database import Base, get_db
from app.main import app
from app import models
from app.auth_utils import hash_password

engine = create_engine(TEST_DATABASE_URL)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="session", autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def db_session():
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)

    yield session

    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture()
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture()
def test_user(db_session):
    user = models.User(
        email=f"test-{uuid.uuid4()}@example.com",
        hashed_password=hash_password("testpass123"),
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture()
def auth_headers(client, test_user):
    res = client.post("/auth/login", json={"email": test_user.email, "password": "testpass123"})
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture()
def test_profile(db_session, test_user):
    profile = models.Profile(user_id=test_user.id, name="Test Profile", is_kids=False)
    db_session.add(profile)
    db_session.commit()
    db_session.refresh(profile)
    return profile


@pytest.fixture()
def test_movie(db_session):
    movie = models.Movie(title="Test Movie for Pytest", type=models.MovieType.movie)
    db_session.add(movie)
    db_session.commit()
    db_session.refresh(movie)
    return movie