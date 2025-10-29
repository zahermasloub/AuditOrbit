# 🎓 دليل البداية السريعة - مرحباً بك في AuditOrbit!
## دليل مبسط للموظفين الجدد (بدون خبرة برمجية)

---

## 👋 مرحباً بك!

**أهلاً وسهلاً!** أنت الآن جزء من فريق AuditOrbit. لا تقلق إذا لم تكن لديك خبرة في البرمجة - هذا الدليل سيشرح لك كل شيء بطريقة بسيطة وواضحة مع صور توضيحية.

### 🎯 ماذا ستتعلم؟

بنهاية هذا الدليل، ستفهم:
1. ما هو AuditOrbit وكيف يعمل (بدون مصطلحات تقنية معقدة!)
2. كيف تستخدم النظام بشكل يومي
3. كيف تتعامل مع المهام الأساسية
4. أين تجد المساعدة عند الحاجة

---

## 🚀 الجزء الأول - ما هو AuditOrbit؟

### الفكرة ببساطة

تخيل معي هذا المثال:

```
┌─────────────────────────────────────────────────────────┐
│         🏢 شركة كبيرة (مثل: أرامكو)                    │
│                                                         │
│  لديها الكثير من الأقسام:                              │
│  • قسم المالية 💰                                      │
│  • قسم الموارد البشرية 👥                              │
│  • قسم تقنية المعلومات 💻                              │
│  • قسم المشتريات 🛒                                    │
│                                                         │
│  ❓ السؤال: كيف نتأكد أن كل قسم يعمل بشكل صحيح؟       │
└─────────────────────────────────────────────────────────┘
                          ⬇️
┌─────────────────────────────────────────────────────────┐
│              ✅ الحل: AuditOrbit                        │
│                                                         │
│  نظام ذكي يساعد المدققين على:                          │
│  1️⃣  إنشاء مهام التدقيق                               │
│  2️⃣  متابعة سير العمل                                  │
│  3️⃣  رفع المستندات والأدلة                             │
│  4️⃣  كتابة التقارير                                    │
│  5️⃣  استخدام الذكاء الاصطناعي للمساعدة               │
└─────────────────────────────────────────────────────────┘
```

### تشبيه المكتبة

فكر في AuditOrbit مثل **مكتبة كبيرة**:

```
🏛️ المكتبة (AuditOrbit)
│
├── 📚 قسم الكتب (قاعدة البيانات)
│   └── هنا نخزن كل المعلومات: المستخدمين، المهام، التقارير
│
├── 👨‍💼 أمين المكتبة (النظام الخلفي)
│   └── يستقبل طلباتك ويجلب لك ما تريد
│
└── 🖥️ الشاشة أمامك (الواجهة)
    └── ما تراه وتتفاعل معه يومياً
```

---

### الساعة 9:30 - إعداد البيئة المحلية

**أنا:** تعال نبدأ. أولاً افتح Terminal:

```bash
# 1. Clone المشروع
git clone https://github.com/zahermasloub/AuditOrbit.git
cd AuditOrbit

# 2. تشغيل Database
cd infra
docker-compose up -d postgres

# 3. تثبيت مكتبات Backend
cd ../api
pip install -r requirements.txt

# 4. تشغيل API Server
python -m uvicorn app.presentation.main:app --reload --port 8000
```

**أنت:** تمام، الـ API يعمل على http://localhost:8000

**أنا:** ممتاز! الآن افتح http://localhost:8000/docs في المتصفح. هذا Swagger UI، سنستخدمه كثيراً.

---

## 🔐 الساعة 10:00 - فهم نظام المصادقة

### خطوة 1: تسجيل الدخول

**أنا:** أول شيء أي مستخدم يفعله هو تسجيل الدخول. شوف معي:

**الملف:** `api/app/presentation/routers/auth.py`

```python
@router.post("/login", response_model=TokenOut)
def login(payload: LoginIn, db: Session = Depends(get_db)):
    # 1. البحث عن المستخدم
    user = db.execute(
        text("SELECT * FROM users WHERE email = :email"),
        {"email": payload.email}
    ).mappings().first()
    
    # 2. التحقق من كلمة المرور
    password_valid = verify_password(payload.password, user["hashed_password"])
    
    # 3. إصدار JWT Token
    access_token = create_token(str(user["id"]), 3600)  # صالح لساعة
    refresh_token = create_token(str(user["id"]), 86400)  # صالح ليوم
    
    return TokenOut(access_token=access_token, refresh_token=refresh_token, user=...)
```

