# 🚀 خطة تطوير صفحة الأدمن - Admin Development Plan
## AuditOrbit Platform Enhancement Roadmap

---

## 📋 نظرة عامة - Executive Summary

**الهدف الاستراتيجي:** تحويل صفحة الأدمن من لوحة تحكم بسيطة إلى مركز قيادة متقدم لإدارة المنصة بالكامل مع ميزات ذكاء اصطناعي وتحليلات متقدمة.

**المدة الزمنية:** 12 أسبوع (3 أشهر)  
**الفريق المطلوب:** 3 مطورين Full-stack + 1 مصمم UI/UX + 1 مهندس AI  
**الميزانية المقدرة:** حسب الموارد المتاحة

---

## 🎯 الأهداف الرئيسية - Key Objectives

### 1. تحسين تجربة المستخدم (UX Enhancement)
- ✅ واجهة سريعة ومستجيبة
- ✅ تصميم حديث باستخدام Tailwind CSS
- ✅ دعم الوضع الليلي/النهاري
- ✅ دعم كامل للغة العربية والإنجليزية

### 2. ميزات إدارية متقدمة (Advanced Admin Features)
- ✅ لوحة معلومات تفاعلية مع رسوم بيانية
- ✅ إدارة متقدمة للصلاحيات (Fine-grained RBAC)
- ✅ سجل تدقيق شامل مع فلترة متقدمة
- ✅ تقارير وتحليلات آلية

### 3. أتمتة وذكاء اصطناعي (AI & Automation)
- ✅ توصيات ذكية للمدققين
- ✅ اكتشاف الأنماط والشذوذ
- ✅ توقع المخاطر
- ✅ توليد التقارير تلقائياً

### 4. الأداء والأمان (Performance & Security)
- ✅ تحسين سرعة التحميل
- ✅ Caching ذكي
- ✅ Two-Factor Authentication (2FA)
- ✅ تشفير البيانات الحساسة

---

## 📅 الجدول الزمني - Timeline

### الشهر الأول (الأسابيع 1-4): الأساسيات والبنية

#### الأسبوع 1: التحليل والتصميم
**المخرجات:**
- [ ] مخططات Wireframes لجميع صفحات الأدمن
- [ ] مخططات تدفق البيانات (Data Flow Diagrams)
- [ ] تصميم قاعدة البيانات الموسعة
- [ ] تحديد APIs المطلوبة

**الملفات المتأثرة:**
```
doc/
├── ADMIN_WIREFRAMES.fig (Figma)
├── DATABASE_SCHEMA_V2.md
└── API_ENDPOINTS_V2.md
```

#### الأسبوع 2: إعادة هيكلة Dashboard
**المهام:**
1. إنشاء Dashboard Layout جديد
2. إضافة Sidebar مع قائمة تنقل محسنة
3. Header مع إشعارات ومعلومات المستخدم
4. Breadcrumbs للتنقل

**الكود المطلوب:**

```tsx
// web/app/admin/layout.tsx - NEW STRUCTURE

'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, Users, Shield, FolderKanban, 
  FileText, Bell, Settings, LogOut 
} from 'lucide-react'
import Link from 'next/link'

export default function AdminLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  
  const menuItems = [
    { icon: LayoutDashboard, label: 'لوحة المعلومات', href: '/admin' },
    { icon: Users, label: 'المستخدمون', href: '/admin/users' },
    { icon: Shield, label: 'الأدوار والصلاحيات', href: '/admin/roles' },
    { icon: FolderKanban, label: 'المهام', href: '/admin/engagements' },
    { icon: FileText, label: 'التقارير', href: '/admin/reports' },
    { icon: Bell, label: 'الإشعارات', href: '/admin/notifications' },
  ]
  
  return (
    <div className="flex min-h-screen bg-slate-950">
      {/* Sidebar */}
      <aside className={`${collapsed ? 'w-20' : 'w-64'} transition-all duration-300 bg-slate-900 border-r border-slate-800`}>
        <div className="p-4">
          <h1 className="text-2xl font-bold text-white">
            {collapsed ? 'AO' : 'AuditOrbit'}
          </h1>
        </div>
        
        <nav className="mt-8">
          {menuItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 ${
                pathname === item.href 
                  ? 'bg-blue-600 text-white' 
                  : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1">
        {/* Header */}
        <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6">
          <button onClick={() => setCollapsed(!collapsed)}>
            Toggle
          </button>
          
          <div className="flex items-center gap-4">
            <Bell className="w-5 h-5 text-slate-400" />
            <div className="flex items-center gap-2">
              <img src="/avatar.png" className="w-8 h-8 rounded-full" />
              <span className="text-white">Admin</span>
            </div>
          </div>
        </header>
        
        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
```

