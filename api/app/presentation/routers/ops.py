from __future__ import annotations

import asyncio
import json
import mimetypes
import os
from collections import deque
from datetime import datetime, timezone
from typing import Any, AsyncIterator, Iterable, Mapping, cast

import boto3
import redis
from botocore.exceptions import ClientError
from fastapi import APIRouter, Query, Request
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.routing import APIRoute
from rq import Queue
from rq.registry import FailedJobRegistry, FinishedJobRegistry, StartedJobRegistry
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError

from ...config.settings import settings as app_settings
from ...infrastructure.db.session import SessionLocal

# pyright: reportMissingTypeStubs=false, reportUnknownMemberType=false, reportUnknownVariableType=false, reportUnknownArgumentType=false

router = APIRouter()

_subscribers: list[asyncio.Queue[dict[str, Any]]] = []
_recent_logs: deque[dict[str, str]] = deque(maxlen=200)
_SETTINGS_TABLE_READY = False


def _get_redis_client(*, decode_responses: bool = True) -> redis.Redis:
    return redis.from_url(os.getenv("REDIS_URL", "redis://redis:6379/0"), decode_responses=decode_responses)


def _get_s3_client() -> Any:
    return cast(
        Any,
        boto3.client(
            "s3",
            endpoint_url=os.getenv("S3_ENDPOINT", "http://minio:9000"),
            aws_access_key_id=os.getenv("S3_ACCESS_KEY", "auditorbit"),
            aws_secret_access_key=os.getenv("S3_SECRET_KEY", "auditorbit123"),
        ),
    )


def _remember_log(level: str, message: str) -> None:
    _recent_logs.appendleft({
        "ts": datetime.now(timezone.utc).isoformat(),
        "level": level,
        "message": message,
    })


def _broadcast(event: dict[str, Any]) -> None:
    for queue in list(_subscribers):
        queue.put_nowait(event)


def _json_error(code: str, message: str, *, status_code: int = 400, details: Any | None = None) -> JSONResponse:
    payload: dict[str, Any] = {"error": {"code": code, "message": message}}
    if details is not None:
        payload["error"]["details"] = details
    return JSONResponse(status_code=status_code, content=payload)


def _now_utc() -> datetime:
    return datetime.now(timezone.utc)


def _client_error_details(exc: ClientError) -> dict[str, Any]:
    error = exc.response.get("Error", {}) if hasattr(exc, "response") else {}
    return {
        "code": error.get("Code"),
        "message": error.get("Message"),
    }


def _get_bucket_name() -> str:
    bucket = app_settings.S3_BUCKET or os.getenv("S3_BUCKET") or os.getenv("S3_BUCKET_NAME")
    if not bucket:
        raise RuntimeError("لم يتم ضبط اسم حاوية التخزين S3.")
    return bucket


def _signed_url_ttl() -> int:
    try:
        return int(os.getenv("STORAGE_SIGNED_URL_TTL", "3600"))
    except (TypeError, ValueError):  # pragma: no cover - defensive
        return 3600


def _sanitize_storage_key(raw: str) -> str:
    key = raw.strip().replace("\\", "/")
    key = key.lstrip("/")
    while "//" in key:
        key = key.replace("//", "/")
    parts = [part for part in key.split("/") if part]
    if not parts:
        raise ValueError("المسار مطلوب")
    if any(part in {"..", "."} for part in parts):
        raise ValueError("مسار غير مسموح به")
    return "/".join(parts) + ("/" if raw.endswith("/") and not parts[-1].endswith("/") else "")


def _ensure_settings_table() -> None:
    global _SETTINGS_TABLE_READY
    if _SETTINGS_TABLE_READY:
        return

    ddl = text(
        """
        CREATE TABLE IF NOT EXISTS ops_settings (
            key VARCHAR(255) PRIMARY KEY,
            value TEXT NOT NULL,
            group_name VARCHAR(128) NOT NULL DEFAULT 'general',
            description TEXT,
            is_secret BOOLEAN NOT NULL DEFAULT FALSE,
            default_value TEXT,
            updated_at TIMESTAMP NOT NULL,
            updated_by VARCHAR(255)
        )
        """
    )

    with SessionLocal() as session:
        session.execute(ddl)
        session.commit()

    _SETTINGS_TABLE_READY = True


