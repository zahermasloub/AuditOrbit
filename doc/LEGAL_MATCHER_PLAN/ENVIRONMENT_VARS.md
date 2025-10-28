# Environment Variables – Legal Matcher and API (Docs-only)

This document lists the environment variables expected by the Legal Matcher microservice and the API integration layer. Adjust names to match your actual configuration files (see `api/app/config/settings.py`).

---

## Legal Matcher service (.env.legal-matcher)

- QDRANT_URL = http://qdrant:6333
- COLLECTION_NAME = laws_corpus
- MODEL_NAME = BAAI/bge-m3
- DEVICE = cpu
- MAX_SEQ_LENGTH = 512
- DATABASE_URL = postgresql+psycopg://audit:auditpw@db:5432/auditdb
- REDIS_URL = redis://redis:6379/0
- TOP_K = 5
- MIN_SCORE = 0.50
- STRONG_MATCH_THRESHOLD = 0.85
- MEDIUM_MATCH_THRESHOLD = 0.70

Notes
- Keep DEVICE=cpu unless you provision GPU images.
- Ensure DATABASE_URL aligns with your API’s database.
- Adjust thresholds to suit your review team’s preferences.

---

## API main (proxy/persistence)

Use the existing API settings module (e.g., `api/app/config/settings.py`). Common variables include:

- DATABASE_URL (already present in API)
- JWT/SECRET and token lifetime settings (names depend on your implementation)
- CORS_ALLOWED_ORIGINS (for local dev)
- REDIS_URL (if the API caches/proxies)
- LEGAL_MATCHER_BASE_URL = http://legal-matcher:8001

Notes
- Confirm actual variable names from your API config and `.env` files.
- If you use generated API clients on the frontend, ensure the base path matches the API gateway address.

---

## Example .env.legal-matcher template

QDRANT_URL=http://qdrant:6333
COLLECTION_NAME=laws_corpus
MODEL_NAME=BAAI/bge-m3
DEVICE=cpu
MAX_SEQ_LENGTH=512
DATABASE_URL=postgresql+psycopg://audit:auditpw@db:5432/auditdb
REDIS_URL=redis://redis:6379/0
TOP_K=5
MIN_SCORE=0.50
STRONG_MATCH_THRESHOLD=0.85
MEDIUM_MATCH_THRESHOLD=0.70
LEGAL_LOG_LEVEL=INFO