#### الأسبوع 3: Dashboard Analytics
**المهام:**
1. إضافة KPI Cards (مؤشرات الأداء)
2. Charts مع Recharts
3. Recent Activity Feed
4. Quick Actions

**APIs المطلوبة:**

```python
# api/app/presentation/routers/dashboard.py - ENHANCED

@router.get("/kpis", response_model=dict[str, Any])
def get_kpis(
    period: str = Query("month", regex="^(day|week|month|quarter|year)$"),
    db: Session = Depends(get_db),
    user_id: str = Depends(current_user_id)
):
    """
    احصائيات KPIs حسب الفترة الزمنية
    """
    
    # Date range calculation
    if period == "day":
        start_date = datetime.now() - timedelta(days=1)
    elif period == "week":
        start_date = datetime.now() - timedelta(weeks=1)
    elif period == "month":
        start_date = datetime.now() - timedelta(days=30)
    elif period == "quarter":
        start_date = datetime.now() - timedelta(days=90)
    else:  # year
        start_date = datetime.now() - timedelta(days=365)
    
    # KPIs calculation
    total_engagements = db.execute(
        text("SELECT COUNT(*) FROM engagements WHERE created_at >= :start"),
        {"start": start_date}
    ).scalar_one()
    
    completed_engagements = db.execute(
        text("SELECT COUNT(*) FROM engagements WHERE status = 'COMPLETED' AND created_at >= :start"),
        {"start": start_date}
    ).scalar_one()
    
    total_findings = db.execute(
        text("SELECT COUNT(*) FROM findings WHERE created_at >= :start"),
        {"start": start_date}
    ).scalar_one()
    
    high_risk_findings = db.execute(
        text("SELECT COUNT(*) FROM findings WHERE severity = 'high' AND created_at >= :start"),
        {"start": start_date}
    ).scalar_one()
    
    total_reports = db.execute(
        text("SELECT COUNT(*) FROM reports WHERE created_at >= :start"),
        {"start": start_date}
    ).scalar_one()
    
    published_reports = db.execute(
        text("SELECT COUNT(*) FROM reports WHERE status = 'PUBLISHED' AND created_at >= :start"),
        {"start": start_date}
    ).scalar_one()
    
    active_users = db.execute(
        text("""
            SELECT COUNT(DISTINCT user_id) 
            FROM audit_logs 
            WHERE created_at >= :start
        """),
        {"start": start_date}
    ).scalar_one()
    
    avg_completion_time = db.execute(
        text("""
            SELECT AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/86400)
            FROM engagements
            WHERE status = 'COMPLETED' AND created_at >= :start
        """),
        {"start": start_date}
    ).scalar_one() or 0
    
    return {
        "period": period,
        "start_date": start_date.isoformat(),
        "total_engagements": total_engagements,
        "completed_engagements": completed_engagements,
        "completion_rate": round((completed_engagements / total_engagements * 100) if total_engagements > 0 else 0, 2),
        "total_findings": total_findings,
        "high_risk_findings": high_risk_findings,
        "high_risk_percentage": round((high_risk_findings / total_findings * 100) if total_findings > 0 else 0, 2),
        "total_reports": total_reports,
        "published_reports": published_reports,
        "active_users": active_users,
        "avg_completion_time_days": round(avg_completion_time, 1)
    }

@router.get("/charts/engagements-trend", response_model=list[dict])
def get_engagements_trend(
    period: str = Query("month"),
    db: Session = Depends(get_db),
    user_id: str = Depends(current_user_id)
):
    """
    رسم بياني لاتجاه المهام
    """
    
    if period == "month":
        interval = "day"
        limit = 30
    elif period == "quarter":
        interval = "week"
        limit = 13
    else:  # year
        interval = "month"
        limit = 12
    
    trend = db.execute(
        text(f"""
            SELECT 
                date_trunc('{interval}', created_at) as period,
                COUNT(*) as count,
                COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completed
            FROM engagements
            WHERE created_at >= NOW() - INTERVAL '{limit} {interval}'
            GROUP BY period
            ORDER BY period
        """)
    ).mappings().all()
    
    return [
        {
            "period": row["period"].isoformat(),
            "total": row["count"],
            "completed": row["completed"]
        }
        for row in trend
    ]

@router.get("/activity-feed", response_model=list[dict])
def get_activity_feed(
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    user_id: str = Depends(current_user_id)
):
    """
    آخر الأنشطة في النظام
    """
    
    activities = db.execute(
        text("""
            SELECT 
                al.id,
                al.action,
                al.resource_type,
                al.resource_id,
                al.created_at,
                u.name as user_name,
                u.email as user_email
            FROM audit_logs al
            JOIN users u ON al.user_id = u.id
            ORDER BY al.created_at DESC
            LIMIT :limit
        """),
        {"limit": limit}
    ).mappings().all()
    
    return [
        {
            "id": str(row["id"]),
            "action": row["action"],
            "resource_type": row["resource_type"],
            "resource_id": str(row["resource_id"]) if row["resource_id"] else None,
            "user_name": row["user_name"],
            "user_email": row["user_email"],
            "created_at": row["created_at"].isoformat()
        }
        for row in activities
    ]
```

