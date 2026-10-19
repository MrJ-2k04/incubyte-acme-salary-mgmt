from collections.abc import Iterator

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.db import Base
from app.models import Country
from app.reference import COUNTRIES


@pytest.fixture
def session() -> Iterator[Session]:
    # One shared in-memory connection, so every session sees the same fresh database.
    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )
    Base.metadata.create_all(engine)
    factory = sessionmaker(bind=engine, expire_on_commit=False)
    with factory() as db:
        db.add_all(Country(**c._asdict()) for c in COUNTRIES)
        db.commit()
        yield db
    engine.dispose()
