# سكريبت اختبار الـ endpoints الجديدة
# يجب تسجيل الدخول أولاً للحصول على token

Write-Host "`n=== اختبار Endpoints الجديدة ===" -ForegroundColor Cyan

# 1. تسجيل الدخول للحصول على token
Write-Host "`n1️⃣ تسجيل الدخول..." -ForegroundColor Yellow
$loginBody = @{
    email = "admin@example.com"
    password = "Admin#2025"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-WebRequest -Uri "http://localhost:8000/auth/login" `
        -Method POST `
        -Body $loginBody `
        -ContentType "application/json" `
        -UseBasicParsing
    
    $token = ($loginResponse.Content | ConvertFrom-Json).access_token
    Write-Host "✅ تم الحصول على Token" -ForegroundColor Green
    
    # 2. اختبار endpoint الإدارات
    Write-Host "`n2️⃣ اختبار /departments..." -ForegroundColor Yellow
    $headers = @{
        "Authorization" = "Bearer $token"
    }
    
    $depsResponse = Invoke-WebRequest -Uri "http://localhost:8000/departments" `
        -Headers $headers `
        -UseBasicParsing
    
    $departments = $depsResponse.Content | ConvertFrom-Json
    Write-Host "✅ تم الحصول على $($departments.Count) إدارات:" -ForegroundColor Green
    $departments | Select-Object -First 5 | ForEach-Object {
        Write-Host "   - $($_.name)" -ForegroundColor White
    }
    
    # 3. اختبار endpoint الخطة الفعالة
    Write-Host "`n3️⃣ اختبار /annual-plans/active..." -ForegroundColor Yellow
    $planResponse = Invoke-WebRequest -Uri "http://localhost:8000/annual-plans/active" `
        -Headers $headers `
        -UseBasicParsing
    
    $activePlan = $planResponse.Content | ConvertFrom-Json
    Write-Host "✅ الخطة الفعالة:" -ForegroundColor Green
    Write-Host "   ID: $($activePlan.id)" -ForegroundColor White
    Write-Host "   السنة: $($activePlan.year)" -ForegroundColor White
    Write-Host "   العنوان: $($activePlan.title)" -ForegroundColor White
    
    # 4. اختبار endpoint جميع الخطط
    Write-Host "`n4️⃣ اختبار /annual-plans..." -ForegroundColor Yellow
    $plansResponse = Invoke-WebRequest -Uri "http://localhost:8000/annual-plans" `
        -Headers $headers `
        -UseBasicParsing
    
    $allPlans = $plansResponse.Content | ConvertFrom-Json
    Write-Host "✅ تم الحصول على $($allPlans.Count) خطة سنوية" -ForegroundColor Green
    
    Write-Host "`n✅ جميع الاختبارات نجحت!" -ForegroundColor Green
    
} catch {
    Write-Host "❌ خطأ: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host "التفاصيل: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}
