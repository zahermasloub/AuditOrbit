import bcrypt

from app.domain.ports.password_hasher import PasswordHasher


def hash_password(plain: str) -> str:
  """Hash a password using bcrypt."""
  password_bytes = plain.encode('utf-8')
  salt = bcrypt.gensalt()
  hashed = bcrypt.hashpw(password_bytes, salt)
  return hashed.decode('utf-8')


def verify_password(plain: str, hashed: str) -> bool:
  """Verify a password against a bcrypt hash."""
  try:
    password_bytes = plain.encode('utf-8')
    hashed_bytes = hashed.encode('utf-8')
    return bcrypt.checkpw(password_bytes, hashed_bytes)
  except Exception:
    return False


class BcryptPasswordHasher(PasswordHasher):
  """Adapter that satisfies the password hashing port using bcrypt."""

  def hash(self, plaintext: str) -> str:
    return hash_password(plaintext)