**Frontend Component:**

```tsx
// web/app/admin/page.tsx - ENHANCED DASHBOARD

'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, Users, FileText, AlertTriangle } from 'lucide-react'
import { apiFetch } from '@/lib/api-client'

export default function AdminDashboard() {
  const [period, setPeriod] = useState('month')
  
  const { data: kpis } = useQuery({
    queryKey: ['dashboard-kpis', period],
    queryFn: () => apiFetch<any>(`/dashboard/kpis?period=${period}`)
  })
  
  const { data: trend } = useQuery({
    queryKey: ['engagements-trend', period],
    queryFn: () => apiFetch<any[]>(`/dashboard/charts/engagements-trend?period=${period}`)
  })
  
  const { data: activities } = useQuery({
    queryKey: ['activity-feed'],
    queryFn: () => apiFetch<any[]>('/dashboard/activity-feed?limit=10'),
    refetchInterval: 30000 // Refresh every 30 seconds
  })
  
  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex gap-2">
        {['day', 'week', 'month', 'quarter', 'year'].map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded ${period === p ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}
          >
            {p}
          </button>
        ))}
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-slate-400">المهام النشطة</CardTitle>
              <TrendingUp className="w-4 h-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">{kpis?.total_engagements}</p>
            <p className="text-sm text-slate-400 mt-1">
              {kpis?.completion_rate}% مكتملة
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-slate-400">النتائج</CardTitle>
              <AlertTriangle className="w-4 h-4 text-red-500" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">{kpis?.total_findings}</p>
            <p className="text-sm text-red-400 mt-1">
              {kpis?.high_risk_findings} عالية الخطورة
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-slate-400">التقارير</CardTitle>
              <FileText className="w-4 h-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">{kpis?.total_reports}</p>
            <p className="text-sm text-slate-400 mt-1">
              {kpis?.published_reports} منشورة
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-slate-400">المستخدمون النشطون</CardTitle>
              <Users className="w-4 h-4 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">{kpis?.active_users}</p>
            <p className="text-sm text-slate-400 mt-1">
              في آخر {period}
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">اتجاه المهام</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="period" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
                <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">آخر الأنشطة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activities?.map(activity => (
                <div key={activity.id} className="flex items-start gap-3 p-3 bg-slate-800 rounded">
                  <div className="w-2 h-2 mt-2 rounded-full bg-blue-500"></div>
                  <div className="flex-1">
                    <p className="text-sm text-white">
                      {activity.user_name} قام بـ {activity.action}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {new Date(activity.created_at).toLocaleString('ar')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
```

