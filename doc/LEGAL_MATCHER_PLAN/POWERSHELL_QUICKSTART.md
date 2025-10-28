# PowerShell Quick Start – Legal Matcher (Docs-only)

These commands are a concise reference for later execution on Windows PowerShell. Replace container names as appropriate.

> Note: Do not run now if you only want documentation. Use when you decide to execute the plan.

---

## Prepare environment file (.env)

```powershell
Copy-Item -Path "D:\AuditOrbit\doc\LEGAL_MATCHER_PLAN\.env.legal-matcher.example" -Destination "D:\AuditOrbit\doc\LEGAL_MATCHER_PLAN\.env.legal-matcher" -Force

# Verify the file exists
if (Test-Path "D:\AuditOrbit\doc\LEGAL_MATCHER_PLAN\.env.legal-matcher") {
	Write-Host "OK: .env.legal-matcher is ready." -ForegroundColor Green
} else {
	Write-Error "Missing .env.legal-matcher. Please create it before proceeding."; exit 1
}
```

---

## Bring up services (build + start)

```powershell
cd D:\AuditOrbit\infra
docker compose up -d --build
```

## Apply Alembic migrations (API)

```powershell
# Replace container name if different
$api = (docker ps --filter "name=api" --format "{{.Names}}" | Select-Object -First 1)
docker exec -it $api alembic upgrade head
```

## Copy corpus into legal-matcher data volume (example)

```powershell
# Assuming you prepared the file under doc/LEGAL_MATCHER_PLAN
$src = "D:\AuditOrbit\doc\LEGAL_MATCHER_PLAN\TEMPLATE_laws_qatar.jsonl"
if (-not (Test-Path $src)) {
	Write-Error "Missing corpus file: $src"; exit 1
}

$svc = (docker ps --filter "name=legal-matcher" --format "{{.Names}}" | Select-Object -First 1)
docker cp $src $svc:/app/data/laws_qatar.jsonl

# Verify inside the container
docker exec $svc sh -c 'test -f /app/data/laws_qatar.jsonl && echo "OK: corpus present in container" || (echo "ERROR: corpus missing in container" && exit 1)'
```

## Index the corpus

```powershell
$svc = (docker ps --filter "name=legal-matcher" --format "{{.Names}}" | Select-Object -First 1)

# Safety check: ensure corpus exists inside container before indexing
docker exec $svc sh -c 'test -f /app/data/laws_qatar.jsonl || (echo "ERROR: /app/data/laws_qatar.jsonl not found" && exit 1)'

docker exec -it $svc python -m services.indexer /app/data/laws_qatar.jsonl --recreate
```

## Smoke test service

```powershell
curl http://localhost:8001/health
curl http://localhost:8001/stats
```

## Test match directly

```powershell
$body = @{ text = "يجب على الجهات الحكومية إنشاء وحدات للتدقيق الداخلي"; top_k = 5 } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:8001/legal-match" -Method Post -Body $body -ContentType "application/json"
```

## Test API integration

```powershell
$body = @{ text = "تمت عملية شراء أجهزة بقيمة 500,000 ريال بمناقصة محدودة بمشاركة 3 موردين"; top_k = 5 } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:8000/api/legal/match" -Method Post -Body $body -ContentType "application/json"
```

## Run frontend

```powershell
cd D:\AuditOrbit\frontend
npm install
npm run dev
```

---

## Troubleshooting quick notes

- First build may take time due to model downloads.
- Ensure ports 8001 and 6333 are not occupied.
- Verify Qdrant is reachable at http://localhost:6333.
- If indexing fails, check the JSONL schema and line endings.
