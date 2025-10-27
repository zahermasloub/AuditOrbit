# البنية الحالية لنظام UI - Current UI Structure

## 📁 هيكل الملفات (File Structure)

```
web/app/
├── components/
│   ├── ui/                     # المكونات الأساسية
│   │   ├── Button.tsx         ✓
│   │   ├── Card.tsx           ✓
│   │   ├── Input.tsx          ✓
│   │   ├── Badge.tsx          ✓
│   │   ├── StatusBadge.tsx    ✓
│   │   ├── Table.tsx          ✓
│   │   ├── Tabs.tsx           ✓
│   │   ├── Modal.tsx          ✓
│   │   ├── CardGrid.tsx       ✓
│   │   ├── Empty.tsx          ✓
│   │   ├── States.tsx         ✓
│   │   ├── icons.tsx          ✓
│   │   └── index.ts           (قد تحتاج إنشاءه)
│   │
│   ├── layout/                 # مكونات التخطيط
│   │   ├── AppShell.tsx
│   │   ├── Container.tsx
│   │   ├── Hero.tsx
│   │   └── SectionTitle.tsx
│   │
│   ├── table/                  # مكونات الجداول
│   │   ├── DataTable.tsx
│   │   └── DataTableToolbar.tsx
│   │
│   ├── forms/                  # مكونات النماذج
│   │   └── FormField.tsx
│   │
│   ├── inputs/                 # مكونات الإدخال
│   │   ├── DateRangePicker.tsx
│   │   └── FileDropzone.tsx
│   │
│   ├── manager/                # مكونات خاصة بالمدير
│   │   ├── FilterBar.tsx
│   │   ├── KpiCard.tsx
│   │   ├── ProgressRadial.tsx
│   │   └── RightStepper.tsx
│   │
│   ├── legends/                # مكونات توضيحية
│   │   └── SamplingLegend.tsx
│   │
│   ├── toast/                  # الإشعارات
│   │   └── Toast.tsx
│   │
│   ├── utils/                  # أدوات مساعدة
│   │   └── cn.ts
│   │
│   ├── Navbar.tsx              # الشريط العلوي القديم
│   ├── NavbarPolished.tsx      # الشريط العلوي الجديد ✓
│   ├── LogoFull.tsx            # شعار كامل
│   └── LogoIcon.tsx            # أيقونة الشعار
│
├── admin/                      # صفحات الإدارة
│   ├── page.tsx               (لوحة التحكم الرئيسية)
│   ├── users/                 (إدارة المستخدمين)
│   ├── roles/                 (إدارة الأدوار)
│   ├── engagements/           (إدارة الاشتباكات)
│   ├── checklists/            (إدارة قوائم التحقق)
│   ├── evidence/              (إدارة الأدلة)
│   ├── reports/               (إدارة التقارير)
│   ├── audit-log/             (سجل التدقيق)
│   ├── notifications/         (الإشعارات)
│   └── ai-lab/                (مختبر AI)
│
├── manager/                    # صفحات المدير
│   ├── page.tsx
│   ├── dashboard/
│   ├── engagements/
│   ├── findings/
│   └── reports/
│
├── auditor/                    # صفحات المراجع
│   ├── page.tsx
│   ├── tasks/
│   ├── engagement/[id]/
│   └── archive/
│
├── auth/                       # صفحات المصادقة
│   └── sign-in/
│
├── lib/                        # مكتبات مساعدة
│   └── apiFetch.ts
│
├── layout.tsx                  # التخطيط الرئيسي ✓
├── page.tsx                    # الصفحة الرئيسية
├── providers.tsx               # Context Providers
├── globals.css                 # الأنماط العامة ✓
└── tokens.css                  # نظام التصميم ✓
```

---

## 🎨 استخدام المكونات الحالية

### Button
```tsx
import { Button } from '@/app/components/ui/Button'

<Button variant="primary" size="md">Save</Button>
<Button variant="outline">Cancel</Button>
<Button variant="danger" size="sm">Delete</Button>
```

**الأنواع (Variants):**
- `primary` - الخلفية الزرقاء
- `outline` - إطار فقط
- `ghost` - شفاف
- `danger` - أحمر للخطر
- `success` - أخضر للنجاح

