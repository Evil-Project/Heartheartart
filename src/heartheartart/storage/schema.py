import sqlalchemy
from heartheartart.storage.models import Base

INDEX_SQL = """
CREATE INDEX IF NOT EXISTS idx_links_timestamp_id
    ON links (timestamp DESC, id DESC)
"""


def prepare_database(engine: sqlalchemy.Engine) -> None:
    Base.metadata.create_all(engine)
    with engine.begin() as connection:
        connection.execute(sqlalchemy.text(INDEX_SQL))
