import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.database import Base, get_db
from app.models.models import User, TrustedContact, Alert, LocationLog
from app.main import app

# Create in-memory SQLite database for testing
from sqlalchemy.pool import StaticPool
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="module")
def db():
    import sys
    print("METADATA TABLES REGISTERED:", list(Base.metadata.tables.keys()), file=sys.stderr)
    Base.metadata.create_all(bind=engine)
    db_session = TestingSessionLocal()
    try:
        yield db_session
    finally:
        db_session.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="module")
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c

def test_health_check(client):
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_register_and_login(client):
    # Test user registration
    user_data = {
        "name": "Jane Doe",
        "email": "jane@example.com",
        "password": "securepassword123",
        "phone": "+1234567890",
        "role": "user"
    }
    res = client.post("/api/auth/register", json=user_data)
    assert res.status_code == 200
    assert res.json()["email"] == "jane@example.com"
    
    # Test user login
    login_data = {
        "email": "jane@example.com",
        "password": "securepassword123"
    }
    res_login = client.post("/api/auth/login", json=login_data)
    assert res_login.status_code == 200
    assert "access_token" in res_login.json()
