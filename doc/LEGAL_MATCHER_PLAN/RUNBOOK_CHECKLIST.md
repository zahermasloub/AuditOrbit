# Legal Matcher – Runbook Checklist (Docs-only)

This checklist captures the minimal, sequenced steps to execute the Legal Matcher plan later. Use it as a companion to `IMPLEMENTATION_PLAN.md`.

---

## 0) Pre-flight

- [ ] Windows 10/11 with Docker Desktop (WSL2) installed and running
- [ ] PowerShell (pwsh) available
- [ ] Internet access (first-time model + spaCy downloads) or pre-cached models
- [ ] RAM available ≥ 12 GB
- [ ] Ports free: 8000, 8001, 6333
- [ ] Repo cloned and on the correct branch
- [ ] Copy `doc/LEGAL_MATCHER_PLAN/.env.legal-matcher.example` to `doc/LEGAL_MATCHER_PLAN/.env.legal-matcher` and adjust values (e.g., `DATABASE_URL`, `CORS_ALLOW_ORIGINS`, thresholds)

---

## 1) Data preparation (Corpus)

- [ ] Prepare `laws_qatar.jsonl` (≥ 1,000 paragraphs)
- [ ] Validate each line has: `text`, `law_id`, `article`, `url`
- [ ] Ensure UTF-8 encoding and normalized Arabic text (optional pre-clean)
- [ ] Keep a small sample for smoke tests (3–10 records)

---

## 2) Infra wiring (docker-compose)

- [ ] Add/verify Qdrant service in `infra/docker-compose.yml`
- [ ] Add/verify `legal-matcher` service with env/volumes/ports
- [ ] Confirm volumes for model cache and data
- [ ] Save and commit infra changes

---

## 3) Service scaffold (no code build yet)

- [ ] Ensure planned file layout exists in docs (see plan)
- [ ] Finalize environment variables list (see ENVIRONMENT_VARS.md)
- [ ] Decide CPU vs GPU (default CPU)

---

## 4) Database & RBAC

- [ ] Create Alembic migration for `audit_evidence` table and indexes
- [ ] Insert permissions `(legal_match, create)` and `(legal_match, read)`
- [ ] Grant to roles: Admin/IA Manager (create/read), Auditor (read)
- [ ] Apply migration in the API container

---

## 5) Indexing the corpus

- [ ] Place `laws_qatar.jsonl` under the service data mount
- [ ] Run the indexer to (re)create the Qdrant collection
- [ ] Confirm vector size matches the model embedding dimension

---

## 6) API integration

- [ ] Implement `/api/legal/match` (proxy + persistence)
- [ ] Implement `GET /api/legal/evidence/{engagement_id}`
- [ ] Implement `GET /api/legal/stats`
- [ ] Wire router into `presentation/main.py`

---

## 7) Frontend integration

- [ ] Create `LegalMatcherPanel` (textarea + results table + tags)
- [ ] Add client helpers: `matchLegalText`, `getLegalEvidence`, `getLegalMatchStats`
- [ ] Mount panel under engagement page or a sandbox route

---

## 8) Validation & quality gates

- [ ] Index ≥ 1,000 paragraphs in ≤ 2 minutes (dev machine)
- [ ] Query latency ≤ 600 ms for K=5 (warm cache)
- [ ] Human-reviewed accuracy ≥ 80% on first 50 cases
- [ ] Unit tests pass (embedder, thresholds, vectorstore mock)
- [ ] Integration tests pass (API ↔ service ↔ Qdrant)

---

## 9) Observability & security

- [ ] Structured JSON logs enabled
- [ ] CORS limited to dev origins
- [ ] JWT verified by API before service calls
- [ ] RBAC enforced on `/api/legal/*`

---

## 10) Rollout & backout

- [ ] Dev → (optional staging) → prod with pinned image tags
- [ ] Backout: remove router include, revert migration, stop services, remove volumes (if needed)

---

## Owner & handover

- Owner: Internal Audit Platform Team
- Artifacts: `IMPLEMENTATION_PLAN.md`, this checklist, ENV vars doc, sample JSONL
- Next step when ready: follow steps in order, validating acceptance criteria at each phase
