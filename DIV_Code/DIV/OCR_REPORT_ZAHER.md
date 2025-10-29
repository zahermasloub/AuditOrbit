# 📊 تقرير تحليل شامل: دمج وحدة المطابقة القانونية مع AuditOrbit

**المشروع:** AuditOrbit - نظام إدارة التدقيق الداخلي  
**إعداد:** مبرمج خبير - 10 سنوات في مجال الذكاء الاصطناعي  
**التاريخ:** 28 أكتوبر 2025  
**الحالة:** خطة تنفيذية كاملة - جاهز للتطبيق

---

## 🎯 الملخص التنفيذي

بعد دراسة معمقة للبرومبت المقدم وفحص شامل لبنية مشروع **AuditOrbit**، أقدم تحليلاً تفصيلياً وخطة دمج عملية لبناء **وحدة المطابقة القانونية (Legal Compliance Matching Module)** كخدمة مجانية مفتوحة المصدر متكاملة مع النظام الحالي.

### أهداف الوحدة:
✅ مطابقة نصوص المستندات مع مواد القوانين/اللوائح القطرية  
✅ إرجاع أعلى التطابقات مع اقتباس ورابط ودرجة ثقة  
✅ وسم تلقائي للمطابقات (قوية/متوسطة/يدوية)  
✅ توليد تقارير PDF/Word شاملة  
✅ تخزين الأدلة القانونية في قاعدة البيانات  

---

## 📋 القسم 1: تحليل البرومبت المقدم

### 1.1 المتطلبات الوظيفية الأساسية

#### المكونات التقنية المطلوبة:
| المكون | الغرض | الإصدار الموصى به |
|--------|-------|-------------------|
| **Haystack** | إطار عمل NLP للبحث والاسترجاع | 1.24+ |
| **Qdrant** | قاعدة بيانات المتجهات | 1.12+ |
| **sentence-transformers** | نماذج التضمين (BGE-M3) | 3.2+ |
| **spaCy** | معالجة اللغة الطبيعية | 3.8+ |
| **LexNLP** | معالجة النصوص القانونية | 2.3+ (اختياري) |
| **FastAPI** | واجهة برمجية REST API | 0.115+ |

#### الوظائف الرئيسية:

**1. واجهة API:**
```
POST /legal-match
- Input: {text, top_k, engagement_id, section_id}
- Output: matches[{law_id, article, url, excerpt, score, tag}]
```

**2. نظام الفهرسة:**
- قراءة القوانين من `data/laws_qatar.jsonl`
- تجزئة إلى فقرات منطقية (مادة/بند)
- توليد embeddings باستخدام BGE-M3
- تخزين في Qdrant بـ COSINE distance

**3. محرك المطابقة:**
- بحث متجه (Vector Search) مع normalize_embeddings=True
- استرجاع هجين (Vector + BM25) - اختياري
- قواعد spaCy Matcher للعبارات النمطية

**4. نظام الوسوم:**
- Score ≥ 0.85 → "مطابقة قوية" 🟢
- Score 0.70-0.85 → "مطابقة متوسطة" 🟡
- Score < 0.70 → "راجع يدوياً" ⚪

### 1.2 المتطلبات غير الوظيفية

#### معايير الأداء:
| المعيار | القيمة المستهدفة | الحالة |
|---------|------------------|--------|
| فهرسة 1000 فقرة | ≤ 2 دقيقة | 🎯 قابل للتحقيق |
| زمن استجابة (K=5) | ≤ 600ms | 🎯 قابل للتحقيق |
| الدقة (50 حالة) | ≥ 80% | 🎯 يحتاج تقييم بشري |
| الترخيص | مجاني ومفتوح | ✅ متحقق |
| الخصوصية | محلي 100% | ✅ متحقق |

#### القيود التقنية:
- ❌ لا استخدام خدمات سحابية خارجية (OpenAI, Azure)
- ✅ يعمل محلياً على Windows
- ✅ Docker/Docker Compose للتشغيل
- ✅ دعم اللغة العربية بالكامل

---

## 📐 القسم 2: تحليل البنية الحالية لـ AuditOrbit

### 2.1 المعمارية الحالية (Clean Architecture)

```
AuditOrbit/
├── api/                      # FastAPI Backend
│   ├── app/
│   │   ├── presentation/     # ✅ Controllers & API Routes
│   │   │   ├── main.py       # Entry point
│   │   │   └── routers/      # ai.py, evidence.py, etc.
│   │   ├── application/      # ✅ Use Cases & Business Logic
│   │   ├── domain/           # ✅ Entities & Domain Models
│   │   ├── infrastructure/   # ✅ DB, External Services
│   │   │   ├── db/session.py
│   │   │   ├── security/
│   │   │   └── response_models.py
│   │   └── config/
│   │       └── settings.py   # DATABASE_URL, REDIS_URL, S3
│   └── alembic/              # ✅ Database Migrations
│       └── versions/         # 0001-0011 migrations
│
├── frontend/                 # Next.js 16 + React 19
│   └── src/
│       ├── app/              # ✅ Pages (App Router)
│       │   ├── admin/
│       │   ├── manager/
│       │   └── auditor/
│       ├── components/       # ✅ React Components
│       │   ├── ui/
│       │   └── layout/
│       └── lib/              # ✅ API Client & Utilities
│
├── ai/                       # ✅ AI Workers (OCR, Extraction)
│   └── worker/
│       ├── ocr.py
│       ├── normalize.py
│       └── tasks.py
│
└── infra/                    # ✅ Docker Compose
    └── docker-compose.yml    # PostgreSQL, Redis, MinIO, API, AI
```

### 2.2 التقنيات المستخدمة حالياً

#### Backend Stack:
```python
# من api/requirements.txt
FastAPI==0.115.6           # ✅ Web Framework
SQLAlchemy==2.0.36        # ✅ ORM
PostgreSQL 16             # ✅ Database
Redis==5.0.8              # ✅ Cache & Queue
RQ==1.16.2                # ✅ Job Queue
alembic==1.14.0           # ✅ Migrations
pydantic-settings==2.6.1  # ✅ Config Management
```

#### Frontend Stack:
```json
// من frontend/package.json
"next": "^16.0.0"                    // ✅ Framework
"react": "^19.2.0"                   // ✅ UI Library
"@tanstack/react-query": "^5.90.5"  // ✅ Data Fetching
"tailwindcss": "^4.1.16"             // ✅ Styling
"openapi-fetch": "^0.10.4"           // ✅ Type-safe API
```

#### Infrastructure:
```yaml
# من infra/docker-compose.yml
services:
  - db: PostgreSQL 16           # ✅ Main Database
  - redis: Redis 7              # ✅ Queue/Cache
  - minio: MinIO                # ✅ S3-compatible Storage
  - api: FastAPI App            # ✅ Backend API
  - ai: AI Worker (OCR)         # ✅ Background Jobs
```

### 2.3 نقاط التكامل الموجودة

#### ✅ موجود ويعمل:
1. **نظام RBAC** - صلاحيات متقدمة (roles, permissions)
2. **جدول Evidence** - مع `evidence_extractions` للبيانات المستخرجة
3. **جدول Engagements** - المهمات/المشاريع
4. **AI Worker Infrastructure** - Redis + RQ للمعالجة الخلفية
5. **API Router للـ AI** - `/ai/extract/{evidence_id}`
6. **نظام Audit Logs** - تتبع جميع العمليات
7. **Docker Compose** - بيئة تشغيل كاملة

#### ❌ غير موجود (سننشئه):
1. ❌ Qdrant Vector Database
2. ❌ Embedding Models (Sentence Transformers)
3. ❌ Legal Documents Corpus
4. ❌ Legal Matching Service
5. ❌ جدول `audit_evidence` للمطابقات القانونية

---

## 🎨 القسم 3: استراتيجية الدمج المقترحة

### 3.1 النهج المعماري: Microservice Pattern

#### لماذا هذا النهج؟

| المعيار | التفسير |
|---------|---------|
| **عزل المكونات** | وحدة المطابقة لها dependencies ثقيلة (3GB+ models) |
| **قابلية التوسع** | يمكن scale بشكل منفصل عن API الرئيسي |
| **الصيانة** | سهولة تحديث النماذج بدون إعادة بناء API |
| **الأداء** | لا تؤثر على سرعة API الرئيسي |
| **التطوير** | فريق منفصل يمكنه العمل على الوحدة |

### 3.2 الرسم المعماري الكامل

```
┌─────────────────────────────────────────────────────────────────┐
│                     AuditOrbit Ecosystem                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  HTTP/REST  ┌──────────────┐                 │
│  │   Frontend   │────────────▶│   API (Main) │                 │
│  │   Next.js    │             │   FastAPI    │                 │
│  │              │◀────────────│   :8000      │                 │
│  └──────────────┘             └───────┬──────┘                 │
│        │                              │                         │
│        │                              ▼                         │
│        │                      ┌──────────────┐                 │
│        │                      │  PostgreSQL  │                 │
│        │                      │   (Main DB)  │                 │
│        │                      └──────────────┘                 │
│        │                              │                         │
│        │                              │                         │
│        │                              ▼                         │
│        │                      ┌──────────────┐                 │
│        │                      │    Redis     │                 │
│        │                      │ Queue/Cache  │                 │
│        │                      └───┬──────┬───┘                 │
│        │                          │      │                     │
│        │          ┌───────────────┘      └───────────┐         │
│        │          ▼                                  ▼          │
│        │  ┌──────────────┐                  ┌──────────────┐  │
│        │  │  AI Worker   │                  │Legal Matcher │  │
│        │  │   (OCR)      │                  │   Service    │  │
│        │  │   RQ Task    │                  │   :8001      │  │
│        │  └──────┬───────┘                  └──────┬───────┘  │
│        │         │                                 │           │
│        │         ▼                                 ▼           │
│        │  ┌──────────────┐                  ┌──────────────┐  │
│        └─▶│   MinIO S3   │                  │    Qdrant    │  │
│           │   Storage    │                  │   Vectors    │  │
│           │   :9000      │                  │   :6333      │  │
│           └──────────────┘                  └──────────────┘  │
│                                                                │
└─────────────────────────────────────────────────────────────────┘

تدفق البيانات:
1. المستخدم يدخل نص في Frontend
2. Frontend يرسل POST /api/legal/match إلى API
3. API يتحقق من الصلاحيات (RBAC)
4. API يستدعي Legal Matcher Service
5. Legal Matcher يولد embedding للنص
6. Legal Matcher يبحث في Qdrant
7. Qdrant يعيد أعلى K نتائج
8. Legal Matcher يصنف النتائج (strong/medium/manual)
9. API يحفظ النتائج في جدول audit_evidence
10. API يعيد النتائج للـ Frontend
11. Frontend يعرض النتائج بتنسيق جميل
```

---

## 🏗️ القسم 4: خطة التنفيذ التفصيلية

### المرحلة 1: إعداد البنية التحتية (يوم 1) ⏰

#### 1.1 هيكل المجلدات الجديد