**أنت:** لماذا نستخدم JWT؟

**أنا:** لأنه stateless. الـ token يحتوي على كل المعلومات اللازمة (user_id, expiry) ولا نحتاج session storage. هذا يسهل الـ scaling.

### تجربة عملية - Login

**أنا:** الآن جرب بنفسك في Swagger UI:

1. اذهب إلى `/auth/login`
2. اضغط "Try it out"
3. أدخل:
```json
{
  "email": "admin@example.com",
  "password": "Admin#2025"
}
```
4. اضغط "Execute"

**أنت:** حصلت على:
```json
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "expires_in": 3600,
  "user": {
    "id": "4c64c2f5-...",
    "email": "admin@example.com",
    "name": "Admin",
    "role": "admin"
  }
}
```

**أنا:** ممتاز! الآن انسخ الـ `access_token`. اضغط على زر "Authorize" في أعلى الصفحة، وألصق:
```
Bearer eyJhbGc...
```

**أنت:** تمام، الآن كل الـ endpoints صارت تعمل!

---

## 👥 الساعة 11:00 - إدارة المستخدمين

### السيناريو: إضافة مدقق جديد

**أنا:** لنفترض أن المدير طلب منك إضافة مدقق جديد اسمه "خالد" للفريق.

**الملف:** `api/app/presentation/routers/users.py`

```python
@router.post("", response_model=UserOut)
def create_user(
    payload: UserCreate,
    db: Session = Depends(get_db),
    user_id: str = Depends(current_user_id)
):
    # 1. التحقق من الصلاحيات
    enforce(db, user_id, "users", "create")
    
    # 2. إنشاء المستخدم
    created = db.execute(
        text("""
            INSERT INTO users (email, name, hashed_password, role, locale)
            VALUES (:email, :name, :password, :role, :locale)
            RETURNING *
        """),
        {
            "email": payload.email,
            "name": payload.name,
            "password": hash_password(payload.password),
            "role": payload.role,
            "locale": payload.locale
        }
    ).mappings().first()
    
    return UserOut(**created)
```

### تجربة عملية - Create User

**أنا:** الآن في Swagger UI، اذهب إلى `/users` (POST):

```json
{
  "email": "khalid@example.com",
  "name": "خالد المدقق",
  "password": "Khalid@2025",
  "role": "auditor",
  "locale": "ar"
}
```

**أنت:** نجح! حصلت على:
```json
{
  "id": "7f8b9c3d-...",
  "email": "khalid@example.com",
  "name": "خالد المدقق",
  "role": "auditor",
  "created_at": "2025-10-29T10:30:00+03:00"
}
```

**أنا:** ممتاز! لاحظ أن كلمة المرور تم تشفيرها تلقائياً باستخدام bcrypt. لن نراها أبداً بصيغة نصية.

---

## 📋 الساعة 12:00 - إنشاء مهمة تدقيق

### السيناريو: تدقيق الحسابات الربع سنوية

**أنا:** الآن المدير يريد إنشاء مهمة تدقيق جديدة. نذهب إلى Engagements.

**الملف:** `api/app/presentation/routers/engagements.py`

```python
@router.post("", response_model=EngagementOut)
def create_engagement(
    payload: EngagementCreate,
    db: Session = Depends(get_db),
    user_id: str = Depends(current_user_id)
):
    enforce(db, user_id, "engagements", "create")
    
    # التحقق من وجود الخطة السنوية
    plan = db.execute(
        text("SELECT id FROM annual_plans WHERE year = :year"),
        {"year": payload.annual_plan_year}
    ).first()
    
    if not plan:
        # إنشاء خطة جديدة
        plan_id = str(uuid.uuid4())
        db.execute(
            text("INSERT INTO annual_plans(id, year, status) VALUES (:id, :year, 'active')"),
            {"id": plan_id, "year": payload.annual_plan_year}
        )
    
    # إنشاء المهمة
    engagement = db.execute(
        text("""
            INSERT INTO engagements(
                id, annual_plan_id, title, scope, risk_rating, status, start_date, end_date
            ) VALUES (
                :id, :plan_id, :title, :scope, :risk_rating, 'PLANNING', :start, :end
            ) RETURNING *
        """),
        {
            "id": str(uuid.uuid4()),
            "plan_id": plan_id,
            "title": payload.title,
            "scope": payload.scope,
            "risk_rating": payload.risk_rating,
            "start": payload.start_date,
            "end": payload.end_date
        }
    ).mappings().first()
    
    return EngagementOut(**engagement)
```

