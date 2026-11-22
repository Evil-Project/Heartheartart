from typing import Protocol

from heartheartart.domain.cards import LinkCard


class PageCapture(Protocol):
    async def capture(self, url: str) -> LinkCard: ...


class SnapshotStore(Protocol):
    async def publish(self, path: str) -> str: ...

    async def delete(self, path: str) -> None: ...


class CardRepository(Protocol):
    def save(self, card: LinkCard) -> None: ...


class PendingPublishes(Protocol):
    def put(self, message_id: int, author_id: int, card: LinkCard) -> None: ...

    def get_owned(self, message_id: int, author_id: int) -> LinkCard: ...

    def discard(self, message_id: int) -> None: ...
