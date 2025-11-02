# Artifact Index for Initial Analysis

## Essential (Immediate)

- **Application structure (page map):** `FRONTEND_PAGES_REPORT.md` documents the full Next.js route tree with route-to-file mapping (see "Routes tree" section generated 2025-10-31).
- **Database diagram (ERD):** `DB_TECHNICAL_REPORT.md` section "3️⃣ مخطط العلاقات (ERD)" enumerates all tables and key relationships, including one-to-many and many-to-many joins.
- **API catalog:** `APPLICATION_REPORT.md` section "🔌 API Endpoints" lists all REST endpoints by resource; pair with `reports/initial-assessment.md` section "Endpoint Inventory" for method counts and mount status.

## Supplementary (If Available)

- **Page usage statistics:** No dedicated analytics or usage summary located in the repository; capture is likely pending instrumentation (e.g., Next.js telemetry, product analytics).
- **Performance and latency logs:** No runtime performance logs or dashboards found. Ops console plans (`doc/تقرير العمل/OPS_CONSOLE_PORTAL_AR.md`) outline future logging views but files contain design notes only.
- **Error and issue reports:** No consolidated error log discovered. Current risk and defect notes live in assessment docs (`reports/initial-assessment.md`, `doc/Reports/PROJECT_PROGRESS_REPORT.md`).

## Recommended Next Actions

- If analytics are needed, enable frontend tracking (e.g., Vercel Analytics, GA4) or expose `/metrics` from the API and document outputs.
- Capture performance baselines via `frontend/tests/performance.spec.ts` and add resulting reports under `DIV_Code/deepseek-report/` once run.
- Centralize incident/error reporting by exporting recent `audit_logs` records or aggregating FastAPI exception logs into a new report file.
