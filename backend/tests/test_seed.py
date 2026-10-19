import re
from collections import Counter

from sqlalchemy import func, select

from app.models import Employee
from app.reference import COUNTRIES, Department
from app.seed import generate_employees, seed
from app.seed_names import NAME_POOLS, NAME_REGION

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


def test_names_fit_each_employee_country():
    for row in generate_employees(2_000, seed=7):
        pool = NAME_POOLS[NAME_REGION[row["country_code"]]]
        first, last = row["full_name"].split(" ", 1)
        assert first in pool.first and last in pool.last


def test_every_name_is_unique_in_a_full_seed():
    names = Counter(row["full_name"] for row in generate_employees(10_000))

    assert max(names.values()) == 1


def test_emails_look_like_company_addresses():
    for row in generate_employees(2_000, seed=7):
        assert re.fullmatch(r"[a-z]+\.[a-z]+\d*@acmecorp\.com", row["email"])