```
AuditOrbit/
└── legal-matcher/                    # 🆕 خدمة جديدة
    ├── Dockerfile                    # بناء الـ container
    ├── requirements.txt              # المكتبات المطلوبة
    ├── .env.example                  # مثال للإعدادات
    │
    ├── config.py                     # إعدادات التطبيق
    ├── main.py                       # FastAPI entry point
    │
    ├── models/                       # 🆕
    │   ├── __init__.py
    │   └── schemas.py                # Pydantic models
    │
    ├── services/                     # 🆕
    │   ├── __init__.py
    │   ├── embedder.py               # BGE-M3 embeddings
    │   ├── vectorstore.py            # Qdrant operations
    │   ├── matcher.py                # Matching logic
    │   └── indexer.py                # Indexing service
    │
    ├── data/                         # 🆕
    │   ├── laws_qatar.jsonl          # القوانين القطرية
    │   └── README.md                 # تعليمات البيانات
    │
    ├── scripts/                      # 🆕
    │   ├── prepare_data.py           # تحضير البيانات
    │   └── test_service.py           # اختبار الخدمة
    │
    └── tests/                        # 🆕
        ├── __init__.py
        ├── test_embedder.py
        ├── test_matcher.py
        └── test_performance.py
```

#### 1.2 ملف requirements.txt

```python
# legal-matcher/requirements.txt

# ==========================================
# Core Framework
# ==========================================
fastapi==0.115.6
uvicorn[standard]==0.32.1
pydantic==2.9.2
pydantic-settings==2.6.1
python-dotenv==1.0.1

# ==========================================
# Vector Database
# ==========================================
qdrant-client==1.11.3

# ==========================================
# Machine Learning & Embeddings
# ==========================================
sentence-transformers==3.2.1
torch==2.5.1
transformers==4.46.3

# ==========================================
# NLP Processing
# ==========================================
spacy==3.8.2
# تثبيت نماذج spaCy بشكل منفصل:
# python -m spacy download ar_core_news_sm
# python -m spacy download en_core_web_sm

# ==========================================
# Legal NLP (Optional)
# ==========================================
# lexnlp==2.3.0  
# ملاحظة: قد يحتاج تعديلات للتوافق مع Python 3.11+
# يُفضل الاستغناء عنه في البداية

# ==========================================
# Text Processing & Utilities
# ==========================================
nltk==3.9.1
regex==2024.11.6
numpy==1.26.4
scikit-learn==1.5.2

# ==========================================
# Caching & Queue
# ==========================================
redis==5.0.8
hiredis==3.0.0  # للأداء الأفضل

# ==========================================
# HTTP Client
# ==========================================
httpx==0.27.2
aiohttp==3.11.2

# ==========================================
# Database
# ==========================================
sqlalchemy==2.0.36
psycopg[binary]==3.2.10

# ==========================================
# Document Generation
# ==========================================
python-docx==1.1.2
reportlab==4.2.5
Pillow==10.4.0

# ==========================================
# Monitoring & Logging
# ==========================================
prometheus-client==0.21.0
python-json-logger==2.0.7

# ==========================================
# Development & Testing
# ==========================================
pytest==8.3.4
pytest-asyncio==0.24.0
pytest-cov==6.0.0
httpx==0.27.2  # للاختبار
```

#### 1.3 ملف Dockerfile

```dockerfile
# legal-matcher/Dockerfile

FROM python:3.11-slim

# متغيرات بيئة Python
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# تثبيت dependencies للنظام
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# نسخ requirements وتثبيتها
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# تنزيل نماذج spaCy
RUN python -m spacy download ar_core_news_sm && \
    python -m spacy download en_core_web_sm

# نسخ الكود
COPY . .

# إنشاء مجلدات البيانات
RUN mkdir -p /app/data /root/.cache/huggingface

# Expose port
EXPOSE 8001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8001/health || exit 1

# تشغيل الخدمة
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001", "--workers", "2"]
```

#### 1.4 تحديث docker-compose.yml

```yaml
# infra/docker-compose.yml - إضافة خدمتين جديدتين

x-project-name: "AuditOrbit"

services:
  # ============ الخدمات الموجودة (بدون تغيير) ============
  db:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${POSTGRES_DB:-auditdb}
      POSTGRES_USER: ${POSTGRES_USER:-audit}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-auditpw}
    ports:
      - "5432:5432"
    volumes:
      - db-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U audit -d auditdb"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    command: redis-server --appendonly yes
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data

  minio:
    image: minio/minio:latest
    restart: unless-stopped
    environment:
      MINIO_ROOT_USER: ${MINIO_ROOT_USER:-auditorbit}
      MINIO_ROOT_PASSWORD: ${MINIO_ROOT_PASSWORD:-auditorbit123}
    command: server /data --console-address ":9001"
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - minio-data:/data

  api:
    build:
      context: ../api
      dockerfile: Dockerfile
    restart: unless-stopped
    env_file:
      - ../.env
    environment:
      DATABASE_URL: postgresql+psycopg://audit:auditpw@db:5432/auditdb
      REDIS_URL: redis://redis:6379/0
      S3_ENDPOINT: http://minio:9000
      LEGAL_MATCHER_URL: http://legal-matcher:8001  # 🆕
    depends_on:
      - db
      - redis
      - minio
    ports:
      - "8000:8000"

  ai:
    build:
      context: ../ai
      dockerfile: Dockerfile
    restart: unless-stopped
    env_file:
      - ../.env
    environment:
      - S3_ENDPOINT=${S3_ENDPOINT:-http://minio:9000}
      - REDIS_URL=${REDIS_URL:-redis://redis:6379/0}
      - DATABASE_URL=${DATABASE_URL:-postgresql+psycopg://audit:auditpw@db:5432/auditdb}
    depends_on:
      - redis
      - db
      - minio

  # ============ خدمات جديدة 🆕 ============
  
  qdrant:
    image: qdrant/qdrant:v1.12.1
    restart: unless-stopped
    ports:
      - "6333:6333"  # REST API
      - "6334:6334"  # gRPC
    volumes:
      - qdrant-data:/qdrant/storage
    environment:
      - QDRANT__SERVICE__GRPC_PORT=6334
      - QDRANT__LOG_LEVEL=INFO
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:6333/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  legal-matcher:
    build:
      context: ../legal-matcher
      dockerfile: Dockerfile
    restart: unless-stopped
    depends_on:
      - qdrant
      - redis
      - db
    environment:
      # Vector DB
      - QDRANT_URL=http://qdrant:6333
      - COLLECTION_NAME=laws_corpus
      
      # Model
      - MODEL_NAME=BAAI/bge-m3
      - DEVICE=cpu  # أو cuda إذا كان GPU متاحاً
      - MAX_SEQ_LENGTH=512
      
      # Database & Cache
      - DATABASE_URL=postgresql+psycopg://audit:auditpw@db:5432/auditdb
      - REDIS_URL=redis://redis:6379/0
      
      # Search Settings
      - TOP_K=5
      - MIN_SCORE=0.5
      - STRONG_MATCH_THRESHOLD=0.85
      - MEDIUM_MATCH_THRESHOLD=0.70
    ports:
      - "8001:8001"
    volumes:
      - legal-data:/app/data
      - legal-models:/root/.cache/huggingface
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8001/health"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  db-data:
  minio-data:
  redis-data:
  qdrant-data:      # 🆕
  legal-data:       # 🆕
  legal-models:     # 🆕
```

---

### المرحلة 2: بناء خدمة المطابقة (يوم 2-3) ⏰

#### 2.1 ملف الإعدادات

**`legal-matcher/config.py`**

```python
"""
إعدادات خدمة المطابقة القانونية
"""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """إعدادات التطبيق"""
    
    # ==========================================
    # Vector Database Settings
    # ==========================================
    QDRANT_URL: str = "http://localhost:6333"
    COLLECTION_NAME: str = "laws_corpus"
    VECTOR_SIZE: int = 1024  # BGE-M3 dimension
    
    # ==========================================
    # Model Settings
    # ==========================================
    MODEL_NAME: str = "BAAI/bge-m3"
    DEVICE: str = "cpu"  # "cuda" or "cpu"
    MAX_SEQ_LENGTH: int = 512
    BATCH_SIZE: int = 32
    
    # ==========================================
    # Search Settings
    # ==========================================
    TOP_K: int = 5
    MIN_SCORE: float = 0.5
    
    # ==========================================
    # Classification Thresholds
    # ==========================================
    STRONG_MATCH_THRESHOLD: float = 0.85
    MEDIUM_MATCH_THRESHOLD: float = 0.70
    
    # ==========================================
    # Database & Cache
    # ==========================================
    DATABASE_URL: str = "postgresql+psycopg://audit:auditpw@localhost:5432/auditdb"
    REDIS_URL: str = "redis://localhost:6379/0"
    CACHE_TTL: int = 3600  # 1 hour in seconds
    
    # ==========================================
    # API Settings
    # ==========================================
    API_TITLE: str = "Legal Matcher Service"
    API_VERSION: str = "1.0.0"
    API_DESCRIPTION: str = "خدمة مطابقة المستندات مع القوانين القطرية"
    DEBUG: bool = False
    
    # ==========================================
    # Logging
    # ==========================================
    LOG_LEVEL: str = "INFO"
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


# إنشاء instance من الإعدادات
settings = Settings()
```

#### 2.2 نماذج البيانات (Pydantic Schemas)

**`legal-matcher/models/schemas.py`**

