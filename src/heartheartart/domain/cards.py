from dataclasses import dataclass


@dataclass(frozen=True)
class LinkCard:
    link: str | None
    title: str | None
    description: str | None
    author: str | None
    snapshot_path: str
