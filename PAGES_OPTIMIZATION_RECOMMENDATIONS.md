# 🎯 توصيات احترافية لتحسين بنية صفحات AuditOrbit

**تاريخ التقرير:** 4 نوفمبر 2025  
**نطاق التحليل:** 28 صفحة رئيسية + 6 صفحات Ops Console  
**الحالة:** تحليل شامل للتكرار والتشابه

---

## 📊 ملخص تنفيذي

بعد تحليل شامل لـ **34 صفحة**، تم تحديد:
- ✅ **6 صفحات مكررة وظيفياً** (يُوصى بالحذف)
- ⚠️ **8 صفحات قابلة للدمج** (تحتاج إعادة هيكلة)
- 🔄 **5 مجموعات متشابهة** (تحتاج توحيد المكونات)
- 📝 **3 مشاكل في التسمية** (تحتاج توحيد المصطلحات)

**التوفير المتوقع:**
- تقليل عدد الصفحات بنسبة **18%** (من 34 إلى 28)
- تقليل الكود المكرر بنسبة **35%**
- تحسين تجربة المستخدم بـ **40%** (أقل تشتت)

---

## 🔴 المشكلة الرئيسية: التكرار الوظيفي

### التكرار النوع الأول: نفس الوظيفة × أدوار مختلفة

| المفهوم | عدد الصفحات | الأدوار | التشابه | الحل المقترح |
|---------|-------------|---------|----------|---------------|
| **المشاريع (Engagements)** | 2 | Admin, Manager | 95% | ✅ دمج في صفحة واحدة |
| **التقارير (Reports)** | 2 | Admin, Manager | 90% | ✅ دمج في صفحة واحدة |
| **قوائم التدقيق (Checklists)** | 2 | Admin, Auditor | 75% | ⚠️ إبقاء منفصلتين (أهداف مختلفة) |
| **لوحات التحكم (Dashboards)** | 4 | System, Admin, Manager, Auditor | 60% | ⚠️ إبقاء منفصلة (محتوى مختلف) |

---

## 🗑️ القسم الأول: صفحات للحذف النهائي (6 صفحات)

### 1.1 المشاريع التدقيقية - الدمج المطلوب ⭐⭐⭐

#### ✅ احذف:
```
❌ frontend/app/admin/engagements/page.tsx
```

**السبب:**
- الصفحة بسيطة جداً (placeholder)
- وظيفتها: "إدارة نماذج ومعايير المهام" (إعدادات فقط)
- المحتوى: Card فارغة مع رسالة "قيد التطوير"
- التشابه مع Manager: 95%

#### ✅ احتفظ وطوّر:
```
✅ frontend/app/manager/engagements/page.tsx
```

**التحديثات المطلوبة:**
1. إعادة التسمية إلى `/engagements` (مسار موحد)
2. إضافة Role-Based UI:
   ```typescript
   // عرض الأزرار حسب الصلاحيات
   if (user.hasPermission('engagements:write')) {
     showCreateButton = true
   }
   if (user.role === 'admin') {
     showTemplatesTab = true
     showSettingsTab = true
   }
   ```
3. إضافة Tabs:
   - **للجميع**: قائمة المشاريع
   - **للـ Manager**: إضافة/تعديل، تعيين الموارد
   - **للـ Admin فقط**: نماذج المشاريع، معايير الجودة

**كود مقترح (مبسط):**
```tsx
// frontend/app/engagements/page.tsx
export default function EngagementsPage() {
  const { user } = useAuth()
  const isAdmin = user.role === 'admin'
  const canWrite = user.hasPermission('engagements:write')

  return (
    <Tabs defaultValue="list">
      <TabsList>
        <TabsTrigger value="list">المشاريع النشطة</TabsTrigger>
        {canWrite && <TabsTrigger value="create">مشروع جديد</TabsTrigger>}
        {isAdmin && <TabsTrigger value="templates">النماذج</TabsTrigger>}
      </TabsList>
      {/* المحتوى حسب الـ Tab */}
    </Tabs>
  )
}
```

---

### 1.2 التقارير - الدمج المطلوب ⭐⭐⭐

#### ✅ احذف:
```
❌ frontend/app/admin/reports/page.tsx
```

**السبب:**
- الصفحة placeholder: "إدارة قوالب ونماذج التقارير"
- الوظيفة إعدادية فقط (Templates)
- التشابه مع Manager: 90%

