from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db import get_session
from app.insights.schemas import CountryInsight, Distribution, JobTitleInsight, Summary
from app.insights.service import InsightsService

INSIGHTS_PATH = "/api/insights"

router = APIRouter(prefix=INSIGHTS_PATH, tags=["insights"])


def get_service(session: Annotated[Session, Depends(get_session)]) -> InsightsService:
    return InsightsService(session)


Service = Annotated[InsightsService, Depends(get_service)]


@router.get("/countries", response_model=list[CountryInsight])
def by_country(service: Service):
    return service.by_country()


@router.get("/countries/{country_code}/job-titles", response_model=list[JobTitleInsight])
def by_job_title(service: Service, country_code: str):
    return service.by_job_title(country_code)


@router.get("/summary", response_model=Summary)
def summary(service: Service):
    return service.summary()


@router.get("/distribution", response_model=Distribution)
def distribution(service: Service, country: str | None = None):
    return service.distribution(country)
