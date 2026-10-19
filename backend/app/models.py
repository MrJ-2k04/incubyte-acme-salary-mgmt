from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import Date, DateTime, ForeignKey, Index, Integer, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


class Country(Base):
    __tablename__ = "countries"

    code: Mapped[str] = mapped_column(String(2), primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    currency: Mapped[str] = mapped_column(String(3))
    usd_rate: Mapped[Decimal] = mapped_column(Numeric(12, 6))


class Employee(Base):
    __tablename__ = "employees"
    __table_args__ = (Index("ix_employees_country_job_title", "country_code", "job_title"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    full_name: Mapped[str] = mapped_column(String(200))
    email: Mapped[str] = mapped_column(String(254), unique=True)
    job_title: Mapped[str] = mapped_column(String(100), index=True)
    department: Mapped[str] = mapped_column(String(50), index=True)
    country_code: Mapped[str] = mapped_column(ForeignKey("countries.code"), index=True)
    salary: Mapped[int] = mapped_column(Integer)
    hired_on: Mapped[date] = mapped_column(Date)
    archived_at: Mapped[datetime | None] = mapped_column(DateTime, index=True, default=None)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )

    country: Mapped[Country] = relationship(lazy="joined")

    @property
    def currency(self) -> str:
        return self.country.currency
