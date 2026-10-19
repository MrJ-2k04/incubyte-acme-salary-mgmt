from sqlalchemy.orm import Session

from app.insights.repository import SALARY_USD, InsightsRepository
from app.insights.schemas import Bucket, CountryInsight, Distribution, JobTitleInsight, Summary
from app.models import Employee

BUCKET_COUNT = 10
REPORTING_CURRENCY = "USD"


class InsightsService:
    def __init__(self, session: Session):
        self.repository = InsightsRepository(session)

    def by_country(self) -> list[CountryInsight]:
        return [
            CountryInsight(
                country_code=row.code,
                country_name=row.name,
                currency=row.currency,
                headcount=row.headcount,
                min_salary=row.min_salary,
                max_salary=row.max_salary,
                avg_salary=round(row.avg_salary),
                avg_salary_usd=round(float(row.avg_salary) * float(row.usd_rate)),
            )
            for row in self.repository.by_country()
        ]

    def by_job_title(self, country_code: str) -> list[JobTitleInsight]:
        return [
            JobTitleInsight(
                job_title=row.job_title,
                headcount=row.headcount,
                min_salary=row.min_salary,
                max_salary=row.max_salary,
                avg_salary=round(row.avg_salary),
            )
            for row in self.repository.by_job_title(country_code)
        ]

    def summary(self) -> Summary:
        row = self.repository.summary()
        total = round(row.total_usd or 0)
        average = round(total / row.headcount) if row.headcount else 0
        return Summary(
            headcount=row.headcount,
            countries=row.countries,
            total_payroll_usd=total,
            avg_salary_usd=average,
        )

    def distribution(self, country_code: str | None = None) -> Distribution:
        # One country stays in its own currency. The whole org is compared in USD.
        value = Employee.salary if country_code else SALARY_USD
        currency = self.repository.currency_of(country_code) if country_code else None
        currency = currency or REPORTING_CURRENCY
        count, low, high = self.repository.value_range(value, country_code)
        if not count:
            return Distribution(currency=currency, buckets=[])
        low, high = float(low), float(high)
        width = (high - low) / BUCKET_COUNT
        bounds = (
            [(low + i * width, low + (i + 1) * width) for i in range(BUCKET_COUNT)]
            if width
            else [(low, high)]
        )
        counts = self.repository.bucket_counts(value, bounds, country_code)
        buckets = [
            Bucket(lower=round(lower), upper=round(upper), count=n)
            for (lower, upper), n in zip(bounds, counts, strict=True)
        ]
        return Distribution(currency=currency, buckets=buckets)