def _row_to_setting(row: Mapping[str, Any]) -> dict[str, Any]:
    updated_at = row.get("updated_at")
    if isinstance(updated_at, datetime):
        updated_at_iso = updated_at.astimezone(timezone.utc).isoformat()
    elif isinstance(updated_at, str):
        updated_at_iso = updated_at
    else:
        updated_at_iso = None

    return {
        "key": row.get("key"),
        "value": row.get("value"),
        "group": row.get("group_name"),
        "description": row.get("description") or "",
        "isSecret": bool(row.get("is_secret")),
        "defaultValue": row.get("default_value"),
        "updatedAt": updated_at_iso,
        "updatedBy": row.get("updated_by"),
    }


def _human_size(value: int) -> str:
    units = ["B", "KB", "MB", "GB", "TB"]
    size = float(value)
    for unit in units:
        if size < 1024 or unit == units[-1]:
            return f"{size:.1f} {unit}"
        size /= 1024
    return f"{value} B"


def _format_dt(value: datetime | None) -> str:
    return value.astimezone(timezone.utc).isoformat() if value else "-"


def _collect_jobs(queue: Queue, job_ids: Iterable[str | bytes], status: str) -> list[dict[str, Any]]:
    jobs: list[dict[str, Any]] = []
    for job_id_raw in job_ids:
        # Handle both string and bytes job IDs
        job_id: str = job_id_raw.decode("utf-8") if isinstance(job_id_raw, bytes) else str(job_id_raw)
        
        try:
            job = queue.fetch_job(job_id)
            if not job:
                continue
            
            # Handle potentially binary values
            job_id_str = job.id.decode("utf-8") if isinstance(job.id, bytes) else job.id
            func_name = job.func_name.decode("utf-8") if isinstance(job.func_name, bytes) else job.func_name
            
            jobs.append(
                {
                    "id": job_id_str,
                    "status": status,
                    "type": func_name.split(".")[-1] if func_name else "task",
                    "started": _format_dt(job.started_at),
                    "finished": _format_dt(job.ended_at),
                }
            )
        except Exception:  # pragma: no cover - defensive
            # Skip jobs that fail to decode or fetch
            continue
    return jobs


@router.get("/ops/healthz-aggregate", tags=["ops"])
async def health_aggregate() -> dict[str, Any]:
    overall_ok = True
    details: dict[str, Any] = {}

    try:
        with SessionLocal() as session:
            session.execute(text("SELECT 1"))
        details["db"] = "ok"
    except Exception as exc:  # pragma: no cover - defensive branch
        overall_ok = False
        details["db"] = f"error: {exc}"
        _remember_log("error", f"فشل التحقق من قاعدة البيانات: {exc}")

    try:
        redis_client = _get_redis_client(decode_responses=False)
        redis_client.ping()
        details["redis"] = "ok"
    except Exception as exc:  # pragma: no cover - defensive branch
        overall_ok = False
        details["redis"] = f"error: {exc}"
        _remember_log("error", f"فشل الاتصال بـ Redis: {exc}")

    try:
        s3_client = _get_s3_client()
        s3_client.list_buckets()
        details["minio"] = "ok"
    except Exception as exc:  # pragma: no cover - defensive branch
        overall_ok = False
        details["minio"] = f"error: {exc}"
        _remember_log("error", f"فشل الاتصال بـ MinIO: {exc}")

    details["ai_worker"] = "ok" if details.get("redis") == "ok" else "unknown"

    if overall_ok:
        _remember_log("info", "فحص الصحة ناجح لجميع الخدمات")

    return {"status": "ok" if overall_ok else "degraded", "details": details}


@router.get("/ops/api-status", tags=["ops"])
async def api_status(request: Request) -> dict[str, Any]:
    app = request.app
    base_url = str(request.base_url).rstrip("/")
    endpoints: list[dict[str, Any]] = []

    for route in app.routes:
        if isinstance(route, APIRoute):
            methods = sorted(method for method in route.methods or [] if method not in {"HEAD", "OPTIONS"})
            for method in methods:
                endpoints.append(
                    {
                        "path": route.path,
                        "method": method,
                        "description": route.summary or route.name or "",
                    }
                )

    endpoints.sort(key=lambda item: (item["path"], item["method"]))

    return {
        "status": "online",
        "version": getattr(app, "version", None) or os.getenv("APP_VERSION", "0.2.0"),
        "docs_url": f"{base_url}/docs",
        "endpoints": endpoints[:100],
    }


