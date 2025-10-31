# Initial Assessment - AuditOrbit Backend (FastAPI)

Date: 2025-10-31

## 1. Architecture & Dependency Map (خريطة اعتماد)

- **Entry layer**: `app/presentation/main.py` يعرّف تطبيق FastAPI ويحمّل 18 Router. لا توجد middlewares فعالة حاليًا؛ تسجيل `SecurityHeadersMiddleware`, `SlowAPIMiddleware`, و`audit_log_middleware` معطّل بتعليقات، و`app.debug=True` مفتوح مع CORS `*` للتطوير.
- **Routing layer**: معظم وحدات `app/presentation/routers` تتعامل مباشرة مع `SessionLocal` وتنفّذ أوامر SQL خام باستخدام `sqlalchemy.text`. لا توجد طبقة خدمات في `app/application/services` (المجلد فارغ)، ولا توجد كيانات فعلية في `app/domain`. هذا يجعل العرض يعتمد مباشرة على البنية التحتية ويكسر التجريد المقترح في Clean Architecture.
- **Infrastructure layer**: `app/infrastructure/db/session.py` ينشئ محرك SQLAlchemy عند الاستيراد ويطبع قيم `DATABASE_URL` (تسريب محتمل). طبقة RBAC (`security/rbac.py`) تُعيد `True` دائمًا، ما يعني أن جميع استدعاءات `enforce` شكلية. التخزين (MinIO) وRedis مهيآن داخل `routers/ops.py`, لكن هذا الـrouter غير مضمّن في التطبيق.
- **Configuration & secrets**: `app/config/settings.py` يحمّل `.env` لكنه يحتوي قيمًا افتراضية حساسة (`JWT_SECRET = "devsecret"`, مفاتيح S3). يجرى الرجوع إلى `os.getenv` مباشرة في عدة مواضع بدل الاعتماد على الضبط المركزي.
- **Legacy duplication**: المجلد `backend/` يحتوي تطبيقًا غنيًا (routers, services, migrations). حالياً لا يوجد مسار واضح لكيفية دمج منطق `backend` في `api/`, مما يزيد التشتت ويصعّب تحديد المصدر الموثوق للأعمال.

## 2. Hot Spots & Instability (نقاط سخونة)

- **تعطيل المصادقة**: `users.current_user_id` يُرجع دائمًا `"dev-user-id"` بدون فحص JWT، و`enforce` مُعلّق بالتعليقات في الملف نفسه. هذا يلغي عمليًا RBAC على أهم جداول (`users`).
- **RBAC مفرغ**: `app/infrastructure/security/rbac.has_permission` يُعيد `True`. جميع الاستدعاءات في routers الأخرى لا تؤدي وظيفة حماية حقيقية. يجب إعادة التوصيل بجدول `role_permissions` أو نظام معادل قبل أي نشر.
- **تسريب أسرار/معلومات حساسة**: `db/session.py` يطبع قيم URL عند التحميل، والعديد من الخدمات تقرأ مفاتيح S3 مباشرة من المتغيرات مع قيم افتراضية مضمّنة في المستودع.
- **واجهات خام بدون طبقات**: منطق الأعمال (التحقق، بناء الاستعلامات، إدارة المعاملات) موجود بالكامل في طبقة العرض. مثال: `reports.py` و`compare.py` فيها أكثر من 250 سطر لكل ملف وتستدعي SQL مباشرة، ما يزيد التعقيد ويصعّب الاختبار وإعادة الاستخدام.
- **اختبارات غير كافية**: مجلد `api/tests` يحتوي 4 ملفات فقط، معتمد على `TestClient` وبيانات DB حقيقية، ولا يوجد قياس تغطية. الـCI الحالي لا يفشل عند فشل `pytest`.
- **خدمات معطلة**: `ops` router (20 endpoint لإدارة التخزين/الصفوف) غير مضمّن في التطبيق. كما أن `audit_log_middleware` معطّل، ما يعني عدم وجود تتبع دقيق للطلبات.

## 3. Endpoint Inventory (جرد Endpoints)

