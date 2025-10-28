# Legal Matcher Integration Plan for AuditOrbit

Date: 2025-10-28
Owner: Internal Audit Platform Team
Status: Ready for execution

---

## Executive summary

This plan describes, end to end, how to integrate a Legal Matching module into AuditOrbit to match document text with Qatari laws and regulations. The solution is privacy-preserving, fully local, and based on free open-source components. The result provides top matches with citation, URL, excerpt, and confidence, exposes a FastAPI endpoint, stores evidence, and adds a simple Next.js UI panel.

---

## Scope

In scope
- Legal Matcher microservice with FastAPI and sentence-transformers (BGE-M3)
- Vector database using Qdrant with cosine distance
- Indexing pipeline for JSONL corpus data
- Backend API integration layer and evidence persistence
- Frontend UI panel to run matches and display results
- RBAC permissions for using and reading legal matches
- Observability (logs, basic metrics), docs, and acceptance tests

Out of scope
- Proprietary or cloud services
- Full law corpus collection and cleaning
- Advanced LLM RAG generation and fine-tuning (future phase)

Constraints
- Free and open source only
- Local execution, no outbound data sharing
- Windows friendly with PowerShell examples

---

## Architecture overview

```
Frontend (Next.js)  ──────────▶  API (FastAPI main)  ──────────▶  PostgreSQL
          │                             │
          │                             ▼
          │                         Redis (cache/queue)
          │                             │
          ▼                             ▼
Legal Matcher Service (FastAPI)  ───────▶  Qdrant (vectors)
     └─ SentenceTransformers (BGE-M3)
```

Key flows
1. User submits text for matching in UI
2. API verifies RBAC and calls Legal Matcher service
3. Legal Matcher embeds text and searches Qdrant
4. Results are returned and optionally persisted to audit_evidence
5. UI displays scores, tags, links, and excerpts

---

## Components and versions

- FastAPI 0.115+
- sentence-transformers 3.2+ with BAAI/bge-m3 (CPU by default)
- qdrant-client 1.11+
- Qdrant server v1.12+
- spaCy 3.8+ (ar/en small models) for optional syntactic rules
- Redis 7 for caching
- SQLAlchemy 2.0+
- Next.js 16 + React 19

---

## Data model additions

New table audit_evidence
- id uuid (pk)
- engagement_id uuid (nullable, fk engagements.id)
- section_id text (nullable)
- doc_id text (nullable)
- law_id text (required)
- article text (required)
- url text (required)
- excerpt text (required, 300–500 chars recommended)
- score numeric(5,4)
- tag text (مطابقة قوية | مطابقة متوسطة | راجع يدويا)
- query_text text (optional)
- created_at timestamptz default now()
- created_by uuid (fk users.id, nullable)

Indexes
- ix_audit_evidence_engagement (engagement_id)
- ix_audit_evidence_score (score)
- ix_audit_evidence_created (created_at)
- ix_audit_evidence_tag (tag)

Permissions
- permissions: (legal_match, create), (legal_match, read)
- Role grant: Admin, IA Manager = create/read; Auditor = read

---

## External interfaces

Legal Matcher service
- POST /legal-match
  - request: { text: string, top_k?: number, min_score?: number, engagement_id?: uuid, section_id?: string }
  - response: { matches: [{ law_id, article, url, excerpt, score, tag }], query_text, search_time_ms, total_found }
- GET /health, GET /stats

API main (integration layer)
- POST /api/legal/match (proxy + persistence)
- GET /api/legal/evidence/{engagement_id}
- GET /api/legal/stats

Frontend
- Panel with textarea, top_k, results table with tag colors and links

---

## Acceptance criteria

- Indexing performance: index ≥ 1,000 paragraphs in ≤ 2 minutes on a mid-range dev machine
- Query latency: ≤ 600 ms for K=5 after warm start (cache improves subsequent calls)
- Human-in-the-loop accuracy: ≥ 80 percent for first 50 reviewed cases
- Privacy: local only, no external calls

---

## Work breakdown structure

Phase 0 preparation
- Validate local Docker Desktop, Python 3.11+, Node 18+
- Ensure infra/docker-compose.yml exists and is controlled

Phase 1 infrastructure
- Add Qdrant service to docker-compose
- Add legal-matcher service with ports, volumes, env
- Bind mounts for data and models cache

