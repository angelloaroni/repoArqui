from collections.abc import Iterator

from sqlalchemy.orm import Session, sessionmaker

from shared.db import make_engine
from shared.settings import Settings

settings = Settings.from_env("booking-api")
engine = make_engine(settings.database_url)
SessionLocal = sessionmaker(engine, expire_on_commit=False)


def get_session() -> Iterator[Session]:
    with SessionLocal() as session:
        yield session
