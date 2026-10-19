from app.employees.service import EmployeeService
from app.reference import COUNTRIES, Department
from app.reference_router import REFERENCE_PATH
from tests.factories import employee_data


def test_reference_lists_countries_departments_and_job_titles_in_use(client, session):
    service = EmployeeService(session)
    people = [
        ("Designer", Department.DESIGN),
        ("Accountant", Department.FINANCE),
        ("Designer", Department.DESIGN),
        ("Analyst", Department.FINANCE),
    ]
    for number, (title, department) in enumerate(people):
        email = f"person{number}@acmecorp.com"
        service.create(employee_data(email=email, job_title=title, department=department))

    body = client.get(REFERENCE_PATH).json()

    assert len(body["countries"]) == len(COUNTRIES)
    assert body["countries"][0] == {"code": "AU", "name": "Australia", "currency": "AUD"}
    assert body["departments"] == [d.value for d in Department]
    assert body["job_titles"] == {"Design": ["Designer"], "Finance": ["Accountant", "Analyst"]}
