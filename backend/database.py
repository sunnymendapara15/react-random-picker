from pathlib import Path

from sqlmodel import Session, SQLModel, create_engine

DB_PATH = Path(__file__).resolve().parent / "database.db"
SQLITE_URL = f"sqlite:///{DB_PATH}"
ENGINE = create_engine(
    SQLITE_URL,
    connect_args={"check_same_thread": False},
    echo=False,
)


def init_db() -> None:
    SQLModel.metadata.create_all(ENGINE)


def get_session() -> Session:
    with Session(ENGINE) as session:
        yield session