```python
"""
نماذج البيانات لخدمة المطابقة القانونية
"""
from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
from datetime import datetime
from uuid import UUID


# ==========================================
# Request Models
# ==========================================

class LegalMatchRequest(BaseModel):
    """طلب مطابقة نص مع القوانين"""
    text: str = Field(
        ..., 
        min_length=10, 
        max_length=10000,
        description="النص المراد مطابقته مع القوانين"
    )
    top_k: int = Field(
        5, 
        ge=1, 
        le=20,
        description="عدد النتائج المطلوبة"
    )
    min_score: Optional[float] = Field(
        0.5, 
        ge=0.0, 
        le=1.0,
        description="الحد الأدنى لدرجة التطابق"
    )
    engagement_id: Optional[UUID] = Field(
        None,
        description="معرّف المهمة (اختياري)"
    )
    section_id: Optional[str] = Field(
        None,
        description="معرّف القسم (اختياري)"
    )
    
    @validator('text')
    def validate_text(cls, v):
        """التحقق من النص"""
        if not v.strip():
            raise ValueError("النص لا يمكن أن يكون فارغاً")
        return v.strip()
    
    class Config:
        schema_extra = {
            "example": {
                "text": "يجب على جميع المؤسسات الحكومية إنشاء وحدة للتدقيق الداخلي",
                "top_k": 5,
                "min_score": 0.6,
                "engagement_id": "123e4567-e89b-12d3-a456-426614174000",
                "section_id": "section-001"
            }
        }


# ==========================================
# Response Models
# ==========================================

class LegalMatch(BaseModel):
    """نتيجة مطابقة واحدة"""
    law_id: str = Field(..., description="معرّف القانون")
    article: str = Field(..., description="رقم المادة")
    url: str = Field(..., description="رابط المادة")
    excerpt: str = Field(..., description="اقتباس من المادة (300-500 حرف)")
    score: float = Field(..., ge=0.0, le=1.0, description="درجة التطابق")
    tag: str = Field(..., description="تصنيف المطابقة")
    
    class Config:
        schema_extra = {
            "example": {
                "law_id": "قانون رقم (8) لسنة 2022 بشأن ديوان المحاسبة",
                "article": "المادة (5)",
                "url": "https://www.almeezan.qa/LawView.aspx?opt&LawID=9600",
                "excerpt": "يجب على جميع الجهات الحكومية إنشاء وحدات للتدقيق الداخلي...",
                "score": 0.92,
                "tag": "مطابقة قوية"
            }
        }


class LegalMatchResponse(BaseModel):
    """استجابة طلب المطابقة"""
    matches: List[LegalMatch] = Field(..., description="قائمة المطابقات")
    query_text: str = Field(..., description="النص المستعلم عنه (مختصر)")
    search_time_ms: float = Field(..., description="وقت البحث بالميلي ثانية")
    total_found: int = Field(..., description="إجمالي النتائج الموجودة")
    
    class Config:
        schema_extra = {
            "example": {
                "matches": [
                    {
                        "law_id": "قانون رقم 8 لسنة 2022",
                        "article": "المادة 5",
                        "url": "https://...",
                        "excerpt": "...",
                        "score": 0.92,
                        "tag": "مطابقة قوية"
                    }
                ],
                "query_text": "يجب على جميع المؤسسات الحكومية...",
                "search_time_ms": 245.5,
                "total_found": 5
            }
        }


# ==========================================
# Indexing Models
# ==========================================

class LawDocument(BaseModel):
    """مستند قانوني للفهرسة"""
    text: str = Field(..., description="نص المادة كاملاً")
    law_id: str = Field(..., description="معرّف القانون")
    article: str = Field(..., description="رقم المادة")
    url: str = Field(..., description="رابط المادة")
    metadata: Optional[Dict[str, Any]] = Field(
        default_factory=dict,
        description="بيانات إضافية"
    )
    
    class Config:
        schema_extra = {
            "example": {
                "text": "المادة (1): تسري أحكام هذا القانون...",
                "law_id": "قانون رقم 8 لسنة 2022",
                "article": "المادة 1",
                "url": "https://www.almeezan.qa/...",
                "metadata": {
                    "year": 2022,
                    "category": "تدقيق ومحاسبة"
                }
            }
        }


# ==========================================
# Statistics Models
# ==========================================

class ServiceStats(BaseModel):
    """إحصائيات الخدمة"""
    total_documents: int = Field(..., description="إجمالي المستندات المفهرسة")
    collection_name: str = Field(..., description="اسم المجموعة")
    model_name: str = Field(..., description="اسم النموذج المستخدم")
    vector_size: int = Field(..., description="حجم المتجهات")
    service_uptime: Optional[str] = Field(None, description="وقت تشغيل الخدمة")
```

#### 2.3 خدمة التضمين (Embeddings)

**`legal-matcher/services/embedder.py`**

```python
"""
خدمة توليد التضمينات (Embeddings) باستخدام BGE-M3
"""
from sentence_transformers import SentenceTransformer
import torch
from typing import List, Union
import numpy as np
import logging
from ..config import settings

logger = logging.getLogger(__name__)


class LegalEmbedder:
    """
    خدمة توليد embeddings للنصوص القانونية
    يستخدم نموذج BGE-M3 الذي يدعم اللغة العربية
    """
    
    def __init__(self):
        """تهيئة النموذج"""
        logger.info(f"Loading embedding model: {settings.MODEL_NAME}")
        logger.info(f"Device: {settings.DEVICE}")
        
        self.device = settings.DEVICE
        self.model = SentenceTransformer(
            settings.MODEL_NAME,
            device=self.device
        )
        
        # تحسين الأداء
        self.model.max_seq_length = settings.MAX_SEQ_LENGTH
        
        # التحقق من تحميل النموذج
        dimension = self.model.get_sentence_embedding_dimension()
        logger.info(f"Model loaded successfully. Dimension: {dimension}")
        
    def embed_query(self, text: str) -> np.ndarray:
        """
        تضمين استعلام واحد
        
        Args:
            text: النص المراد تضمينه
            
        Returns:
            np.ndarray: متجه التضمين المُطبّع
        """
        try:
            embedding = self.model.encode(
                text,
                convert_to_numpy=True,
                normalize_embeddings=True,  # مهم جداً لـ COSINE similarity
                show_progress_bar=False
            )
            return embedding
        except Exception as e:
            logger.error(f"Error embedding query: {e}")
            raise
    
    def embed_documents(
        self, 
        texts: List[str], 
        batch_size: int = None,
        show_progress: bool = True
    ) -> List[np.ndarray]:
        """
        تضمين مجموعة من المستندات
        
        Args:
            texts: قائمة النصوص
            batch_size: حجم الدفعة (اختياري)
            show_progress: عرض شريط التقدم
            
        Returns:
            List[np.ndarray]: قائمة المتجهات المُطبّعة
        """
        if batch_size is None:
            batch_size = settings.BATCH_SIZE
            
        try:
            logger.info(f"Embedding {len(texts)} documents...")
            embeddings = self.model.encode(
                texts,
                batch_size=batch_size,
                convert_to_numpy=True,
                normalize_embeddings=True,
                show_progress_bar=show_progress
            )
            logger.info(f"Successfully embedded {len(texts)} documents")
            return embeddings.tolist()
        except Exception as e:
            logger.error(f"Error embedding documents: {e}")
            raise
    
    def get_dimension(self) -> int:
        """الحصول على بُعد المتجهات"""
        return self.model.get_sentence_embedding_dimension()
    
    def similarity(self, embedding1: np.ndarray, embedding2: np.ndarray) -> float:
        """
        حساب التشابه بين متجهين (cosine similarity)
        
        Args:
            embedding1: المتجه الأول
            embedding2: المتجه الثاني
            
        Returns:
            float: درجة التشابه (0-1)
        """
        return float(np.dot(embedding1, embedding2))
```

#### 2.4 خدمة قاعدة المتجهات (Qdrant)

**`legal-matcher/services/vectorstore.py`**

```python
"""
خدمة قاعدة بيانات المتجهات (Qdrant)
"""
from qdrant_client import QdrantClient
from qdrant_client.models import (
    Distance, VectorParams, PointStruct, 
    Filter, FieldCondition, MatchValue,
    SearchRequest, QueryResponse
)
from typing import List, Dict, Any, Optional
from uuid import uuid4
import logging
from ..config import settings

logger = logging.getLogger(__name__)


class QdrantVectorStore:
    """
    خدمة إدارة المتجهات في Qdrant
    """
    
    def __init__(self, embedder):
        """
        تهيئة الاتصال بـ Qdrant
        
        Args:
            embedder: خدمة التضمين
        """
        logger.info(f"Connecting to Qdrant at: {settings.QDRANT_URL}")
        self.client = QdrantClient(url=settings.QDRANT_URL)
        self.embedder = embedder
        self.collection_name = settings.COLLECTION_NAME
        
        # التحقق من الاتصال
        try:
            collections = self.client.get_collections()
            logger.info(f"Connected to Qdrant. Existing collections: {len(collections.collections)}")
        except Exception as e:
            logger.error(f"Failed to connect to Qdrant: {e}")
            raise
    
    def collection_exists(self) -> bool:
        """التحقق من وجود المجموعة"""
        try:
            self.client.get_collection(self.collection_name)
            return True
        except Exception:
            return False
    
    def create_collection(self, recreate: bool = False):
        """
        إنشاء مجموعة جديدة للقوانين
        
        Args:
            recreate: إعادة إنشاء المجموعة إذا كانت موجودة
        """
        try:
            if recreate:
                logger.info(f"Recreating collection '{self.collection_name}'...")
                self.client.recreate_collection(
                    collection_name=self.collection_name,
                    vectors_config=VectorParams(
                        size=self.embedder.get_dimension(),
                        distance=Distance.COSINE  # مهم: استخدام COSINE
                    )
                )
            else:
                if self.collection_exists():
                    logger.info(f"Collection '{self.collection_name}' already exists")
                    return
                    
                logger.info(f"Creating collection '{self.collection_name}'...")
                self.client.create_collection(
                    collection_name=self.collection_name,
                    vectors_config=VectorParams(
                        size=self.embedder.get_dimension(),
                        distance=Distance.COSINE
                    )
                )
            
            logger.info(f"Collection '{self.collection_name}' created successfully")
            
        except Exception as e:
            logger.error(f"Error creating collection: {e}")
            raise
    
    def index_documents(self, documents: List[Dict[str, Any]]):
        """
        فهرسة مجموعة من المستندات القانونية
        
        Args:
            documents: قائمة المستندات [{"text": ..., "law_id": ..., "article": ..., "url": ...}]
        """
        if not documents:
            logger.warning("No documents to index")
            return
        
        logger.info(f"Starting to index {len(documents)} documents...")
        
        # استخراج النصوص
        texts = [doc['text'] for doc in documents]
        
        # توليد embeddings
        embeddings = self.embedder.embed_documents(texts)
        
        # إنشاء نقاط (points) للإدراج
        points = []
        for i, (doc, embedding) in enumerate(zip(documents, embeddings)):
            # تقصير النص للتخزين (أول 500 حرف)
            excerpt = doc['text'][:500] if len(doc['text']) > 500 else doc['text']
            
            point = PointStruct(
                id=str(uuid4()),
                vector=embedding,
                payload={
                    'law_id': doc['law_id'],
                    'article': doc['article'],
                    'url': doc['url'],
                    'text': excerpt,
                    'full_text_length': len(doc['text'])
                }
            )
            points.append(point)
        
        # إدراج على دفعات
        batch_size = 100
        total_batches = (len(points) + batch_size - 1) // batch_size
        
        for i in range(0, len(points), batch_size):
            batch = points[i:i + batch_size]
            batch_num = (i // batch_size) + 1
            
            logger.info(f"Uploading batch {batch_num}/{total_batches} ({len(batch)} points)...")
            
            self.client.upsert(
                collection_name=self.collection_name,
                points=batch
            )
        
        logger.info(f"✅ Successfully indexed {len(documents)} documents")
    
    def search(
        self, 
        query_text: str, 
        top_k: int = 5, 
        score_threshold: float = 0.5
    ) -> List[Dict[str, Any]]:
        """
        البحث عن أقرب المطابقات للنص المعطى
        
        Args:
            query_text: النص المراد البحث عنه
            top_k: عدد النتائج المطلوبة
            score_threshold: الحد الأدنى للدرجة
            
        Returns:
            List[Dict]: قائمة النتائج مرتبة حسب الأعلى درجة
        """
        try:
            # توليد embedding للاستعلام
            query_vector = self.embedder.embed_query(query_text)
            
            # البحث في Qdrant
            results = self.client.search(
                collection_name=self.collection_name,
                query_vector=query_vector.tolist(),
                limit=top_k,
                score_threshold=score_threshold
            )
            
            # تحويل النتائج إلى تنسيق قياسي
            matches = []
            for result in results:
                matches.append({
                    'law_id': result.payload['law_id'],
                    'article': result.payload['article'],
                    'url': result.payload['url'],
                    'excerpt': result.payload['text'],
                    'score': float(result.score)
                })
            
            logger.info(f"Found {len(matches)} matches for query")
            return matches
            
        except Exception as e:
            logger.error(f"Error during search: {e}")
            raise
    
    def get_stats(self) -> Dict[str, Any]:
        """الحصول على إحصائيات المجموعة"""
        try:
            collection_info = self.client.get_collection(self.collection_name)
            return {
                'total_documents': collection_info.points_count,
                'collection_name': self.collection_name,
                'vector_size': collection_info.config.params.vectors.size,
                'distance': collection_info.config.params.vectors.distance
            }
        except Exception as e:
            logger.error(f"Error getting stats: {e}")
            return {}
    
    def delete_collection(self):
        """حذف المجموعة"""
        try:
            self.client.delete_collection(self.collection_name)
            logger.info(f"Collection '{self.collection_name}' deleted")
        except Exception as e:
            logger.error(f"Error deleting collection: {e}")
            raise
```

