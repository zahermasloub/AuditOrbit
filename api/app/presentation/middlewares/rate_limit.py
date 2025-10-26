from typing import Any

from slowapi import Limiter  # type: ignore[import]
from slowapi.util import get_remote_address  # type: ignore[import]

limiter: Any = Limiter(key_func=get_remote_address, default_limits=["200/minute"])
