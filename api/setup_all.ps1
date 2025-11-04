# سكربت تهيئة قاعدة البيانات الكامل
# يقوم بتطبيق الهجرات وإضافة البيانات الأساسية

Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "🚀 بدء تهيئة قاعدة البيانات - AuditOrbit" -ForegroundColor Cyan
Write-Host "============================================================`n" -ForegroundColor Cyan

# الانتقال إلى مجلد API
Set-Location D:\AuditOrbit\api

# الخطوة 1: تطبيق هجرات Alembic
Write-Host "`n------------------------------------------------------------" -ForegroundColor Yellow
Write-Host "📋 الخطوة 1: تطبيق هجرات قاعدة البيانات" -ForegroundColor Yellow
Write-Host "------------------------------------------------------------" -ForegroundColor Yellow

# استخدام Python من البيئة الافتراضية مباشرة
$pythonPath = "D:\AuditOrbit\api\.venv\Scripts\python.exe"

# إذا لم توجد البيئة الافتراضية، استخدم Python العام
if (-not (Test-Path $pythonPath)) {
    $pythonPath = "python"
    Write-Host "⚠️ استخدام Python العام (لم يتم العثور على .venv)" -ForegroundColor Yellow
} else {
    Write-Host "✓ استخدام Python من البيئة الافتراضية" -ForegroundColor Green
}

# تطبيق الهجرات
& $pythonPath -m alembic upgrade head

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ تم تطبيق الهجرات بنجاح`n" -ForegroundColor Green
} else {
    Write-Host "❌ فشل تطبيق الهجرات. الكود: $LASTEXITCODE" -ForegroundColor Red
    Write-Host "تأكد من أن قاعدة البيانات تعمل ومن صحة إعدادات الاتصال`n" -ForegroundColor Yellow
    exit 1
}

# الخطوة 2: تهيئة البيانات
Write-Host "`n------------------------------------------------------------" -ForegroundColor Yellow
Write-Host "📊 الخطوة 2: إضافة البيانات الأساسية" -ForegroundColor Yellow
Write-Host "------------------------------------------------------------" -ForegroundColor Yellow

# تهيئة الإدارات
Write-Host "`n• إضافة الإدارات..." -ForegroundColor Cyan
& $pythonPath .\seed_departments_simple.py

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ تمت إضافة الإدارات بنجاح" -ForegroundColor Green
} else {
    Write-Host "❌ فشل في إضافة الإدارات" -ForegroundColor Red
}

# تهيئة الخطة السنوية
Write-Host "`n• إضافة خطة سنوية افتراضية..." -ForegroundColor Cyan
& $pythonPath .\seed_annual_plan_simple.py

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ تمت إضافة الخطة السنوية بنجاح" -ForegroundColor Green
} else {
    Write-Host "❌ فشل في إضافة الخطة السنوية" -ForegroundColor Red
}

# النتيجة النهائية
Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "✅ اكتملت عملية التهيئة!" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan

Write-Host "`nالخطوات التالية:" -ForegroundColor Yellow
Write-Host "1. تشغيل API إذا لم يكن يعمل:" -ForegroundColor White
Write-Host "   .\start_api.ps1" -ForegroundColor Gray
Write-Host "`n2. افتح الواجهة الأمامية وجرب إنشاء مهمة تدقيقية" -ForegroundColor White
Write-Host "   يجب أن تظهر الخطة السنوية تلقائياً`n" -ForegroundColor White