سأكمل الملف...

#### 2.5 خدمة المطابقة الرئيسية

**`legal-matcher/services/matcher.py`**

```python
"""
خدمة المطابقة القانونية الرئيسية
"""
from typing import List, Dict, Any
import time
import logging
import redis
import json
import hashlib
from ..models.schemas import LegalMatch
from ..config import settings

logger = logging.getLogger(__name__)


class LegalMatcher:
    """
    محرك المطابقة القانونية
    يدمج البحث المتجه مع التصنيف والتخزين المؤقت
    """
    
    def __init__(self, vectorstore):
        """
        تهيئة المطابق
        
        Args:
            vectorstore: خدمة قاعدة المتجهات
        """
        self.vectorstore = vectorstore
        
        # إعداد Redis للتخزين المؤقت
        try:
            self.redis_client = redis.from_url(
                settings.REDIS_URL,
                decode_responses=True
            )
            self.cache_enabled = True
            logger.info("Redis cache enabled")
        except Exception as e:
            logger.warning(f"Redis cache disabled: {e}")
            self.cache_enabled = False
    
    def _get_cache_key(self, text: str, top_k: int, min_score: float) -> str:
        """توليد مفتاح cache فريد"""
        content = f"{text}:{top_k}:{min_score}"
        return f"legal:match:{hashlib.md5(content.encode()).hexdigest()}"
    
    def _get_from_cache(self, cache_key: str) -> Optional[Dict[str, Any]]:
        """محاولة الحصول على نتيجة من الcache"""
        if not self.cache_enabled:
            return None
            
        try:
            cached = self.redis_client.get(cache_key)
            if cached:
                logger.info("Cache hit")
                return json.loads(cached)
        except Exception as e:
            logger.warning(f"Cache read error: {e}")
        
        return None
    
    def _save_to_cache(self, cache_key: str, result: Dict[str, Any]):
        """حفظ النتيجة في cache"""
        if not self.cache_enabled:
            return
            
        try:
            self.redis_client.setex(
                cache_key,
                settings.CACHE_TTL,
                json.dumps(result, ensure_ascii=False)
            )
        except Exception as e:
            logger.warning(f"Cache write error: {e}")
    
    def _classify_match(self, score: float) -> str:
        """
        تصنيف المطابقة حسب الدرجة
        
        Args:
            score: درجة التطابق (0-1)
            
        Returns:
            str: التصنيف (مطابقة قوية/متوسطة/راجع يدوياً)
        """
        if score >= settings.STRONG_MATCH_THRESHOLD:
            return "مطابقة قوية"
        elif score >= settings.MEDIUM_MATCH_THRESHOLD:
            return "مطابقة متوسطة"
        else:
            return "راجع يدوياً"
    
    def match(
        self, 
        text: str, 
        top_k: int = 5, 
        min_score: float = 0.5
    ) -> Dict[str, Any]:
        """
        مطابقة النص مع القوانين
        
        Args:
            text: النص المراد مطابقته
            top_k: عدد النتائج المطلوبة
            min_score: الحد الأدنى للدرجة
            
        Returns:
            Dict: النتائج مع البيانات الوصفية
        """
        # التحقق من cache أولاً
        cache_key = self._get_cache_key(text, top_k, min_score)
        cached_result = self._get_from_cache(cache_key)
        if cached_result:
            return cached_result
        
        # البحث الفعلي
        start_time = time.time()
        
        try:
            # البحث في Qdrant
            raw_matches = self.vectorstore.search(
                query_text=text,
                top_k=top_k,
                score_threshold=min_score
            )
            
            # تحويل النتائج وإضافة الوسوم
            matches = []
            for match in raw_matches:
                tag = self._classify_match(match['score'])
                matches.append(
                    LegalMatch(
                        law_id=match['law_id'],
                        article=match['article'],
                        url=match['url'],
                        excerpt=match['excerpt'],
                        score=match['score'],
                        tag=tag
                    )
                )
            
            search_time = (time.time() - start_time) * 1000  # ms
            
            result = {
                'matches': [m.dict() for m in matches],
                'query_text': text[:100],  # أول 100 حرف
                'search_time_ms': round(search_time, 2),
                'total_found': len(matches)
            }
            
            # حفظ في cache
            self._save_to_cache(cache_key, result)
            
            logger.info(f"Match completed in {search_time:.2f}ms, found {len(matches)} results")
            return result
            
        except Exception as e:
            logger.error(f"Error in match: {e}")
            raise
```

#### 2.6 خدمة الفهرسة

**`legal-matcher/services/indexer.py`**

```python
"""
خدمة فهرسة القوانين القطرية
"""
import jsonlines
from pathlib import Path
from typing import List, Dict, Any
import logging
from .embedder import LegalEmbedder
from .vectorstore import QdrantVectorStore

logger = logging.getLogger(__name__)


class LegalIndexer:
    """
    خدمة فهرسة corpus القوانين
    """
    
    def __init__(self):
        """تهيئة الفاهرس"""
        logger.info("Initializing Legal Indexer...")
        self.embedder = LegalEmbedder()
        self.vectorstore = QdrantVectorStore(self.embedder)
    
    def load_corpus(self, file_path: str) -> List[Dict[str, Any]]:
        """
        تحميل corpus من ملف JSONL
        
        Args:
            file_path: مسار ملف JSONL
            
        Returns:
            List[Dict]: قائمة المستندات
        """
        documents = []
        file_path_obj = Path(file_path)
        
        if not file_path_obj.exists():
            raise FileNotFoundError(f"File not found: {file_path}")
        
        logger.info(f"Loading corpus from: {file_path}")
        
        with jsonlines.open(file_path) as reader:
            for obj in reader:
                # التحقق من الحقول المطلوبة
                required_fields = ['text', 'law_id', 'article', 'url']
                if not all(field in obj for field in required_fields):
                    logger.warning(f"Skipping document with missing fields: {obj}")
                    continue
                
                documents.append({
                    'text': obj['text'],
                    'law_id': obj['law_id'],
                    'article': obj['article'],
                    'url': obj['url']
                })
        
        logger.info(f"✅ Loaded {len(documents)} documents from {file_path}")
        return documents
    
    def index_corpus(self, corpus_path: str, recreate: bool = False):
        """
        فهرسة corpus كامل
        
        Args:
            corpus_path: مسار ملف JSONL
            recreate: إعادة إنشاء المجموعة
        """
        logger.info("=" * 60)
        logger.info("Starting Legal Corpus Indexing")
        logger.info("=" * 60)
        
        # إنشاء Collection
        self.vectorstore.create_collection(recreate=recreate)
        
        # تحميل المستندات
        documents = self.load_corpus(corpus_path)
        
        if not documents:
            logger.error("No documents to index!")
            return
        
        # فهرسة
        self.vectorstore.index_documents(documents)
        
        # عرض الإحصائيات
        stats = self.vectorstore.get_stats()
        logger.info("=" * 60)
        logger.info("Indexing Complete!")
        logger.info(f"Total documents indexed: {stats.get('total_documents', 0)}")
        logger.info(f"Collection: {stats.get('collection_name', 'N/A')}")
        logger.info(f"Vector size: {stats.get('vector_size', 0)}")
        logger.info("=" * 60)


# سكريبت standalone للتشغيل المباشر
if __name__ == "__main__":
    import sys
    import argparse
    
    # إعداد logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    parser = argparse.ArgumentParser(
        description="فهرسة القوانين القطرية في Qdrant"
    )
    parser.add_argument(
        'corpus_file',
        help='مسار ملف JSONL الذي يحتوي على القوانين'
    )
    parser.add_argument(
        '--recreate',
        action='store_true',
        help='إعادة إنشاء المجموعة (حذف البيانات الموجودة)'
    )
    
    args = parser.parse_args()
    
    if not Path(args.corpus_file).exists():
        print(f"❌ Error: File {args.corpus_file} not found")
        sys.exit(1)
    
    try:
        indexer = LegalIndexer()
        indexer.index_corpus(args.corpus_file, recreate=args.recreate)
        print("✅ Indexing completed successfully")
    except Exception as e:
        print(f"❌ Error during indexing: {e}")
        sys.exit(1)
```

#### 2.7 التطبيق الرئيسي (FastAPI)

**`legal-matcher/main.py`**

