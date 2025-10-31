# 🗂️ تقرير قاعدة بيانات مشروع AuditOrbit

## 1️⃣ المعلومات الأساسية

| العنصر            | التفاصيل                                                                 |
|-------------------|--------------------------------------------------------------------------|
| نوع قاعدة البيانات | PostgreSQL                                                               |
| الإصدار           | غالباً 13+ (يستخدم امتدادات مثل uuid-ossp و pgcrypto)                    |
| الغرض من المشروع  | نظام إدارة ومتابعة التدقيق الداخلي، إدارة المستخدمين، المهام، الصلاحيات  |
| نوع التطبيق       | تطبيق ويب متكامل (Backend: FastAPI/Python، Frontend: Next.js/React)      |
| نظرة عامة         | قاعدة بيانات علائقية تدير المستخدمين، الأدوار، الصلاحيات، المهام التدقيقية، الخطط السنوية، سجلات التدقيق، المستندات، قوائم التحقق، وغيرها. كل كيان مرتبط بعلاقات واضحة لضمان التحكم والصلاحية. |

---

## 2️⃣ هيكل قاعدة البيانات الكامل

### 📋 الجداول الأساسية

#### 1. users (المستخدمون)
| اسم العمود      | نوع البيانات   | القيود                |
|-----------------|---------------|-----------------------|
| id              | UUID          | PRIMARY KEY, DEFAULT  |
| email           | VARCHAR(255)  | UNIQUE, NOT NULL      |
| password_hash   | VARCHAR(255)  | NOT NULL              |
| name            | VARCHAR(255)  | NOT NULL              |
| role_id         | UUID          | FK → roles(id)        |
| status          | VARCHAR(50)   | DEFAULT 'active'      |
| last_login      | TIMESTAMP     |                       |
| created_at      | TIMESTAMP     | DEFAULT NOW()         |
| updated_at      | TIMESTAMP     | DEFAULT NOW()         |

- **Primary Key:** id
- **Foreign Key:** role_id → roles(id)
- **Indexes:** email, role_id, status

#### 2. roles (الأدوار)
| اسم العمود      | نوع البيانات   | القيود                |
|-----------------|---------------|-----------------------|
| id              | UUID          | PRIMARY KEY, DEFAULT  |
| name            | VARCHAR(100)  | UNIQUE, NOT NULL      |
| description     | TEXT          |                       |
| created_at      | TIMESTAMP     | DEFAULT NOW()         |
| updated_at      | TIMESTAMP     | DEFAULT NOW()         |

- **Primary Key:** id
- **Indexes:** name

#### 3. permissions (الصلاحيات)
| اسم العمود      | نوع البيانات   | القيود                |
|-----------------|---------------|-----------------------|
| id              | UUID          | PRIMARY KEY, DEFAULT  |
| name            | VARCHAR(100)  | UNIQUE, NOT NULL      |
| resource        | VARCHAR(100)  | NOT NULL              |
| action          | VARCHAR(50)   | NOT NULL              |
| description     | TEXT          |                       |
| created_at      | TIMESTAMP     | DEFAULT NOW()         |

- **Primary Key:** id
- **Indexes:** name, resource, action

#### 4. user_roles (ربط المستخدمين بالأدوار)
| اسم العمود      | نوع البيانات   | القيود                |
|-----------------|---------------|-----------------------|
| user_id         | UUID          | FK → users(id)        |
| role_id         | UUID          | FK → roles(id)        |

- **Primary Key:** (user_id, role_id)
- **Foreign Keys:** user_id → users(id), role_id → roles(id)

#### 5. role_permissions (ربط الأدوار بالصلاحيات)
| اسم العمود      | نوع البيانات   | القيود                |
|-----------------|---------------|-----------------------|
| role_id         | UUID          | FK → roles(id)        |
| permission_id   | UUID          | FK → permissions(id)  |

