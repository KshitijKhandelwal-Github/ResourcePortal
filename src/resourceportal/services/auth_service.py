import jwt
from datetime import datetime, timedelta, timezone
from pwdlib import PasswordHash
from resourceportal.config import settings
from typing import Optional

hasher = PasswordHash.recommended()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return hasher.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return hasher.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")
    return encoded_jwt

