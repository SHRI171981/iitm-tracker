# security.py
from pwdlib import PasswordHash
from pwdlib.hashers.argon2 import Argon2Hasher

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