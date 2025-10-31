from __future__ import annotations

import os
import pathlib
from collections.abc import Generator

import pytest
from alembic import command
from alembic.config import Config


_ROOT = pathlib.Path(__file__).resolve().parents[1]


@pytest.fixture(scope="session", autouse=True)
def apply_migrations() -> Generator[None, None, None]:
    """Ensure the database schema matches the latest Alembic revision before tests."""
    config_path = _ROOT / "alembic.ini"
    alembic_cfg = Config(str(config_path))
    alembic_cfg.set_main_option("script_location", str(_ROOT / "alembic"))

    database_url = os.getenv("DATABASE_URL")
    if database_url:
        alembic_cfg.set_main_option("sqlalchemy.url", database_url)

    command.upgrade(alembic_cfg, "head")
    yield
