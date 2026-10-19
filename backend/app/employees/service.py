from collections.abc import Callable
from datetime import UTC, datetime

from sqlalchemy.orm import Session

from app.employees.repository import EmployeeRepository
from app.employees.schemas import (
    EmployeeCreate,
    EmployeePage,
    EmployeeQuery,
    EmployeeRead,
    EmployeeUpdate,
)
from app.models import Country, Employee


class EmployeeNotFoundError(Exception):
    pass


class UnknownCountryError(Exception):
    pass


class DuplicateEmailError(Exception):
    pass


def utc_now() -> datetime:
    return datetime.now(UTC).replace(tzinfo=None)


class EmployeeService:
    def __init__(self, session: Session, clock: Callable[[], datetime] = utc_now):
        self.repository = EmployeeRepository(session)
        self.clock = clock

    def create(self, data: EmployeeCreate) -> Employee:
        self._check_country(data.country_code)
        email = self._unused_email(data.email)
        return self.repository.add(Employee(**data.model_dump() | {"email": email}))

    def countries(self) -> list[Country]:
        return self.repository.countries()

    def job_titles(self) -> list[str]:
        return self.repository.job_titles()

    def get(self, employee_id: int) -> Employee:
        employee = self.repository.get(employee_id)
        if employee is None:
            raise EmployeeNotFoundError(employee_id)
        return employee

    def list(self, query: EmployeeQuery) -> EmployeePage:
        rows, total = self.repository.search(query)
        items = [EmployeeRead.model_validate(row) for row in rows]
        return EmployeePage(items=items, total=total, page=query.page, size=query.size)

    def update(self, employee_id: int, data: EmployeeUpdate) -> Employee:
        employee = self.get(employee_id)
        changes = data.model_dump(exclude_unset=True)
        if "country_code" in changes:
            self._check_country(changes["country_code"])
        if "email" in changes:
            changes["email"] = self._unused_email(changes["email"], employee.id)
        if "salary" in changes:
            self.change_salary(employee, changes.pop("salary"))
        for field, value in changes.items():
            setattr(employee, field, value)
        return self.repository.save(employee)

    # The only place a salary changes, so history can be added here if HR needs it.
    def change_salary(self, employee: Employee, salary: int) -> None:
        employee.salary = salary

    def archive(self, employee_id: int) -> Employee:
        employee = self.get(employee_id)
        employee.archived_at = self.clock()
        return self.repository.save(employee)

    def restore(self, employee_id: int) -> Employee:
        employee = self.get(employee_id)
        employee.archived_at = None
        return self.repository.save(employee)

    def _check_country(self, code: str) -> None:
        if not self.repository.country_exists(code):
            raise UnknownCountryError(code)

    def _unused_email(self, email: str, employee_id: int | None = None) -> str:
        email = email.lower()
        if self.repository.email_taken(email, exclude_id=employee_id):
            raise DuplicateEmailError(email)
        return email