Phase 2 legal-matcher service
- FastAPI app with endpoints: /health, /stats, /legal-match
- Config via pydantic-settings
- Embedder class loading BGE-M3, normalize embeddings
- Qdrant client wrapper creating collection with cosine distance
- Matching engine with threshold tagging and optional Redis cache
- Indexer reading data/laws_qatar.jsonl and bulk uploading vectors

Phase 3 backend API integration
- Alembic migration for audit_evidence and RBAC grants
- Router /legal: POST /match (proxy + persistence), GET /evidence/{id}, GET /stats
- Wire router in presentation/main.py

Phase 4 frontend integration
- API client helpers (fetch) with types
- LegalMatcherPanel reusable component
- Integrate panel into an engagement detail page or a sandbox route

Phase 5 testing and validation
- Unit tests: embedder, vector search mock, tag classification
- Integration tests: API to service to Qdrant round trip
- Performance harness for indexing and search

Phase 6 documentation and handover
- README for service, ops runbook, troubleshooting
- Update docs index and quick start

---

## Detailed execution plan

Step 1 add services to docker compose

```yaml
# infra/docker-compose.yml fragments
services:
  qdrant:
    image: qdrant/qdrant:v1.12.1
    restart: unless-stopped
    ports:
      - "6333:6333"
      - "6334:6334"
    volumes:
      - qdrant-data:/qdrant/storage
    environment:
      - QDRANT__SERVICE__GRPC_PORT=6334

  legal-matcher:
    build:
      context: ../legal-matcher
      dockerfile: Dockerfile
    restart: unless-stopped
    depends_on:
      - qdrant
      - db
      - redis
    # Tip: Before running, copy doc/LEGAL_MATCHER_PLAN/.env.legal-matcher.example
    #      to doc/LEGAL_MATCHER_PLAN/.env.legal-matcher
    env_file:
      - ../doc/LEGAL_MATCHER_PLAN/.env.legal-matcher
    environment:
      - QDRANT_URL=http://qdrant:6333
      - COLLECTION_NAME=laws_corpus
      - MODEL_NAME=BAAI/bge-m3
      - DEVICE=cpu
      - MAX_SEQ_LENGTH=512
      - DATABASE_URL=postgresql+psycopg://audit:auditpw@db:5432/auditdb
      - REDIS_URL=redis://redis:6379/0
      - TOP_K=5
      - MIN_SCORE=0.5
      - STRONG_MATCH_THRESHOLD=0.85
      - MEDIUM_MATCH_THRESHOLD=0.70
    ports:
      - "8001:8001"
    volumes:
      - legal-data:/app/data
      - legal-models:/root/.cache/huggingface

volumes:
  qdrant-data:
  legal-data:
  legal-models:
```

Step 2 scaffold legal-matcher service

- Files
  - legal-matcher/Dockerfile
  - legal-matcher/requirements.txt
  - legal-matcher/config.py
  - legal-matcher/main.py
  - legal-matcher/models/schemas.py
  - legal-matcher/services/embedder.py
  - legal-matcher/services/vectorstore.py
  - legal-matcher/services/matcher.py
  - legal-matcher/services/indexer.py
  - legal-matcher/data/laws_qatar.jsonl (sample)

Dockerfile

```dockerfile
FROM python:3.11-slim
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt \
 && python -m spacy download ar_core_news_sm \
 && python -m spacy download en_core_web_sm
COPY . .
EXPOSE 8001
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001", "--workers", "2"]
```

requirements.txt

```text
fastapi==0.115.6
uvicorn[standard]==0.32.1
pydantic==2.9.2
pydantic-settings==2.6.1
qdrant-client==1.11.3
sentence-transformers==3.2.1
torch==2.5.1
transformers==4.46.3
spacy==3.8.2
redis==5.0.8
httpx==0.27.2
sqlalchemy==2.0.36
psycopg[binary]==3.2.10
python-docx==1.1.2
reportlab==4.2.5
```

Indexing corpus file format

```jsonl
{"text":"المادة (1): ...","law_id":"قانون رقم 8 لسنة 2022","article":"المادة (1)","url":"https://..."}
{"text":"المادة (2): ...","law_id":"قانون رقم 8 لسنة 2022","article":"المادة (2)","url":"https://..."}
```

Step 3 database migration and RBAC

- Create alembic version 0012_audit_evidence_legal
- Create table and indexes as defined in data model additions
- Insert permissions (legal_match, create) and (legal_match, read)
- Grant to Admin and IA Manager (both), Auditor (read)

Step 4 backend API router

