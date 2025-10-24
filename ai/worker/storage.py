import boto3
from botocore.client import Config as BotoConfig

from .config import Config


def s3_client():
  return boto3.client(
    "s3",
    endpoint_url=Config.S3_ENDPOINT,
    aws_access_key_id=Config.S3_ACCESS_KEY,
    aws_secret_access_key=Config.S3_SECRET_KEY,
    config=BotoConfig(signature_version="s3v4"),
    region_name="us-east-1",
  )
