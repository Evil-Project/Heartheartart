import shutil
from pathlib import Path

import boto3
from heartheartart.bot.client import HeartheartClient
from heartheartart.bot.commands import PublishingCommands, StatusCommands
from heartheartart.bot.roles import BotRoleSync
from heartheartart.capture.browser import WebsiteCapture
from heartheartart.config import Settings
from heartheartart.publishing.pending import PendingPublishStore
from heartheartart.publishing.service import PublishService
from heartheartart.storage.database import SqlAlchemyCardRepository
from heartheartart.storage.objects import R2SnapshotStore
from heartheartart.storage.schema import prepare_database


def _repository(database_url: str) -> SqlAlchemyCardRepository:
    repository = SqlAlchemyCardRepository(database_url)
    prepare_database(repository.engine)
    return repository


def main() -> None:
    settings = Settings.from_env()
    service = PublishService(
        capture=WebsiteCapture(),
        snapshots=R2SnapshotStore(
            client=boto3.client(
                "s3",
                endpoint_url=settings.r2_endpoint_url,
                aws_access_key_id=settings.r2_access_key_id,
                aws_secret_access_key=settings.r2_secret_access_key,
            ),
            bucket=settings.r2_bucket_name,
            cdn_base_url=settings.cdn_base_url,
        ),
        repository=_repository(settings.database_url),
    )
    client = HeartheartClient()
    StatusCommands(client).bind()
    PublishingCommands(client, service, PendingPublishStore()).bind()
    BotRoleSync(client).bind()
    shutil.rmtree("temp", ignore_errors=True)
    Path("temp").mkdir(parents=True, exist_ok=True)
    client.run(settings.token)


if __name__ == "__main__":
    main()