@router.get("/ops/storage-status", tags=["ops"])
async def storage_status() -> dict[str, Any]:
    status = "online"
    bucket_stats: list[dict[str, Any]] = []

    try:
        s3_client = _get_s3_client()
        buckets = s3_client.list_buckets().get("Buckets", [])
        for bucket in buckets:
            bucket_name = bucket["Name"]
            total_size = 0
            total_objects = 0
            continuation_token: str | None = None

            while True:
                params: dict[str, Any] = {"Bucket": bucket_name, "MaxKeys": 1000}
                if continuation_token:
                    params["ContinuationToken"] = continuation_token
                response = s3_client.list_objects_v2(**params)
                contents = response.get("Contents", [])
                total_objects += len(contents)
                total_size += sum(obj.get("Size", 0) for obj in contents)
                continuation_token = response.get("NextContinuationToken")
                if not continuation_token:
                    break

            bucket_stats.append(
                {
                    "name": bucket_name,
                    "objects": total_objects,
                    "size": _human_size(total_size),
                }
            )
    except Exception as exc:  # pragma: no cover - defensive branch
        status = "error"
        _remember_log("error", f"تعذّر جلب إحصائيات التخزين: {exc}")

    return {"status": status, "buckets": bucket_stats}


@router.get("/ops/ai-status", tags=["ops"])
async def ai_status() -> dict[str, Any]:
    try:
        redis_client = _get_redis_client(decode_responses=False)
        queue = Queue(os.getenv("AI_QUEUE", "ai-tasks"), connection=redis_client)
    except Exception as exc:  # pragma: no cover - defensive branch
        _remember_log("error", f"تعذّر الاتصال بطابور الذكاء الاصطناعي: {exc}")
        return {"status": "error", "jobs": []}

    started_registry = StartedJobRegistry(queue=queue)
    finished_registry = FinishedJobRegistry(queue=queue)
    failed_registry = FailedJobRegistry(queue=queue)

    jobs: list[dict[str, Any]] = []
    jobs.extend(_collect_jobs(queue, started_registry.get_job_ids()[:10], "running"))
    jobs.extend(_collect_jobs(queue, queue.get_job_ids(0, 10), "queued"))
    jobs.extend(_collect_jobs(queue, finished_registry.get_job_ids()[:10], "done"))
    jobs.extend(_collect_jobs(queue, failed_registry.get_job_ids()[:10], "error"))

    # Sort by started time descending when available
    jobs.sort(key=lambda job: job.get("started", ""), reverse=True)

    return {"status": "online", "jobs": jobs[:25]}


@router.get("/ops/logs", tags=["ops"])
async def ops_logs() -> list[dict[str, str]]:
    return list(_recent_logs)


@router.get("/ops/events", tags=["ops"])
async def sse_events(request: Request) -> StreamingResponse:
    queue: asyncio.Queue[dict[str, Any]] = asyncio.Queue()
    _subscribers.append(queue)

    async def event_stream() -> AsyncIterator[str]:
        try:
            while True:
                if await request.is_disconnected():
                    break

                try:
                    event = await asyncio.wait_for(queue.get(), timeout=15)
                    yield f"data: {json.dumps(event, ensure_ascii=False)}\n\n"
                except asyncio.TimeoutError:
                    yield ": keep-alive\n\n"
        finally:
            if queue in _subscribers:
                _subscribers.remove(queue)

    return StreamingResponse(event_stream(), media_type="text/event-stream")


@router.post("/ops/minio/webhook", tags=["ops"])
async def minio_webhook(payload: dict[str, Any]) -> dict[str, Any]:
    event: dict[str, Any] = {
        "type": "minio_event",
        "ts": datetime.now(timezone.utc).isoformat(),
        "payload": payload,
    }
    _remember_log("info", f"MinIO event: {payload.get('EventName') or payload.get('eventName', 'notification')}")
    _broadcast(event)
    return {"ok": True}


