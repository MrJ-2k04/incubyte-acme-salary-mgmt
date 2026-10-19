from datetime import date, datetime
from enum import StrEnum

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.reference import Department

COUNTRY_CODE_PATTERN = r"^[A-Z]{2}$"
MAX_PAGE_SIZE = 100
DEFAULT_PAGE_SIZE = 25


class SortField(StrEnum):
    FULL_NAME = "full_name"
    EMAIL = "email"
    JOB_TITLE = "job_title"
    DEPARTMENT = "department"
    COUNTRY = "country_code"
    SALARY = "salary"
    HIRED_ON = "hired_on"


class EmployeeStatus(StrEnum):
    ACTIVE = "active"
    ARCHIVED = "archived"
    ALL = "all"


class SortOrder(StrEnum):
    ASC = "asc"
    DESC = "desc"


class EmployeeCreate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    full_name: str = Field(min_length=1, max_length=200)
    email: EmailStr
    job_title: str = Field(min_length=1, max_length=100)
    department: Department
    country_code: str = Field(pattern=COUNTRY_CODE_PATTERN)
    salary: int = Field(gt=0)
    hired_on: date


class EmployeeUpdate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    full_name: str | None = Field(default=None, min_length=1, max_length=200)
    email: EmailStr | None = None
    job_title: str | None = Field(default=None, min_length=1, max_length=100)
    department: Department | None = None
    country_code: str | None = Field(default=None, pattern=COUNTRY_CODE_PATTERN)
    salary: int | None = Field(default=None, gt=0)
    hired_on: date | None = None


class EmployeeRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    email: str
    job_title: str
    department: Department
    country_code: str
    currency: str
    salary: int
    hired_on: date
    archived_at: datetime | None


class EmployeeQuery(BaseModel):
    q: str | None = None
    country: str | None = None
    job_title: str | None = None
    department: Department | None = None
    status: EmployeeStatus = EmployeeStatus.ACTIVE
    sort: SortField = SortField.FULL_NAME
    order: SortOrder = SortOrder.ASC
    page: int = Field(default=1, ge=1)
    size: int = Field(default=DEFAULT_PAGE_SIZE, ge=1, le=MAX_PAGE_SIZE)


class EmployeePage(BaseModel):
    items: list[EmployeeRead]
    total: int
    page: int
    size: int


class RowError(BaseModel):
    line: int
    errors: list[str]


class ImportReport(BaseModel):
    imported: int
    rejected: list[RowError]


class SalaryAdjustment(BaseModel):
    # A bigger swing is far more likely a typo than a real pay decision.
    percent: float = Field(ge=-50, le=100)
    q: str | None = None
    country: str | None = None
    job_title: str | None = None
    department: Department | None = None

    def query(self) -> EmployeeQuery:
        # Only people still on payroll get a raise.
        filters = self.model_dump(exclude={"percent"})
        return EmployeeQuery(**filters, status=EmployeeStatus.ACTIVE)

    @property
    def factor(self) -> float:
        return 1 + self.percent / 100


class RaiseSample(BaseModel):
    full_name: str
    currency: str
    salary: int
    new_salary: int


class RaisePreview(BaseModel):
    headcount: int
    payroll_before_usd: int
    payroll_after_usd: int
    sample: list[RaiseSample]


class RaiseResult(BaseModel):
    updated: int
