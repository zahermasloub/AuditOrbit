from botocore.exceptions import ClientError

from .s3 import s3_client


def delete_object(bucket: str, key: str) -> None:
  """Remove an object from S3/MinIO before pruning the DB record."""
  client = s3_client()
  try:
    client.delete_object(Bucket=bucket, Key=key)
  except ClientError as exc:
    error_code = exc.response.get("Error", {}).get("Code")
    if error_code in {"NoSuchBucket", "NoSuchKey"}:
      return
    raise