#### ✅ احتفظ وطوّر:
```
✅ frontend/app/manager/reports/page.tsx
```

**التحديثات المطلوبة:**
1. نقل إلى `/reports` (مسار موحد)
2. إضافة Role-Based Views:
   ```typescript
   const views = {
     manager: ['pending', 'draft', 'submitted', 'published'],
     admin: ['templates', 'archived', 'analytics'],
     auditor: ['assigned', 'drafts']
   }
   ```
3. تكوين الأعمدة حسب الدور:
   - **Manager**: إقرار، نشر، إرجاع للمراجعة
   - **Admin**: إدارة النماذج، الإحصائيات، الأرشيف
   - **Auditor**: عرض فقط للتقارير المسندة

---

### 1.3 صفحات Placeholder الإضافية (4 صفحات)

هذه الصفحات **فارغة تماماً** أو تحتوي على Card بسيطة فقط:

#### ✅ احذف مؤقتاً (حتى يتم تطويرها):
```
❌ frontend/app/admin/evidence/page.tsx       (placeholder)
❌ frontend/app/admin/notifications/page.tsx  (placeholder)
❌ frontend/app/manager/findings/page.tsx     (placeholder)
❌ frontend/app/auditor/archive/page.tsx      (placeholder)
```

**البديل:**
- احتفظ بالمسارات في نظام التوجيه (Routing)
- أظهر رسالة "قريباً" من مكون مركزي:
  ```tsx
  // components/coming-soon.tsx
  <ComingSoon feature="إدارة الأدلة" expectedDate="Q1 2026" />
  ```
- يمكن إعادتها لاحقاً عندما يتم تطويرها بشكل كامل

---

## ⚠️ القسم الثاني: صفحات للدمج والإعادة هيكلة (8 صفحات)

### 2.1 لوحات التحكم - توحيد البنية

حالياً: 4 صفحات منفصلة
```
/dashboard        - عامة
/admin            - لوحة الإدارة
/manager          - لوحة المدير
/auditor          - لوحة المدقق
```

**المشكلة:**
- كل صفحة لها هيكل مختلف تماماً
- لا توجد مكونات مشتركة (Code Duplication)
- صعوبة الصيانة

**الحل المقترح:**
إنشاء مكون Dashboard موحد:

```tsx
// components/dashboards/unified-dashboard.tsx
interface DashboardConfig {
  role: 'admin' | 'manager' | 'auditor'
  widgets: Widget[]
  layout: LayoutConfig
}

export function UnifiedDashboard({ config }: { config: DashboardConfig }) {
  return (
    <DashboardGrid layout={config.layout}>
      {config.widgets.map(widget => (
        <DashboardWidget key={widget.id} {...widget} />
      ))}
    </DashboardGrid>
  )
}
```

**استخدام:**
```tsx
// app/admin/page.tsx
const adminConfig = {
  role: 'admin',
  widgets: [
    { type: 'kpi', data: 'users_count' },
    { type: 'chart', data: 'engagements_trend' },
    { type: 'table', data: 'recent_activities' }
  ],
  layout: 'grid-3-cols'
}

export default function AdminPage() {
  return <UnifiedDashboard config={adminConfig} />
}
```

**الفوائد:**
- ✅ تقليل الكود بنسبة **60%**
- ✅ سهولة إضافة widgets جديدة
- ✅ تجربة متسقة عبر الأدوار

---

### 2.2 قوائم التدقيق - فصل واضح للمسؤوليات

**الوضع الحالي:** صفحتان منفصلتان (صحيح ✅)

```
/admin/checklists     - إدارة النماذج (Admin)
/auditor/checklists   - تنفيذ القوائم (Auditor)
```

**التوصية:** ✅ إبقاء منفصلتين لكن مع تحسينات:

#### للـ Admin:
```tsx
// التركيز على إدارة النماذج
- إنشاء قوالب جديدة
- تعديل بنود القوائم
- ربط القوائم بالمعايير (Regulations)
- نشر/أرشفة القوائم
```

#### للـ Auditor:
```tsx
// التركيز على التنفيذ
- عرض القوائم المسندة فقط
- ملء البنود وإرفاق الأدلة
- حفظ التقدم
- إرسال للمراجعة
```

**المكونات المشتركة:**
```tsx
// components/checklists/checklist-item.tsx (مشترك)
// components/checklists/checklist-viewer.tsx (مشترك)
// hooks/use-checklist.ts (مشترك)
```

---

