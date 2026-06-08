# security.py
from pwdlib import PasswordHash
from pwdlib.hashers.argon2 import Argon2Hasher
from datetime import datetime, timedelta, timezone
from jose import jwt
from config import SECRET_KEY, HASH_ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES, REFRESH_TOKEN_EXPIRE_MINUTES

# Initialize the password hash context using the Argon2 algorithm.
# This context handles salt generation and hashing automatically.
password_hash = PasswordHash((Argon2Hasher(),))

def get_password_hash(password: str) -> str:
    """
    Hashes a plaintext password using Argon2.
    """
    return password_hash.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifies a plaintext password against a stored hash.
    """
    return password_hash.verify(plain_password, hashed_password)


def create_jwt_token(data: dict, expires_delta: timedelta) -> str:
    """
    Encodes a dictionary payload into a signed JSON Web Token.
    Appends an explicit expiration (exp) claim based on the provided timedelta.
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + expires_delta
    to_encode.update({"exp": expire})
    
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=HASH_ALGORITHM)
    return encoded_jwt


def generate_auth_tokens(user_id: str | int, role: str) -> dict:
    """
    Generates an access and refresh token pair and constructs the 
    standardized client response payload.
    """
    # Define distinct expiration intervals
    access_delta = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    refresh_delta = timedelta(minutes=REFRESH_TOKEN_EXPIRE_MINUTES)

    # Construct access token with authorization scopes
    access_payload = {
        "sub": str(user_id),
        "role": role,
        "type": "access"
    }
    access_token = create_jwt_token(access_payload, access_delta)

    refresh_payload = {
        "sub": str(user_id),
        "type": "refresh"
    }
    refresh_token = create_jwt_token(refresh_payload, refresh_delta)

    # Return structured payload for client consumption
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": int(access_delta.total_seconds()),
        "user": {
            "user_id": str(user_id),
            "role": role
        }
    }
