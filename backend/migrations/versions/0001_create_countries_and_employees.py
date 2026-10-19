"""create countries and employees

Revision ID: 0001
Revises:
"""

from decimal import Decimal

import sqlalchemy as sa
from alembic import op

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None

# Frozen copy of the reference data, so later code changes never alter this migration.
COUNTRIES = [
    ("US", "United States", "USD", Decimal("1")),
    ("GB", "United Kingdom", "GBP", Decimal("1.27")),
    ("IN", "India", "INR", Decimal("0.012")),
    ("DE", "Germany", "EUR", Decimal("1.08")),
    ("FR", "France", "EUR", Decimal("1.08")),
    ("CA", "Canada", "CAD", Decimal("0.73")),
    ("AU", "Australia", "AUD", Decimal("0.66")),
    ("JP", "Japan", "JPY", Decimal("0.0067")),
    ("SG", "Singapore", "SGD", Decimal("0.74")),
    ("BR", "Brazil", "BRL", Decimal("0.18")),
]


def upgrade() -> None:
    countries = op.create_table(
        "countries",
        sa.Column("code", sa.String(length=2), primary_key=True),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("currency", sa.String(length=3), nullable=False),
        sa.Column("usd_rate", sa.Numeric(precision=12, scale=6), nullable=False),
    )
    op.create_table(
        "employees",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("full_name", sa.String(length=200), nullable=False),
        sa.Column("email", sa.String(length=254), nullable=False, unique=True),
        sa.Column("job_title", sa.String(length=100), nullable=False),
        sa.Column("department", sa.String(length=50), nullable=False),
        sa.Column(
            "country_code", sa.String(length=2), sa.ForeignKey("countries.code"), nullable=False
        ),
        sa.Column("salary", sa.Integer(), nullable=False),
        sa.Column("hired_on", sa.Date(), nullable=False),
        sa.Column("archived_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_employees_archived_at", "employees", ["archived_at"])
    op.create_index("ix_employees_country_code", "employees", ["country_code"])
    op.create_index("ix_employees_country_job_title", "employees", ["country_code", "job_title"])
    op.create_index("ix_employees_department", "employees", ["department"])
    op.create_index("ix_employees_job_title", "employees", ["job_title"])
    op.bulk_insert(
        countries,
        [
            dict(zip(("code", "name", "currency", "usd_rate"), row, strict=True))
            for row in COUNTRIES
        ],
    )


def downgrade() -> None:
    op.drop_table("employees")
    op.drop_table("countries")