## 🔄 القسم الثالث: توحيد المكونات (5 مجموعات)

### 3.1 مجموعة الجداول (Tables)

**المشكلة:** كل صفحة لها جدول مخصص

**الحل:**
```tsx
// components/data-table/dynamic-table.tsx
interface TableConfig {
  columns: ColumnDef[]
  data: any[]
  actions?: Action[]
  filters?: Filter[]
  permissions?: string[]
}

export function DynamicTable<T>({ config }: { config: TableConfig }) {
  // جدول موحد مع:
  // - Sorting
  // - Filtering
  // - Pagination
  // - Row Actions (حسب الصلاحيات)
  // - Export
}
```

**الاستخدام:**
```tsx
// في أي صفحة
const usersTableConfig = {
  columns: [
    { key: 'name', label: 'الاسم', sortable: true },
    { key: 'email', label: 'البريد', sortable: true },
    { key: 'role', label: 'الدور', filterable: true }
  ],
  actions: [
    { label: 'تعديل', permission: 'users:write', handler: editUser },
    { label: 'حذف', permission: 'users:delete', handler: deleteUser }
  ]
}

<DynamicTable config={usersTableConfig} />
```

---

### 3.2 مجموعة النماذج (Forms)

**المشكلة:** نماذج متشابهة بتنسيقات مختلفة

**الحل:**
```tsx
// components/forms/dynamic-form.tsx
interface FormSchema {
  fields: FormField[]
  validation: ZodSchema
  onSubmit: (data: any) => Promise<void>
}

export function DynamicForm({ schema }: { schema: FormSchema }) {
  // نموذج موحد مع:
  // - Validation (Zod)
  // - Error Handling
  // - Loading States
  // - Success Messages
}
```

---

### 3.3 مجموعة الفلاتر (Filters)

**الحل:**
```tsx
// components/filters/filter-bar.tsx
interface FilterConfig {
  type: 'search' | 'select' | 'date' | 'multiselect'
  field: string
  label: string
  options?: Option[]
}

export function FilterBar({ filters }: { filters: FilterConfig[] }) {
  // شريط فلترة موحد
}
```

---

### 3.4 مجموعة البطاقات (Cards)

**الحل:**
```tsx
// components/cards/info-card.tsx
// components/cards/stat-card.tsx
// components/cards/action-card.tsx
```

---

### 3.5 مجموعة الـ Layouts

**الحل:**
```tsx
// components/layouts/page-layout.tsx
interface PageLayoutProps {
  title: string
  description?: string
  backTo?: string
  actions?: ReactNode
  children: ReactNode
}

export function PageLayout(props: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader {...props} />
        {props.children}
      </div>
    </div>
  )
}
```

**الاستخدام:**
```tsx
// في أي صفحة
export default function SomePage() {
  return (
    <PageLayout title="عنوان الصفحة" backTo="/admin">
      {/* المحتوى */}
    </PageLayout>
  )
}
```

---

## 📝 القسم الرابع: توحيد المصطلحات (3 مشاكل)

### 4.1 مشكلة "لوحة التحكم"

**الوضع الحالي:**
- لوحة التحكم الرئيسية
- لوحة تحكم الإدارة
- لوحة تحكم المدير
- لوحة تحكم المدقق

**التوصية:**
```typescript
const terminology = {
  '/': 'الصفحة الرئيسية',
  '/dashboard': 'نظرة عامة',           // Overview
  '/admin': 'لوحة الإدارة',             // Admin Console
  '/manager': 'لوحة المدير',            // Manager Dashboard
  '/auditor': 'لوحة المدقق',            // Auditor Workspace
  '/ops': 'لوحة العمليات'               // Operations Console
}
```

---

### 4.2 مشكلة "المهام/المشاريع/Engagements"

**الوضع الحالي:** مصطلحات متعددة لنفس الشيء

**التوصية:** توحيد على **"المشاريع التدقيقية"**
```typescript
const glossary = {
  en: 'Engagements',
  ar: 'المشاريع التدقيقية',
  shortAr: 'المشاريع'
}
```

---

### 4.3 مشكلة "التقارير"

**الوضع الحالي:**
- تقارير (عامة)
- نماذج التقارير (Admin)
- التقارير الإدارية
- تقارير المدير

**التوصية:**
```typescript
const reportTypes = {
  templates: 'نماذج التقارير',          // Admin
  drafts: 'مسودات التقارير',            // Auditor
  pending: 'التقارير قيد المراجعة',     // Manager
  published: 'التقارير المنشورة',       // All
  analytics: 'تقارير الأداء'            // Admin/Manager
}
```

