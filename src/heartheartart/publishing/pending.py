from dataclasses import dataclass

from heartheartart.domain.cards import LinkCard


class PendingPublishNotFound(Exception):
    message = "No pending publish found."


class PendingPublishForbidden(Exception):
    message = "You are not the author of this publish."


@dataclass(frozen=True)
class PendingPublish:
    author_id: int
    card: LinkCard


class PendingPublishStore:
    def __init__(self) -> None:
        self._items: dict[int, PendingPublish] = {}

    def put(self, message_id: int, author_id: int, card: LinkCard) -> None:
        self._items[message_id] = PendingPublish(author_id=author_id, card=card)

    def get_owned(self, message_id: int, author_id: int) -> LinkCard:
        pending = self._items.get(message_id)
        if pending is None:
            raise PendingPublishNotFound()
        if pending.author_id != author_id:
            raise PendingPublishForbidden()
        return pending.card

    def discard(self, message_id: int) -> None:
        self._items.pop(message_id, None)
