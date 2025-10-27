# V0 Quick Reference - مرجع سريع

## 🎨 نظام الألوان (Color System)

```css
/* Light Mode */
Primary:   #0EA5E9 (Sky-500)
Success:   #22C55E (Green-500)
Warning:   #FACC14 (Yellow-500)
Danger:    #DC2626 (Red-600)

BG:        #FFFFFF
FG:        #0F172A
Card:      #FFFFFF
Border:    #E2E8F0

/* Dark Mode */
Primary:   #0EA5E9
Success:   #22C55E
Warning:   #FACC14
Danger:    #DC4040

BG:        #020617
FG:        #F8FAFC
Card:      #020617
Border:    #1F2937
```

---

## 📐 الأبعاد والمسافات (Spacing)

```
xs:  0.25rem (4px)
sm:  0.375rem (6px)
md:  0.5rem (8px)
lg:  0.75rem (12px)
xl:  1rem (16px)
2xl: 1.5rem (24px)
```

---

## 🔘 أهم المكونات (Key Components)

### Button
```tsx
<Button variant="primary" size="md">Save</Button>
<Button variant="outline">Cancel</Button>
<Button variant="danger">Delete</Button>
```

### Card
```tsx
<Card className="p-6">
  <h2>Title</h2>
  <p>Content</p>
</Card>
```

### Input
```tsx
<Input placeholder="Enter text..." />
```

### Badge
```tsx
<Badge variant="success">Active</Badge>
```

---

## 📋 Prompts جاهزة للنسخ

### إعادة تصميم Navigation
```
تصميم navigation bar حديث لـ AuditOrbit مع:
- Logo على اليسار
- Menu items (Admin, Manager, Auditor) في الوسط
- Theme toggle + RTL toggle على اليمين
- sticky top-0 مع backdrop blur
- يدعم Dark Mode و RTL
```

### إعادة تصميم Dashboard
```
تصميم dashboard لـ AuditOrbit يتضمن:
- Grid من KPI cards (4 columns)
- Chart (استخدم Recharts)
- Recent activities table
- Quick actions buttons
- يدعم Dark Mode و RTL
```

### إعادة تصميم Data Table
```
تصميم data table لـ AuditOrbit يتضمن:
- Sortable columns
- Search filter
- Pagination
- Row actions (view, edit, delete)
- يدعم Dark Mode و RTL
- استخدم Radix UI
```

### إعادة تصميم Form
```
تصميم form لـ AuditOrbit مع:
- Input fields (text, email, date, select, textarea)
- Validation messages
- Submit button
- يدعم Dark Mode و RTL
- استخدم React Hook Form style
```

---

## 🎯 Checklist قبل البدء

- [ ] قرأت V0_INTEGRATION_GUIDE.md
- [ ] عملت backup للمشروع
- [ ] أنشأت branch جديد (feature/v0-redesign)
- [ ] فهمت بنية المشروع الحالية
- [ ] عرفت المسارات الصحيحة (web/app/...)

---

## 🚀 Quick Start

### 1. تصميم على V0
- اذهب إلى v0.dev
- أدخل أحد الـ prompts أعلاه
- احصل على الكود

### 2. انسخ الكود
```bash
# أنشئ ملف جديد
touch web/app/components/ui/NewComponent.tsx

# انسخ الكود من V0
```

### 3. عدل الـ paths
```tsx
// بدلاً من
import { Button } from '@/components/ui/button'

// استخدم
import { Button } from '@/app/components/ui/Button'
```

### 4. اختبر
```bash
cd web
pnpm dev
```

---

## 📝 Notes

- استخدم absolute imports: `@/app/...`
- أضف `"use client"` عند الحاجة
- احرص على RTL classes: `rtl:... ltr:...`
- اختبر Dark Mode دائماً
- لا تنسى accessibility (a11y)

---

**Good Luck! 🎉**

