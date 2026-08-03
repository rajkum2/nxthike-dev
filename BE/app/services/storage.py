"""Storage backends: local disk or Cloudflare R2 (S3-compatible)."""

from __future__ import annotations

import os
import uuid
from abc import ABC, abstractmethod
from dataclasses import dataclass
from pathlib import Path

from app.config import settings


@dataclass
class StoredObject:
    key: str
    url: str
    filename: str
    content_type: str | None
    size: int
    backend: str


class StorageBackend(ABC):
    name: str

    @abstractmethod
    def upload(
        self,
        data: bytes,
        *,
        folder: str,
        filename: str,
        content_type: str | None = None,
    ) -> StoredObject:
        ...

    @abstractmethod
    def delete(self, key: str) -> bool:
        ...


class LocalStorage(StorageBackend):
    name = "local"

    def __init__(self, root: str, public_base: str = "/uploads"):
        self.root = Path(root)
        self.public_base = public_base.rstrip("/")

    def upload(
        self,
        data: bytes,
        *,
        folder: str,
        filename: str,
        content_type: str | None = None,
    ) -> StoredObject:
        key = f"{folder.strip('/')}/{filename}"
        path = self.root / key
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(data)
        return StoredObject(
            key=key,
            url=f"{self.public_base}/{key}",
            filename=filename,
            content_type=content_type,
            size=len(data),
            backend=self.name,
        )

    def delete(self, key: str) -> bool:
        path = self.root / key
        if path.is_file():
            path.unlink()
            return True
        return False


class R2Storage(StorageBackend):
    """Cloudflare R2 via S3 API (boto3)."""

    name = "r2"

    def __init__(
        self,
        *,
        account_id: str,
        access_key_id: str,
        secret_access_key: str,
        bucket: str,
        public_url: str,
        endpoint: str | None = None,
    ):
        import boto3
        from botocore.config import Config

        self.bucket = bucket
        self.public_url = public_url.rstrip("/")
        self.endpoint = endpoint or f"https://{account_id}.r2.cloudflarestorage.com"
        self.client = boto3.client(
            "s3",
            endpoint_url=self.endpoint,
            aws_access_key_id=access_key_id,
            aws_secret_access_key=secret_access_key,
            region_name="auto",
            config=Config(signature_version="s3v4"),
        )

    def upload(
        self,
        data: bytes,
        *,
        folder: str,
        filename: str,
        content_type: str | None = None,
    ) -> StoredObject:
        key = f"{folder.strip('/')}/{filename}"
        extra = {}
        if content_type:
            extra["ContentType"] = content_type
        self.client.put_object(Bucket=self.bucket, Key=key, Body=data, **extra)
        return StoredObject(
            key=key,
            url=f"{self.public_url}/{key}",
            filename=filename,
            content_type=content_type,
            size=len(data),
            backend=self.name,
        )

    def delete(self, key: str) -> bool:
        try:
            self.client.delete_object(Bucket=self.bucket, Key=key)
            return True
        except Exception:
            return False

    def presigned_get(self, key: str, expires_in: int = 3600) -> str:
        return self.client.generate_presigned_url(
            "get_object",
            Params={"Bucket": self.bucket, "Key": key},
            ExpiresIn=expires_in,
        )

    def presigned_put(
        self,
        key: str,
        content_type: str | None = None,
        expires_in: int = 3600,
    ) -> str:
        params: dict = {"Bucket": self.bucket, "Key": key}
        if content_type:
            params["ContentType"] = content_type
        return self.client.generate_presigned_url(
            "put_object",
            Params=params,
            ExpiresIn=expires_in,
        )


_storage: StorageBackend | None = None


def get_storage() -> StorageBackend:
    global _storage
    if _storage is not None:
        return _storage

    backend = (settings.STORAGE_BACKEND or "local").lower().strip()
    if backend == "r2":
        if not all(
            [
                settings.R2_ACCOUNT_ID,
                settings.R2_ACCESS_KEY_ID,
                settings.R2_SECRET_ACCESS_KEY,
                settings.R2_BUCKET_NAME,
                settings.R2_PUBLIC_URL,
            ]
        ):
            raise RuntimeError(
                "STORAGE_BACKEND=r2 requires R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, "
                "R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, and R2_PUBLIC_URL"
            )
        _storage = R2Storage(
            account_id=settings.R2_ACCOUNT_ID,
            access_key_id=settings.R2_ACCESS_KEY_ID,
            secret_access_key=settings.R2_SECRET_ACCESS_KEY,
            bucket=settings.R2_BUCKET_NAME,
            public_url=settings.R2_PUBLIC_URL,
            endpoint=settings.R2_ENDPOINT or None,
        )
    else:
        _storage = LocalStorage(settings.UPLOAD_DIR)

    return _storage


def unique_filename(original: str | None, default_ext: str = "bin") -> str:
    ext = default_ext
    if original and "." in original:
        ext = original.rsplit(".", 1)[-1].lower()[:16]
    return f"{uuid.uuid4().hex}.{ext}"