@router.get("/ops/storage/objects", tags=["ops"], response_model=None)
async def storage_objects(
    prefix: str | None = Query(None, description="المجلد الحالي"),
    q: str | None = Query(None, description="نص للبحث"),
    limit: int = Query(200, ge=1, le=1000),
    cursor: str | None = Query(None, description="مؤشر الصفحة التالية"),
) -> JSONResponse | dict[str, Any]:
    try:
        bucket = _get_bucket_name()
    except RuntimeError as exc:
        return _json_error("STORAGE_BUCKET_MISSING", str(exc), status_code=500)

    normalized_prefix = None
    if prefix:
        try:
            normalized_prefix = _sanitize_storage_key(prefix)
            if not normalized_prefix.endswith("/"):
                normalized_prefix += "/"
        except ValueError as exc:
            return _json_error("STORAGE_INVALID_PREFIX", str(exc))

    s3_client = _get_s3_client()
    params: dict[str, Any] = {"Bucket": bucket, "MaxKeys": limit}
    if normalized_prefix:
        params["Prefix"] = normalized_prefix
    if cursor:
        params["ContinuationToken"] = cursor
    if normalized_prefix:
        params["Delimiter"] = "/"

    try:
        response = s3_client.list_objects_v2(**params)
    except ClientError as exc:  # pragma: no cover - remote dependency
        _remember_log("error", f"تعذّر جلب قائمة الملفات: {exc}")
        return _json_error("STORAGE_LIST_FAILED", "تعذّر جلب قائمة الملفات.", status_code=502, details=_client_error_details(exc))

    query_lower = q.lower() if q else None

    folders: list[dict[str, Any]] = []
    for item in response.get("CommonPrefixes", []):
        folder_prefix = item.get("Prefix") or ""
        if not folder_prefix:
            continue
        name = folder_prefix.rstrip("/").split("/")[-1]
        if query_lower and query_lower not in name.lower():
            continue
        folders.append({
            "key": folder_prefix.rstrip("/"),
            "name": name,
            "isFolder": True,
        })

    objects: list[dict[str, Any]] = []
    for obj in response.get("Contents", []):
        key = obj.get("Key")
        if not key:
            continue
        name = key.split("/")[-1] or key
        if query_lower and query_lower not in name.lower() and query_lower not in key.lower():
            continue
        last_modified = obj.get("LastModified")
        objects.append({
            "key": key,
            "name": name,
            "size": obj.get("Size", 0),
            "etag": (obj.get("ETag") or "").strip('"'),
            "lastModified": last_modified.astimezone(timezone.utc).isoformat() if isinstance(last_modified, datetime) else None,
            "contentType": mimetypes.guess_type(key)[0] or "application/octet-stream",
            "isFolder": key.endswith("/"),
        })

    payload = {
        "prefix": normalized_prefix or "",
        "folders": folders,
        "items": objects,
        "nextCursor": response.get("NextContinuationToken"),
        "count": len(objects) + len(folders),
    }
    return payload


@router.get("/ops/storage/download-url", tags=["ops"], response_model=None)
async def storage_download_url(key: str = Query(..., description="المسار الكامل للملف")) -> JSONResponse | dict[str, Any]:
    try:
        bucket = _get_bucket_name()
    except RuntimeError as exc:
        return _json_error("STORAGE_BUCKET_MISSING", str(exc), status_code=500)

    try:
        normalized_key = _sanitize_storage_key(key)
    except ValueError as exc:
        return _json_error("STORAGE_INVALID_KEY", str(exc))

    s3_client = _get_s3_client()
    try:
        url = s3_client.generate_presigned_url(
            "get_object",
            Params={"Bucket": bucket, "Key": normalized_key},
            ExpiresIn=_signed_url_ttl(),
        )
    except ClientError as exc:  # pragma: no cover - remote dependency
        _remember_log("error", f"تعذّر إنشاء رابط التنزيل للملف {normalized_key}: {exc}")
        return _json_error("STORAGE_DOWNLOAD_FAILED", "تعذّر إنشاء رابط التنزيل.", status_code=502, details=_client_error_details(exc))

    return {"url": url}


