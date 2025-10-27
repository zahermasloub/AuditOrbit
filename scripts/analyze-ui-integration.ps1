# =========================================
# UI Integration Analysis Script
# تحليل وتخطيط دمج الواجهات الجديدة
# =========================================

param(
    [string]$NewUIPath = "d:\AuditOrbit\temp-ui-integration",
    [string]$CurrentProjectPath = "d:\AuditOrbit\web",
    [string]$OutputReport = "d:\AuditOrbit\UI_INTEGRATION_PLAN.md"
)

Write-Host "🔍 بدء تحليل الواجهات الجديدة..." -ForegroundColor Cyan

# البنية المتوقعة للمشروع
$expectedStructure = @{
    Components = @(
        "ui", "forms", "inputs", "layout", "manager", 
        "table", "toast", "legends", "utils"
    )
    Pages = @(
        "admin", "auditor", "manager", "auth"
    )
    Assets = @(
        "styles", "images", "icons"
    )
}

# 1. تحليل الملفات الجديدة
Write-Host "`n📂 تحليل بنية الملفات الجديدة..." -ForegroundColor Yellow

$newFiles = Get-ChildItem -Path $NewUIPath -Recurse -File | Where-Object {
    $_.Extension -in @('.tsx', '.ts', '.jsx', '.js', '.css', '.scss', '.json')
}

$filesByType = $newFiles | Group-Object Extension | ForEach-Object {
    [PSCustomObject]@{
        Type = $_.Name
        Count = $_.Count
        Files = $_.Group.FullName
    }
}

# 2. تحليل المكونات الموجودة
Write-Host "📦 تحليل المكونات الحالية..." -ForegroundColor Yellow

$existingComponents = Get-ChildItem -Path "$CurrentProjectPath\app\components" -Recurse -File -Filter "*.tsx"

# 3. تحديد التطابقات والتعارضات
Write-Host "🔄 تحديد التطابقات والتعارضات..." -ForegroundColor Yellow

$conflicts = @()
$newComponents = @()
$updates = @()

