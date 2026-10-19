from app.employees.service import EmployeeService

from tests.factories import employee_data


def test_create_employee_saves_it_with_currency_from_country(session):
    employee = EmployeeService(session).create(employee_data(country_code="JP"))

    assert employee.id is not None
    assert employee.full_name == "Asha Rao"
    assert employee.currency == "JPY"