### تجربة عملية - Create Engagement

**أنا:** في Swagger UI، `/engagements` (POST):

```json
{
  "annual_plan_year": 2025,
  "title": "تدقيق العمليات المالية - الربع الأول",
  "scope": "مراجعة شاملة للحسابات والعمليات المالية للربع الأول من 2025",
  "risk_rating": "high",
  "start_date": "2025-01-01",
  "end_date": "2025-03-31"
}
```

**أنت:** نجح! حصلت على engagement_id جديد:
```json
{
  "id": "a1b2c3d4-...",
  "title": "تدقيق العمليات المالية - الربع الأول",
  "status": "PLANNING",
  "risk_rating": "high"
}
```

**أنا:** ممتاز! لاحظ أن الحالة الافتراضية "PLANNING". دورة الحياة:
```
PLANNING → IN_PROGRESS → FIELDWORK → REPORTING → COMPLETED
```

---

## 🔗 الساعة 2:00 بعد الظهر - ربط Frontend مع Backend

### السيناريو: عرض المهام في صفحة Admin

**أنا:** الآن سنربط الـ API مع الـ Frontend. افتح معي:

**الملف:** `web/components/engagements-section-new.tsx`

```typescript
// 1. API Client
async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = TokenManager.getToken()
  const headers = new Headers(init.headers)
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  
  const response = await fetch(
    `http://localhost:8000${path}`, 
    { ...init, headers }
  )
  
  if (!response.ok) {
    if (response.status === 401) {
      TokenManager.clearTokens()
      window.location.href = '/login'
    }
    throw new Error(await response.text())
  }
  
  return response.json()
}

// 2. استخدام React Query لجلب البيانات
const { data, isLoading } = useQuery({
  queryKey: ['engagements', { page: 1, size: 10 }],
  queryFn: () => apiFetch<Page<Engagement>>('/engagements?page=1&size=10')
})

// 3. عرض البيانات
return (
  <div>
    {isLoading ? (
      <Loader2 className="animate-spin" />
    ) : (
      <table>
        {data?.items.map(engagement => (
          <tr key={engagement.id}>
            <td>{engagement.title}</td>
            <td>{engagement.status}</td>
            <td>{engagement.risk_rating}</td>
          </tr>
        ))}
      </table>
    )}
  </div>
)
```

**أنت:** فهمت! نستخدم React Query للـ caching وإدارة الـ state.

**أنا:** بالضبط! React Query يتعامل مع loading, error, refetching تلقائياً.

### تجربة عملية - إضافة ميزة جديدة

**أنا:** الآن تحدي لك! أريدك تضيف زر "حذف" للمهمة.

**أنت:** تمام، سأفعل:

```typescript
// 1. Mutation للحذف
const deleteMutation = useMutation({
  mutationFn: (engagementId: string) => 
    apiFetch(`/engagements/${engagementId}`, { method: 'DELETE' }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['engagements'] })
    toast.success('تم الحذف بنجاح')
  }
})

// 2. زر الحذف
<Button 
  variant="destructive"
  onClick={() => deleteMutation.mutate(engagement.id)}
>
  حذف
