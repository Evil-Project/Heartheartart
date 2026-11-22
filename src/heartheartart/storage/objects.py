import asyncio
from pathlib import Path


class R2SnapshotStore:
    def __init__(self, client, bucket: str, cdn_base_url: str):
        self.client = client
        self.bucket = bucket
        self.cdn_base_url = cdn_base_url

    async def publish(self, path: str) -> str:
        return await asyncio.to_thread(self._publish_sync, path)

    async def delete(self, path: str) -> None:
        await asyncio.to_thread(self._delete_sync, path)

    def _publish_sync(self, path: str) -> str:
        folder = Path(path)
        for file in folder.rglob("*"):
            if file.is_file():
                relative_path = file.relative_to(folder.parent)
                self.client.upload_file(str(file), self.bucket, relative_path.as_posix())
        return f"{self.cdn_base_url}/{folder.name}/index.html"

    def _delete_sync(self, path: str) -> None:
        folder = Path(path).name
        paginator = self.client.get_paginator("list_objects_v2")
        for page in paginator.paginate(Bucket=self.bucket, Prefix=f"{folder}/"):
            objects = [
                {"Key": key_object["Key"]} for key_object in page.get("Contents", [])
            ]
            if objects:
                self.client.delete_objects(
                    Bucket=self.bucket, Delete={"Objects": objects}
                )
