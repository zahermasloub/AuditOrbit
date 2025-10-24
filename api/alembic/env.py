from __future__ import annotations

from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool

# Alembic Config object
config = context.config
if config.config_file_name:
  fileConfig(config.config_file_name)

# We use imperative migrations only
target_metadata = None


def run_migrations_offline() -> None:
  url = config.get_main_option("sqlalchemy.url")
  context.configure(
    url=url,
    target_metadata=target_metadata,
    literal_binds=True,
    dialect_opts={"paramstyle": "named"},
    include_object=None,
    timezone=True,
  )
  with context.begin_transaction():
    context.run_migrations()


def run_migrations_online() -> None:
  section = config.get_section(config.config_ini_section)
  if section is None:
    raise RuntimeError("Alembic config section is missing")
  connectable = engine_from_config(
    section,
    prefix="sqlalchemy.",
    poolclass=pool.NullPool,
    future=True,
  )
  with connectable.connect() as connection:
    context.configure(
      connection=connection,
      target_metadata=target_metadata,
      include_object=None,
      timezone=True,
    )
    with context.begin_transaction():
      context.run_migrations()


if context.is_offline_mode():
  run_migrations_offline()
else:
  run_migrations_online()
