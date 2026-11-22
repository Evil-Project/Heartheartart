import os
from dataclasses import dataclass

from dotenv import load_dotenv


def _required(name: str) -> str:
    value = os.getenv(name)
    if not value:
        raise RuntimeError(f"Missing environment variable {name}")
    return value


@dataclass(frozen=True)
class Settings:
    token: str
    db_name: str
    db_user: str
    db_password: str
    db_host_port: str
    cdn_base_url: str
    r2_bucket_name: str
    r2_endpoint_url: str
    r2_access_key_id: str
    r2_secret_access_key: str

    @classmethod
    def from_env(cls) -> "Settings":
        load_dotenv()
        return cls(
            token=_required("TOKEN"),
            db_name=_required("DB_NAME"),
            db_user=_required("DB_USER"),
            db_password=_required("DB_PASSWORD"),
            db_host_port=_required("DB_HOST_PORT"),
            cdn_base_url=_required("CDN_BASE_URL"),
            r2_bucket_name=_required("R2_BUCKET_NAME"),
            r2_endpoint_url=_required("R2_ENDPOINT_URL"),
            r2_access_key_id=_required("R2_ACCESS_KEY_ID"),
            r2_secret_access_key=_required("R2_SECRET_ACCESS_KEY"),
        )

    @property
    def database_url(self) -> str:
        return (
            f"postgresql+psycopg://{self.db_user}:{self.db_password}"
            f"@{self.db_host_port}/{self.db_name}"
        )