</Button>
```

**أنا:** ممتاز! الآن جرب في المتصفح.

**أنت:** نجح! المهمة اختفت من القائمة.

**أنا:** رائع! لاحظ أننا استخدمنا `invalidateQueries` لتحديث البيانات تلقائياً بعد الحذف.

---

## 🛡️ الساعة 3:00 - فهم RBAC (صلاحيات الأدوار)

### السيناريو: المدقق يحاول حذف مستخدم

**أنا:** الآن سنفهم نظام الصلاحيات. جرب تسجيل الدخول بحساب المدقق خالد:

```json
{
  "email": "khalid@example.com",
  "password": "Khalid@2025"
}
```

**أنت:** تمام، حصلت على token جديد.

**أنا:** الآن حاول تحذف مستخدم عن طريق `/users/{id}` (DELETE).

**أنت:** حصلت على:
```json
{
  "detail": "Forbidden",
  "status_code": 403
}
```

**أنا:** بالضبط! لأن المدقق ليس لديه صلاحية `users:delete`. شوف معي الكود:

**الملف:** `api/app/infrastructure/security/rbac.py`

```python
def enforce(db: Session, user_id: str, resource: str, action: str):
    # 1. الحصول على دور المستخدم
    user_role = db.execute(
        text("""
            SELECT r.name 
            FROM users u 
            JOIN user_roles ur ON u.id = ur.user_id 
            JOIN roles r ON ur.role_id = r.id 
            WHERE u.id = :user_id
        """),
        {"user_id": user_id}
    ).scalar_one_or_none()
    
    # 2. Admin لديه كل الصلاحيات
    if user_role == 'admin':
        return
    
    # 3. التحقق من الصلاحية المحددة
    has_permission = db.execute(
        text("""
            SELECT 1 
            FROM permissions p 
            JOIN user_roles ur ON p.role_id = ur.role_id 
            WHERE ur.user_id = :user_id 
              AND p.resource = :resource 
              AND p.action = :action
        """),
        {"user_id": user_id, "resource": resource, "action": action}
    ).scalar_one_or_none()
    
    if not has_permission:
        raise HTTPException(status_code=403, detail="Forbidden")
```

**أنت:** فهمت! كل endpoint يستدعي `enforce()` للتحقق من الصلاحيات.

**أنا:** صح! وهذا يجعل النظام آمن جداً.

---

## 📤 الساعة 4:00 - رفع الأدلة (Evidence Upload)

### السيناريو: رفع فاتورة PDF كدليل

**أنا:** الآن سنتعلم كيف نرفع ملفات. نحن نستخدم MinIO (S3-compatible storage).

**الملف:** `api/app/presentation/routers/evidence.py`

```python
@router.post("/init", response_model=EvidenceInitOut)
def init_upload(
    payload: EvidenceInit,
    db: Session = Depends(get_db),
    user_id: str = Depends(current_user_id)
):
    # 1. إنشاء سجل في DB
    evidence_id = str(uuid.uuid4())
    file_path = f"engagements/{payload.engagement_id}/{evidence_id}/{payload.filename}"
    
    db.execute(
        text("""
            INSERT INTO evidence(id, engagement_id, filename, file_path, uploaded_by, status)
            VALUES (:id, :eng_id, :filename, :path, :user_id, 'pending')
        """),
        {
            "id": evidence_id,
            "eng_id": payload.engagement_id,
            "filename": payload.filename,
            "path": file_path,
            "user_id": user_id
        }
    )
    
    # 2. إنشاء Presigned URL للرفع المباشر
    presigned_url = s3_client.generate_presigned_url(
        'put_object',
        Params={'Bucket': 'auditorbibucket', 'Key': file_path},
        ExpiresIn=3600
    )
    
    return EvidenceInitOut(
        evidence_id=evidence_id,
        presigned_url=presigned_url
    )

@router.post("/{evidence_id}/confirm")
def confirm_upload(evidence_id: str, db: Session = Depends(get_db)):
    # تحديث الحالة إلى "uploaded"
    db.execute(
        text("UPDATE evidence SET status = 'uploaded' WHERE id = :id"),
        {"id": evidence_id}
    )
    return {"success": True}
