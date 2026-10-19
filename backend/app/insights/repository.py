from sqlalchemy import ColumnElement, Row, Select, and_, case, func, select
from sqlalchemy.orm import Session

from app.models import Country, Employee

ACTIVE = Employee.archived_at.is_(None)
SALARY_USD = Employee.salary * Country.usd_rate


class InsightsRepository:
    def __init__(self, session: Session):
        self.session = session

    def by_country(self) -> list[Row]:
        headcount = func.count(Employee.id)
        query = (
            select(
                Country.code,
                Country.name,
                Country.currency,
                Country.usd_rate,
                headcount.label("headcount"),
                func.min(Employee.salary).label("min_salary"),
                func.max(Employee.salary).label("max_salary"),
                func.avg(Employee.salary).label("avg_salary"),
            )
            .join(Employee.country)
            .where(ACTIVE)
            .group_by(Country.code, Country.name, Country.currency, Country.usd_rate)
            .order_by(headcount.desc(), Country.code)
        )
        return list(self.session.execute(query))

    def by_job_title(self, country_code: str) -> list[Row]:
        average = func.avg(Employee.salary)
        query = (
            select(
                Employee.job_title,
                func.count(Employee.id).label("headcount"),
                func.min(Employee.salary).label("min_salary"),
                func.max(Employee.salary).label("max_salary"),
                average.label("avg_salary"),
            )
            .where(ACTIVE, Employee.country_code == country_code)
            .group_by(Employee.job_title)
            .order_by(average.desc(), Employee.job_title)
        )
        return list(self.session.execute(query))

    def summary(self) -> Row:
        query = (
            select(
                func.count(Employee.id).label("headcount"),
                func.count(func.distinct(Employee.country_code)).label("countries"),
                func.sum(SALARY_USD).label("total_usd"),
            )
            .join(Employee.country)
            .where(ACTIVE)
        )
        return self.session.execute(query).one()

    def value_range(self, value: ColumnElement, country_code: str | None) -> Row:
        query = select(func.count(), func.min(value), func.max(value)).join(Employee.country)
        return self.session.execute(self._scoped(query, country_code)).one()

    def bucket_counts(
        self, value: ColumnElement, bounds: list[tuple[float, float]], country_code: str | None
    ) -> list[int]:
        last = len(bounds) - 1
        # The top bucket includes its upper edge so the maximum is counted.
        counts = [
            func.sum(
                case((and_(value >= low, value <= high if i == last else value < high), 1), else_=0)
            )
            for i, (low, high) in enumerate(bounds)
        ]
        query = select(*counts).join(Employee.country)
        row = self.session.execute(self._scoped(query, country_code)).one()
        return [int(n or 0) for n in row]

    def currency_of(self, country_code: str) -> str | None:
        return self.session.scalar(select(Country.currency).where(Country.code == country_code))

    def _scoped(self, query: Select, country_code: str | None) -> Select:
        query = query.where(ACTIVE)
        if country_code:
            query = query.where(Employee.country_code == country_code)
        return query
