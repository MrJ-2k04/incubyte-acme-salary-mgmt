import argparse
import random
import time
from datetime import date, datetime, timedelta
from decimal import Decimal
from typing import NamedTuple

from sqlalchemy import delete, insert
from sqlalchemy.orm import Session

from app.db import SessionLocal
from app.models import Employee
from app.reference import COUNTRIES, Department

DEFAULT_COUNT = 10_000
DEFAULT_SEED = 42
BATCH_SIZE = 1_000
EMAIL_DOMAIN = "acmecorp.com"
ARCHIVED_SHARE = 0.03
SALARY_ROUNDING = 1_000
HIRE_RANGE = (date(2010, 1, 1), date(2026, 6, 30))
ARCHIVED_AT = datetime(2026, 6, 30)


class Role(NamedTuple):
    title: str
    department: Department
    usd_base: int


ROLES = (
    Role("Software Engineer", Department.ENGINEERING, 120_000),
    Role("Senior Software Engineer", Department.ENGINEERING, 160_000),
    Role("Engineering Manager", Department.ENGINEERING, 190_000),
    Role("QA Engineer", Department.ENGINEERING, 95_000),
    Role("Product Manager", Department.PRODUCT, 150_000),
    Role("Product Designer", Department.DESIGN, 115_000),
    Role("UX Researcher", Department.DESIGN, 105_000),
    Role("Account Executive", Department.SALES, 100_000),
    Role("Sales Manager", Department.SALES, 140_000),
    Role("Marketing Specialist", Department.MARKETING, 80_000),
    Role("Financial Analyst", Department.FINANCE, 95_000),
    Role("Accountant", Department.FINANCE, 75_000),
    Role("HR Generalist", Department.HR, 70_000),
    Role("Recruiter", Department.HR, 75_000),
    Role("Operations Manager", Department.OPERATIONS, 110_000),
    Role("Support Specialist", Department.SUPPORT, 55_000),
    Role("Legal Counsel", Department.LEGAL, 170_000),
)
ROLE_WEIGHTS = (18, 12, 4, 6, 6, 5, 2, 8, 3, 6, 4, 4, 3, 3, 4, 10, 2)

# Share of headcount, and local pay level relative to the US.
COUNTRY_WEIGHTS = {
    "US": 25,
    "IN": 25,
    "GB": 10,
    "DE": 8,
    "CA": 7,
    "FR": 6,
    "AU": 5,
    "JP": 5,
    "BR": 5,
    "SG": 4,
}
PAY_LEVEL = {
    "US": 1.0,
    "GB": 0.75,
    "IN": 0.25,
    "DE": 0.8,
    "FR": 0.7,
    "CA": 0.8,
    "AU": 0.8,
    "JP": 0.65,
    "SG": 0.85,
    "BR": 0.35,
}

FIRST_NAMES = (
    "Aarav",
    "Aisha",
    "Akira",
    "Amelia",
    "Ana",
    "Arjun",
    "Ben",
    "Camille",
    "Carlos",
    "Chloe",
    "Daniel",
    "Diya",
    "Elena",
    "Emma",
    "Ethan",
    "Felix",
    "Grace",
    "Hana",
    "Hiro",
    "Isabel",
    "Ishaan",
    "Jack",
    "Julia",
    "Kavya",
    "Leon",
    "Liam",
    "Lucas",
    "Maya",
    "Mei",
    "Mia",
    "Noah",
    "Olivia",
    "Omar",
    "Priya",
    "Rafael",
    "Riya",
    "Sakura",
    "Sofia",
    "Tom",
    "Zara",
)
LAST_NAMES = (
    "Anderson",
    "Bauer",
    "Brown",
    "Chen",
    "Costa",
    "Dubois",
    "Fischer",
    "Garcia",
    "Gupta",
    "Ito",
    "Iyer",
    "Kim",
    "Kumar",
    "Lee",
    "Martin",
    "Mehta",
    "Meyer",
    "Moreau",
    "Nair",
    "Nguyen",
    "Oliveira",
    "Patel",
    "Rao",
    "Reddy",
    "Santos",
    "Sato",
    "Schmidt",
    "Shah",
    "Silva",
    "Singh",
    "Smith",
    "Suzuki",
    "Tan",
    "Taylor",
    "Wang",
    "Weber",
    "Williams",
    "Wilson",
    "Wong",
    "Yamamoto",
)

USD_RATES = {c.code: c.usd_rate for c in COUNTRIES}


def generate_employees(count: int, seed: int = DEFAULT_SEED) -> list[dict]:
    rng = random.Random(seed)
    codes = list(COUNTRY_WEIGHTS)
    country_weights = list(COUNTRY_WEIGHTS.values())
    hire_days = (HIRE_RANGE[1] - HIRE_RANGE[0]).days
    rows = []
    for index in range(count):
        first, last = rng.choice(FIRST_NAMES), rng.choice(LAST_NAMES)
        country = rng.choices(codes, country_weights)[0]
        role = rng.choices(ROLES, ROLE_WEIGHTS)[0]
        usd = role.usd_base * PAY_LEVEL[country] * rng.uniform(0.85, 1.25)
        local = Decimal(str(usd)) / USD_RATES[country]
        archived = rng.random() < ARCHIVED_SHARE
        rows.append(
            {
                "full_name": f"{first} {last}",
                # Index keeps emails unique even when names repeat.
                "email": f"{first}.{last}.{index}@{EMAIL_DOMAIN}".lower(),
                "job_title": role.title,
                "department": role.department.value,
                "country_code": country,
                "salary": max(SALARY_ROUNDING, round(local / SALARY_ROUNDING) * SALARY_ROUNDING),
                "hired_on": HIRE_RANGE[0] + timedelta(days=rng.randrange(hire_days)),
                "archived_at": ARCHIVED_AT if archived else None,
            }
        )
    return rows


def seed(session: Session, count: int = DEFAULT_COUNT, batch_size: int = BATCH_SIZE) -> None:
    session.execute(delete(Employee))
    rows = generate_employees(count)
    for start in range(0, len(rows), batch_size):
        # One multi-row INSERT per batch. Row-by-row sends cost a network trip each on a remote DB.
        session.execute(insert(Employee).values(rows[start : start + batch_size]))
    session.commit()


def main() -> None:
    parser = argparse.ArgumentParser(description="Replace all employees with generated ones.")
    parser.add_argument("--count", type=int, default=DEFAULT_COUNT)
    args = parser.parse_args()
    started = time.perf_counter()
    with SessionLocal() as session:
        seed(session, args.count)
    print(f"Seeded {args.count} employees in {time.perf_counter() - started:.2f}s")


if __name__ == "__main__":
    main()