foreach ($newFile in $newFiles) {
    $relativePath = $newFile.FullName.Replace($NewUIPath, "").TrimStart('\')
    $targetPath = Join-Path $CurrentProjectPath $relativePath
    
    if (Test-Path $targetPath) {
        # ملف موجود - محتمل تعارض أو تحديث
        $existingContent = Get-Content $targetPath -Raw
        $newContent = Get-Content $newFile.FullName -Raw
        
        if ($existingContent -ne $newContent) {
            $conflicts += [PSCustomObject]@{
                File = $relativePath
                Action = "UPDATE_NEEDED"
                ExistingPath = $targetPath
                NewPath = $newFile.FullName
            }
        }
    } else {
        # ملف جديد
        $newComponents += [PSCustomObject]@{
            File = $relativePath
            Action = "NEW"
            Path = $newFile.FullName
            TargetPath = $targetPath
        }
    }
}

# 4. تحليل التبعيات (Dependencies)
Write-Host "📊 تحليل التبعيات..." -ForegroundColor Yellow

$dependencies = @{}
foreach ($file in $newFiles | Where-Object { $_.Extension -in @('.tsx', '.ts', '.jsx', '.js') }) {
    $content = Get-Content $file.FullName -Raw
    
    # استخراج import statements
    $imports = [regex]::Matches($content, "import\s+.*\s+from\s+['\`"](.+?)['\`"]")
    
    foreach ($import in $imports) {
        $importPath = $import.Groups[1].Value
        
        if (-not $importPath.StartsWith('@/') -and 
            -not $importPath.StartsWith('.') -and 
            -not $importPath.StartsWith('react') -and
            -not $importPath.StartsWith('next')) {
            
            if (-not $dependencies.ContainsKey($importPath)) {
                $dependencies[$importPath] = @()
            }
            $dependencies[$importPath] += $file.Name
        }
    }
}

# 5. توليد التقرير
Write-Host "`n📄 توليد تقرير التكامل..." -ForegroundColor Green

$report = @"
# 📊 خطة دمج الواجهات الجديدة - UI Integration Plan

**تاريخ التحليل:** $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")  
**المسار الجديد:** ``$NewUIPath``  
**المسار الحالي:** ``$CurrentProjectPath``

---

## 📈 ملخص التحليل

- **إجمالي الملفات الجديدة:** $($newFiles.Count)
- **المكونات الجديدة:** $($newComponents.Count)
- **تحديثات مطلوبة:** $($conflicts.Count)
- **التبعيات الخارجية:** $($dependencies.Count)

---

## 📁 تصنيف الملفات

$(
$filesByType | ForEach-Object {
"### $($_.Type) - ($($_.Count) ملف)
``````
$($_.Files -join "`n")
``````
"
}
)

---

## 🆕 المكونات الجديدة (تحتاج إضافة)

$(
if ($newComponents.Count -eq 0) {
    "لا توجد مكونات جديدة."
} else {
    $newComponents | ForEach-Object {
        "- [ ] **$($_.File)**
  - المسار الهدف: ``$($_.TargetPath)``
  - الإجراء: نسخ مباشر
"
    }
}
)

---

## ⚠️ تعارضات وتحديثات (تحتاج مراجعة يدوية)

$(
if ($conflicts.Count -eq 0) {
    "✅ لا توجد تعارضات."
} else {
    $conflicts | ForEach-Object {
        "- [ ] **$($_.File)**
  - الملف الموجود: ``$($_.ExistingPath)``
  - الملف الجديد: ``$($_.NewPath)``
  - الإجراء المقترح: مقارنة يدوية (diff)
"
    }
}
)

---

## 📦 التبعيات المطلوبة

$(
if ($dependencies.Count -eq 0) {
    "✅ لا توجد تبعيات خارجية جديدة."
} else {
    $dependencies.GetEnumerator() | ForEach-Object {
        "### ``$($_.Key)``
المستخدم في:
$(($_.Value | ForEach-Object { "- $_" }) -join "`n")
"
    }
}
)

---

## 🔧 خطوات التنفيذ المقترحة

### المرحلة 1: التحضير
\`\`\`powershell
# 1. إنشاء نسخة احتياطية
cd d:\AuditOrbit
git checkout -b ui-integration-backup
git add .
git commit -m "backup before UI integration"

# 2. إنشاء فرع جديد للتكامل
git checkout -b feature/ui-integration
\`\`\`

### المرحلة 2: نسخ المكونات الجديدة
\`\`\`powershell
# استخدم السكريبت المساعد
.\scripts\copy-new-components.ps1
\`\`\`

### المرحلة 3: حل التعارضات
- استخدم أداة diff (مثل VS Code Compare)
- قارن كل ملف متعارض
- اختر أفضل التغييرات من كلا الملفين

### المرحلة 4: تثبيت التبعيات
\`\`\`powershell
cd web
pnpm install
\`\`\`

### المرحلة 5: الاختبار
\`\`\`powershell
# تشغيل الخادم
pnpm dev

# اختبار المكونات
pnpm test:ui
\`\`\`

### المرحلة 6: الدمج
\`\`\`powershell
git add .
git commit -m "feat: integrate new UI components"
git checkout master
git merge feature/ui-integration
\`\`\`

---

## 📋 قائمة المراجعة (Checklist)

### قبل البدء
- [ ] نسخ احتياطي من المشروع الحالي
- [ ] إنشاء فرع Git جديد
- [ ] مراجعة جميع الملفات الجديدة

### أثناء التنفيذ
- [ ] نسخ المكونات الجديدة
- [ ] حل جميع التعارضات
- [ ] تحديث imports في الملفات
- [ ] تثبيت التبعيات الجديدة
- [ ] تحديث ملفات التكوين (tsconfig, tailwind)

### بعد التنفيذ
- [ ] اختبار جميع الصفحات
- [ ] اختبار جميع المكونات
- [ ] اختبار Responsive Design
- [ ] اختبار RTL Support
- [ ] اختبار Dark Mode
- [ ] تشغيل اختبارات A11y
- [ ] تشغيل اختبارات الأداء
- [ ] مراجعة الكود
- [ ] توثيق التغييرات

---

## 🚨 تحذيرات مهمة

1. **لا تحذف ملفات القديمة مباشرة** - قد تحتوي على منطق مهم
2. **راجع كل تعارض يدوياً** - الدمج التلقائي قد يفقد تغييرات
3. **اختبر بعد كل مرحلة** - لا تنتظر حتى النهاية
4. **احتفظ بنسخة احتياطية** - Git + نسخة محلية
5. **راجع التبعيات** - تأكد من التوافق مع React 18/19

---

**تم إنشاء التقرير بواسطة:** UI Integration Analysis Script  
**الإصدار:** 1.0.0
"@

$report | Out-File -FilePath $OutputReport -Encoding UTF8

Write-Host "`n✅ تم إنشاء التقرير بنجاح!" -ForegroundColor Green
Write-Host "📄 الموقع: $OutputReport" -ForegroundColor Cyan

# 6. فتح التقرير في VS Code
code $OutputReport

Write-Host "`n🎉 التحليل مكتمل! راجع التقرير للخطوات التالية." -ForegroundColor Green
