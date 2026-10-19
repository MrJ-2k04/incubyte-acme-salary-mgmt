from sqlalchemy import Select, func, or_, select
from sqlalchemy.orm import Session

from app.employees.schemas import EmployeeQuery, EmployeeStatus, SortOrder
from app.models import Country, Employee


class EmployeeRepository:
    def __init__(self, session: Session):
        self.session = session

    def add(self, employee: Employee) -> Employee:
        self.session.add(employee)
        return self.save(employee)

    def save(self, employee: Employee) -> Employee:
        self.session.commit()
        self.session.refresh(employee)
        return employee

    def get(self, employee_id: int) -> Employee | None:
        return self.session.get(Employee, employee_id)

    def countries(self) -> list[Country]:
        return list(self.session.scalars(select(Country).order_by(Country.name)))

    def job_titles(self) -> dict[str, list[str]]:
        query = (
            select(Employee.department, Employee.job_title)
            .distinct()
            .order_by(Employee.department, Employee.job_title)
        )
        titles: dict[str, list[str]] = {}
        for department, title in self.session.execute(query):
            titles.setdefault(department, []).append(title)
        return titles

    def country_exists(self, code: str) -> bool:
        return self.session.get(Country, code) is not None

    def email_taken(self, email: str, exclude_id: int | None = None) -> bool:
        query = select(Employee.id).where(func.lower(Employee.email) == email.lower())
        if exclude_id is not None:
            query = query.where(Employee.id != exclude_id)
        return self.session.scalar(query) is not None

    def search(self, query: EmployeeQuery) -> tuple[list[Employee], int]:
        total = self.session.scalar(self._filtered(select(func.count(Employee.id)), query))
        rows = self.session.scalars(
            self._ordered(query).offset((query.page - 1) * query.size).limit(query.size)
        )
        return list(rows), total

    def search_all(self, query: EmployeeQuery) -> list[Employee]:
        return list(self.session.scalars(self._ordered(query)))

    def add_all(self, employees: list[Employee]) -> None:
        self.session.add_all(employees)
        self.session.commit()

    def existing_emails(self, emails: set[str]) -> set[str]:
        query = select(func.lower(Employee.email)).where(func.lower(Employee.email).in_(emails))
        return set(self.session.scalars(query))

    def _ordered(self, query: EmployeeQuery) -> Select:
        column = getattr(Employee, query.sort)
        ordering = column.desc() if query.order == SortOrder.DESC else column.asc()
        # Id breaks ties so paging never repeats or skips a row.
        return self._filtered(select(Employee), query).order_by(ordering, Employee.id)

    def _filtered(self, statement: Select, query: EmployeeQuery) -> Select:
        if query.status == EmployeeStatus.ACTIVE:
            statement = statement.where(Employee.archived_at.is_(None))
        if query.status == EmployeeStatus.ARCHIVED:
            statement = statement.where(Employee.archived_at.is_not(None))
        if query.country:
            statement = statement.where(Employee.country_code == query.country)
        if query.job_title:
            statement = statement.where(Employee.job_title == query.job_title)
        if query.department:
            statement = statement.where(Employee.department == query.department)
        if query.q:
            pattern = f"%{query.q.lower()}%"
            statement = statement.where(
                or_(
                    func.lower(Employee.full_name).like(pattern),
                    func.lower(Employee.email).like(pattern),
                )
            )
        return statement