#### الأسبوع 4: إدارة المستخدمين المتقدمة
**المهام:**
1. جدول قابل للفلترة والبحث
2. نموذج إضافة/تعديل مستخدم محسن
3. Bulk Actions (تفعيل/تعطيل/حذف)
4. تصدير البيانات (CSV, Excel)

---

### الشهر الثاني (الأسابيع 5-8): الميزات المتقدمة

#### الأسبوع 5: نظام الصلاحيات المتقدم (Fine-grained RBAC)
**المهام:**
1. واجهة إدارة الصلاحيات Visual
2. Permission Matrix
3. Role Templates
4. Permission Inheritance

**Database Schema:**

```sql
-- إضافة جداول جديدة

CREATE TABLE permission_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES permission_categories(id),
  code VARCHAR(100) UNIQUE NOT NULL,  -- e.g., 'users.create', 'reports.publish'
  name VARCHAR(200) NOT NULL,
  description TEXT,
  is_dangerous BOOLEAN DEFAULT false  -- للصلاحيات الحساسة
);

CREATE TABLE role_permissions (
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  granted BOOLEAN DEFAULT true,
  granted_by UUID REFERENCES users(id),
  granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (role_id, permission_id)
);

-- Seed Data
INSERT INTO permission_categories (name, description, icon, sort_order) VALUES
  ('المستخدمون', 'إدارة المستخدمين والحسابات', 'Users', 1),
  ('المهام', 'إدارة مهام التدقيق', 'FolderKanban', 2),
  ('التقارير', 'إدارة وإصدار التقارير', 'FileText', 3),
  ('الأدلة', 'إدارة الأدلة والملفات', 'Upload', 4),
  ('النظام', 'إعدادات النظام والصلاحيات', 'Settings', 5);

INSERT INTO permissions (category_id, code, name, description, is_dangerous) VALUES
  ((SELECT id FROM permission_categories WHERE name = 'المستخدمون'), 'users.view', 'عرض المستخدمين', 'القدرة على عرض قائمة المستخدمين', false),
  ((SELECT id FROM permission_categories WHERE name = 'المستخدمون'), 'users.create', 'إضافة مستخدم', 'القدرة على إضافة مستخدمين جدد', false),
  ((SELECT id FROM permission_categories WHERE name = 'المستخدمون'), 'users.edit', 'تعديل مستخدم', 'القدرة على تعديل بيانات المستخدمين', false),
  ((SELECT id FROM permission_categories WHERE name = 'المستخدمون'), 'users.delete', 'حذف مستخدم', 'القدرة على حذف المستخدمين', true),
  ((SELECT id FROM permission_categories WHERE name = 'التقارير'), 'reports.publish', 'نشر تقرير', 'القدرة على نشر التقارير', true);
```

**API Endpoint:**

