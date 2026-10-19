from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.reference import Department

COUNTRY_CODE_PATTERN = r"^[A-Z]{2}$"


class EmployeeCreate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    full_name: str = Field(min_length=1, max_length=200)
    email: EmailStr
    job_title: str = Field(min_length=1, max_length=100)
    department: Department
    country_code: str = Field(pattern=COUNTRY_CODE_PATTERN)
    salary: int = Field(gt=0)
    hired_on: date


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