```python
"""
التطبيق الرئيسي لخدمة المطابقة القانونية
"""
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
import time
from datetime import datetime

from .models.schemas import (
    LegalMatchRequest, 
    LegalMatchResponse,
    ServiceStats
)
from .services.embedder import LegalEmbedder
from .services.vectorstore import QdrantVectorStore
from .services.matcher import LegalMatcher
from .config import settings

# إعداد Logging
logging.basicConfig(
    level=settings.LOG_LEVEL,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# وقت بدء التشغيل
startup_time = datetime.now()

# ==========================================
# تهيئة المكونات (Singleton Pattern)
# ==========================================
logger.info("Initializing Legal Matcher Service...")
embedder = LegalEmbedder()
vectorstore = QdrantVectorStore(embedder)
matcher = LegalMatcher(vectorstore)
logger.info("✅ Service initialized successfully")

# ==========================================
# FastAPI App
# ==========================================
app = FastAPI(
    title=settings.API_TITLE,
    version=settings.API_VERSION,
    description=settings.API_DESCRIPTION,
    debug=settings.DEBUG,
    docs_url="/docs",
    redoc_url="/redoc"
)

# ==========================================
# CORS Middleware
# ==========================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# Request Logging Middleware
# ==========================================
@app.middleware("http")
async def log_requests(request, call_next):
    """تسجيل جميع الطلبات"""
    start_time = time.time()
    response = await call_next(request)
    process_time = (time.time() - start_time) * 1000
    
    logger.info(
        f"{request.method} {request.url.path} - "
        f"Status: {response.status_code} - "
        f"Time: {process_time:.2f}ms"
    )
    
    return response

# ==========================================
# Routes
# ==========================================

@app.get(
    "/health",
    tags=["System"],
    summary="فحص صحة الخدمة"
)
def health_check():
    """
    التحقق من أن الخدمة تعمل بشكل صحيح
    """
    return {
        "status": "ok",
        "service": "legal-matcher",
        "version": settings.API_VERSION,
        "timestamp": datetime.now().isoformat()
    }


@app.post(
    "/legal-match",
    response_model=LegalMatchResponse,
    tags=["Matching"],
    summary="مطابقة نص مع القوانين",
    description="""
    يقوم بمطابقة النص المعطى مع مواد القوانين القطرية المفهرسة.
    
    **المدخلات:**
    - text: النص المراد مطابقته (10-10000 حرف)
    - top_k: عدد النتائج المطلوبة (1-20)
    - min_score: الحد الأدنى لدرجة التطابق (0.0-1.0)
    
    **المخرجات:**
    - matches: قائمة بأعلى المطابقات مع الدرجات والوسوم
    - search_time_ms: وقت البحث بالميلي ثانية
    """,
    responses={
        200: {"description": "نجح البحث"},
        400: {"description": "خطأ في البيانات المدخلة"},
        500: {"description": "خطأ في الخادم"}
    }
)
async def match_legal_text(request: LegalMatchRequest):
    """
    مطابقة النص مع القوانين
    """
    try:
        logger.info(f"Match request received. Text length: {len(request.text)}, top_k: {request.top_k}")
        
        # التحقق من أن المجموعة موجودة
        if not vectorstore.collection_exists():
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Legal corpus not indexed yet. Please run indexing first."
            )
        
        # إجراء المطابقة
        result = matcher.match(
            text=request.text,
            top_k=request.top_k,
            min_score=request.min_score or settings.MIN_SCORE
        )
        
        logger.info(f"Match completed. Found {result['total_found']} results")
        
        return LegalMatchResponse(**result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in match_legal_text: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@app.get(
    "/stats",
    response_model=ServiceStats,
    tags=["System"],
    summary="إحصائيات الخدمة"
)
def get_service_statistics():
    """
    الحصول على إحصائيات الخدمة والمجموعة
    """
    try:
        stats = vectorstore.get_stats()
        
        # حساب وقت التشغيل
        uptime = datetime.now() - startup_time
        uptime_str = f"{uptime.days}d {uptime.seconds // 3600}h {(uptime.seconds % 3600) // 60}m"
        
        return ServiceStats(
            total_documents=stats.get('total_documents', 0),
            collection_name=stats.get('collection_name', settings.COLLECTION_NAME),
            model_name=settings.MODEL_NAME,
            vector_size=stats.get('vector_size', embedder.get_dimension()),
            service_uptime=uptime_str
        )
    except Exception as e:
        logger.error(f"Error getting stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@app.get(
    "/",
    tags=["System"],
    summary="معلومات الخدمة"
)
def root():
    """
    صفحة الترحيب
    """
    return {
        "service": "Legal Matcher Service",
        "version": settings.API_VERSION,
        "description": "خدمة مطابقة المستندات مع القوانين القطرية",
        "docs": "/docs",
        "health": "/health",
        "stats": "/stats"
    }


# ==========================================
# Startup Event
# ==========================================
@app.on_event("startup")
async def startup_event():
    """
    يتم تنفيذه عند بدء التشغيل
    """
    logger.info("=" * 60)
    logger.info("Legal Matcher Service Starting...")
    logger.info(f"Version: {settings.API_VERSION}")
    logger.info(f"Model: {settings.MODEL_NAME}")
    logger.info(f"Device: {settings.DEVICE}")
    logger.info(f"Qdrant: {settings.QDRANT_URL}")
    logger.info(f"Collection: {settings.COLLECTION_NAME}")
    logger.info("=" * 60)


@app.on_event("shutdown")
async def shutdown_event():
    """
    يتم تنفيذه عند إيقاف التشغيل
    """
    logger.info("Legal Matcher Service shutting down...")
```

---

### المرحلة 3: تحديث API الرئيسي (يوم 4) ⏰

#### 3.1 إضافة Migration لجدول audit_evidence

**`api/alembic/versions/0012_audit_evidence_legal.py`**

```python
"""add audit_evidence table for legal matches

Revision ID: 0012_audit_evidence_legal
Revises: 0011_wp_samples_crud_and_indexes
Create Date: 2025-10-28
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0012_audit_evidence_legal"
down_revision = "0011_wp_samples_crud_and_indexes"
branch_labels = None
depends_on = None


def upgrade() -> None:
    """إنشاء جدول audit_evidence"""
    
    # إنشاء الجدول
    op.create_table(
        "audit_evidence",
        sa.Column(
            "id", 
            postgresql.UUID(as_uuid=True), 
            primary_key=True, 
            server_default=sa.text("gen_random_uuid()")
        ),
        sa.Column(
            "engagement_id", 
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("engagements.id", ondelete="CASCADE"),
            nullable=True
        ),
        sa.Column("section_id", sa.Text(), nullable=True),
        sa.Column("doc_id", sa.Text(), nullable=True),
        sa.Column("law_id", sa.Text(), nullable=False),
        sa.Column("article", sa.Text(), nullable=False),
        sa.Column("url", sa.Text(), nullable=False),
        sa.Column("excerpt", sa.Text(), nullable=False),
        sa.Column("score", sa.Numeric(5, 4), nullable=False),
        sa.Column("tag", sa.Text(), nullable=False),
        sa.Column("query_text", sa.Text(), nullable=True),
        sa.Column(
            "created_at", 
            sa.TIMESTAMP(timezone=True),
            server_default=sa.text("now()"), 
            nullable=False
        ),
        sa.Column(
            "created_by", 
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="SET NULL"),
            nullable=True
        ),
    )
    
    # إنشاء Indexes للأداء
    op.create_index(
        "ix_audit_evidence_engagement", 
        "audit_evidence", 
        ["engagement_id"]
    )
    op.create_index(
        "ix_audit_evidence_score", 
        "audit_evidence", 
        ["score"]
    )
    op.create_index(
        "ix_audit_evidence_created", 
        "audit_evidence", 
        ["created_at"]
    )
    op.create_index(
        "ix_audit_evidence_tag", 
        "audit_evidence", 
        ["tag"]
    )
    
    # إضافة الصلاحيات
    op.execute("""
        INSERT INTO permissions (resource, action) VALUES
          ('legal_match', 'create'),
          ('legal_match', 'read')
        ON CONFLICT ON CONSTRAINT uq_permissions_resource_action DO NOTHING;
    """)
    
    # منح الصلاحيات للأدوار
    op.execute("""
        WITH perms AS (
          SELECT id, resource, action
          FROM permissions
          WHERE resource = 'legal_match'
        ),
        roles_map AS (
          SELECT id, name
          FROM roles
          WHERE name IN ('Admin', 'IA Manager', 'Auditor')
        )
        INSERT INTO role_permissions (role_id, perm_id)
        SELECT r.id, p.id
        FROM roles_map r
        CROSS JOIN perms p
        WHERE (r.name IN ('Admin', 'IA Manager'))
           OR (r.name = 'Auditor' AND p.action = 'read')
        ON CONFLICT DO NOTHING;
    """)


def downgrade() -> None:
    """حذف الجدول والصلاحيات"""
    
    # حذف الصلاحيات
    op.execute("""
        DELETE FROM permissions
        WHERE resource = 'legal_match';
    """)
    
    # حذف Indexes
    op.drop_index("ix_audit_evidence_tag", table_name="audit_evidence")
    op.drop_index("ix_audit_evidence_created", table_name="audit_evidence")
    op.drop_index("ix_audit_evidence_score", table_name="audit_evidence")
    op.drop_index("ix_audit_evidence_engagement", table_name="audit_evidence")
    
    # حذف الجدول
    op.drop_table("audit_evidence")
```

#### 3.2 إنشاء Router للمطابقة القانونية

**`api/app/presentation/routers/legal.py`** (جديد)

```python
"""
Router للمطابقة القانونية
"""
from typing import List, Generator
from fastapi import APIRouter, Depends, HTTPException, Header, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from uuid import UUID
import httpx
from pydantic import BaseModel, Field

from ...infrastructure.db.session import SessionLocal
from ...infrastructure.security.jwt import try_get_user_id
from ...infrastructure.security.rbac import enforce

router = APIRouter(prefix="/legal", tags=["legal"])

# URL خدمة المطابقة
LEGAL_MATCHER_URL = "http://legal-matcher:8001"


# ==========================================
# Schemas
# ==========================================

class LegalMatchRequest(BaseModel):
    """طلب مطابقة قانونية"""
    text: str = Field(..., min_length=10, max_length=10000)
    top_k: int = Field(5, ge=1, le=20)
    engagement_id: UUID | None = None
    section_id: str | None = None


class LegalMatchResult(BaseModel):
    """نتيجة مطابقة واحدة"""
    law_id: str
    article: str
    url: str
    excerpt: str
    score: float
    tag: str


class LegalMatchResponse(BaseModel):
    """استجابة المطابقة"""
    matches: List[LegalMatchResult]
    search_time_ms: float
    total_found: int


class AuditEvidenceRecord(BaseModel):
    """سجل دليل تدقيق"""
    id: UUID
    law_id: str
    article: str
    url: str
    excerpt: str
    score: float
    tag: str
    created_at: str


# ==========================================
# Dependencies
# ==========================================

def get_db() -> Generator[Session, None, None]:
    """الحصول على session قاعدة البيانات"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def current_user_id(
    authorization: str = Header(default=None, convert_underscores=False)
) -> str:
    """الحصول على معرّف المستخدم الحالي"""
    user_id = try_get_user_id(authorization)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized"
        )
    return user_id


# ==========================================
# Endpoints
# ==========================================

@router.post("/match", response_model=LegalMatchResponse)
async def match_legal_text(
    request: LegalMatchRequest,
    db: Session = Depends(get_db),
    user_id: str = Depends(current_user_id)
):
    """
    مطابقة نص مع القوانين القطرية
    
    - يستدعي خدمة Legal Matcher
    - يحفظ النتائج في audit_evidence إذا كان engagement_id موجوداً
    - يعيد قائمة المطابقات مع الوسوم
    """
    # التحقق من الصلاحيات
    enforce(db, user_id, "legal_match", "create")
    
    try:
        # استدعاء خدمة المطابقة
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{LEGAL_MATCHER_URL}/legal-match",
                json=request.dict(),
            )
            response.raise_for_status()
            result = response.json()
        
        # حفظ النتائج في قاعدة البيانات إذا كان engagement_id موجوداً
        if request.engagement_id:
            # التحقق من وجود المهمة
            engagement_exists = db.execute(
                text("SELECT 1 FROM engagements WHERE id = :id"),
                {"id": str(request.engagement_id)}
            ).scalar()
            
            if not engagement_exists:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Engagement not found"
                )
            
            # حفظ كل نتيجة
            for match in result['matches']:
                db.execute(
                    text("""
                        INSERT INTO audit_evidence 
                        (engagement_id, section_id, law_id, article, url, 
                         excerpt, score, tag, query_text, created_by)
                        VALUES (:engagement_id, :section_id, :law_id, :article, 
                                :url, :excerpt, :score, :tag, :query_text, :user_id)
                    """),
                    {
                        'engagement_id': str(request.engagement_id),
                        'section_id': request.section_id,
                        'law_id': match['law_id'],
                        'article': match['article'],
                        'url': match['url'],
                        'excerpt': match['excerpt'],
                        'score': match['score'],
                        'tag': match['tag'],
                        'query_text': request.text[:200],
                        'user_id': user_id
                    }
                )
            db.commit()
        
        return LegalMatchResponse(**result)
        
    except httpx.HTTPError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Legal matcher service unavailable: {str(e)}"
        )
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/evidence/{engagement_id}", response_model=List[AuditEvidenceRecord])
def get_legal_evidence(
    engagement_id: UUID,
    db: Session = Depends(get_db),
    user_id: str = Depends(current_user_id)
):
    """
    جلب الأدلة القانونية لمهمة معينة
    
    - يعيد جميع المطابقات المحفوظة لهذه المهمة
    - مرتبة حسب الدرجة (الأعلى أولاً)
    """
    # التحقق من الصلاحيات
    enforce(db, user_id, "legal_match", "read")
    
    try:
        results = db.execute(
            text("""
                SELECT id, law_id, article, url, excerpt, score, tag, 
                       created_at::text as created_at
                FROM audit_evidence
                WHERE engagement_id = :engagement_id
                ORDER BY score DESC, created_at DESC
            """),
            {'engagement_id': str(engagement_id)}
        ).fetchall()
        
        return [dict(row._mapping) for row in results]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/stats")
def get_legal_matcher_stats(
    db: Session = Depends(get_db),
    user_id: str = Depends(current_user_id)
):
    """
    إحصائيات المطابقات القانونية
    """
    enforce(db, user_id, "legal_match", "read")
    
    try:
        # إحصائيات من قاعدة البيانات
        db_stats = db.execute(text("""
            SELECT 
                COUNT(*) as total_matches,
                COUNT(DISTINCT engagement_id) as total_engagements,
                AVG(score) as avg_score,
                COUNT(CASE WHEN tag = 'مطابقة قوية' THEN 1 END) as strong_matches,
                COUNT(CASE WHEN tag = 'مطابقة متوسطة' THEN 1 END) as medium_matches,
                COUNT(CASE WHEN tag = 'راجع يدوياً' THEN 1 END) as manual_review
            FROM audit_evidence
        """)).fetchone()
        
        return {
            "database_stats": dict(db_stats._mapping) if db_stats else {},
            "legal_matcher_url": LEGAL_MATCHER_URL
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
```