- Add api/app/presentation/routers/legal.py
  - POST /legal/match: proxy to legal-matcher and persist matches if engagement_id provided
  - GET /legal/evidence/{engagement_id}
  - GET /legal/stats
- Include router in presentation/main.py

Step 5 frontend integration

- Add frontend/src/lib/api/legal-matcher.ts with
  - matchLegalText, getLegalEvidence, getLegalMatchStats
- Add frontend/src/components/legal/LegalMatcherPanel.tsx
  - textarea, search button, results list with tag colors
- Mount panel under an engagement detail page route

Tagging thresholds
- score ≥ 0.85 → مطابقة قوية
- 0.70 ≤ score < 0.85 → مطابقة متوسطة
- score < 0.70 → راجع يدويا

---

## Step by step run book (Windows PowerShell)

Bring up services

```powershell
cd D:\AuditOrbit\infra
docker compose up -d --build
```

Apply migrations

```powershell
# replace container name if different
docker exec -it auditorbit-api-1 alembic upgrade head
```

Index the corpus

```powershell
# copy your laws_qatar.jsonl under legal-matcher/data first
# then inside container
docker exec -it auditorbit-legal-matcher-1 python -m services.indexer /app/data/laws_qatar.jsonl --recreate
```

Smoke test service

```powershell
curl http://localhost:8001/health
curl http://localhost:8001/stats
```

Test match directly

```powershell
$body = @{ text = "يجب على الجهات الحكومية إنشاء وحدات للتدقيق الداخلي"; top_k = 5 } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:8001/legal-match" -Method Post -Body $body -ContentType "application/json"
```

Test API integration

```powershell
$body = @{ text = "تمت عملية شراء أجهزة بقيمة 500,000 ريال بمناقصة محدودة بمشاركة 3 موردين"; top_k = 5 } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:8000/api/legal/match" -Method Post -Body $body -ContentType "application/json"
```

Run frontend

```powershell
cd D:\AuditOrbit\frontend
npm install
npm run dev
```

---

## Testing strategy

Unit tests
- Embedder returns normalized vectors and correct dimension
- Tag classification thresholds
- Vectorstore creation and search mocked

Integration tests
- End to end from API /api/legal/match to service and back
- Evidence persisted when engagement_id provided

Performance tests
- Indexing 1k docs within 120 seconds
- Average query latency ≤ 600 ms for K=5 over 50 runs

---

## Observability and ops

Logging
- JSON structured logs for service and API integration
- Include query length, matches count, latency

Metrics (optional)
- Prometheus counters for requests and histograms for duration

Dashboards
- Qdrant UI at http://localhost:6333
- FastAPI docs at http://localhost:8001/docs and http://localhost:8000/docs

---

## Security and privacy

- No outbound calls, local only
- CORS limited to localhost dev origins
- JWT verification by main API before invoking service endpoints
- RBAC enforced on /api/legal/* routes

---

## Risks and mitigations

- Model download size and first-load latency
  - Pre-warm models and mount cache volume
- Memory pressure on low-spec machines
  - Use CPU, lower batch sizes, stagger indexing
- Data quality of corpus
  - Validate JSONL schema, add pre-processing scripts
- Qdrant collection config mismatch
  - Validate vector size equals model embedding dimension

---

## Timeline and effort

- Infra and service scaffold: 2 days
- API integration and migration: 1 day
- Frontend panel and wiring: 1 day
- Indexing and tests: 1 day
- Buffer and polish: 1 day
Total: 6 working days

---

## Deliverables

- legal-matcher microservice code and Docker image
- Updated infra/docker-compose.yml
- Alembic migration 0012_audit_evidence_legal
- API router /api/legal/*
- Frontend panel and API client
- Documentation and run book

---

## Rollout plan

Environment sequence
- Dev on localhost
- Optional staging with same compose file
- Production compose with pinned image tags and volumes

Backout
- Drop router include and revert migration if required
- Stop legal-matcher and qdrant services and remove volumes if needed

---

## Ready checklist before execution

- [ ] Docker Desktop running with WSL2
- [ ] 12 GB RAM available for smooth local dev
- [ ] laws_qatar.jsonl prepared with at least 1,000 paragraphs
- [ ] Ports 8000, 8001, 6333 free
- [ ] .env populated for API and service

---

## Next action

When requested to implement, follow this plan sequentially, committing each phase with clear messages and verifying acceptance criteria at the end of each phase.
