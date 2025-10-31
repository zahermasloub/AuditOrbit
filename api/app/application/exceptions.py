"""Application-level exception types to decouple FastAPI handlers from domain rules."""

class ApplicationError(Exception):
    """Base error for application layer."""


class NotFoundError(ApplicationError):
    """Raised when an entity cannot be found."""


class ValidationError(ApplicationError):
    """Raised when input data is invalid for a use case."""


class ConflictError(ApplicationError):
    """Raised when a domain conflict occurs (e.g., duplicate state)."""