@router.post("/ops/storage/upload-url", tags=["ops"], response_model=None)
async def storage_upload_url(payload: dict[str, Any]) -> JSONResponse | dict[str, Any]:
    try:
        bucket = _get_bucket_name()
    except RuntimeError as exc:
        return _json_error("STORAGE_BUCKET_MISSING", str(exc), status_code=500)

    key = payload.get("key") or ""
    content_type = payload.get("contentType") or "application/octet-stream"

    try:
        normalized_key = _sanitize_storage_key(key)
    except ValueError as exc:
        return _json_error("STORAGE_INVALID_KEY", str(exc))

    s3_client = _get_s3_client()
    extra_params = {"Bucket": bucket, "Key": normalized_key, "ContentType": content_type}

    try:
        url = s3_client.generate_presigned_url("put_object", Params=extra_params, ExpiresIn=_signed_url_ttl())
    except ClientError as exc:  # pragma: no cover - remote dependency
        _remember_log("error", f"تعذّر إنشاء رابط الرفع للملف {normalized_key}: {exc}")
        return _json_error("STORAGE_UPLOAD_FAILED", "تعذّر إنشاء رابط الرفع.", status_code=502, details=_client_error_details(exc))

    return {"url": url, "headers": {"Content-Type": content_type}, "key": normalized_key}


@router.put("/ops/storage/rename", tags=["ops"], response_model=None)
async def storage_rename(payload: dict[str, Any]) -> JSONResponse | dict[str, Any]:
    try:
        bucket = _get_bucket_name()
    except RuntimeError as exc:
        return _json_error("STORAGE_BUCKET_MISSING", str(exc), status_code=500)

    source_raw = payload.get("source") or ""
    new_key_raw = payload.get("newKey") or payload.get("new_key") or ""

    try:
        source = _sanitize_storage_key(source_raw)
        target = _sanitize_storage_key(new_key_raw)
    except ValueError as exc:
        return _json_error("STORAGE_INVALID_KEY", str(exc))

    if source == target:
        return _json_error("STORAGE_SAME_KEY", "المسار الجديد يطابق المسار الحالي")

    s3_client = _get_s3_client()

    try:
        s3_client.copy_object(Bucket=bucket, CopySource={"Bucket": bucket, "Key": source}, Key=target)
        s3_client.delete_object(Bucket=bucket, Key=source)
    except ClientError as exc:  # pragma: no cover - remote dependency
        _remember_log("error", f"تعذّر إعادة تسمية الملف {source} إلى {target}: {exc}")
        return _json_error("STORAGE_RENAME_FAILED", "تعذّر إعادة تسمية الملف.", status_code=502, details=_client_error_details(exc))

    _remember_log("info", f"تمت إعادة تسمية {source} إلى {target}")
    _broadcast({
        "type": "storage",
        "action": "rename",
        "ts": _now_utc().isoformat(),
        "data": {"source": source, "target": target},
    })

    return {"renamed": True, "source": source, "target": target}


@router.post("/ops/storage/move-copy", tags=["ops"], response_model=None)
async def storage_move_copy(payload: dict[str, Any]) -> JSONResponse | dict[str, Any]:
    try:
        bucket = _get_bucket_name()
    except RuntimeError as exc:
        return _json_error("STORAGE_BUCKET_MISSING", str(exc), status_code=500)

    items = payload.get("items") or []
    mode = (payload.get("mode") or "move").lower()
    if mode not in {"move", "copy"}:
        return _json_error("STORAGE_INVALID_MODE", "الوضع يجب أن يكون move أو copy")
    if not isinstance(items, list) or not items:
        return _json_error("STORAGE_INVALID_ITEMS", "قائمة العناصر مطلوبة")

    s3_client = _get_s3_client()
    processed: list[dict[str, str]] = []

    action_label = "نقل" if mode == "move" else "نسخ"

    for item in items:
        source_raw = (item or {}).get("source") or ""
        destination_raw = (item or {}).get("destination") or ""
        try:
            source = _sanitize_storage_key(source_raw)
            destination = _sanitize_storage_key(destination_raw)
        except ValueError as exc:
            return _json_error("STORAGE_INVALID_KEY", str(exc))

        if source == destination:
            continue

        try:
            s3_client.copy_object(Bucket=bucket, CopySource={"Bucket": bucket, "Key": source}, Key=destination)
            if mode == "move":
                s3_client.delete_object(Bucket=bucket, Key=source)
        except ClientError as exc:  # pragma: no cover - remote dependency
            _remember_log("error", f"تعذّر {mode} العنصر {source} إلى {destination}: {exc}")
            return _json_error("STORAGE_MOVE_FAILED", f"تعذّر {action_label} العنصر.", status_code=502, details=_client_error_details(exc))

        processed.append({"source": source, "destination": destination})

    if not processed:
        return {"processed": 0}

    _remember_log("info", f"تم {action_label} {len(processed)} عناصر")
    _broadcast({
        "type": "storage",
        "action": mode,
        "ts": _now_utc().isoformat(),
        "data": processed,
    })

    return {"processed": len(processed), "mode": mode}