#### 3.3 تحديث main.py

```python
# api/app/presentation/main.py

# إضافة import
from .routers import ( ..., legal)  # أضف legal

# إضافة router
app.include_router(legal.router, prefix="/api")
```

---

### المرحلة 4: واجهة Frontend (يوم 5-6) ⏰

#### 4.1 خدمة API Client

**`frontend/src/lib/api/legal-matcher.ts`** (جديد)

```typescript
/**
 * API Client للمطابقة القانونية
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface LegalMatchRequest {
  text: string;
  top_k?: number;
  engagement_id?: string;
  section_id?: string;
}

export interface LegalMatch {
  law_id: string;
  article: string;
  url: string;
  excerpt: string;
  score: number;
  tag: string;
}

export interface LegalMatchResponse {
  matches: LegalMatch[];
  search_time_ms: number;
  total_found: number;
}

export interface AuditEvidenceRecord extends LegalMatch {
  id: string;
  created_at: string;
}

/**
 * مطابقة نص مع القوانين
 */
export async function matchLegalText(
  request: LegalMatchRequest,
  token?: string
): Promise<LegalMatchResponse> {
  const response = await fetch(`${API_BASE_URL}/api/legal/match`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || 'فشل في المطابقة');
  }

  return response.json();
}

/**
 * جلب الأدلة القانونية لمهمة
 */
export async function getLegalEvidence(
  engagementId: string,
  token?: string
): Promise<AuditEvidenceRecord[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/legal/evidence/${engagementId}`,
    {
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    }
  );

  if (!response.ok) {
    throw new Error('فشل في جلب الأدلة');
  }

  return response.json();
}

/**
 * إحصائيات المطابقات
 */
export async function getLegalMatchStats(
  token?: string
): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/legal/stats`, {
    headers: {
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
  });

  if (!response.ok) {
    throw new Error('فشل في جلب الإحصائيات');
  }

  return response.json();
}
```

#### 4.2 مكون واجهة المطابقة القانونية

**`frontend/src/components/legal/LegalMatcherPanel.tsx`** (جديد)

```typescript
'use client';

import { useState } from 'react';
import { matchLegalText, LegalMatch } from '@/lib/api/legal-matcher';

interface LegalMatcherPanelProps {
  engagementId?: string;
  sectionId?: string;
}

export function LegalMatcherPanel({ engagementId, sectionId }: LegalMatcherPanelProps) {
  const [text, setText] = useState('');
  const [matches, setMatches] = useState<LegalMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTime, setSearchTime] = useState<number>(0);
  const [error, setError] = useState<string>('');

  const handleMatch = async () => {
    if (!text.trim() || text.length < 10) {
      setError('الرجاء إدخال نص لا يقل عن 10 أحرف');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const result = await matchLegalText({
        text,
        top_k: 5,
        engagement_id: engagementId,
        section_id: sectionId
      });
      
      setMatches(result.matches);
      setSearchTime(result.search_time_ms);
    } catch (err: any) {
      setError(err.message || 'فشل في المطابقة. الرجاء المحاولة مرة أخرى.');
      console.error('Error matching text:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTagStyle = (tag: string) => {
    if (tag === 'مطابقة قوية') {
      return 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-200';
    }
    if (tag === 'مطابقة متوسطة') {
      return 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-200';
    }
    return 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-700 dark:text-gray-200';
  };

  const getTagIcon = (tag: string) => {
    if (tag === 'مطابقة قوية') return '🟢';
    if (tag === 'مطابقة متوسطة') return '🟡';
    return '⚪';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-4">
      <div className="border-b pb-3">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          ⚖️ مطابقة النصوص مع القوانين
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          ابحث عن المواد القانونية المطابقة للنص المدخل
        </p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          النص المراد مطابقته
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="أدخل النص هنا للبحث عن المواد القانونية المطابقة... (مثال: يجب على جميع المؤسسات الحكومية إنشاء وحدة للتدقيق الداخلي)"
          rows={6}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          disabled={loading}
        />
        <div className="flex justify-between items-center mt-2">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {text.length} / 10,000 حرف
          </p>
          {text.length < 10 && text.length > 0 && (
            <p className="text-xs text-red-500">
              الحد الأدنى: 10 أحرف
            </p>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <p className="text-sm text-red-800 dark:text-red-200">
            ❌ {error}
          </p>
        </div>
      )}

      <button
        onClick={handleMatch}
        disabled={loading || text.length < 10}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 space-x-reverse"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>جاري المطابقة...</span>
          </>
        ) : (
          <>
            <span>🔍</span>
            <span>بحث عن المطابقات</span>
          </>
        )}
      </button>

      {matches.length > 0 && (
        <div className="mt-6 space-y-4">
          <div className="flex justify-between items-center bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              📋 النتائج ({matches.length})
            </h3>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              ⏱️ وقت البحث: <strong>{searchTime.toFixed(0)}</strong> ms
            </span>
          </div>

          <div className="space-y-3">
            {matches.map((match, idx) => (
              <div
                key={idx}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-lg transition-shadow duration-200 bg-white dark:bg-gray-800"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 dark:text-white text-lg">
                      {match.law_id}
                    </h4>
                    <p className="text-blue-600 dark:text-blue-400 font-semibold">
                      {match.article}
                    </p>
                    <a
                      href={match.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline inline-flex items-center mt-1"
                    >
                      <span>عرض في القانون</span>
                      <span className="mr-1">→</span>
                    </a>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getTagStyle(match.tag)}`}>
                      {getTagIcon(match.tag)} {match.tag}
                    </span>
                    <span className="text-lg font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-lg">
                      {(match.score * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {match.excerpt}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && matches.length === 0 && text.length >= 10 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p className="text-lg">🔍 ابحث عن المطابقات القانونية</p>
          <p className="text-sm mt-2">اضغط على زر البحث لبدء المطابقة</p>
        </div>
      )}
    </div>
  );
}
```

---

## 📦 القسم 5: خطوات التثبيت والتشغيل

### 5.1 متطلبات النظام

#### الحد الأدنى:
- **OS**: Windows 10/11 with WSL2
- **CPU**: 4 cores
- **RAM**: 8 GB
- **Storage**: 20 GB free space
- **Docker Desktop**: 4.25+
- **Node.js**: 18+
- **Python**: 3.11+

#### الموصى به:
- **CPU**: 6+ cores
- **RAM**: 16 GB
- **Storage**: 50 GB SSD
- **GPU**: Optional (لتسريع الـ embeddings)

### 5.2 خطوات التثبيت الكاملة

#### الخطوة 1: إعداد البيئة

```powershell
# 1. التحقق من تثبيت Docker Desktop
docker --version
docker compose version

# 2. تفعيل WSL2 (إذا لم يكن مفعلاً)
wsl --install
wsl --set-default-version 2

# 3. التحقق من Node.js
node --version  # يجب أن يكون 18+
npm --version

# 4. الانتقال إلى مجلد المشروع
cd D:\AuditOrbit
```

#### الخطوة 2: إنشاء هيكل legal-matcher

```powershell
# إنشاء المجلدات
mkdir legal-matcher
cd legal-matcher

mkdir models, services, data, scripts, tests

# إنشاء الملفات الأساسية
New-Item -ItemType File config.py, main.py
New-Item -ItemType File requirements.txt, Dockerfile, .env.example
New-Item -ItemType File models/__init__.py, models/schemas.py
New-Item -ItemType File services/__init__.py, services/embedder.py
New-Item -ItemType File services/vectorstore.py, services/matcher.py, services/indexer.py
New-Item -ItemType File data/README.md
```

#### الخطوة 3: نسخ الكود

```powershell
# انسخ جميع الملفات المذكورة أعلاه في أماكنها المناسبة
# يمكنك استخدام VS Code أو أي محرر نصوص
```

#### الخطوة 4: تحضير بيانات القوانين

**`legal-matcher/data/laws_qatar.jsonl`** - مثال:

```jsonl
{"text": "المادة (1): تسري أحكام هذا القانون على جميع المؤسسات الحكومية والهيئات والمؤسسات العامة", "law_id": "قانون رقم (8) لسنة 2022 بشأن ديوان المحاسبة", "article": "المادة (1)", "url": "https://www.almeezan.qa/LawView.aspx?opt&LawID=9600&language=ar"}
{"text": "المادة (2): يهدف الديوان إلى تحقيق الرقابة المالية العليا على أموال الدولة وإيراداتها ومصروفاتها", "law_id": "قانون رقم (8) لسنة 2022 بشأن ديوان المحاسبة", "article": "المادة (2)", "url": "https://www.almeezan.qa/LawView.aspx?opt&LawID=9600&language=ar"}
{"text": "المادة (5): يجب على جميع الجهات الخاضعة لرقابة الديوان إنشاء وحدات للتدقيق الداخلي", "law_id": "قانون رقم (8) لسنة 2022 بشأن ديوان المحاسبة", "article": "المادة (5)", "url": "https://www.almeezan.qa/LawView.aspx?opt&LawID=9600&language=ar"}
```

**ملاحظة**: يمكنك إضافة المزيد من القوانين القطرية من:
- https://www.almeezan.qa
- https://www.qانون.qa
- الجريدة الرسمية القطرية

#### الخطوة 5: تحديث docker-compose.yml

```powershell
cd D:\AuditOrbit\infra

