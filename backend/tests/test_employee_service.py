import pytest

from app.employees.service import DuplicateEmailError, EmployeeService, UnknownCountryError
from tests.factories import employee_data


def test_create_employee_saves_it_with_currency_from_country(session):
    employee = EmployeeService(session).create(employee_data(country_code="JP"))

    assert employee.id is not None
    assert employee.full_name == "Asha Rao"
    assert employee.currency == "JPY"


def test_create_employee_rejects_unknown_country(session):
    with pytest.raises(UnknownCountryError):
        EmployeeService(session).create(employee_data(country_code="ZZ"))


def test_create_employee_rejects_email_already_in_use_ignoring_case(session):
    service = EmployeeService(session)
    service.create(employee_data(email="asha.rao@acmecorp.com"))

    with pytest.raises(DuplicateEmailError):
        service.create(employee_data(email="Asha.Rao@AcmeCorp.com"))


def test_create_employee_stores_email_in_lowercase(session):
    employee = EmployeeService(session).create(employee_data(email="Asha.Rao@AcmeCorp.com"))

    assert employee.email == "asha.rao@acmecorp.com"
