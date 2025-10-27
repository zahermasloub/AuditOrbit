# =========================================
# Smart Merge Helper Script
# مساعد دمج ذكي للواجهات
# =========================================

param(
    [string]$File1,
    [string]$File2,
    [string]$OutputFile = "",
    [switch]$Interactive = $true
)

function Show-Diff {
    param($path1, $path2)
    
    Write-Host "🔍 مقارنة الملفات..." -ForegroundColor Cyan
    Write-Host "الملف 1: $path1"
    Write-Host "الملف 2: $path2"
    Write-Host ""
    
    # استخدام VS Code للمقارنة
    code --diff $path1 $path2
}

function Merge-ComponentFiles {
    param($old, $new, $output)
    
    Write-Host "🔄 دمج المكونات..." -ForegroundColor Yellow
    
    $oldContent = Get-Content $old -Raw
    $newContent = Get-Content $new -Raw
    
    # تحليل Imports
    Write-Host "`nتحليل Imports..."
    
    $oldImports = [regex]::Matches($oldContent, "import\s+.*\s+from\s+['\`"](.+?)['\`"]") | 
        ForEach-Object { $_.Value } | Select-Object -Unique
    
    $newImports = [regex]::Matches($newContent, "import\s+.*\s+from\s+['\`"](.+?)['\`"]") | 
        ForEach-Object { $_.Value } | Select-Object -Unique
    
    $allImports = ($oldImports + $newImports) | Select-Object -Unique | Sort-Object
    
    Write-Host "  الـ Imports القديمة: $($oldImports.Count)"
    Write-Host "  الـ Imports الجديدة: $($newImports.Count)"
    Write-Host "  الإجمالي (بعد الدمج): $($allImports.Count)"
    
    # تحليل المكونات (Component definitions)
    Write-Host "`nتحليل المكونات..."
    
    $oldComponents = [regex]::Matches($oldContent, "(export\s+(default\s+)?function|export\s+const)\s+(\w+)") |
        ForEach-Object { $_.Groups[3].Value }
    
    $newComponents = [regex]::Matches($newContent, "(export\s+(default\s+)?function|export\s+const)\s+(\w+)") |
        ForEach-Object { $_.Groups[3].Value }
    
    Write-Host "  المكونات القديمة: $($oldComponents -join ', ')"
    Write-Host "  المكونات الجديدة: $($newComponents -join ', ')"
    
    # التحقق من التعارضات
    $conflicts = Compare-Object $oldComponents $newComponents -IncludeEqual -ExcludeDifferent
    
    if ($conflicts) {
        Write-Host "`n⚠️  تعارضات محتملة في المكونات:" -ForegroundColor Yellow
        $conflicts | ForEach-Object { Write-Host "  - $($_.InputObject)" }
    }
    
    # اقتراحات الدمج
    Write-Host "`n💡 اقتراحات الدمج:" -ForegroundColor Green
    Write-Host "1. خذ جميع الـ Imports من الملفين"
    Write-Host "2. احتفظ بالمكونات الفريدة من كل ملف"
    Write-Host "3. للمكونات المتعارضة، راجع يدوياً واختر الأفضل"
    Write-Host "4. احتفظ بـ Props types من كلا الملفين"
    Write-Host "5. ادمج الـ Styles والـ Classes"
    
    return @{
        Imports = $allImports
        OldComponents = $oldComponents
        NewComponents = $newComponents
        Conflicts = $conflicts
    }
}

function Merge-StyleFiles {
    param($old, $new, $output)
    
    Write-Host "🎨 دمج ملفات الأنماط..." -ForegroundColor Yellow
    
    $oldContent = Get-Content $old -Raw
    $newContent = Get-Content $new -Raw
    
    # استخراج CSS classes
    $oldClasses = [regex]::Matches($oldContent, "\.([a-zA-Z0-9_-]+)\s*\{") |
        ForEach-Object { $_.Groups[1].Value } | Select-Object -Unique
    
    $newClasses = [regex]::Matches($newContent, "\.([a-zA-Z0-9_-]+)\s*\{") |
        ForEach-Object { $_.Groups[1].Value } | Select-Object -Unique
    
    Write-Host "  الـ Classes القديمة: $($oldClasses.Count)"
    Write-Host "  الـ Classes الجديدة: $($newClasses.Count)"
    
    $duplicates = Compare-Object $oldClasses $newClasses -IncludeEqual -ExcludeDifferent
    
    if ($duplicates) {
        Write-Host "`n⚠️  Classes مكررة (تحتاج مراجعة):" -ForegroundColor Yellow
        $duplicates | ForEach-Object { Write-Host "  - .$($_.InputObject)" }
    }
    
    return @{
        OldClasses = $oldClasses
        NewClasses = $newClasses
        Duplicates = $duplicates
    }
}

# التنفيذ الرئيسي
if (-not $File1 -or -not $File2) {
    Write-Host "الاستخدام:" -ForegroundColor Yellow
    Write-Host "  .\merge-helper.ps1 -File1 <path> -File2 <path>"
    Write-Host ""
    Write-Host "مثال:"
    Write-Host "  .\merge-helper.ps1 -File1 old\Button.tsx -File2 new\Button.tsx"
    exit
}

if (-not (Test-Path $File1)) {
    Write-Host "❌ الملف غير موجود: $File1" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $File2)) {
    Write-Host "❌ الملف غير موجود: $File2" -ForegroundColor Red
    exit 1
}

Write-Host "=" * 60
Write-Host "🔧 مساعد الدمج الذكي" -ForegroundColor Cyan
Write-Host "=" * 60
Write-Host ""

$ext = [System.IO.Path]::GetExtension($File1)

# تحديد نوع الدمج بناءً على امتداد الملف
switch ($ext) {
    {$_ -in '.tsx', '.ts', '.jsx', '.js'} {
        $result = Merge-ComponentFiles $File1 $File2 $OutputFile
    }
    {$_ -in '.css', '.scss', '.sass'} {
        $result = Merge-StyleFiles $File1 $File2 $OutputFile
    }
    default {
        Write-Host "⚠️  نوع ملف غير مدعوم: $ext" -ForegroundColor Yellow
        Write-Host "سيتم فتح المقارنة المرئية فقط."
    }
}

# فتح المقارنة المرئية
if ($Interactive) {
    Write-Host ""
    $response = Read-Host "هل تريد فتح المقارنة المرئية في VS Code؟ (y/n)"
    if ($response -eq 'y') {
        Show-Diff $File1 $File2
    }
}

Write-Host ""
Write-Host "✅ التحليل مكتمل!" -ForegroundColor Green
