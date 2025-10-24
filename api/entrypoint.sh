#!/usr/bin/env bash
set -euo pipefail

alembic -c alembic.ini upgrade head
exec uvicorn app.presentation.main:app --host 0.0.0.0 --port 8000