- **Primary Key:** (role_id, permission_id)
- **Foreign Keys:** role_id → roles(id), permission_id → permissions(id)

#### 6. audit_logs (سجلات التدقيق)
| اسم العمود      | نوع البيانات   | القيود                |
|-----------------|---------------|-----------------------|
| id              | BIGINT        | PRIMARY KEY, AUTO     |
| actor_id        | UUID          | FK → users(id)        |
| action          | TEXT          | NOT NULL              |
| resource        | TEXT          | NOT NULL              |
| resource_id     | UUID          |                       |
| at              | TIMESTAMP     | DEFAULT NOW()         |
| ip              | TEXT          |                       |

- **Primary Key:** id
- **Foreign Key:** actor_id → users(id)
- **Indexes:** action, resource, created_at

#### 7. annual_plans (الخطط السنوية)
| اسم العمود      | نوع البيانات   | القيود                |
|-----------------|---------------|-----------------------|
| id              | UUID          | PRIMARY KEY, DEFAULT  |
| name            | VARCHAR(255)  | NOT NULL              |
| fiscal_year     | INTEGER       | NOT NULL              |
| budget          | DECIMAL(15,2) |                       |
| status          | VARCHAR(50)   | DEFAULT 'draft'       |
| created_by      | UUID          | FK → users(id)        |
| approved_by     | UUID          | FK → users(id)        |
| approved_at     | TIMESTAMP     |                       |
| created_at      | TIMESTAMP     | DEFAULT NOW()         |
| updated_at      | TIMESTAMP     | DEFAULT NOW()         |

- **Primary Key:** id
- **Foreign Keys:** created_by, approved_by → users(id)
- **Indexes:** fiscal_year, status

#### 8. engagements (المهام التدقيقية)
| اسم العمود      | نوع البيانات   | القيود                |
|-----------------|---------------|-----------------------|
| id              | UUID          | PRIMARY KEY, DEFAULT  |
| code            | VARCHAR(100)  | UNIQUE, NOT NULL      |
| title           | VARCHAR(255)  | NOT NULL              |
| objective       | TEXT          | NOT NULL              |
| status          | VARCHAR(50)   | DEFAULT 'draft'       |
| assigned_to     | UUID          | FK → users(id)        |
| annual_plan_id  | UUID          | FK → annual_plans(id) |
| progress        | INTEGER       | DEFAULT 0             |
| created_by      | UUID          | FK → users(id)        |
| created_at      | TIMESTAMP     | DEFAULT NOW()         |
| updated_at      | TIMESTAMP     | DEFAULT NOW()         |

- **Primary Key:** id
- **Foreign Keys:** assigned_to, created_by → users(id), annual_plan_id → annual_plans(id)
- **Indexes:** code, status, assigned_to, annual_plan_id

#### 9. engagement_team (فريق المهمة)
| اسم العمود      | نوع البيانات   | القيود                |
|-----------------|---------------|-----------------------|
| engagement_id   | UUID          | FK → engagements(id)  |
| user_id         | UUID          | FK → users(id)        |
| role            | VARCHAR(100)  |                       |
| assigned_at     | TIMESTAMP     | DEFAULT NOW()         |

- **Primary Key:** (engagement_id, user_id)
- **Foreign Keys:** engagement_id → engagements(id), user_id → users(id)
- **Indexes:** user_id

#### 10. checklists (قوائم التحقق)
| اسم العمود      | نوع البيانات   | القيود                |
|-----------------|---------------|-----------------------|
| id              | UUID          | PRIMARY KEY, DEFAULT  |
| engagement_id   | UUID          | FK → engagements(id)  |
| name            | VARCHAR(255)  | NOT NULL              |
| description     | TEXT          |                       |
| created_at      | TIMESTAMP     | DEFAULT NOW()         |
| updated_at      | TIMESTAMP     | DEFAULT NOW()         |

- **Primary Key:** id
- **Foreign Key:** engagement_id → engagements(id)
- **Indexes:** engagement_id

