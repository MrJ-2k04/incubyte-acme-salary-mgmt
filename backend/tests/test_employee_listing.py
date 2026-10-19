import pytest
from pydantic import ValidationError

from app.employees.schemas import EmployeeQuery, EmployeeStatus, SortField, SortOrder
from app.employees.service import EmployeeService
from app.reference import Department
from tests.factories import employee_data


@pytest.fixture
def service(session):
    service = EmployeeService(session)
    people = [
        ("Asha Rao", "IN", "Software Engineer", Department.ENGINEERING, 2_400_000),
        ("Ben Clark", "US", "Software Engineer", Department.ENGINEERING, 150_000),
        ("Chloe Martin", "FR", "Designer", Department.DESIGN, 60_000),
        ("Dev Patel", "IN", "Accountant", Department.FINANCE, 1_200_000),
        ("Emma Stone", "US", "Designer", Department.DESIGN, 110_000),
    ]
    for name, country, title, department, salary in people:
        email = name.lower().replace(" ", ".") + "@acmecorp.com"
        service.create(
            employee_data(
                full_name=name,
                email=email,
                country_code=country,
                job_title=title,
                department=department,
                salary=salary,
            )
        )
    return service


def names(page):
    return [e.full_name for e in page.items]


def test_list_returns_one_page_and_the_total_count(service):
    page = service.list(EmployeeQuery(page=2, size=2))

    assert page.total == 5
    assert names(page) == ["Chloe Martin", "Dev Patel"]


def test_list_sorts_by_name_by_default(service):
    assert names(service.list(EmployeeQuery()))[0] == "Asha Rao"


def test_list_sorts_by_the_chosen_field_and_order(service):
    page = service.list(EmployeeQuery(sort=SortField.SALARY, order=SortOrder.DESC))

    assert names(page)[:2] == ["Asha Rao", "Dev Patel"]


def test_list_filters_by_country_job_title_and_department(service):
    assert names(service.list(EmployeeQuery(country="IN"))) == ["Asha Rao", "Dev Patel"]
    assert names(service.list(EmployeeQuery(job_title="Designer"))) == [
        "Chloe Martin",
        "Emma Stone",
    ]
    assert names(service.list(EmployeeQuery(department=Department.FINANCE))) == ["Dev Patel"]


def test_list_searches_name_and_email_ignoring_case(service):
    assert names(service.list(EmployeeQuery(q="EMMA"))) == ["Emma Stone"]
    assert names(service.list(EmployeeQuery(q="ben.clark@"))) == ["Ben Clark"]


def test_list_shows_active_employees_unless_another_status_is_asked(service):
    archived = service.list(EmployeeQuery(q="Ben")).items[0]
    service.archive(archived.id)

    assert "Ben Clark" not in names(service.list(EmployeeQuery()))
    assert names(service.list(EmployeeQuery(status=EmployeeStatus.ARCHIVED))) == ["Ben Clark"]
    assert service.list(EmployeeQuery(status=EmployeeStatus.ALL)).total == 5


def test_list_page_size_is_capped_at_100():
    with pytest.raises(ValidationError):
        EmployeeQuery(size=101)