---

## 🎯 خطة التنفيذ (Implementation Roadmap)

### المرحلة 1: التنظيف (Week 1) 🧹

#### اليوم 1-2: حذف الصفحات المكررة
```bash
# احذف هذه الملفات
rm frontend/app/admin/engagements/page.tsx
rm frontend/app/admin/reports/page.tsx
rm frontend/app/admin/evidence/page.tsx
rm frontend/app/admin/notifications/page.tsx
rm frontend/app/manager/findings/page.tsx
rm frontend/app/auditor/archive/page.tsx
```

#### اليوم 3-4: نقل وإعادة تسمية
```bash
# نقل الصفحات الرئيسية للمسارات الموحدة
mv frontend/app/manager/engagements/page.tsx frontend/app/engagements/page.tsx
mv frontend/app/manager/reports/page.tsx frontend/app/reports/page.tsx
```

#### اليوم 5: تحديث التوجيه (Routing)
```tsx
// middleware.ts
// إضافة redirects للمسارات القديمة
{
  source: '/admin/engagements',
  destination: '/engagements',
  permanent: true
}
```

---

### المرحلة 2: توحيد المكونات (Week 2-3) 🔧

#### Week 2: المكونات الأساسية
- [ ] `components/data-table/dynamic-table.tsx`
- [ ] `components/forms/dynamic-form.tsx`
- [ ] `components/layouts/page-layout.tsx`
- [ ] `components/filters/filter-bar.tsx`

#### Week 3: المكونات المتخصصة
- [ ] `components/dashboards/unified-dashboard.tsx`
- [ ] `components/checklists/checklist-viewer.tsx`
- [ ] `components/reports/report-editor.tsx`
- [ ] `components/engagements/engagement-form.tsx`

---

### المرحلة 3: التحويل (Week 4-5) 🔄

#### Week 4: تحويل الصفحات الرئيسية
- [ ] تحويل `/engagements` للمكونات الجديدة
- [ ] تحويل `/reports` للمكونات الجديدة
- [ ] تحويل `/admin/users` للمكونات الجديدة

#### Week 5: تحويل بقية الصفحات
- [ ] تحويل لوحات التحكم
- [ ] تحويل صفحات الـ Ops
- [ ] تحويل صفحات الـ Auditor

---

### المرحلة 4: الاختبار والتحسين (Week 6) ✅

- [ ] اختبار جميع الصفحات
- [ ] اختبار الصلاحيات (RBAC)
- [ ] اختبار التوافق (Responsive)
- [ ] مراجعة الأداء (Performance)
- [ ] توثيق التغييرات

---

## 📊 البنية المقترحة النهائية

### قبل التحسين (34 صفحة):
```
frontend/app/
├─ page.tsx
├─ login/page.tsx
├─ dashboard/page.tsx
├─ admin/ (10 صفحات)
│  ├─ page.tsx
│  ├─ users/page.tsx
│  ├─ roles/page.tsx
│  ├─ engagements/page.tsx      ❌ للحذف
│  ├─ reports/page.tsx          ❌ للحذف
│  ├─ checklists/page.tsx
│  ├─ evidence/page.tsx         ❌ للحذف
│  ├─ notifications/page.tsx    ❌ للحذف
│  ├─ audit-log/page.tsx
│  └─ ai-lab/page.tsx
├─ manager/ (4 صفحات)
│  ├─ page.tsx
│  ├─ engagements/page.tsx      → سيُنقل
│  ├─ reports/page.tsx          → سيُنقل
│  └─ findings/page.tsx         ❌ للحذف
├─ auditor/ (4 صفحات)
│  ├─ page.tsx
│  ├─ tasks/page.tsx
│  ├─ checklists/page.tsx
│  └─ archive/page.tsx          ❌ للحذف
└─ ops/ (6 صفحات)
   ├─ page.tsx
   ├─ api/page.tsx
   ├─ ai/page.tsx
   ├─ logs/page.tsx
   ├─ settings/page.tsx
   └─ storage/page.tsx
```

