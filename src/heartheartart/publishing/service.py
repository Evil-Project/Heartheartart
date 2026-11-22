from dataclasses import dataclass

from heartheartart.capture.errors import CaptureError
from heartheartart.domain.cards import LinkCard
from heartheartart.publishing.ports import CardRepository, PageCapture, SnapshotStore


class PublishRejected(Exception):
    def __init__(self, message: str):
        super().__init__(message)
        self.message = message


@dataclass(frozen=True)
class PreparedPublish:
    card: LinkCard
    preview_url: str


class PublishService:
    def __init__(
        self,
        capture: PageCapture,
        snapshots: SnapshotStore,
        repository: CardRepository,
    ):
        self.capture = capture
        self.snapshots = snapshots
        self.repository = repository

    async def prepare(self, url: str) -> PreparedPublish:
        try:
            card = await self.capture.capture(url)
        except CaptureError as exc:
            raise PublishRejected(exc.message) from exc
        preview_url = await self.snapshots.publish(card.snapshot_path)
        return PreparedPublish(card=card, preview_url=preview_url)

    async def confirm(self, card: LinkCard) -> None:
        self.repository.save(card)

    async def cancel(self, card: LinkCard) -> None:
        await self.snapshots.delete(card.snapshot_path)
