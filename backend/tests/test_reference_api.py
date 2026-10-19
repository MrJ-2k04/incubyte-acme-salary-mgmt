from app.reference import COUNTRIES, Department
from app.reference_router import REFERENCE_PATH
from tests.factories import employee_data


def test_reference_lists_countries_departments_and_job_titles_in_use(client, session):
    from app.employees.service import EmployeeService

    service = EmployeeService(session)
    service.create(employee_data(email="a@acmecorp.com", job_title="Designer"))
    service.create(employee_data(email="b@acmecorp.com", job_title="Accountant"))
    service.create(employee_data(email="c@acmecorp.com", job_title="Designer"))

    body = client.get(REFERENCE_PATH).json()

    assert len(body["countries"]) == len(COUNTRIES)
    assert body["countries"][0] == {"code": "AU", "name": "Australia", "currency": "AUD"}
    assert body["departments"] == [d.value for d in Department]
    assert body["job_titles"] == ["Accountant", "Designer"]