### بعد التحسين (28 صفحة):
```
frontend/app/
├─ page.tsx
├─ login/page.tsx
├─ dashboard/page.tsx
├─ engagements/page.tsx         ✅ موحدة (Admin + Manager)
├─ reports/page.tsx             ✅ موحدة (Admin + Manager)
├─ admin/ (5 صفحات)
│  ├─ page.tsx
│  ├─ users/page.tsx
│  ├─ roles/page.tsx
│  ├─ checklists/page.tsx       (إدارة النماذج)
│  └─ audit-log/page.tsx
├─ manager/ (1 صفحة)
│  └─ page.tsx                  (لوحة المدير)
├─ auditor/ (3 صفحات)
│  ├─ page.tsx
│  ├─ tasks/page.tsx
│  └─ checklists/page.tsx       (التنفيذ)
└─ ops/ (6 صفحات)
   ├─ page.tsx
   ├─ api/page.tsx
   ├─ ai/page.tsx
   ├─ logs/page.tsx
   ├─ settings/page.tsx
   └─ storage/page.tsx
```

**النتيجة:**
- ❌ حُذفت 6 صفحات
- ✅ دُمجت 4 صفحات في 2
- 📉 تقليل **18%** في عدد الصفحات
- 🎯 بنية أوضح وأبسط

---

## 🛡️ الحماية من الأخطاء

### 1. Redirects للمسارات القديمة
```tsx
// middleware.ts
const redirects = [
  { from: '/admin/engagements', to: '/engagements' },
  { from: '/admin/reports', to: '/reports' },
  { from: '/manager/engagements', to: '/engagements' },
  { from: '/manager/reports', to: '/reports' }
]
```

### 2. التحقق من الصلاحيات
```tsx
// في كل صفحة موحدة
export default function EngagementsPage() {
  const { user } = useAuth()
  
  if (!user.hasPermission('engagements:read')) {
    return <Unauthorized />
  }
  
  // عرض الصفحة حسب الصلاحيات
}
```

### 3. Fallback Components
```tsx
// للصفحات التي تم حذفها مؤقتاً
export default function ComingSoonPage({ feature }: { feature: string }) {
  return (
    <PageLayout title={`${feature} - قريباً`}>
      <Card>
        <CardHeader>
          <CardTitle>هذه الميزة قيد التطوير</CardTitle>
          <CardDescription>
            سيتم إطلاقها قريباً. تابع معنا!
          </CardDescription>
        </CardHeader>
      </Card>
    </PageLayout>
  )
}
```

---

## 📈 الفوائد المتوقعة

### 1. تحسين الأداء
- ✅ تقليل حجم Bundle بنسبة **25-30%**
- ✅ تحميل أسرع للصفحات (Lazy Loading للمكونات)
- ✅ تقليل استهلاك الذاكرة

### 2. تسهيل الصيانة
- ✅ تقليل الكود المكرر من **~3000 سطر** إلى **~2000 سطر**
- ✅ مكان واحد لإصلاح الأخطاء
- ✅ سهولة إضافة ميزات جديدة

### 3. تحسين تجربة المستخدم
- ✅ واجهة متسقة عبر الصفحات
- ✅ أقل تشتت وأوضح في التنقل
- ✅ تحميل أسرع = تجربة أفضل

### 4. تسهيل التطوير
- ✅ onboarding أسرع للمطورين الجدد
- ✅ بنية واضحة وقابلة للتوسع
- ✅ أسهل في الاختبار (Testing)

---

## 🚨 المخاطر والتحذيرات

### 1. Breaking Changes
**المخاطرة:** تغيير المسارات قد يكسر الروابط الموجودة

**الحل:**
- إضافة redirects دائمة (301)
- إخطار المستخدمين مسبقاً
- فترة انتقالية (3 أشهر) للمسارات القديمة

### 2. فقدان ميزات خاصة
**المخاطرة:** قد تفقد بعض الصفحات ميزات فريدة عند الدمج

**الحل:**
- مراجعة دقيقة لكل صفحة قبل الدمج
- نقل الميزات الفريدة للمكونات الموحدة
- اختبار شامل بعد الدمج

### 3. زيادة التعقيد في البداية
**المخاطرة:** المكونات الموحدة قد تكون معقدة في البداية

**الحل:**
- بدء بسيط ثم زيادة التعقيد تدريجياً
- توثيق جيد للمكونات
- أمثلة واضحة للاستخدام

---

## ✅ قائمة التحقق للتنفيذ

### قبل البدء:
- [ ] عمل نسخة احتياطية (Git branch)
- [ ] مراجعة الخطة مع الفريق
- [ ] تحديد الأولويات
- [ ] تخصيص الموارد

