from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError

ph = PasswordHasher()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return ph.verify(hashed_password, plain_password)
    except (VerifyMismatchError, Exception):
        return False


def get_password_hash(password: str) -> str:
    if not validate_password(password):
        raise ValueError("Password does not meet complexity requirements. Min 8 chars, 1 upper, 1 lower, 1 digit, 1 special char.")
    return ph.hash(password)

def validate_password(password: str) -> bool:
    """
    Password Policy:
    - Min 8 characters
    - At least one uppercase
    - At least one lowercase
    - At least one digit
    - At least one special character
    """
    if len(password) < 8:
        return False
    if not any(char.isdigit() for char in password):
        return False
    if not any(char.isupper() for char in password):
        return False
    if not any(char.islower() for char in password):
        return False
    import string
    if not any(char in string.punctuation for char in password):
        return False
    return True
