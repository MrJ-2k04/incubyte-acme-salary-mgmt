from decimal import Decimal
from enum import StrEnum
from typing import NamedTuple


class CountryInfo(NamedTuple):
    code: str
    name: str
    currency: str
    usd_rate: Decimal


# Fixed reporting rates (1 unit of currency in USD), not live market rates.
COUNTRIES = (
    CountryInfo("US", "United States", "USD", Decimal("1")),
    CountryInfo("GB", "United Kingdom", "GBP", Decimal("1.27")),
    CountryInfo("IN", "India", "INR", Decimal("0.012")),
    CountryInfo("DE", "Germany", "EUR", Decimal("1.08")),
    CountryInfo("FR", "France", "EUR", Decimal("1.08")),
    CountryInfo("CA", "Canada", "CAD", Decimal("0.73")),
    CountryInfo("AU", "Australia", "AUD", Decimal("0.66")),
    CountryInfo("JP", "Japan", "JPY", Decimal("0.0067")),
    CountryInfo("SG", "Singapore", "SGD", Decimal("0.74")),
    CountryInfo("BR", "Brazil", "BRL", Decimal("0.18")),
)


class Department(StrEnum):
    ENGINEERING = "Engineering"
    PRODUCT = "Product"
    DESIGN = "Design"
    SALES = "Sales"
    MARKETING = "Marketing"
    FINANCE = "Finance"
    HR = "HR"
    OPERATIONS = "Operations"
    SUPPORT = "Support"
    LEGAL = "Legal"