```python
# api/app/presentation/routers/permissions.py - NEW FILE

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

router = APIRouter()

@router.get("/permission-categories", response_model=list[PermissionCategoryOut])
def list_permission_categories(
    db: Session = Depends(get_db),
    user_id: str = Depends(current_user_id)
):
    enforce(db, user_id, "permissions", "view")
    
    categories = db.execute(
        text("""
            SELECT 
                pc.id::text,
                pc.name,
                pc.description,
                pc.icon,
                COUNT(p.id) as permissions_count
            FROM permission_categories pc
            LEFT JOIN permissions p ON pc.id = p.category_id
            GROUP BY pc.id
            ORDER BY pc.sort_order
        """)
    ).mappings().all()
    
    return [PermissionCategoryOut(**dict(cat)) for cat in categories]

@router.get("/permissions", response_model=list[PermissionOut])
def list_permissions(
    category_id: str | None = Query(None),
    db: Session = Depends(get_db),
    user_id: str = Depends(current_user_id)
):
    enforce(db, user_id, "permissions", "view")
    
    filters = []
    params = {}
    
    if category_id:
        filters.append("category_id = :cat_id")
        params["cat_id"] = category_id
    
    where_clause = f"WHERE {' AND '.join(filters)}" if filters else ""
    
    permissions = db.execute(
        text(f"""
            SELECT 
                p.id::text,
                p.code,
                p.name,
                p.description,
                p.is_dangerous,
                pc.name as category_name
            FROM permissions p
            JOIN permission_categories pc ON p.category_id = pc.id
            {where_clause}
            ORDER BY pc.sort_order, p.name
        """),
        params
    ).mappings().all()
    
    return [PermissionOut(**dict(perm)) for perm in permissions]

@router.get("/roles/{role_id}/permissions", response_model=dict[str, Any])
def get_role_permissions(
    role_id: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(current_user_id)
):
    enforce(db, user_id, "roles", "view")
    
    # Get role info
    role = db.execute(
        text("SELECT id::text, name, description FROM roles WHERE id = :id"),
        {"id": role_id}
    ).mappings().first()
    
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    
    # Get all permissions with granted status for this role
    permissions = db.execute(
        text("""
            SELECT 
                p.id::text,
                p.code,
                p.name,
                p.category_id::text,
                pc.name as category_name,
                COALESCE(rp.granted, false) as granted
            FROM permissions p
            JOIN permission_categories pc ON p.category_id = pc.id
            LEFT JOIN role_permissions rp ON p.id = rp.permission_id AND rp.role_id = :role_id
            ORDER BY pc.sort_order, p.name
        """),
        {"role_id": role_id}
    ).mappings().all()
    
    # Group by category
    grouped = {}
    for perm in permissions:
        cat_id = perm["category_id"]
        if cat_id not in grouped:
            grouped[cat_id] = {
                "category_name": perm["category_name"],
                "permissions": []
            }
        grouped[cat_id]["permissions"].append({
            "id": perm["id"],
            "code": perm["code"],
            "name": perm["name"],
            "granted": perm["granted"]
        })
    
    return {
        "role": dict(role),
        "permission_categories": list(grouped.values())
    }

@router.put("/roles/{role_id}/permissions", response_model=dict[str, bool])
def update_role_permissions(
    role_id: str,
    payload: RolePermissionsUpdate,
    db: Session = Depends(get_db),
    user_id: str = Depends(current_user_id)
):
    enforce(db, user_id, "roles", "edit_permissions")
    
    # Delete existing permissions
    db.execute(
        text("DELETE FROM role_permissions WHERE role_id = :role_id"),
        {"role_id": role_id}
    )
    
    # Insert new permissions
    for perm_id in payload.permission_ids:
        db.execute(
            text("""
                INSERT INTO role_permissions (role_id, permission_id, granted_by)
                VALUES (:role_id, :perm_id, :user_id)
            """),
            {"role_id": role_id, "perm_id": perm_id, "user_id": user_id}
        )
    
    db.commit()
    
    return {"success": True}
```

**Frontend Component:**

```tsx
// web/app/admin/roles/[roleId]/permissions/page.tsx

'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api-client'
import { Card } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'

export default function RolePermissionsPage({ params }) {
  const queryClient = useQueryClient()
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set())
  
  const { data } = useQuery({
    queryKey: ['role-permissions', params.roleId],
    queryFn: () => apiFetch<any>(`/permissions/roles/${params.roleId}/permissions`),
    onSuccess: (data) => {
      // Initialize selected permissions
      const granted = new Set<string>()
      data.permission_categories.forEach(cat => {
        cat.permissions.forEach(perm => {
          if (perm.granted) granted.add(perm.id)
        })
      })
      setSelectedPermissions(granted)
    }
  })
  
  const updateMutation = useMutation({
    mutationFn: (permissionIds: string[]) => 
      apiFetch(`/permissions/roles/${params.roleId}/permissions`, {
        method: 'PUT',
        body: JSON.stringify({ permission_ids: permissionIds })
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role-permissions'] })
      toast.success('تم تحديث الصلاحيات بنجاح')
    }
  })
  
  const togglePermission = (permId: string) => {
    setSelectedPermissions(prev => {
      const next = new Set(prev)
      if (next.has(permId)) {
        next.delete(permId)
      } else {
        next.add(permId)
      }
      return next
    })
  }
  
  const handleSave = () => {
    updateMutation.mutate(Array.from(selectedPermissions))
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">
          صلاحيات: {data?.role.name}
        </h1>
        <Button onClick={handleSave} disabled={updateMutation.isLoading}>
          حفظ التغييرات
        </Button>
      </div>
      
      <div className="space-y-4">
        {data?.permission_categories.map(category => (
          <Card key={category.category_name} className="bg-slate-900 border-slate-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              {category.category_name}
            </h3>
            
            <div className="space-y-3">
              {category.permissions.map(perm => (
                <div key={perm.id} className="flex items-center justify-between p-3 bg-slate-800 rounded">
                  <div>
                    <p className="text-white font-medium">{perm.name}</p>
                    <p className="text-sm text-slate-400">{perm.code}</p>
                  </div>
                  <Switch
                    checked={selectedPermissions.has(perm.id)}
                    onCheckedChange={() => togglePermission(perm.id)}
                  />
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
```