| Router | Base Path | Methods (count) | Total | Mounted | ملاحظات |
| --- | --- | --- | --- | --- | --- |
| admin | `/admin` | GET×5 | 5 | ✅ | تقارير KPI وإحصاءات مستخدمين؛ يعتمد بالكامل على SQL خام ويستدعي `enforce` لمورد `admin`. |
| ai | `/ai` | GET×1, POST×1 | 2 | ✅ | استخدام AI worker لا يحقق RBAC حقيقي؛ الموارد `evidence` فقط. |
| audit | `/audit-logs` | GET×1 | 1 | ✅ | يعرض سجلات التدقيق بدون pagination ولا حماية فعلية. |
| auditor | `/auditor` | GET×3, POST×2, PUT×1 | 6 | ✅ | يشترط `enforce` لموارد `engagements` و`checklist_items` لكن RBAC stub. |
| auth | `/auth` | POST×2 | 2 | ✅ | إنشاء/تجديد JWT؛ يعتمد على جدول `users` بحقل `hashed_password` (مختلف عن `create_user`). |
| checklists | `/checklists` | GET×2, POST×3 | 5 | ✅ | يدير checklists/items بمحركات SQL مباشرة. |
| compare | `/ai` | GET×3, POST×4 | 7 | ✅ | عمليات مقارنة وتنزيل مع enforce لموارد متعددة (`evidence`, `findings`, `regulations`, `scenarios`). |
| dashboard | `/dashboard` | GET×4 | 4 | ✅ | إحصاءات عامة. |
| engagements | `/engagements` | GET×1, POST×1 | 2 | ✅ | إنشاء وجلب engagements مع enforce stub. |
| evidence | `/evidence` | GET×2, POST×2, DELETE×1 | 5 | ✅ | إدارة الأدلة والتحميل؛ RBAC مورد `evidence`. |
| followups | `/followups` | GET×1, POST×3, PATCH×1 | 5 | ✅ | إدارة المتابعات؛ enforce لثلاثة موارد (`followups`, `followup_tests`, `management_responses`). |
| manager | `/manager` | GET×1, POST×1, DELETE×1 | 3 | ✅ | تعيين مدققين، RBAC لموارد `engagements/findings`. |
| notifications | (inline paths) | GET×2, POST×3 | 5 | ✅ | قنوات وإشعارات؛ enforce مورد `notifications`. |
| ops | `/ops` | GET×10, POST×5, PUT×3, DELETE×2 | 20 | ❌ | غير مضمّن في `main.py`; يحتوي منطق Redis/S3 حساسًا وتعاملًا مع أسرار. |
| reports | `/reports` | GET×2, POST×4, PUT×1 | 7 | ✅ | دورة حياة التقارير مع enforce متكرر. |
| roles | `/roles` | GET×1 | 1 | ✅ | يستدعي enforce مورد `roles`, لكنه يعتمد على RBAC المعطل. |
| samples | `/samples` | GET×1, POST×1, PATCH×1, DELETE×1 | 4 | ✅ | CRUD لعينة إشرافية؛ enforce فعال شكليًا. |
| users | `/users` | GET×1, POST×1, PUT×1, DELETE×1 | 4 | ✅ | جميع استدعاءات `enforce` معلّقة بتعليقات؛ `current_user_id` يعيد مستخدمًا افتراضيًا. |
| wp | `/wp` | GET×1, POST×1, PATCH×1, DELETE×1 | 4 | ✅ | حماية engagements عبر فحص إضافي، لكن يعتمد على RBAC stub. |

## 4. RBAC Touchpoints (مواضع RBAC)

- **استدعاءات `enforce` النشطة**: تظهر في كل routers أعلاه باستثناء `users` (معلّقة). جميعها تعتمد على `security/rbac.py` الذي يعيد `True`, ما يعني أن أي مستخدم يمر دون فحص صلاحيات.
- **الموارد المستهدفة**: `admin`, `audit_logs`, `checklists`, `engagements`, `evidence`, `findings`, `followups`, `management_responses`, `notifications`, `reports`, `roles`, `samples`, `working_papers` وغيرها. لا توجد خريطة مركزية للموارد/الأفعال.
- **حالة خاصة - users**: أهم CRUD (`list/create/update/delete`) مفعّل، لكن جميع استدعاءات `enforce` و`current_user_id` مُعلّقة. هذا يسمح لأي عميل غير موثق بالتعديل على المستخدمين في البيئة الحالية.
- **تكامل قاعدة البيانات**: التعليقات داخل `rbac.py` تشير إلى مخطط قديم (`role_permissions`, `permissions`) غير موجود في المخطط الحالي، ما يفسّر التعطيل. لا توجد وظيفة مكافئة في قاعدة البيانات الحالية `SCHEMA_MIGRATION.md`.

## 5. Additional Observations (ملاحظات داعمة)

- **اختبارات**: لا توجد عقود تغطية أو أدوات lint في `api`. التكوين الجديد في `pyproject.toml` (أضيف في هذه الخطوة) يفعّل `ruff`, `black`, `pytest --cov`, `import-linter`, `radon`, `mypy` لاستكمال المتطلبات.
- **Dev dependencies**: أُنشئ `api/requirements-dev.txt` ليضم ruff/black/coverage/import-linter/radon/vulture/deptry/pytest-cov/mypy، تمهيدًا للتهيئة الآلية وCI.
- **Legacy scripts**: العديد من سكربتات الجذر داخل `api/` تتعامل مع قاعدة البيانات مباشرة (إنشاء مستخدمين، تفريغ بيانات). سيتم تقييمها في مرحلة إزالة الكود الميت.
- **Config drift**: `backend/pyproject.toml` يحتوي إعدادات lint/coverage متقدمة، لكن لا تُستخدم في المسار الحالي. هذا سيدعم خطة توحيد المستودع لاحقًا.

## 6. Recommended Next Steps (خطوات تالية مقترحة)

1. **إعادة تفعيل الحماية** تدريجيًا عبر إعادة ربط `enforce` ببوابة RBAC واقعية، مع طبقة `authorize()` ضمن `application` كما هو مخطط.
2. **عزل الأسرار** بإزالة القيم الافتراضية من `settings.py`, إيقاف الطباعة في `db/session.py`, وتحديث `.env.example` قبل دمج أي تغييرات أخرى.
3. **تفريغ منطق SQL من routers** إلى خدمات `application`, وإنشاء مخازن (repositories) في `infrastructure` لتسهيل الاختبار وتطبيق import-linter.
4. **إعادة دمج `ops` router** ضمن سياق موحّد أو توثيق سبب التعطيل إن لزم الحفاظ على التوافق.
5. **إعداد CI على Python 3.12/Postgres 16** باستخدام الأدوات المضافة، مع تشغيل تغطية ≥70% وخطوات lint قبل متابعة إعادة الهيكلة.
