import bcrypt


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