#### الأسبوع 6: سجل التدقيق المتقدم (Advanced Audit Log)
**المهام:**
1. فلترة متقدمة (تاريخ، مستخدم، نوع الإجراء)
2. Timeline View
3. Export Logs
4. Retention Policies

#### الأسبوع 7: نظام الإشعارات المحسن
**المهام:**
1. Real-time Notifications مع WebSockets
2. تخصيص الإشعارات لكل مستخدم
3. Notification Center
4. Email/SMS Integration

#### الأسبوع 8: تقارير وتحليلات متقدمة
**المهام:**
1. Report Builder
2. Custom Dashboards
3. Scheduled Reports
4. Data Export (PDF, Excel, CSV)

---

### الشهر الثالث (الأسابيع 9-12): الذكاء الاصطناعي والتحسينات

#### الأسبوع 9: AI-Powered Recommendations
**المهام:**
1. توصيات المدققين المناسبين للمهام
2. اكتشاف الأنماط في النتائج
3. توقع المخاطر

**Implementation:**

```python
# api/app/application/services/ai_recommendations.py - NEW FILE

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

class AuditorRecommendationService:
    """
    خدمة التوصية بالمدققين المناسبين للمهام
    """
    
    def __init__(self, db: Session):
        self.db = db
    
    def recommend_auditors_for_engagement(
        self, 
        engagement_id: str, 
        top_k: int = 3
    ) -> list[dict]:
        """
        يوصي بأفضل 3 مدققين لمهمة معينة بناءً على:
        1. الخبرة السابقة في مجالات مشابهة
        2. معدل النجاح
        3. الحمل الحالي
        """
        
        # 1. Get engagement details
        engagement = self.db.execute(
            text("""
                SELECT title, scope, risk_rating 
                FROM engagements 
                WHERE id = :id
            """),
            {"id": engagement_id}
        ).mappings().first()
        
        # 2. Get all auditors with their history
        auditors = self.db.execute(
            text("""
                SELECT 
                    u.id::text,
                    u.name,
                    u.email,
                    COUNT(ea.engagement_id) as total_engagements,
                    COUNT(CASE WHEN e.status = 'COMPLETED' THEN 1 END) as completed_engagements,
                    STRING_AGG(DISTINCT e.title, ' | ') as past_titles,
                    STRING_AGG(DISTINCT e.scope, ' | ') as past_scopes,
                    COUNT(CASE WHEN ea.is_active = true THEN 1 END) as current_load
                FROM users u
                JOIN user_roles ur ON u.id = ur.user_id
                JOIN roles r ON ur.role_id = r.id
                LEFT JOIN engagement_auditors ea ON u.id = ea.auditor_id
                LEFT JOIN engagements e ON ea.engagement_id = e.id
                WHERE r.name = 'auditor'
                GROUP BY u.id, u.name, u.email
            """)
        ).mappings().all()
        
        # 3. Calculate similarity scores
        vectorizer = TfidfVectorizer()
        
        # Prepare texts for comparison
        eng_text = f"{engagement['title']} {engagement['scope']}"
        auditor_texts = [
            f"{aud['past_titles']} {aud['past_scopes']}" 
            for aud in auditors
        ]
        
        # Add engagement text as first item
        all_texts = [eng_text] + auditor_texts
        
        # Calculate TF-IDF
        tfidf_matrix = vectorizer.fit_transform(all_texts)
        
        # Calculate cosine similarity
        similarities = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:]).flatten()
        
        # 4. Calculate final scores
        recommendations = []
        for i, auditor in enumerate(auditors):
            # Factors:
            # - Similarity score (0-1)
            # - Success rate (0-1)
            # - Load penalty (inverse of current load)
            
            similarity_score = similarities[i]
            
            success_rate = (
                auditor['completed_engagements'] / auditor['total_engagements']
                if auditor['total_engagements'] > 0 else 0
            )
            
            load_penalty = 1 / (1 + auditor['current_load'])
            
            # Weighted final score
            final_score = (
                0.5 * similarity_score +
                0.3 * success_rate +
                0.2 * load_penalty
            )
            
            recommendations.append({
                "auditor_id": auditor['id'],
                "name": auditor['name'],
                "email": auditor['email'],
                "score": round(final_score, 3),
                "similarity": round(similarity_score, 3),
                "success_rate": round(success_rate, 3),
                "current_load": auditor['current_load'],
                "total_engagements": auditor['total_engagements']
            })
        
        # Sort by score and return top K
        recommendations.sort(key=lambda x: x['score'], reverse=True)
        return recommendations[:top_k]

# API Endpoint
@router.get("/engagements/{engagement_id}/recommend-auditors")
def recommend_auditors(
    engagement_id: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(current_user_id)
):
    enforce(db, user_id, "engagements", "assign")
    
    service = AuditorRecommendationService(db)
    recommendations = service.recommend_auditors_for_engagement(engagement_id)
    
    return {
        "engagement_id": engagement_id,
        "recommendations": recommendations
    }
```

