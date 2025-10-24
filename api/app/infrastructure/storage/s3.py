import os
from typing import Optional

import boto3
from botocore.client import Config


def _s3_client():
  return boto3.client(
    "s3",
    endpoint_url=os.getenv("S3_ENDPOINT", "http://localhost:9000"),
    aws_access_key_id=os.getenv("S3_ACCESS_KEY", "minioadmin"),
    aws_secret_access_key=os.getenv("S3_SECRET_KEY", "minioadmin"),
    config=Config(signature_version="s3v4"),
    region_name=os.getenv("S3_REGION", "us-east-1"),
  )


def presign_put(bucket: str, key: str, mime: Optional[str] = None, expires: int = 3600) -> str:
  params: dict[str, object] = {"Bucket": bucket, "Key": key}
  if mime:
    params["ContentType"] = mime
  return _s3_client().generate_presigned_url("put_object", Params=params, ExpiresIn=expires)


def presign_get(bucket: str, key: str, expires: int = 3600) -> str:
  params = {"Bucket": bucket, "Key": key}
  return _s3_client().generate_presigned_url("get_object", Params=params, ExpiresIn=expires)