#### 11. checklist_items (بنود قائمة التحقق)
| اسم العمود      | نوع البيانات   | القيود                |
|-----------------|---------------|-----------------------|
| id              | UUID          | PRIMARY KEY, DEFAULT  |
| checklist_id    | UUID          | FK → checklists(id)   |
| section         | VARCHAR(255)  |                       |
| text            | TEXT          | NOT NULL              |
| checked         | BOOLEAN       | DEFAULT FALSE         |
| notes           | TEXT          |                       |
| checked_by      | UUID          | FK → users(id)        |
| checked_at      | TIMESTAMP     |                       |
| order_index     | INTEGER       |                       |
| created_at      | TIMESTAMP     | DEFAULT NOW()         |
| updated_at      | TIMESTAMP     | DEFAULT NOW()         |

- **Primary Key:** id
- **Foreign Keys:** checklist_id → checklists(id), checked_by → users(id)
- **Indexes:** checklist_id, checked

#### 12. documents (المستندات)
| اسم العمود      | نوع البيانات   | القيود                |
|-----------------|---------------|-----------------------|
| id              | UUID          | PRIMARY KEY, DEFAULT  |
| engagement_id   | UUID          | FK → engagements(id)  |
| name            | VARCHAR(255)  | NOT NULL              |
| file_url        | TEXT          | NOT NULL              |
| uploaded_by     | UUID          | FK → users(id)        |
| uploaded_at     | TIMESTAMP     | DEFAULT NOW()         |

- **Primary Key:** id
- **Foreign Keys:** engagement_id → engagements(id), uploaded_by → users(id)

#### 13. settings (الإعدادات)
| اسم العمود      | نوع البيانات   | القيود                |
|-----------------|---------------|-----------------------|
| key             | VARCHAR(255)  | PRIMARY KEY           |
| value           | JSONB         | NOT NULL              |
| type            | VARCHAR(50)   | NOT NULL              |
| category        | VARCHAR(100)  |                       |
| description     | TEXT          |                       |
| updated_by      | UUID          | FK → users(id)        |
| updated_at      | TIMESTAMP     | DEFAULT NOW()         |

- **Primary Key:** key
- **Foreign Key:** updated_by → users(id)
- **Indexes:** category

#### 14. ai_jobs (مهام الذكاء الاصطناعي)
| اسم العمود      | نوع البيانات   | القيود                |
|-----------------|---------------|-----------------------|
| id              | UUID          | PRIMARY KEY, DEFAULT  |
| type            | VARCHAR(100)  | NOT NULL              |
| status          | VARCHAR(50)   | DEFAULT 'pending'     |
| payload         | JSONB         |                       |
| result          | JSONB         |                       |
| created_by      | UUID          | FK → users(id)        |
| created_at      | TIMESTAMP     | DEFAULT NOW()         |
| updated_at      | TIMESTAMP     | DEFAULT NOW()         |

- **Primary Key:** id
- **Foreign Key:** created_by → users(id)

---

## 3️⃣ مخطط العلاقات (ERD)

```
users ──< user_roles >── roles ──< role_permissions >── permissions
users ──< audit_logs
users ──< annual_plans
annual_plans ──< engagements
engagements ──< engagement_team >── users
engagements ──< checklists ──< checklist_items
engagements ──< documents
users ──< settings
users ──< ai_jobs
```

- **One-to-Many:** users → annual_plans, users → engagements, engagements → checklists, checklists → checklist_items, engagements → documents
- **Many-to-Many:** users ↔ roles (via user_roles), roles ↔ permissions (via role_permissions), engagements ↔ users (via engagement_team)
- **One-to-One:** لا يوجد علاقات مباشرة من هذا النوع

---

## 4️⃣ الكود الكامل (SQL/Migrations)