```

### تجربة عملية - Upload Flow

**أنا:** في Frontend، الـ flow كالتالي:

```typescript
// 1. Initialize upload
const handleUpload = async (file: File) => {
  // Step 1: Get presigned URL
  const initRes = await apiFetch<{
    evidence_id: string
    presigned_url: string
  }>('/evidence/init', {
    method: 'POST',
    body: JSON.stringify({
      filename: file.name,
      engagement_id: selectedEngagementId
    })
  })
  
  // Step 2: Upload directly to MinIO
  await fetch(initRes.presigned_url, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type
    }
  })
  
  // Step 3: Confirm upload
  await apiFetch(`/evidence/${initRes.evidence_id}/confirm`, {
    method: 'POST'
  })
  
  toast.success('تم رفع الملف بنجاح!')
}
```

**أنت:** لماذا لا نرفع الملف مباشرة للـ Backend؟

**أنا:** لأسباب عدة:
1. **Performance:** الـ Backend لن يتعامل مع الملفات الكبيرة
2. **Scalability:** MinIO يمكنه التعامل مع ملايين الملفات
3. **Security:** Presigned URL محدودة بوقت (ساعة واحدة فقط)

---

## 🤖 الساعة 5:00 - مختبر الذكاء الاصطناعي

### السيناريو: مقارنة ممارسة بنظام

**أنا:** الآن أكثر جزء ممتع! عندنا AI Lab لمقارنة الممارسات بالأنظمة.

**الملف:** `api/app/presentation/routers/compare.py`

```python
@router.post("/regulations", response_model=Dict[str, Any])
def upload_regulation(
    payload: RegulationCreate,
    db: Session = Depends(get_db),
    user_id: str = Depends(current_user_id)
):
    # 1. حفظ النظام في DB
    regulation_id = str(uuid.uuid4())
    db.execute(
        text("""
            INSERT INTO regulations(id, title, text, created_by)
            VALUES (:id, :title, :text, :user_id)
        """),
        {
            "id": regulation_id,
            "title": payload.title,
            "text": payload.text,
            "user_id": user_id
        }
    )
    
    # 2. تقسيم النص إلى chunks
    chunks = chunk_text(payload.text, chunk_size=500)
    
    # 3. إنشاء embeddings باستخدام Sentence Transformers
    model = SentenceTransformer('sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2')
    embeddings = model.encode(chunks)
    
    # 4. حفظ embeddings في DB
    for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
        db.execute(
            text("""
                INSERT INTO regulation_chunks(id, regulation_id, chunk_index, text, embedding)
                VALUES (:id, :reg_id, :idx, :text, :emb)
            """),
            {
                "id": str(uuid.uuid4()),
                "reg_id": regulation_id,
                "idx": i,
                "text": chunk,
                "emb": embedding.tolist()
            }
        )
    
    return {"regulation_id": regulation_id, "chunks_count": len(chunks)}

@router.post("/compare", response_model=Dict[str, Any])
def compare_scenario_to_regulation(
    payload: CompareRequest,
    db: Session = Depends(get_db)
):
    # 1. الحصول على السيناريو
    scenario = db.execute(
        text("SELECT description FROM scenarios WHERE id = :id"),
        {"id": payload.scenario_id}
    ).scalar_one()
    
    # 2. الحصول على chunks النظام
    chunks = db.execute(
        text("""
            SELECT id, text, embedding 
            FROM regulation_chunks 
            WHERE regulation_id = :reg_id
        """),
        {"reg_id": payload.regulation_id}
    ).mappings().all()
    
    # 3. حساب التشابه
    model = SentenceTransformer('...')
    scenario_embedding = model.encode([scenario])[0]
    
    similarities = []
    for chunk in chunks:
        chunk_embedding = np.array(chunk['embedding'])
        similarity = cosine_similarity(
            scenario_embedding.reshape(1, -1),
            chunk_embedding.reshape(1, -1)
        )[0][0]
        
        if similarity > 0.7:  # threshold
            similarities.append({
                "chunk_id": chunk['id'],
                "text": chunk['text'],
                "similarity": float(similarity)
            })
    
    return {
        "scenario_id": payload.scenario_id,
        "regulation_id": payload.regulation_id,
        "matches": sorted(similarities, key=lambda x: x['similarity'], reverse=True)
    }
```

### تجربة عملية - Legal Matcher

**أنا:** جرب معي:

1. ارفع نظام (مثلاً: قانون حماية البيانات)
```bash
POST /ai/regulations
{
  "title": "نظام حماية البيانات الشخصية",
  "text": "المادة 1: يجب على جميع المنشآت... المادة 2: يحظر..."
}
```

2. ارفع سيناريو (ممارسة في الشركة)
```bash
POST /ai/scenarios
{
  "title": "تخزين بيانات العملاء",
  "description": "نحن نقوم بتخزين بيانات العملاء على خوادم سحابية في أمريكا"
}
```

3. قارن
```bash
POST /ai/compare
{
  "scenario_id": "...",
  "regulation_id": "..."
}
```

**أنت:** حصلت على:
```json
{
  "matches": [
    {
      "text": "المادة 5: يحظر نقل البيانات خارج المملكة إلا بموافقة مسبقة",
      "similarity": 0.89
    }
  ]
}
```

**أنا:** ممتاز! الـ AI اكتشف أن هناك مخالفة محتملة!

---

## 📊 الساعة 6:00 - Dashboard و Analytics

### السيناريو: عرض إحصائيات Dashboard

**أنا:** آخر شيء نتعلمه اليوم: الـ Dashboard.

**الملف:** `api/app/presentation/routers/dashboard.py`

```python
@router.get("/stats", response_model=dict[str, Any])
def get_dashboard_stats(
    db: Session = Depends(get_db),
    user_id: str = Depends(current_user_id)
):
    # 1. عدد المهام النشطة
    active_engagements = db.execute(
        text("""
            SELECT COUNT(*) 
            FROM engagements 
            WHERE status IN ('IN_PROGRESS', 'PLANNING', 'FIELDWORK')
        """)
    ).scalar_one()
    
    # 2. عدد النتائج المفتوحة
    open_findings = db.execute(
        text("SELECT COUNT(*) FROM findings WHERE status = 'open'")
    ).scalar_one()
    
    # 3. التقارير المعلقة
    pending_reports = db.execute(
        text("SELECT COUNT(*) FROM reports WHERE status IN ('DRAFT', 'SUBMITTED')")
    ).scalar_one()
    
    # 4. نسبة الإنجاز
    total = db.execute(text("SELECT COUNT(*) FROM engagements")).scalar_one()
    completed = db.execute(
        text("SELECT COUNT(*) FROM engagements WHERE status = 'COMPLETED'")
    ).scalar_one()
    
    completion_rate = (completed / total * 100) if total > 0 else 0
    
    return {
        "active_engagements": active_engagements,
        "open_findings": open_findings,
        "pending_reports": pending_reports,
        "completion_rate": round(completion_rate, 2)
    }