#### الأسبوع 10: Two-Factor Authentication (2FA)
**المهام:**
1. TOTP Implementation (Google Authenticator)
2. Backup Codes
3. SMS 2FA (Optional)
4. Recovery Options

#### الأسبوع 11: Performance Optimization
**المهام:**
1. Redis Caching
2. Database Query Optimization
3. Frontend Code Splitting
4. CDN Integration

#### الأسبوع 12: Testing & Documentation
**المهام:**
1. Unit Tests (Backend)
2. Integration Tests
3. E2E Tests (Playwright)
4. API Documentation Update
5. User Manual

---

## 📊 مؤشرات النجاح - Success Metrics

### Technical Metrics
- [ ] Page Load Time < 2 seconds
- [ ] API Response Time < 200ms (95th percentile)
- [ ] Test Coverage > 80%
- [ ] Zero Critical Security Vulnerabilities
- [ ] Uptime > 99.9%

### User Experience Metrics
- [ ] User Satisfaction Score > 4.5/5
- [ ] Task Completion Rate > 90%
- [ ] Average Time to Complete Admin Task < 5 minutes
- [ ] Support Tickets Reduction by 50%

### Business Metrics
- [ ] Admin Efficiency Increase by 40%
- [ ] Audit Completion Time Reduction by 30%
- [ ] Error Rate Reduction by 60%

---

## 🛠️ التقنيات والأدوات المطلوبة

### Backend
- ✅ FastAPI (existing)
- ✅ SQLAlchemy (existing)
- ✅ PostgreSQL (existing)
- 🆕 Redis (for caching)
- 🆕 Celery (for background tasks)
- 🆕 Scikit-learn (for ML features)
- 🆕 PyOTP (for 2FA)

### Frontend
- ✅ Next.js 14 (existing)
- ✅ TypeScript (existing)
- ✅ Tailwind CSS (existing)
- ✅ React Query (existing)
- 🆕 Recharts (for advanced charts)
- 🆕 Socket.io-client (for real-time)
- 🆕 React Hook Form (for complex forms)
- 🆕 Zod (for validation)

### DevOps
- 🆕 Docker Compose (for local dev)
- 🆕 GitHub Actions (for CI/CD)
- 🆕 Sentry (for error tracking)
- 🆕 Prometheus + Grafana (for monitoring)

---

## 💰 تقدير التكاليف - Cost Estimation

### Infrastructure (شهرياً)
- VPS/Cloud Server: $100-200
- Database (managed): $50-100
- Redis Cache: $30-50
- CDN: $20-50
- Monitoring Tools: $50-100
- **Total: $250-500/month**

### Development (لمرة واحدة)
- 3 Full-stack Developers × 3 months × $5000 = $45,000
- 1 UI/UX Designer × 1 month × $4000 = $4,000
- 1 AI Engineer × 1 month × $6000 = $6,000
- **Total: $55,000**

