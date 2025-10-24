# AuditOrbit — Internal Audit Platform

Architecture: Clean Architecture + DDD + DI.

## Services
- `/api` — FastAPI (Presentation/API + Application + Infrastructure + Domain)
- `/ai` — Workers: OCR/Normalize/Compare (planned)
- `/web` — Next.js (Admin/Manager/Auditor UI) with RTL & Tailwind
- `/infra` — Docker Compose, CI/CD
- `/shared` — Schemas/Contracts (planned)

## Quick Start

### 1. Start Infrastructure
```bash
docker compose -f infra/docker-compose.yml up -d
```

This starts: PostgreSQL, MinIO (S3), Redis, and the FastAPI backend.

### 2. Run Web Interface
```bash
cd web
pnpm install
pnpm dev
```

Visit: http://localhost:3000

### 3. Default Credentials
- Email: `admin@example.com`
- Password: `Admin#2025`

## API Documentation
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- Health: http://localhost:8000/health

## Branding
- Logo is SVG (currentColor). Change color via CSS on the container.
- Dark mode supported by `.dark` class.
