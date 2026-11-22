from datetime import datetime

import sqlalchemy
from sqlalchemy.orm import declarative_base

Base = declarative_base()


class LinkRecord(Base):
    __tablename__ = "links"
    id = sqlalchemy.Column(
        sqlalchemy.Integer, primary_key=True, nullable=True, autoincrement=True
    )
    link = sqlalchemy.Column(sqlalchemy.Text, nullable=True)
    title = sqlalchemy.Column(sqlalchemy.Text, nullable=True)
    description = sqlalchemy.Column(sqlalchemy.Text, nullable=True)
    author = sqlalchemy.Column(sqlalchemy.Text, nullable=True)
    screenshot = sqlalchemy.Column(sqlalchemy.Text, nullable=True)
    timestamp = sqlalchemy.Column(
        sqlalchemy.DateTime, nullable=True, default=datetime.now
    )
