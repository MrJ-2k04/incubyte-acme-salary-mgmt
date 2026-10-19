from collections.abc import Callable
from datetime import UTC, datetime

from pydantic import ValidationError
from sqlalchemy.orm import Session

from app.employees.csv_io import read_csv, write_csv
from app.employees.repository import EmployeeRepository
from app.employees.schemas import (
    EmployeeCreate,
    EmployeePage,
    EmployeeQuery,
    EmployeeRead,
    EmployeeUpdate,
    ImportReport,
    RaisePreview,
    RaiseSample,
    RowError,
    SalaryAdjustment,
)
from app.models import Country, Employee

RAISE_SAMPLE_SIZE = 5


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

    def job_titles(self) -> dict[str, list[str]]:
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

    # This and raise_salaries are the only places pay changes, so history can be added here.
    def change_salary(self, employee: Employee, salary: int) -> None:
        employee.salary = salary

    # One UPDATE for the whole group. Row by row would cost a network trip each on a remote DB.
    def raise_salaries(self, adjustment: SalaryAdjustment) -> int:
        return self.repository.raise_salaries(adjustment.query(), adjustment.factor)

    def preview_raise(self, adjustment: SalaryAdjustment) -> RaisePreview:
        query, factor = adjustment.query(), adjustment.factor
        summary = self.repository.raise_summary(query, factor)
        sample = self.repository.raise_sample(query, factor, RAISE_SAMPLE_SIZE)
        return RaisePreview(
            headcount=summary.headcount,
            payroll_before_usd=round(summary.before_usd or 0),
            payroll_after_usd=round(summary.after_usd or 0),
            sample=[RaiseSample.model_validate(row._mapping) for row in sample],
        )

    def archive(self, employee_id: int) -> Employee:
        employee = self.get(employee_id)
        employee.archived_at = self.clock()
        return self.repository.save(employee)

    def restore(self, employee_id: int) -> Employee:
        employee = self.get(employee_id)
        employee.archived_at = None
        return self.repository.save(employee)

    def export_csv(self, query: EmployeeQuery) -> str:
        return write_csv(self.repository.search_all(query))

    def import_csv(self, text: str) -> ImportReport:
        known_countries = {country.code for country in self.repository.countries()}
        parsed: list[tuple[int, EmployeeCreate]] = []
        rejected: list[RowError] = []
        for line, raw in read_csv(text):
            try:
                parsed.append((line, EmployeeCreate.model_validate(raw)))
            except ValidationError as error:
                messages = [f"{e['loc'][-1]}: {e['msg']}" for e in error.errors()]
                rejected.append(RowError(line=line, errors=messages))
        # One query for every email in the file, not one per row.
        taken = self.repository.existing_emails({data.email.lower() for _, data in parsed})
        seen: set[str] = set()
        accepted: list[Employee] = []
        for line, data in parsed:
            email = data.email.lower()
            errors = []
            if data.country_code not in known_countries:
                errors.append(f"country_code: Unknown country {data.country_code}")
            if email in seen:
                errors.append("email: Repeated in this file")
            elif email in taken:
                errors.append("email: Already in use")
            seen.add(email)
            if errors:
                rejected.append(RowError(line=line, errors=errors))
            else:
                accepted.append(Employee(**data.model_dump() | {"email": email}))
        self.repository.add_all(accepted)
        rejected.sort(key=lambda row: row.line)
        return ImportReport(imported=len(accepted), rejected=rejected)

    def _check_country(self, code: str) -> None:
        if not self.repository.country_exists(code):
            raise UnknownCountryError(code)

    def _unused_email(self, email: str, employee_id: int | None = None) -> str:
        email = email.lower()
        if self.repository.email_taken(email, exclude_id=employee_id):
            raise DuplicateEmailError(email)
        return email