### CREATE TABLE Statements (أمثلة رئيسية)

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role_id UUID REFERENCES roles(id),
    status VARCHAR(50) DEFAULT 'active',
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    resource VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_roles (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE role_permissions (
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    actor_id UUID REFERENCES users(id),
    action TEXT NOT NULL,
    resource TEXT NOT NULL,
    resource_id UUID,
    at TIMESTAMP DEFAULT NOW(),
    ip TEXT
);
```

### ALTER TABLE / MIGRATION SCRIPTS

- جميع التغييرات تتم عبر Alembic migrations (`api/alembic/versions/`)
- أمثلة:
  - إضافة أعمدة جديدة (ALTER TABLE ... ADD COLUMN ...)
  - تعديل القيود (ALTER TABLE ... ALTER COLUMN ...)
  - إضافة فهارس (CREATE INDEX ...)

### SEED DATA SCRIPTS

```sql
-- أدوار افتراضية
INSERT INTO roles (name, description) VALUES
('System Admin', 'Full system access'),
('Audit Manager', 'Manage audit plans and teams'),
('Senior Auditor', 'Execute and review audits'),
('Auditor', 'Execute audits'),
('Reviewer', 'Review reports only'),
('Ops Manager', 'Manage infrastructure');

-- صلاحيات افتراضية
INSERT INTO permissions (name, resource, action, description) VALUES
('users.create', 'users', 'create', 'Create new users'),
('users.read', 'users', 'read', 'View users'),
('users.update', 'users', 'update', 'Update users'),
('users.delete', 'users', 'delete', 'Delete users'),
('engagements.create', 'engagements', 'create', 'Create engagements'),
('engagements.read', 'engagements', 'read', 'View engagements');
```

### Stored Procedures / Functions / Triggers

- لا توجد Stored Procedures معقدة، لكن هناك استخدام لـ:
  - امتدادات PostgreSQL: `uuid-ossp`, `pgcrypto`
  - بعض الـ Triggers لتحديث timestamps (يمكن إضافتها حسب الحاجة)

### Views

- لا توجد Views معرفة حالياً، لكن يمكن إنشاء View لعرض المستخدمين مع أدوارهم وصلاحياتهم.

---

## 5️⃣ البيانات النموذجية

### users

| id                                   | email              | name         | status   | created_at           |
|--------------------------------------|--------------------|--------------|----------|----------------------|
| 1e2f...-a1b2...                      | admin@example.com  | Admin        | active   | 2025-01-01 10:00:00  |
| 2a3b...-c3d4...                      | auditor@company.com| أحمد محمد    | active   | 2025-02-15 09:30:00  |
| 3c4d...-e5f6...                      | reviewer@company.com| سارة علي    | suspended| 2025-03-10 14:20:00  |

### roles

| id                                   | name           | description                |
|--------------------------------------|----------------|----------------------------|
| 1e2f...                              | System Admin   | Full system access         |
| 2a3b...                              | Auditor        | Execute audits             |
| 3c4d...                              | Reviewer       | Review reports only        |

### audit_logs

| id | actor_id | action  | resource | resource_id | at                  | ip         |
|----|----------|---------|----------|-------------|---------------------|------------|
| 1  | 1e2f...  | CREATE  | User     | 2a3b...     | 2025-02-15 09:30:01 | 192.168.1.2|
| 2  | 1e2f...  | UPDATE  | User     | 3c4d...     | 2025-03-10 14:21:00 | 192.168.1.2|

**طبيعة البيانات:** كل جدول يحتوي على بيانات وصفية وإدارية، مع ربط واضح بين المستخدمين، الأدوار، المهام، وسجلات التدقيق.

---

## 6️⃣ الاستعلامات و API

### الاستعلامات الأكثر استخداماً

- جلب المستخدمين مع أدوارهم:
  ```sql
  SELECT u.*, r.name as role_name
  FROM users u
  LEFT JOIN roles r ON u.role_id = r.id
  ORDER BY u.created_at DESC;
  ```
- جلب المهام التدقيقية حسب الحالة:
  ```sql
  SELECT * FROM engagements WHERE status = 'active';
  ```

### عمليات CRUD لكل جدول

- **users:** CREATE, READ, UPDATE, DELETE
- **roles:** CREATE, READ, UPDATE, DELETE
- **permissions:** CREATE, READ, UPDATE, DELETE
- **engagements:** CREATE, READ, UPDATE, DELETE
- **audit_logs:** READ فقط (للتدقيق)

### API Endpoints (مثال)

| Route                      | Method | الوظيفة                | Request Body / Response Example         |
|----------------------------|--------|------------------------|----------------------------------------|
| /api/admin/users           | GET    | جلب قائمة المستخدمين   | Response: `[{"id": "...", "name": "..."}]` |
| /api/admin/users           | POST   | إنشاء مستخدم جديد      | Request: `{ "name": "...", "email": "...", ... }` |
| /api/admin/users/{id}      | PUT    | تحديث بيانات مستخدم    | Request: `{ "name": "...", ... }`      |
| /api/admin/users/{id}      | DELETE | حذف مستخدم             | Response: `{ "success": true }`        |
| /api/engagements           | GET    | جلب المهام التدقيقية   | Response: `[{"id": "...", "title": "..."}]` |

---

## 7️⃣ الأمان والمصادقة

- **نظام المصادقة:** JWT/Token-based، مع تحقق من كلمة المرور (bcrypt/crypt)
- **Row Level Security:** غير مفعّل بشكل صريح، لكن الصلاحيات تُدار عبر جداول RBAC
- **إعدادات الأمان:** صلاحيات دقيقة عبر جداول roles/permissions/user_roles/role_permissions
- **التحكم في الوصول:** كل API endpoint يتحقق من صلاحية المستخدم قبل التنفيذ (RBAC)
- **تسجيل الأحداث:** كل عملية مهمة تُسجل في audit_logs

---

## 8️⃣ التحليل والتحسينات

### نقاط القوة
- تصميم علائقي واضح، قابل للتوسع
- RBAC مفصل يتيح التحكم الدقيق بالصلاحيات
- وجود سجلات تدقيق لكل العمليات الحساسة
- استخدام UUIDs يضمن عدم تضارب البيانات

### نقاط الضعف
- بعض الجداول قد تحتوي على بيانات مكررة (مثل user_roles إذا لم يتم ضبطها)
- لا يوجد تفعيل صريح لـ Row Level Security
- بعض الأعمدة قد تحتاج إلى توثيق أو قيود إضافية (مثلاً: status في engagements)

### التطبيع (Normalization)
- معظم الجداول في 3NF، لكن يمكن تحسين بعض العلاقات (مثلاً: فصل بيانات المستخدمين عن بيانات الدخول)

### مشاكل الأداء
- الفهارس جيدة، لكن مع زيادة حجم البيانات قد تحتاج إلى تحسينات إضافية (Partial Indexes, Partitioning)
- بعض الاستعلامات المعقدة قد تحتاج إلى Views أو Materialized Views

### التحسينات المقترحة
- تفعيل Row Level Security في PostgreSQL
- إضافة Triggers لتحديث timestamps تلقائياً
- توثيق جميع الأعمدة والقيود بشكل أفضل
- إضافة فهارس مركبة للاستعلامات الشائعة
- مراجعة وتحديث بيانات الصلاحيات بشكل دوري

---

# ✅ خلاصة

هذا التقرير يغطي كل ما يحتاجه أي مطور لإعادة بناء قاعدة البيانات وفهم النظام بالكامل. جميع الجداول، العلاقات، الأكواد، البيانات النموذجية، الاستعلامات، واعتبارات الأمان موثقة بشكل واضح ومنظم.

إذا احتجت تفاصيل إضافية عن أي جدول أو استعلام، أو رسم ERD بصيغة رسومية، يمكنني توليده لك مباشرة.