@router.delete("/ops/storage/objects", tags=["ops"], response_model=None)
async def storage_delete(payload: dict[str, Any]) -> JSONResponse | dict[str, Any]:
    try:
        bucket = _get_bucket_name()
    except RuntimeError as exc:
        return _json_error("STORAGE_BUCKET_MISSING", str(exc), status_code=500)

    keys = payload.get("keys") or []
    if not isinstance(keys, list) or not keys:
        return _json_error("STORAGE_INVALID_KEYS", "قائمة الملفات مطلوبة")

    sanitized_keys: list[str] = []
    for key in keys:
        try:
            sanitized_keys.append(_sanitize_storage_key(str(key)))
        except ValueError as exc:
            return _json_error("STORAGE_INVALID_KEY", str(exc))

    s3_client = _get_s3_client()

    objects = [{"Key": key} for key in sanitized_keys]

    try:
        s3_client.delete_objects(Bucket=bucket, Delete={"Objects": objects, "Quiet": True})
    except ClientError as exc:  # pragma: no cover - remote dependency
        _remember_log("error", f"تعذّر حذف الملفات {sanitized_keys}: {exc}")
        return _json_error("STORAGE_DELETE_FAILED", "تعذّر حذف الملفات.", status_code=502, details=_client_error_details(exc))

    _remember_log("warning", f"تم حذف {len(sanitized_keys)} عنصر من التخزين")
    _broadcast({
        "type": "storage",
        "action": "delete",
        "ts": _now_utc().isoformat(),
        "data": {"keys": sanitized_keys},
    })

    return {"deleted": len(sanitized_keys)}


@router.get("/ops/settings", tags=["ops"])
async def list_settings(
    group: str | None = Query(None, description="تصفية حسب المجموعة"),
    q: str | None = Query(None, description="بحث نصي"),
) -> JSONResponse | dict[str, Any]:
    _ensure_settings_table()

    clauses: list[str] = []
    params: dict[str, Any] = {}

    if group:
        clauses.append("group_name = :group_name")
        params["group_name"] = group

    if q:
        clauses.append("(LOWER(key) LIKE :q OR LOWER(COALESCE(description, '')) LIKE :q)")
        params["q"] = f"%{q.lower()}%"

    base_query = "SELECT key, value, group_name, description, is_secret, default_value, updated_at, updated_by FROM ops_settings"
    if clauses:
        base_query += " WHERE " + " AND ".join(clauses)
    base_query += " ORDER BY group_name, key"

    with SessionLocal() as session:
        rows = session.execute(text(base_query), params).mappings().all()

    items = [_row_to_setting(dict(row)) for row in rows]
    return {"items": items, "total": len(items)}


