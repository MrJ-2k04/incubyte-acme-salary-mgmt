from datetime import date

from app.employees.schemas import EmployeeCreate
from app.reference import Department


def employee_data(**overrides) -> EmployeeCreate:
    fields = {
        "full_name": "Asha Rao",
        "email": "asha.rao@acmecorp.com",
        "job_title": "Software Engineer",
        "department": Department.ENGINEERING,
        "country_code": "IN",
        "salary": 2_400_000,
        "hired_on": date(2022, 4, 1),
    }
    return EmployeeCreate(**(fields | overrides))
