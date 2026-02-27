import asyncio
import aioboto3
import json
from config import settings

async def main():
    session = aioboto3.Session()
    bucket_name = "omervision-assets"
    async with session.client(
        's3',
        endpoint_url=f"http://{settings.MINIO_ENDPOINT}",
        aws_access_key_id=settings.MINIO_ACCESS_KEY,
        aws_secret_access_key=settings.MINIO_SECRET_KEY,
        region_name="us-east-1"
    ) as s3:
        public_policy = {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Effect": "Allow",
                    "Principal": {"AWS": ["*"]},
                    "Action": ["s3:GetObject"],
                    "Resource": [f"arn:aws:s3:::{bucket_name}/*"]
                }
            ]
        }
        await s3.put_bucket_policy(Bucket=bucket_name, Policy=json.dumps(public_policy))
        print("Successfully applied public read policy to omervision-assets bucket.")

if __name__ == "__main__":
    asyncio.run(main())