@router.post("/ops/settings", tags=["ops"], response_model=None)
async def create_setting(payload: dict[str, Any]) -> JSONResponse | dict[str, Any]:
    _ensure_settings_table()

    key = (payload.get("key") or "").strip()
    value = payload.get("value")
    group = (payload.get("group") or "general").strip() or "general"
    description = (payload.get("description") or "").strip() or None
    is_secret = bool(payload.get("isSecret") or payload.get("is_secret") or False)
    default_value = payload.get("defaultValue")
    updated_by = (payload.get("updatedBy") or payload.get("updated_by") or "ops-console").strip() or "ops-console"

    if not key:
        return _json_error("SETTINGS_KEY_REQUIRED", "حقل المفتاح مطلوب")
    if value is None:
        return _json_error("SETTINGS_VALUE_REQUIRED", "حقل القيمة مطلوب")

    now_value = _now_utc()

    insert_stmt = text(
        """
        INSERT INTO ops_settings (key, value, group_name, description, is_secret, default_value, updated_at, updated_by)
        VALUES (:key, :value, :group_name, :description, :is_secret, :default_value, :updated_at, :updated_by)
        """
    )

    params = {
        "key": key,
        "value": value,
        "group_name": group,
        "description": description,
        "is_secret": is_secret,
        "default_value": default_value,
        "updated_at": now_value,
        "updated_by": updated_by,
    }

    with SessionLocal() as session:
        try:
            session.execute(insert_stmt, params)
            session.commit()
        except IntegrityError as exc:  # pragma: no cover - depends on DB backend
            session.rollback()
            _remember_log("warning", f"محاولة إضافة إعداد موجود مسبقًا: {key} - {exc}")
            return _json_error("SETTINGS_DUPLICATE", "المفتاح مستخدم بالفعل", status_code=409, details={"key": key})

    _remember_log("info", f"تم إنشاء الإعداد {key} ضمن المجموعة {group}")
    _broadcast({
        "type": "settings",
        "action": "create",
        "ts": now_value.isoformat(),
        "data": {"key": key, "group": group},
    })

    return {"created": True, "item": {
        "key": key,
        "value": value,
        "group": group,
        "description": description or "",
        "isSecret": is_secret,
        "defaultValue": default_value,
        "updatedAt": now_value.isoformat(),
        "updatedBy": updated_by,
    }}


@router.put("/ops/settings", tags=["ops"], response_model=None)
async def update_settings_bulk(payload: dict[str, Any]) -> JSONResponse | dict[str, Any]:
    _ensure_settings_table()

    items = payload.get("items") or []
    if not isinstance(items, list) or not items:
        return _json_error("SETTINGS_ITEMS_REQUIRED", "قائمة الإعدادات مطلوبة")

    now_value = _now_utc()
    updated_keys: list[str] = []
    missing: list[str] = []

    update_stmt = text(
        """
        UPDATE ops_settings
        SET value = :value,
            description = :description,
            group_name = :group_name,
            is_secret = :is_secret,
            updated_at = :updated_at,
            updated_by = :updated_by
        WHERE key = :key
        """
    )

    with SessionLocal() as session:
        for item in items:
            key = (item.get("key") or "").strip()
            if not key:
                continue
            value = item.get("value")
            if value is None:
                continue
            params = {
                "key": key,
                "value": value,
                "description": (item.get("description") or "").strip() or None,
                "group_name": (item.get("group") or "general").strip() or "general",
                "is_secret": bool(item.get("isSecret") or item.get("is_secret") or False),
                "updated_at": now_value,
                "updated_by": (item.get("updatedBy") or item.get("updated_by") or "ops-console").strip() or "ops-console",
            }
            result = session.execute(update_stmt, params)
            rowcount = getattr(result, "rowcount", 0)
            if rowcount:
                updated_keys.append(key)
            else:
                missing.append(key)
        session.commit()

    if not updated_keys:
        return _json_error("SETTINGS_NOT_UPDATED", "تعذّر تحديث أي إعداد", status_code=404, details={"missing": missing})

    _remember_log("info", f"تم تحديث {len(updated_keys)} إعداد")
    _broadcast({
        "type": "settings",
        "action": "bulk-update",
        "ts": now_value.isoformat(),
        "data": {"keys": updated_keys, "missing": missing},
    })

    return {"updated": len(updated_keys), "missing": missing}


@router.get("/ops/settings/{key}", tags=["ops"], response_model=None)
async def get_setting(key: str) -> JSONResponse | dict[str, Any]:
    _ensure_settings_table()

    with SessionLocal() as session:
        row = session.execute(
            text("SELECT key, value, group_name, description, is_secret, default_value, updated_at, updated_by FROM ops_settings WHERE key = :key"),
            {"key": key},
        ).mappings().first()

    if not row:
        return _json_error("SETTINGS_NOT_FOUND", "الإعداد غير موجود", status_code=404, details={"key": key})

    return {"item": _row_to_setting(dict(row))}