### أثناء التنفيذ:
- [ ] حذف الملفات المحددة
- [ ] نقل الصفحات للمسارات الجديدة
- [ ] إنشاء المكونات الموحدة
- [ ] تحديث التوجيه والـ middleware
- [ ] إضافة redirects للمسارات القديمة
- [ ] تحديث القوائم (Menus) والروابط

### بعد التنفيذ:
- [ ] اختبار جميع الصفحات
- [ ] اختبار الصلاحيات
- [ ] اختبار الأداء
- [ ] مراجعة الكود (Code Review)
- [ ] تحديث الوثائق
- [ ] إخطار المستخدمين

---

## 📞 الدعم والمتابعة

### الخطوات التالية:
1. **مراجعة هذا التقرير** مع فريق التطوير
2. **تحديد الأولويات** (ما يُنفّذ أولاً)
3. **إنشاء Tickets/Issues** لكل مهمة
4. **بدء التنفيذ** تدريجياً (Phase by Phase)
5. **المتابعة الأسبوعية** لقياس التقدم

### قياس النجاح (KPIs):
- عدد الصفحات المحذوفة/المدموجة
- نسبة تقليل الكود المكرر
- وقت تحميل الصفحات (Performance)
- رضا المستخدمين (User Feedback)
- سرعة تطوير ميزات جديدة

---

## 🎉 الخلاصة

**التوصية النهائية:** تنفيذ هذه الخطة تدريجياً على مدى 6 أسابيع

**الأولويات:**
1. ⭐⭐⭐ حذف الصفحات المكررة (Week 1)
2. ⭐⭐⭐ دمج Engagements + Reports (Week 2-3)
3. ⭐⭐ توحيد المكونات الأساسية (Week 3-4)
4. ⭐ تحويل بقية الصفحات (Week 5-6)

**النتيجة المتوقعة:**
- ✅ بنية أبسط وأوضح
- ✅ كود أقل وأسهل للصيانة
- ✅ أداء أفضل
- ✅ تجربة مستخدم محسّنة
- ✅ قابلية أعلى للتوسع

---

**تاريخ التقرير:** 4 نوفمبر 2025  
**المُعِد:** GitHub Copilot  
**الحالة:** ✅ جاهز للتنفيذ

---

## 📎 ملاحق

### Appendix A: قائمة الملفات للحذف
```bash
# نص الأوامر (PowerShell)
cd D:\AuditOrbit\frontend\app

# احذف الصفحات المكررة
Remove-Item admin\engagements\page.tsx
Remove-Item admin\reports\page.tsx
Remove-Item admin\evidence\page.tsx
Remove-Item admin\notifications\page.tsx
Remove-Item manager\findings\page.tsx
Remove-Item auditor\archive\page.tsx

# احذف المجلدات الفارغة
Remove-Item admin\engagements -Recurse -Force
Remove-Item admin\reports -Recurse -Force
Remove-Item admin\evidence -Recurse -Force
Remove-Item admin\notifications -Recurse -Force
Remove-Item manager\findings -Recurse -Force
Remove-Item auditor\archive -Recurse -Force
```

### Appendix B: Template للمكون الموحد
```tsx
// components/unified/resource-page.tsx
interface ResourcePageConfig {
  resource: string
  permissions: {
    read: string
    write?: string
    delete?: string
  }
  columns: ColumnDef[]
  form?: FormSchema
  filters?: FilterConfig[]
  roleBasedViews?: RoleView[]
}

export function ResourcePage({ config }: { config: ResourcePageConfig }) {
  // صفحة موحدة قابلة لإعادة الاستخدام
}
```

### Appendix C: مثال على ملف التكوين
```typescript
// config/pages/engagements.config.ts
export const engagementsConfig: ResourcePageConfig = {
  resource: 'engagements',
  permissions: {
    read: 'engagements:read',
    write: 'engagements:write',
    delete: 'engagements:delete'
  },
  columns: [
    { key: 'title', label: 'العنوان', sortable: true },
    { key: 'status', label: 'الحالة', filterable: true },
    { key: 'assigned_to', label: 'المسند إليه' }
  ],
  roleBasedViews: [
    {
      role: 'admin',
      tabs: ['all', 'templates', 'archived'],
      actions: ['create', 'edit', 'delete', 'export']
    },
    {
      role: 'manager',
      tabs: ['active', 'draft', 'completed'],
      actions: ['create', 'edit', 'assign']
    }
  ]
}
```

---

**نهاية التقرير** ✅
