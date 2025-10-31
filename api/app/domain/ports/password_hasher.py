from typing import Protocol


class PasswordHasher(Protocol):
    """Port for password hashing services."""

    def hash(self, plaintext: str) -> str:  # pragma: no cover - interface
        raise NotImplementedError