@router.put("/ops/settings/{key}", tags=["ops"], response_model=None)
async def update_setting(key: str, payload: dict[str, Any]) -> JSONResponse | dict[str, Any]:
    _ensure_settings_table()

    value = payload.get("value")
    if value is None:
        return _json_error("SETTINGS_VALUE_REQUIRED", "حقل القيمة مطلوب")

    description = (payload.get("description") or "").strip() or None
    group = (payload.get("group") or "general").strip() or "general"
    is_secret = bool(payload.get("isSecret") or payload.get("is_secret") or False)
    updated_by = (payload.get("updatedBy") or payload.get("updated_by") or "ops-console").strip() or "ops-console"

    now_value = _now_utc()

    with SessionLocal() as session:
        result = session.execute(
            text(
                """
                UPDATE ops_settings
                SET value = :value,
                    description = :description,
                    group_name = :group_name,
                    is_secret = :is_secret,
                    updated_at = :updated_at,
                    updated_by = :updated_by
                WHERE key = :key
                """
            ),
            {
                "key": key,
                "value": value,
                "description": description,
                "group_name": group,
                "is_secret": is_secret,
                "updated_at": now_value,
                "updated_by": updated_by,
            },
        )
        rowcount = getattr(result, "rowcount", 0)
        if rowcount == 0:
            session.rollback()
            return _json_error("SETTINGS_NOT_FOUND", "الإعداد غير موجود", status_code=404, details={"key": key})
        session.commit()

    _remember_log("info", f"تم تحديث الإعداد {key}")
    _broadcast({
        "type": "settings",
        "action": "update",
        "ts": now_value.isoformat(),
        "data": {"key": key},
    })

    return {
        "updated": True,
        "item": {
            "key": key,
            "value": value,
            "group": group,
            "description": description or "",
            "isSecret": is_secret,
            "updatedAt": now_value.isoformat(),
            "updatedBy": updated_by,
        },
    }


@router.delete("/ops/settings/{key}", tags=["ops"], response_model=None)
async def delete_setting(key: str, reset: bool = Query(False, description="إرجاع القيمة للوضع الافتراضي")) -> JSONResponse | dict[str, Any]:
    _ensure_settings_table()

    now_value = _now_utc()

    with SessionLocal() as session:
        row = session.execute(
            text("SELECT value, default_value FROM ops_settings WHERE key = :key"),
            {"key": key},
        ).mappings().first()

        if not row:
            return _json_error("SETTINGS_NOT_FOUND", "الإعداد غير موجود", status_code=404, details={"key": key})

        if reset and row.get("default_value") is not None:
            session.execute(
                text(
                    """
                    UPDATE ops_settings
                    SET value = :value,
                        updated_at = :updated_at
                    WHERE key = :key
                    """
                ),
                {
                    "key": key,
                    "value": row.get("default_value"),
                    "updated_at": now_value,
                },
            )
            session.commit()
            _remember_log("info", f"تمت إعادة ضبط الإعداد {key} إلى القيمة الافتراضية")
            _broadcast({
                "type": "settings",
                "action": "reset",
                "ts": now_value.isoformat(),
                "data": {"key": key},
            })
            return {"reset": True}

        session.execute(text("DELETE FROM ops_settings WHERE key = :key"), {"key": key})
        session.commit()

    _remember_log("warning", f"تم حذف الإعداد {key}")
    _broadcast({
        "type": "settings",
        "action": "delete",
        "ts": now_value.isoformat(),
        "data": {"key": key},
    })

    return {"deleted": True}


@router.post("/ops/ai/webhook", tags=["ops"])
async def ai_webhook(payload: dict[str, Any]) -> dict[str, Any]:
    event: dict[str, Any] = {
        "type": "ai_job_event",
        "ts": datetime.now(timezone.utc).isoformat(),
        "payload": payload,
    }
    _remember_log("info", f"AI job event: {payload.get('event') or payload.get('status', 'update')}")
    _broadcast(event)
    return {"ok": True}