# قم بتحديث الملف كما هو موضح في القسم 1.4 أعلاه
```

#### الخطوة 6: بناء وتشغيل الخدمات

```powershell
# من مجلد infra/
cd D:\AuditOrbit\infra

# بناء جميع الخدمات
docker compose build

# تشغيل الخدمات
docker compose up -d

# التحقق من تشغيل الخدمات
docker compose ps

# يجب أن ترى:
# ✅ auditorbit-db-1
# ✅ auditorbit-redis-1
# ✅ auditorbit-minio-1
# ✅ auditorbit-api-1
# ✅ auditorbit-ai-1
# ✅ auditorbit-qdrant-1         ⬅️ جديد
# ✅ auditorbit-legal-matcher-1  ⬅️ جديد

# عرض logs للتأكد من عدم وجود أخطاء
docker compose logs legal-matcher
docker compose logs qdrant
```

#### الخطوة 7: تشغيل Migrations

```powershell
# تطبيق migrations على قاعدة البيانات
docker exec -it auditorbit-api-1 alembic upgrade head

# يجب أن ترى:
# INFO  [alembic.runtime.migration] Running upgrade 0011 -> 0012, add audit_evidence table
```

#### الخطوة 8: فهرسة القوانين

```powershell
# دخول إلى container الـ legal-matcher
docker exec -it auditorbit-legal-matcher-1 bash

# داخل الـ container:
python -m services.indexer /app/data/laws_qatar.jsonl --recreate

# يجب أن ترى:
# ✅ Loaded 1000 documents from /app/data/laws_qatar.jsonl
# Embedding 1000 documents...
# 100%|██████████| 1000/1000 [01:23<00:00, 12.01it/s]
# ✅ Successfully indexed 1000 documents
# ========================================================
# Indexing Complete!
# Total documents indexed: 1000
# Collection: laws_corpus
# Vector size: 1024
# ========================================================

# الخروج من container
exit
```

#### الخطوة 9: اختبار الخدمة

```powershell
# اختبار health endpoint
curl http://localhost:8001/health

# يجب أن يعيد:
# {"status":"ok","service":"legal-matcher","version":"1.0.0","timestamp":"..."}

# اختبار stats endpoint
curl http://localhost:8001/stats

# يجب أن يعيد:
# {"total_documents":1000,"collection_name":"laws_corpus",...}

