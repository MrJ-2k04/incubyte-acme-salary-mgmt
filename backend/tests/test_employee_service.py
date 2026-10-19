from datetime import datetime

import pytest

from app.employees.schemas import EmployeeUpdate
from app.employees.service import (
    DuplicateEmailError,
    EmployeeNotFoundError,
    EmployeeService,
    UnknownCountryError,
)
from tests.factories import employee_data

FIXED_NOW = datetime(2026, 1, 15, 9, 30)


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


def test_get_employee_returns_the_saved_employee(session):
    service = EmployeeService(session)
    created = service.create(employee_data())

    assert service.get(created.id).email == created.email


def test_get_employee_raises_not_found_for_unknown_id(session):
    with pytest.raises(EmployeeNotFoundError):
        EmployeeService(session).get(999)


def test_update_employee_changes_only_the_given_fields(session):
    service = EmployeeService(session)
    created = service.create(employee_data())

    updated = service.update(
        created.id, EmployeeUpdate(job_title="Staff Engineer", salary=3_000_000)
    )

    assert updated.job_title == "Staff Engineer"
    assert updated.salary == 3_000_000
    assert updated.full_name == "Asha Rao"


def test_update_employee_rejects_email_of_another_employee(session):
    service = EmployeeService(session)
    service.create(employee_data(email="taken@acmecorp.com"))
    created = service.create(employee_data(email="asha.rao@acmecorp.com"))

    with pytest.raises(DuplicateEmailError):
        service.update(created.id, EmployeeUpdate(email="TAKEN@acmecorp.com"))


def test_update_employee_keeps_own_email(session):
    service = EmployeeService(session)
    created = service.create(employee_data())

    updated = service.update(created.id, EmployeeUpdate(email=created.email, full_name="Asha R."))

    assert updated.full_name == "Asha R."


def test_update_employee_rejects_unknown_country(session):
    service = EmployeeService(session)
    created = service.create(employee_data())

    with pytest.raises(UnknownCountryError):
        service.update(created.id, EmployeeUpdate(country_code="ZZ"))


def test_archive_employee_records_when_it_happened(session):
    service = EmployeeService(session, clock=lambda: FIXED_NOW)
    created = service.create(employee_data())

    assert service.archive(created.id).archived_at == FIXED_NOW


def test_restore_employee_clears_archive(session):
    service = EmployeeService(session, clock=lambda: FIXED_NOW)
    created = service.create(employee_data())
    service.archive(created.id)

    assert service.restore(created.id).archived_at is None
