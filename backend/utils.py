from PIL import Image, ImageDraw, ImageFont
import io
import os
import magic
import secrets
from fastapi import HTTPException

# List of allowed magic numbers (file signatures)
ALLOWED_MIME_TYPES = {
    "image/jpeg": [b"\xff\xd8\xff"],
    "image/png": [b"\x89\x50\x4e\x47\x0d\x0a\x1a\x0a"],
    "image/gif": [b"GIF87a", b"GIF89a"],
    "image/webp": [b"RIFF"],
}

def validate_file_magic(content: bytes):
    mime = magic.from_buffer(content, mime=True)
    if mime not in ALLOWED_MIME_TYPES:
        raise HTTPException(status_code=400, detail=f"File type {mime} not allowed")
    return mime

def optimize_image(content: bytes, quality: int = 80) -> bytes:
    """Converts image to WebP and compresses it."""
    try:
        img = Image.open(io.BytesIO(content))
        output = io.BytesIO()
        img.save(output, format="WEBP", quality=quality, method=6)
        return output.getvalue()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Image processing failed: {str(e)}")

import aioboto3
from config import settings

class MinioStorage:
    def __init__(self):
        self.bucket = "omervision-assets"
        self.session = aioboto3.Session()

    async def _ensure_bucket(self, s3_client):
        try:
            await s3_client.head_bucket(Bucket=self.bucket)
        except:
            await s3_client.create_bucket(Bucket=self.bucket)
            # Make public read for assets (simplified for portfolio)
            public_policy = {
                "Version": "2012-10-17",
                "Statement": [
                    {
                        "Effect": "Allow",
                        "Principal": {"AWS": ["*"]},
                        "Action": ["s3:GetObject"],
                        "Resource": [f"arn:aws:s3:::{self.bucket}/*"]
                    }
                ]
            }
            import json
            await s3_client.put_bucket_policy(Bucket=self.bucket, Policy=json.dumps(public_policy))

    async def upload_file(self, content: bytes, filename: str, content_type: str = "image/webp") -> str:
        async with self.session.client(
            's3',
            endpoint_url=f"http://{settings.MINIO_ENDPOINT}",
            aws_access_key_id=settings.MINIO_ACCESS_KEY,
            aws_secret_access_key=settings.MINIO_SECRET_KEY,
            region_name="us-east-1"
        ) as s3:
            await self._ensure_bucket(s3)
            await s3.put_object(
                Bucket=self.bucket,
                Key=filename,
                Body=content,
                ContentType=content_type
            )
            return f"http://{settings.MINIO_PUBLIC_ENDPOINT}/{self.bucket}/{filename}"

def get_cdn_url(path: str) -> str:
    """Prepends MinIO or CDN domain to asset paths."""
    if path.startswith("http"): return path
    return f"http://{settings.MINIO_PUBLIC_ENDPOINT}/omervision-assets/{path}"

def generate_og_image(title: str) -> bytes:
    """Generates a dynamic 1200x630 OG image with content title."""
    img = Image.new('RGB', (1200, 630), color=(10, 10, 15))
    draw = ImageDraw.Draw(img)
    
    # Add branding
    draw.text((50, 50), "OmerVision", fill=(0, 200, 255))
    
    # Center text (Simplified)
    draw.text((600, 315), title[:50], fill=(255, 255, 255))
    
    output = io.BytesIO()
    img.save(output, format="WEBP")
    return output.getvalue()

def generate_verification_token() -> str:
    return secrets.token_urlsafe(32)
