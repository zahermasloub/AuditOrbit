FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app

RUN pip install --no-cache-dir uv pip-tools

WORKDIR /app

COPY requirements*.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

COPY app /app/app
COPY tests /app/tests
COPY alembic /app/alembic
COPY alembic.ini /app/
COPY entrypoint.sh /app/

EXPOSE 8000

CMD ["/app/entrypoint.sh"]