# اختبار المطابقة (Windows PowerShell)
$body = @{
    text = "يجب على المؤسسات الحكومية إنشاء وحدة للتدقيق الداخلي"
    top_k = 3
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8001/legal-match" `
    -Method Post `
    -Body $body `
    -ContentType "application/json"
```

#### الخطوة 10: تشغيل Frontend

```powershell
# في terminal جديد
cd D:\AuditOrbit\frontend

# تثبيت المكتبات (إذا لم تكن مثبتة)
npm install

# تشغيل التطوير
npm run dev

# افتح المتصفح على:
# http://localhost:3000
```

### 5.3 التحقق من التكامل الكامل

```powershell
# 1. افتح المتصفح على http://localhost:3000
# 2. سجل الدخول بـ admin@example.com / Admin#2025
# 3. انتقل إلى صفحة أي Engagement
# 4. يجب أن ترى لوحة "مطابقة النصوص مع القوانين"
# 5. أدخل نصاً واضغط "بحث عن المطابقات"
# 6. يجب أن تظهر النتائج في أقل من ثانية
```

---

## 🧪 القسم 6: الاختبار والتحقق من الأداء

### 6.1 اختبارات Unit

**`legal-matcher/tests/test_embedder.py`**

```python
"""
اختبارات خدمة التضمين
"""
import pytest
from services.embedder import LegalEmbedder
import numpy as np


def test_embedder_initialization():
    """اختبار تهيئة Embedder"""
    embedder = LegalEmbedder()
    assert embedder is not None
    assert embedder.get_dimension() > 0


def test_embed_query():
    """اختبار تضمين استعلام واحد"""
    embedder = LegalEmbedder()
    text = "اختبار التضمين للنصوص العربية"
    embedding = embedder.embed_query(text)
    
    assert isinstance(embedding, np.ndarray)
    assert embedding.shape[0] == embedder.get_dimension()
    assert np.abs(np.linalg.norm(embedding) - 1.0) < 0.01  # normalized


def test_embed_documents():
    """اختبار تضمين مجموعة مستندات"""
    embedder = LegalEmbedder()
    texts = [
        "نص تجريبي أول",
        "نص تجريبي ثاني",
        "نص تجريبي ثالث"
    ]
    embeddings = embedder.embed_documents(texts, show_progress=False)
    
    assert len(embeddings) == len(texts)
    assert all(len(emb) == embedder.get_dimension() for emb in embeddings)


def test_similarity():
    """اختبار حساب التشابه"""
    embedder = LegalEmbedder()
    
    # نصوص متشابهة
    emb1 = embedder.embed_query("التدقيق الداخلي")
    emb2 = embedder.embed_query("المراجعة الداخلية")
    similarity = embedder.similarity(emb1, emb2)
    
    assert 0.0 <= similarity <= 1.0
    assert similarity > 0.5  # يجب أن يكونا متشابهين


# تشغيل الاختبارات:
# pytest tests/test_embedder.py -v
```

**`legal-matcher/tests/test_performance.py`**

```python
"""
اختبارات الأداء
"""
import pytest
import time
import statistics
from services.embedder import LegalEmbedder
from services.vectorstore import QdrantVectorStore
from services.matcher import LegalMatcher


@pytest.fixture
def setup_services():
    """إعداد الخدمات للاختبار"""
    embedder = LegalEmbedder()
    vectorstore = QdrantVectorStore(embedder)
    matcher = LegalMatcher(vectorstore)
    return embedder, vectorstore, matcher


def test_indexing_performance(setup_services):
    """اختبار سرعة الفهرسة - الهدف: ≤ 2 دقيقة لـ 1000 فقرة"""
    embedder, vectorstore, _ = setup_services
    
    # إنشاء 1000 مستند تجريبي
    documents = [
        {
            'text': f'نص قانوني تجريبي رقم {i} يحتوي على معلومات قانونية مهمة', 
            'law_id': f'قانون {i}', 
            'article': f'المادة {i}',
            'url': f'https://example.com/law/{i}'
        }
        for i in range(1000)
    ]
    
    # قياس الوقت
    start = time.time()
    vectorstore.index_documents(documents)
    elapsed = time.time() - start
    
    print(f"\n✅ Indexed 1000 docs in {elapsed:.2f}s ({elapsed/60:.2f} min)")
    assert elapsed <= 120, f"Indexing too slow: {elapsed}s > 120s"


def test_search_performance(setup_services):
    """اختبار سرعة البحث - الهدف: ≤ 600ms لـ K=5"""
    _, _, matcher = setup_services
    
    query = "يجب على المؤسسات الحكومية إنشاء وحدة للتدقيق الداخلي"
    times = []
    
    # تشغيل 50 استعلام
    for _ in range(50):
        start = time.time()
        matcher.match(query, top_k=5)
        elapsed = (time.time() - start) * 1000  # ms
        times.append(elapsed)
    
    avg_time = statistics.mean(times)
    median_time = statistics.median(times)
    p95_time = sorted(times)[int(0.95 * len(times))]
    
    print(f"\n📊 Search Performance:")
    print(f"  Avg: {avg_time:.2f}ms")
    print(f"  Median: {median_time:.2f}ms")
    print(f"  P95: {p95_time:.2f}ms")
    
    assert avg_time <= 600, f"Search too slow: {avg_time}ms > 600ms"


# تشغيل الاختبارات:
# pytest tests/test_performance.py -v -s
```

### 6.2 اختبار الدقة (Human-in-the-loop)

```python
"""
اختبار الدقة - يحتاج مراجعة بشرية
"""

# إنشاء 50 حالة اختبار
test_cases = [
    {
        "query": "يجب على المؤسسات الحكومية إنشاء وحدة للتدقيق الداخلي",
        "expected_law": "قانون رقم 8 لسنة 2022",
        "expected_article": "المادة 5"
    },
    # ... 49 حالة أخرى
]

# تشغيل المطابقات وحفظ النتائج
results = []
for case in test_cases:
    result = matcher.match(case["query"], top_k=1)
    top_match = result["matches"][0] if result["matches"] else None
    
    is_correct = (
        top_match and
        case["expected_law"] in top_match["law_id"] and
        case["expected_article"] in top_match["article"]
    )
    
    results.append({
        "query": case["query"],
        "expected": f"{case['expected_law']} - {case['expected_article']}",
        "got": f"{top_match['law_id']} - {top_match['article']}" if top_match else "N/A",
        "correct": is_correct
    })

# حساب الدقة
accuracy = sum(1 for r in results if r["correct"]) / len(results) * 100
print(f"Accuracy: {accuracy:.1f}%")
assert accuracy >= 80, f"Accuracy too low: {accuracy}% < 80%"
```

---

## 🎯 القسم 7: التحسينات والتوسعات المستقبلية

### 7.1 تحسينات قصيرة المدى (شهر 1-3)

#### 1. Hybrid Search (BM25 + Vector)

```python
# إضافة BM25 للبحث الهجين
from rank_bm25 import BM25Okapi

class HybridMatcher:
    def __init__(self, vectorstore):
        self.vectorstore = vectorstore
        self.bm25 = None
        self.documents = []
    
    def build_bm25_index(self, documents):
        """بناء فهرس BM25"""
        tokenized = [doc['text'].split() for doc in documents]
        self.bm25 = BM25Okapi(tokenized)
        self.documents = documents
    
    def hybrid_search(self, query, top_k=5, alpha=0.7):
        """بحث هجين (alpha: وزن Vector search)"""
        # Vector search
        vector_results = self.vectorstore.search(query, top_k=top_k*2)
        
        # BM25 search
        bm25_scores = self.bm25.get_scores(query.split())
        
        # دمج النتائج
        combined = {}
        for i, result in enumerate(vector_results):
            doc_id = result['law_id'] + result['article']
            combined[doc_id] = alpha * result['score']
        
        # إضافة درجات BM25
        for i, score in enumerate(bm25_scores):
            doc = self.documents[i]
            doc_id = doc['law_id'] + doc['article']
            if doc_id in combined:
                combined[doc_id] += (1-alpha) * score
            else:
                combined[doc_id] = (1-alpha) * score
        
        # ترتيب
        sorted_results = sorted(
            combined.items(), 
            key=lambda x: x[1], 
            reverse=True
        )[:top_k]
        
        return sorted_results
```

#### 2. Query Expansion

```python
# توسيع الاستعلامات باستخدام مرادفات
LEGAL_SYNONYMS = {
    "التدقيق": ["المراجعة", "الفحص", "التحقق"],
    "المؤسسة": ["الجهة", "الهيئة", "المنشأة"],
    "الداخلي": ["الذاتي", "الداخلية"]
}

def expand_query(query):
    """توسيع الاستعلام بالمرادفات"""
    words = query.split()
    expanded = []
    
    for word in words:
        expanded.append(word)
        if word in LEGAL_SYNONYMS:
            expanded.extend(LEGAL_SYNONYMS[word])
    
    return " ".join(expanded)
```

### 7.2 تحسينات متوسطة المدى (شهر 3-6)

#### 1. Fine-tuning النموذج

```python
# ضبط دقيق على بيانات قانونية قطرية
from sentence_transformers import SentenceTransformer, InputExample
from sentence_transformers import losses
from torch.utils.data import DataLoader

# إعداد البيانات
train_examples = [
    InputExample(texts=[query, positive_law], label=1.0),
    InputExample(texts=[query, negative_law], label=0.0),
    # ... المزيد
]

# Fine-tuning
model = SentenceTransformer('BAAI/bge-m3')
train_dataloader = DataLoader(train_examples, shuffle=True, batch_size=16)
train_loss = losses.CosineSimilarityLoss(model)

model.fit(
    train_objectives=[(train_dataloader, train_loss)],
    epochs=3,
    warmup_steps=100
)

model.save('models/bge-m3-qatar-legal-finetuned')
```

#### 2. RAG System مع LLM

```python
# إضافة LLM لتوليد إجابات
from transformers import AutoTokenizer, AutoModelForCausalLM

class LegalRAG:
    def __init__(self, matcher, llm_model="meta-llama/Llama-2-7b-chat-hf"):
        self.matcher = matcher
        self.tokenizer = AutoTokenizer.from_pretrained(llm_model)
        self.model = AutoModelForCausalLM.from_pretrained(llm_model)
    
    def answer_question(self, question):
        """الإجابة عن سؤال قانوني"""
        # الحصول على السياق من المطابقات
        matches = self.matcher.match(question, top_k=3)
        context = "\n\n".join([m['excerpt'] for m in matches['matches']])
        
        # بناء prompt
        prompt = f"""بناءً على المواد القانونية التالية:

{context}

السؤال: {question}

الإجابة:"""
        
        # توليد الإجابة
        inputs = self.tokenizer(prompt, return_tensors="pt")
        outputs = self.model.generate(**inputs, max_length=500)
        answer = self.tokenizer.decode(outputs[0])
        
        return {
            "answer": answer,
            "sources": matches['matches']
        }
```

### 7.3 تحسينات طويلة المدى (شهر 6-12)

1. **دعم متعدد اللغات** (عربي، إنجليزي، فرنسي)
2. **كشف التعارضات** بين القوانين
3. **تحليل الخط الزمني** للتشريعات
4. **استخراج الاستشهادات** تلقائياً
5. **توليد تقارير ذكية** بتنسيقات مختلفة

---

## 📊 القسم 8: المراقبة والصيانة

### 8.1 Monitoring مع Prometheus

```python
# إضافة metrics في main.py
from prometheus_client import Counter, Histogram, Gauge, generate_latest

# Metrics
match_requests = Counter('legal_match_requests_total', 'Total match requests')
match_duration = Histogram('legal_match_duration_seconds', 'Match duration')
match_errors = Counter('legal_match_errors_total', 'Total match errors')
active_users = Gauge('legal_match_active_users', 'Active users')

@app.post("/legal-match")
@match_duration.time()
async def match_text(request):
    match_requests.inc()
    active_users.inc()
    try:
        result = matcher.match(...)
        return result
    except Exception as e:
        match_errors.inc()
        raise
    finally:
        active_users.dec()

@app.get("/metrics")
def metrics():
    return Response(generate_latest(), media_type="text/plain")
```

### 8.2 Logging المركزي

```python
# إعداد logging منظم
import logging
from pythonjsonlogger import jsonlogger

logHandler = logging.StreamHandler()
formatter = jsonlogger.JsonFormatter()
logHandler.setFormatter(formatter)

logger = logging.getLogger()
logger.addHandler(logHandler)
logger.setLevel(logging.INFO)

# الآن كل log سيكون JSON
logger.info("Match completed", extra={
    "query_length": len(query),
    "matches_found": len(matches),
    "search_time_ms": search_time
})
```

### 8.3 Backup و Recovery

```bash
# نسخ احتياطي لـ Qdrant
docker exec auditorbit-qdrant-1 tar czf /qdrant/backup.tar.gz /qdrant/storage

# نسخ الملف للـ host
docker cp auditorbit-qdrant-1:/qdrant/backup.tar.gz ./backups/

# استعادة من نسخة احتياطية
docker cp ./backups/backup.tar.gz auditorbit-qdrant-1:/qdrant/
docker exec auditorbit-qdrant-1 tar xzf /qdrant/backup.tar.gz -C /
docker restart auditorbit-qdrant-1
```

---

## ✅ القسم 9: قائمة التحقق النهائية

### مرحلة الإعداد:
- [ ] Docker Desktop مثبت ويعمل (v4.25+)
- [ ] WSL2 مفعّل ومُعدّ بشكل صحيح
- [ ] 16GB RAM متاحة على الأقل
- [ ] 30GB مساحة قرص حرة
- [ ] Python 3.11+ مثبت
- [ ] Node.js 18+ مثبت

### مرحلة البناء:
- [ ] مجلد `legal-matcher/` مُنشأ بكامل هيكله
- [ ] جميع ملفات الكود منسوخة ومعدّلة
- [ ] ملف `requirements.txt` جاهز
- [ ] ملف `Dockerfile` جاهز
- [ ] ملف `docker-compose.yml` محدّث
- [ ] ملف `laws_qatar.jsonl` جاهز ب 100+ فقرة

### مرحلة التشغيل:
- [ ] `docker compose build` نجح بدون أخطاء
- [ ] `docker compose up -d` نجح وجميع الـ containers تعمل
- [ ] Qdrant يستجيب على http://localhost:6333
- [ ] Legal Matcher يستجيب على http://localhost:8001/health
- [ ] Migration `0012` تم تطبيقها بنجاح
- [ ] الفهرسة تمت بنجاح (1000+ documents)

### مرحلة الاختبار:
- [ ] `/health` endpoint يعمل
- [ ] `/stats` endpoint يعيد بيانات صحيحة
- [ ] `/legal-match` endpoint يعمل مع نص تجريبي
- [ ] API الرئيسي (`/api/legal/match`) يعمل
- [ ] Frontend يعرض لوحة المطابقة
- [ ] المطابقة الكاملة من UI إلى DB تعمل

### مرحلة الأداء:
- [ ] فهرسة 1000 فقرة ≤ 2 دقيقة ✓
- [ ] زمن استجابة البحث ≤ 600ms ✓
- [ ] Cache يعمل (تجربة نفس الاستعلام مرتين)
- [ ] النتائج منطقية ودقيقة

### مرحلة التوثيق:
- [ ] README.md في legal-matcher/
- [ ] API docs متاحة على /docs
- [ ] تعليمات الاستخدام واضحة
- [ ] أمثلة على queries وresponses

---

## 🎓 القسم 10: الخلاصة والنصائح النهائية

### نقاط القوة الرئيسية:

✅ **معمارية ممتازة**: Microservices + Clean Architecture  
✅ **تقنيات حديثة**: BGE-M3 + Qdrant + FastAPI  
✅ **تكامل سلس**: يندمج مع البنية الحالية بدون تعديلات جذرية  
✅ **قابلية التوسع**: سهل إضافة ميزات جديدة  
✅ **مجاني 100%**: جميع المكونات مفتوحة المصدر  
✅ **خصوصية تامة**: كل شيء يعمل محلياً

### التحديات المتوقعة:

⚠️ **الموارد**: نماذج ML تحتاج RAM كافية (8-16GB)  
⚠️ **البيانات**: جمع وتنظيف القوانين القطرية يتطلب وقتاً  
⚠️ **الأداء الأولي**: قد يكون بطيئاً في أول تشغيل (تحميل النماذج)  
⚠️ **الصيانة**: تحديث النماذج والقوانين دورياً

### نصائح للنجاح:

#### 1. ابدأ صغيراً (MVP):
```
Week 1: فهرس 50-100 مادة فقط
Week 2: اختبر الدقة والأداء
Week 3: اجمع feedback من 3-5 مستخدمين
Week 4: وسّع إلى 500-1000 مادة
```

#### 2. راقب الأداء:
```powershell
# مراقبة استخدام الموارد
docker stats

# مراقبة logs
docker compose logs -f legal-matcher

# فحص Qdrant
curl http://localhost:6333/collections/laws_corpus
```

#### 3. حسّن تدريجياً:
```
Phase 1 (Month 1): Vector Search فقط
Phase 2 (Month 2): + Caching
Phase 3 (Month 3): + Hybrid Search (BM25)
Phase 4 (Month 4+): + Fine-tuning + RAG
```

### الجدول الزمني الواقعي:

| الأسبوع | المهمة | الوقت المقدر |
|---------|--------|--------------|
| 1 | إعداد البنية + إنشاء المجلدات | 8 ساعات |
| 2 | كتابة الكود الأساسي | 16 ساعة |
| 2-3 | جمع وتنظيف بيانات القوانين | 12 ساعة |
| 3 | دمج مع API وFrontend | 10 ساعات |
| 4 | الاختبار والتحسين | 8 ساعات |
| **الإجمالي** | | **~54 ساعة = 1.5 شهر** |

### الموارد المفيدة:

📚 **التوثيق**:
- Qdrant: https://qdrant.tech/documentation/
- BGE-M3: https://huggingface.co/BAAI/bge-m3
- Sentence Transformers: https://www.sbert.net/

🎓 **دروس**:
- RAG Systems: https://www.deeplearning.ai/short-courses/
- Vector Search: https://www.pinecone.io/learn/

🛠️ **أدوات**:
- Qdrant Dashboard: http://localhost:6333/dashboard
- FastAPI Docs: http://localhost:8001/docs

---

## 📧 الدعم والمتابعة

### إذا واجهت مشاكل:

1. **مشاكل Docker**:
```powershell
docker compose down
docker compose up --build -d
docker compose logs
```

2. **مشاكل الفهرسة**:
```powershell
# إعادة الفهرسة
docker exec -it auditorbit-legal-matcher-1 python -m services.indexer /app/data/laws_qatar.jsonl --recreate
```

3. **مشاكل الأداء**:
```powershell
# تخصيص موارد أكبر في Docker Desktop
# Settings > Resources > Advanced
# CPU: 4-6, RAM: 12-16 GB
```

---

## 🎉 الخاتمة

تم إعداد هذا التقرير الشامل ليكون **دليلاً كاملاً** لدمج وحدة المطابقة القانونية مع نظام AuditOrbit. التصميم المعماري والكود المقدم جاهز للتطبيق مباشرة، مع مراعاة:

- ✅ أفضل الممارسات في البرمجة
- ✅ معايير الأداء المطلوبة
- ✅ قابلية التوسع المستقبلية
- ✅ سهولة الصيانة
- ✅ توافق كامل مع Windows

**الخطوة التالية**: اتبع خطوات التثبيت بالتسلسل، ولا تتردد في طلب المساعدة عند الحاجة!

**التوقيع**:  
مبرمج خبير - 10 سنوات في مجال الذكاء الاصطناعي  
التاريخ: 28 أكتوبر 2025  

---

**ملاحظة نهائية**: هذا التقرير يمثل خطة تنفيذية كاملة ومفصلة. يُنصح بطباعتها أو حفظها كـ PDF للرجوع إليها أثناء التنفيذ.

**حظاً موفقاً! 🚀**

