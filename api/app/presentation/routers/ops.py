from __future__ import annotations

import asyncio
import json
import os
from collections import deque
from datetime import datetime, timezone
from typing import Any, AsyncIterator, Iterable, cast

import boto3
import redis
from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
from fastapi.routing import APIRoute
from rq import Queue
from rq.registry import FailedJobRegistry, FinishedJobRegistry, StartedJobRegistry
from sqlalchemy import text

from ...config.settings import settings as app_settings
from ...infrastructure.db.session import SessionLocal

# pyright: reportMissingTypeStubs=false, reportUnknownMemberType=false, reportUnknownVariableType=false, reportUnknownArgumentType=false

router = APIRouter()

_subscribers: list[asyncio.Queue[dict[str, Any]]] = []
_recent_logs: deque[dict[str, str]] = deque(maxlen=200)


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


@router.get("/ops/settings", tags=["ops"])
async def ops_settings() -> dict[str, Any]:
    config_snapshot = {
        "DATABASE_URL": app_settings.DATABASE_URL.split("@")[-1],
        "REDIS_URL": app_settings.REDIS_URL,
        "S3_ENDPOINT": app_settings.S3_ENDPOINT,
        "S3_BUCKET": app_settings.S3_BUCKET,
        "WEB_ORIGINS": app_settings.WEB_ORIGINS,
    }

    return {
        "version": os.getenv("APP_VERSION", "0.2.0"),
        "env": os.getenv("APP_ENV", "local"),
        "config": config_snapshot,
    }


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
