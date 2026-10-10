import pytest
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.security import hash_password, verify_password, create_access_token, decode_access_token
from app.core.database import SessionLocal
from app.models.models import User

def test_password_hashing_and_verification():
    plain = "Secur3P@ssw0rd!"
    hashed = hash_password(plain)
    assert hashed != plain
    assert verify_password(plain, hashed) is True
    assert verify_password("WrongPassword!", hashed) is False

def test_jwt_token_generation_and_decoding():
    payload = {"sub": "42", "role": "teacher", "username": "dr.kavitha"}
    token = create_access_token(payload)
    assert isinstance(token, str)

    decoded = decode_access_token(token)
    assert decoded["sub"] == "42"
    assert decoded["role"] == "teacher"
    assert decoded["username"] == "dr.kavitha"

def test_seeded_users_exist():
    db = SessionLocal()
    try:
        teacher = db.query(User).filter(User.username == "dr.kavitha").first()
        student = db.query(User).filter(User.username == "arun.kumar").first()
        admin = db.query(User).filter(User.username == "admin").first()

        assert teacher is not None
        assert teacher.role == "teacher"
        assert student is not None
        assert student.role == "student"
        assert admin is not None
        assert admin.role == "admin"
    finally:
        db.close()
