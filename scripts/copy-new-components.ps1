# =========================================
# Safe Component Copy Script
# نسخ آمن للمكونات الجديدة
# =========================================

param(
    [string]$SourcePath = "d:\AuditOrbit\temp-ui-integration",
    [string]$TargetPath = "d:\AuditOrbit\web",
    [switch]$DryRun = $false,
    [switch]$CreateBackup = $true
)

Write-Host "🚀 بدء عملية نسخ المكونات..." -ForegroundColor Cyan

# ألوان للمخرجات
function Write-Success { param($msg) Write-Host "✅ $msg" -ForegroundColor Green }
function Write-Warning { param($msg) Write-Host "⚠️  $msg" -ForegroundColor Yellow }
function Write-Error { param($msg) Write-Host "❌ $msg" -ForegroundColor Red }
function Write-Info { param($msg) Write-Host "ℹ️  $msg" -ForegroundColor Cyan }

# التحقق من وجود المسارات
if (-not (Test-Path $SourcePath)) {
    Write-Error "المسار المصدر غير موجود: $SourcePath"
    exit 1
}

if (-not (Test-Path $TargetPath)) {
    Write-Error "المسار الهدف غير موجود: $TargetPath"
    exit 1
}

# إنشاء نسخة احتياطية
if ($CreateBackup -and -not $DryRun) {
    Write-Info "إنشاء نسخة احتياطية..."
    $backupPath = "d:\AuditOrbit\backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    
    Copy-Item -Path $TargetPath -Destination $backupPath -Recurse -Force
    Write-Success "تم إنشاء نسخة احتياطية في: $backupPath"
}

# قواعد النسخ
$copyRules = @{
    # المكونات الجديدة - نسخ مباشر
    NewComponents = @{
        Pattern = "*.tsx"
        Exclude = @("*.test.tsx", "*.spec.tsx", "*.stories.tsx")
        Action = "Copy"
    }
    
    # الأنماط - دمج بحذر
    Styles = @{
        Pattern = "*.css"
        Action = "Merge"
    }
    
    # التكوينات - مراجعة يدوية
    Config = @{
        Pattern = @("*.json", "*.config.*")
        Action = "Review"
    }
    
    # الأصول - نسخ مباشر
    Assets = @{
        Pattern = @("*.svg", "*.png", "*.jpg", "*.ico")
        Action = "Copy"
    }
}

# الإحصائيات
$stats = @{
    Copied = 0
    Skipped = 0
    RequireReview = 0
    Conflicts = 0
}

# معالجة الملفات
$sourceFiles = Get-ChildItem -Path $SourcePath -Recurse -File

Write-Info "عدد الملفات الإجمالي: $($sourceFiles.Count)"
Write-Host ""

foreach ($file in $sourceFiles) {
    $relativePath = $file.FullName.Replace($SourcePath, "").TrimStart('\', '/')
    $targetFile = Join-Path $TargetPath $relativePath
    $targetDir = Split-Path $targetFile -Parent
    
    # تحديد الإجراء بناءً على نوع الملف
    $action = "Copy"  # افتراضي
    
    if ($file.Extension -match '\.(json|config\.)') {
        $action = "Review"
    } elseif ($file.Extension -eq ".css" -and (Test-Path $targetFile)) {
        $action = "Merge"
    }
    
    # معالجة حسب الإجراء
    switch ($action) {
        "Copy" {
            if (Test-Path $targetFile) {
                # الملف موجود - تحقق من الاختلاف
                $sourceHash = (Get-FileHash $file.FullName).Hash
                $targetHash = (Get-FileHash $targetFile).Hash
                
                if ($sourceHash -eq $targetHash) {
                    Write-Info "متطابق، تم التخطي: $relativePath"
                    $stats.Skipped++
                } else {
                    Write-Warning "تعارض محتمل: $relativePath"
                    
                    if (-not $DryRun) {
                        # إنشاء نسخة من الملف القديم
                        $backupFile = "$targetFile.backup"
                        Copy-Item $targetFile $backupFile -Force
                        
                        # نسخ الملف الجديد
                        Copy-Item $file.FullName $targetFile -Force
                        
                        Write-Warning "تم النسخ (النسخة القديمة: $backupFile)"
                    } else {
                        Write-Info "[DRY RUN] سيتم النسخ: $relativePath"
                    }
                    
                    $stats.Conflicts++
                }
            } else {
                # ملف جديد
                if (-not $DryRun) {
                    # إنشاء المجلد إذا لم يكن موجود
                    if (-not (Test-Path $targetDir)) {
                        New-Item -Path $targetDir -ItemType Directory -Force | Out-Null
                    }
                    
                    Copy-Item $file.FullName $targetFile -Force
                    Write-Success "تم النسخ: $relativePath"
                } else {
                    Write-Info "[DRY RUN] سيتم النسخ: $relativePath"
                }
                
                $stats.Copied++
            }
        }
        
        "Merge" {
            Write-Warning "يتطلب دمج يدوي: $relativePath"
            $stats.RequireReview++
        }
        
        "Review" {
            Write-Info "يتطلب مراجعة يدوية: $relativePath"
            $stats.RequireReview++
        }
    }
}

# طباعة الإحصائيات
Write-Host ""
Write-Host "=" * 50
Write-Host "📊 ملخص العملية" -ForegroundColor Cyan
Write-Host "=" * 50
Write-Success "تم النسخ: $($stats.Copied)"
Write-Info "تم التخطي (متطابق): $($stats.Skipped)"
Write-Warning "تعارضات تم حلها: $($stats.Conflicts)"
Write-Warning "يتطلب مراجعة: $($stats.RequireReview)"
Write-Host "=" * 50

if ($DryRun) {
    Write-Host ""
    Write-Info "هذا كان تشغيل تجريبي (Dry Run). لم يتم تعديل أي ملفات."
    Write-Info "لتنفيذ العملية الفعلية، قم بتشغيل السكريبت بدون معامل -DryRun"
}

# توصيات
Write-Host ""
Write-Host "🔍 الخطوات التالية:" -ForegroundColor Yellow
Write-Host "1. راجع الملفات التي تتطلب مراجعة يدوية"
Write-Host "2. قم بحل التعارضات (*.backup files)"
Write-Host "3. قم بتحديث imports في الملفات"
Write-Host "4. اختبر التطبيق: cd web && pnpm dev"
Write-Host "5. شغّل الاختبارات: pnpm test:ui"
Write-Host ""

if ($stats.Conflicts -gt 0) {
    Write-Warning "لديك $($stats.Conflicts) تعارض. راجع الملفات *.backup"
    Write-Info "استخدم VS Code Compare لمقارنة الملفات:"
    Write-Host "code --diff file.backup file.tsx"
}

Write-Success "العملية مكتملة! ✨"
