# security.py
from pwdlib import PasswordHash
from pwdlib.hashers.argon2 import Argon2Hasher
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from config import SECRET_KEY, HASH_ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES, REFRESH_TOKEN_EXPIRE_MINUTES
from fastapi.security import OAuth2PasswordBearer, HTTPBearer, HTTPAuthorizationCredentials
from app.schemas.auth import UserResponse
from fastapi import Depends, HTTPException, status
from typing import List, Callable

# Initialize the password hash context using the Argon2 algorithm.
# This context handles salt generation and hashing automatically.
password_hash = PasswordHash((Argon2Hasher(),))

# Instructs FastAPI to extract the Bearer token from the Authorization header.
# The tokenUrl specifies where the client should go to get the token (for Swagger UI).
token_auth_schema = HTTPBearer()


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


def get_current_user(token: HTTPAuthorizationCredentials = Depends(token_auth_schema)) -> UserResponse:
    """
    Dependency to validate the incoming JWT access token.
    Extracts the user identity and role, enforcing strict validation checks.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Extract the raw JWT string using the .credentials attribute
        raw_token = token.credentials
        
        # Cryptographically verify and decode the extracted string
        payload = jwt.decode(raw_token, SECRET_KEY, algorithms=[HASH_ALGORITHM])
        
        user_id: str | None = payload.get("sub")
        role: str | None = payload.get("role")
        token_type: str | None = payload.get("type")
        
        if token_type != "access":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type. Please use an access token.",
                headers={"WWW-Authenticate": "Bearer"},
            )
            
        if user_id is None or role is None:
            raise credentials_exception
            
        return UserResponse(user_id=user_id, role=role)
        
    except JWTError:
        raise credentials_exception


def require_roles(allowed_roles: List[str]) -> Callable:
    """
    Dependency factory generating a role validation closure.
    Provides functional equivalent to a callable class.
    """
    def role_checker(user: UserResponse = Depends(get_current_user)) -> UserResponse:
        """Executes request-time role validation."""
        if user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions"
            )
        return user
        
    return role_checker