**الأحجام (Sizes):**
- `sm` - صغير
- `md` - متوسط (افتراضي)
- `lg` - كبير

---

### Card
```tsx
import { Card } from '@/app/components/ui/Card'

<Card className="p-6">
  <h2>Title</h2>
  <p>Content</p>
</Card>
```

**الخصائص:**
- خلفية `bg-card`
- إطار `border-border`
- ظل `shadow-soft`
- دائري `rounded-2xl`

---

### Input
```tsx
import { Input, Textarea } from '@/app/components/ui/Input'

<Input placeholder="Enter text..." />
<Textarea placeholder="Enter description..." rows={4} />
```

---

### Badge
```tsx
import { Badge } from '@/app/components/ui/Badge'

<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="danger">Failed</Badge>
```

---

### DataTable
```tsx
import { DataTable } from '@/app/components/table/DataTable'

<DataTable
  data={data}
  columns={columns}
  searchKey="name"
/>
```

---

### Modal
```tsx
import { Modal } from '@/app/components/ui/Modal'

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirm Delete"
>
  <p>Are you sure?</p>
</Modal>
```

---

## 🔄 State Management

### React Query (TanStack Query)
```tsx
import { useQuery } from '@tanstack/react-query'

const { data, isLoading } = useQuery({
  queryKey: ['users'],
  queryFn: fetchUsers
})
```

### Context API
```tsx
// في providers.tsx
<QueryClientProvider client={queryClient}>
  <ThemeProvider>
    {children}
  </ThemeProvider>
</QueryClientProvider>
```

---

## 🌍 دعم RTL

### في layout.tsx
```tsx
<html lang="ar" dir="rtl">
```

### في CSS
```css
.class {
  text-align: right; /* افتراضي لـ RTL */
}

@media (dir="ltr") {
  .class {
    text-align: left;
  }
}
```

---

## 🌓 Dark Mode

### التفعيل
```tsx
document.documentElement.classList.toggle('dark', true)
```

### في Tailwind
```tsx
<div className="bg-card dark:bg-card-dark">
```

### في CSS
```css
.dark .class {
  background: var(--ao-card);
}
```

---

## 🔗 API Calls

### استخدام apiFetch
```tsx
import { apiFetch } from '@/app/lib/apiFetch'

const data = await apiFetch('/api/users')
```

---

## 📦 Dependencies الحالية

```json
{
  "@tanstack/react-query": "^5.90.5",
  "@tanstack/react-table": "^8.21.3",
  "react-hook-form": "^7.65.0",
  "react": "18.3.1",
  "next": "14.2.11",
  "tailwindcss": "3.4.13",
  "lucide-react": "^0.548.0",
  "recharts": "^3.3.0"
}
```

---

## ⚙️ Tailwind Config

```typescript
// web/tailwind.config.ts
const config: Config = {
  theme: {
    extend: {
      colors: {
        bg: "rgb(var(--ao-bg) / <alpha-value>)",
        fg: "rgb(var(--ao-fg) / <alpha-value>)",
        primary: "rgb(var(--ao-primary) / <alpha-value>)",
        // ...
      }
    }
  }
}
```

---

## 🎯 ملاحظات مهمة

1. **Absolute Imports:** استخدم `@/app/...` دائماً
2. **"use client":** أضفه عند استخدام hooks أو interactivity
3. **RTL Support:** تأكد من dir="rtl" في <html>
4. **Dark Mode:** اختبر في جميع الصفحات
5. **Accessibility:** استخدم semantic HTML و ARIA labels

---

## 📝 Templates

### Page Template
```tsx
import { Card } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Button'

export default function PageName() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Page Title</h1>
      
      <Card className="p-6">
        <p>Content here</p>
      </Card>
    </div>
  )
}
```

### Client Component Template
```tsx
"use client"

import { useState } from 'react'
import { Button } from '@/app/components/ui/Button'

export default function ClientComponent() {
  const [state, setState] = useState(false)
  
  return (
    <Button onClick={() => setState(!state)}>
      Click me
    </Button>
  )
}
```

---

**هذا كل شيء! استخدم هذا المرجع أثناء إعادة التصميم على V0. 🚀**

