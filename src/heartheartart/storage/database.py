import sqlalchemy
from heartheartart.domain.cards import LinkCard
from sqlalchemy.orm import Session
from heartheartart.storage.models import LinkRecord


class SqlAlchemyCardRepository:
    def __init__(self, database_url: str):
        self.engine = sqlalchemy.create_engine(
            database_url,
            pool_pre_ping=True,
            pool_recycle=1800,
            connect_args={"application_name": "heartheartart-bot"},
        )

    def save(self, card: LinkCard) -> None:
        with Session(self.engine) as session:
            session.add(
                LinkRecord(
                    link=card.link,
                    title=card.title,
                    description=card.description,
                    author=card.author,
                    screenshot=card.snapshot_path,
                )
            )
            session.commit()
