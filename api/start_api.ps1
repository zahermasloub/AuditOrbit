# تشغيل API
Set-Location D:\AuditOrbit\api
& D:\AuditOrbit\api\.venv\Scripts\python.exe -m uvicorn app.presentation.main:app --host 0.0.0.0 --port 8000 --reload