```

**Frontend Integration:**

```tsx
// web/app/dashboard/page.tsx

const { data: stats } = useQuery({
  queryKey: ['dashboard-stats'],
  queryFn: () => apiFetch<DashboardStats>('/dashboard/stats')
})

return (
  <div className="grid grid-cols-4 gap-4">
    <Card>
      <CardHeader>
        <CardTitle>مهام نشطة</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-4xl font-bold">{stats?.active_engagements}</p>
      </CardContent>
    </Card>
    
    <Card>
      <CardHeader>
        <CardTitle>نتائج مفتوحة</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-4xl font-bold">{stats?.open_findings}</p>
      </CardContent>
    </Card>
    
    {/* ... more cards */}
  </div>
)
```

---

## 🎯 نهاية اليوم - ملخص ما تعلمناه

**أنا:** ممتاز! أنت الآن فهمت:

✅ **Authentication:** JWT tokens, bcrypt passwords  
✅ **CRUD Operations:** Create, Read, Update, Delete  
✅ **RBAC:** Role-Based Access Control  
✅ **File Upload:** MinIO with presigned URLs  
✅ **AI Integration:** Sentence Transformers & Vector Similarity  
✅ **Frontend Integration:** React Query & TypeScript  
✅ **Database:** PostgreSQL queries with SQLAlchemy  

**أنت:** شكراً جزيلاً! متحمس للبدء غداً.

**أنا:** غداً سنتعلم:
- إضافة ميزة جديدة من الصفر
- كتابة Unit Tests
- Deployment على Production
- Code Review best practices

---

## 📚 مراجع إضافية

### أكواد مفيدة للنسخ

**1. Create a new endpoint:**
```python
@router.get("/my-endpoint", response_model=MySchema)
def my_function(
    db: Session = Depends(get_db),
    user_id: str = Depends(current_user_id)
):
    enforce(db, user_id, "resource", "action")
    result = db.execute(text("SELECT ...")).mappings().all()
    return result
```

**2. Frontend API call:**
```typescript
const { data } = useQuery({
  queryKey: ['key'],
  queryFn: () => apiFetch<Type>('/endpoint')
})
```

**3. Mutation:**
```typescript
const mutation = useMutation({
  mutationFn: (payload) => apiFetch('/endpoint', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['key'] })
  }
})
```

---

## 💡 نصائح من خبرة 10 سنوات

1. **Always validate input:** استخدم Pydantic schemas
2. **Never trust user input:** استخدم parameterized queries
3. **Log everything important:** استخدم audit logs
4. **Test before deploy:** اكتب unit tests
5. **Document your code:** اكتب docstrings واضحة
6. **Use type hints:** TypeScript في Frontend, Python type hints في Backend
7. **Handle errors gracefully:** استخدم try/catch و HTTPException
8. **Keep it DRY:** Don't Repeat Yourself
9. **Security first:** تحقق من الصلاحيات دائماً
10. **Ask questions:** لا تتردد في السؤال!

---

**مبروك! أتممت اليوم الأول بنجاح! 🎉**

