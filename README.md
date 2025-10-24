# AuditOrbit — Internal Audit Platform

Architecture: Clean Architecture + DDD + DI.
Services:
- /api (FastAPI — Presentation/API + Application + Infrastructure + Domain)
- /ai (Workers: OCR/Normalize/Compare)
- /web (Next.js — Admin/Manager/Auditor UI) with RTL & Tailwind
- /infra (Compose, CI/CD)
- /shared (Schemas/Contracts)

Run base services:
  docker compose -f infra/docker-compose.yml up -d db minio redis

Branding:
- Logo is SVG (currentColor). Change color via CSS on the container.
- Dark mode supported by `.dark` class.
