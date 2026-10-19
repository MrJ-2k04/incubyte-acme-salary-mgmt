from pydantic import BaseModel


class CountryInsight(BaseModel):
    country_code: str
    country_name: str
    currency: str
    headcount: int
    min_salary: int
    max_salary: int
    avg_salary: int
    avg_salary_usd: int


class JobTitleInsight(BaseModel):
    job_title: str
    headcount: int
    min_salary: int
    max_salary: int
    avg_salary: int


class Summary(BaseModel):
    headcount: int
    countries: int
    total_payroll_usd: int
    avg_salary_usd: int


class Bucket(BaseModel):
    lower: int
    upper: int
    count: int


class Distribution(BaseModel):
    currency: str
    buckets: list[Bucket]
