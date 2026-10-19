from sqlalchemy import func, select

from app.models import Employee
from app.reference import COUNTRIES, Department
from app.seed import generate_employees, seed

COUNTRY_CODES = {c.code for c in COUNTRIES}


def test_generated_employees_are_the_same_on_every_run():
    assert generate_employees(50, seed=7) == generate_employees(50, seed=7)


def test_generated_employees_are_valid_and_have_unique_emails():
    rows = generate_employees(500, seed=7)

    assert len({row["email"] for row in rows}) == 500
    assert all(row["country_code"] in COUNTRY_CODES for row in rows)
    assert all(row["department"] in set(Department) for row in rows)
    assert all(row["salary"] > 0 for row in rows)


def test_seed_inserts_the_requested_number_of_employees(session):
    seed(session, count=1200, batch_size=500)

    assert session.scalar(select(func.count(Employee.id))) == 1200


def test_seed_replaces_existing_employees(session):
    seed(session, count=10)
    seed(session, count=20)

    assert session.scalar(select(func.count(Employee.id))) == 20
