import pytest
from pydantic import ValidationError

from app.employees.router import ADJUSTMENTS_PATH
from app.employees.schemas import EmployeeQuery, SalaryAdjustment
from app.employees.service import EmployeeService
from app.reference import Department
from tests.factories import employee_data


@pytest.fixture
def service(session):
    service = EmployeeService(session)
    people = [
        ("Asha Rao", "IN", "Software Engineer", 2_000_000),
        ("Dev Patel", "IN", "Software Engineer", 3_000_000),
        ("Isha Nair", "IN", "Accountant", 1_000_000),
        ("Ben Clark", "US", "Software Engineer", 100_000),
        ("Old Hand", "IN", "Software Engineer", 1_500_000),
    ]
    for name, country, title, salary in people:
        service.create(
            employee_data(
                full_name=name,
                email=name.lower().replace(" ", ".") + "@acmecorp.com",
                country_code=country,
                job_title=title,
                department=Department.ENGINEERING,
                salary=salary,
            )
        )
    service.archive(service.list(EmployeeQuery(q="Old Hand")).items[0].id)
    return service


def salaries(service):
    page = service.list(EmployeeQuery(size=100, status="all"))
    return {e.full_name: e.salary for e in page.items}


def test_preview_counts_active_matches_and_payroll_change_in_usd(service):
    preview = service.preview_raise(
        SalaryAdjustment(percent=10, country="IN", job_title="Software Engineer")
    )

    assert preview.headcount == 2
    assert (preview.payroll_before_usd, preview.payroll_after_usd) == (60_000, 66_000)
    assert [(s.full_name, s.salary, s.new_salary) for s in preview.sample] == [
        ("Asha Rao", 2_000_000, 2_200_000),
        ("Dev Patel", 3_000_000, 3_300_000),
    ]


def test_preview_changes_nothing(service):
    before = salaries(service)

    service.preview_raise(SalaryAdjustment(percent=10))

    assert salaries(service) == before


def test_raise_changes_only_matching_active_employees_in_whole_units(service):
    updated = service.raise_salaries(SalaryAdjustment(percent=2.5, job_title="Software Engineer"))

    assert updated == 3
    assert salaries(service) == {
        "Asha Rao": 2_050_000,
        "Dev Patel": 3_075_000,
        "Isha Nair": 1_000_000,
        "Ben Clark": 102_500,
        "Old Hand": 1_500_000,
    }


def test_negative_percent_cuts_pay(service):
    service.raise_salaries(SalaryAdjustment(percent=-10, country="US"))

    assert salaries(service)["Ben Clark"] == 90_000


@pytest.mark.parametrize("percent", [-51, 101])
def test_percent_is_limited_to_a_sane_range(percent):
    with pytest.raises(ValidationError):
        SalaryAdjustment(percent=percent)


def test_adjustment_endpoints(client, service):
    body = {"percent": 10, "country": "US"}

    preview = client.post(f"{ADJUSTMENTS_PATH}/preview", json=body).json()
    applied = client.post(ADJUSTMENTS_PATH, json=body).json()

    assert preview["headcount"] == 1
    assert applied == {"updated": 1}
