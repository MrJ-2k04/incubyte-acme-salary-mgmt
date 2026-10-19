import os
from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.db import Base, get_session
from app.main import app
from app.models import Country
from app.reference import COUNTRIES


# CI sets this to run the same tests on Postgres. Locally tests use in-memory SQLite.
TEST_DATABASE_URL = os.environ.get("TEST_DATABASE_URL")


def make_engine():
    if TEST_DATABASE_URL:
        return create_engine(TEST_DATABASE_URL)
    # One shared in-memory connection, so every session sees the same fresh database.
    return create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )


@pytest.fixture
def session() -> Iterator[Session]:
    engine = make_engine()
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
    factory = sessionmaker(bind=engine, expire_on_commit=False)
    with factory() as db:
        db.add_all(Country(**c._asdict()) for c in COUNTRIES)
        db.commit()
        yield db
    engine.dispose()


@pytest.fixture
def client(session) -> Iterator[TestClient]:
    app.dependency_overrides[get_session] = lambda: session
    yield TestClient(app)
    app.dependency_overrides.clear()