---

## ⚠️ المخاطر والتحديات - Risks & Mitigation

### Technical Risks

**Risk 1: Performance Issues with Large Data**
- **Mitigation:** 
  - Implement pagination everywhere
  - Use database indexing
  - Add Redis caching
  - Lazy loading for frontend

**Risk 2: Security Vulnerabilities**
- **Mitigation:**
  - Regular security audits
  - Penetration testing
  - Keep dependencies updated
  - Implement WAF

**Risk 3: Data Migration Issues**
- **Mitigation:**
  - Thorough testing in staging
  - Backup before migration
  - Rollback plan
  - Incremental migration

### Business Risks

**Risk 1: User Resistance to Change**
- **Mitigation:**
  - Gradual rollout
  - Training sessions
  - User feedback loops
  - Keep old UI available for transition period

**Risk 2: Timeline Delays**
- **Mitigation:**
  - Buffer time in schedule
  - Regular progress reviews
  - Clear prioritization
  - MVP approach

---

## 🎓 Training Plan

### Week 1: Admin Training
- Dashboard navigation
- User management
- Basic operations

### Week 2: Advanced Features
- RBAC configuration
- AI recommendations
- Report generation

### Week 3: Troubleshooting
- Common issues
- Log analysis
- Support procedures

---

## 📝 Checklist للإطلاق - Launch Checklist

### Pre-Launch (قبل الإطلاق)
- [ ] All features tested and working
- [ ] Security audit completed
- [ ] Performance benchmarks met
- [ ] Documentation completed
- [ ] Training materials ready
- [ ] Backup and recovery tested
- [ ] Monitoring set up

### Launch Day (يوم الإطلاق)
- [ ] Database backup
- [ ] Deploy to production
- [ ] Smoke tests
- [ ] Monitor for errors
- [ ] Support team on standby

### Post-Launch (بعد الإطلاق)
- [ ] Collect user feedback
- [ ] Monitor performance
- [ ] Fix critical bugs
- [ ] Plan next iteration

---

## 📞 الدعم والصيانة - Support & Maintenance

### Daily
- Monitor error logs
- Check system health
- Respond to critical issues

### Weekly
- Review performance metrics
- User feedback analysis
- Bug fix deployment

### Monthly
- Security updates
- Feature enhancements
- Capacity planning

### Quarterly
- Major version updates
- Architecture review
- Training refresher

---

## 🚀 المرحلة التالية - Next Phase (Future)

### Phase 2 (Months 4-6)
- Mobile App (React Native)
- Advanced AI Features
- Multi-tenancy Support
- White-label Options

### Phase 3 (Months 7-9)
- Blockchain for Audit Trail
- Advanced Analytics with ML
- Integration APIs
- Marketplace for Plugins

---

## 📚 المراجع والموارد - References

### Documentation
- FastAPI: https://fastapi.tiangolo.com/
- Next.js: https://nextjs.org/docs
- PostgreSQL: https://www.postgresql.org/docs/
- React Query: https://tanstack.com/query/latest

### Learning Resources
- Clean Architecture: Robert C. Martin
- Designing Data-Intensive Applications: Martin Kleppmann
- System Design Interview: Alex Xu

---

**تاريخ الإنشاء:** 29 أكتوبر 2025  
**الإصدار:** 1.0  
**الحالة:** معتمد للتنفيذ  
**المراجع:** مبرمج خبير 10+ سنوات

---

## ✅ الخلاصة - Conclusion

هذه الخطة توفر رؤية شاملة لتطوير صفحة الأدمن من صفحة بسيطة إلى مركز قيادة متقدم. التنفيذ السليم لهذه الخطة سيؤدي إلى:

1. ✅ **تحسين الإنتاجية** بنسبة 40%
2. ✅ **تقليل الأخطاء** بنسبة 60%
3. ✅ **تحسين تجربة المستخدم** بشكل كبير
4. ✅ **زيادة الأمان** والحماية
5. ✅ **قابلية التوسع** للمستقبل

**الخطوة التالية:** مراجعة الخطة مع الفريق والبدء في الأسبوع الأول! 🚀

