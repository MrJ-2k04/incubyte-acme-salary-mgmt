from fastapi import APIRouter
from pydantic import BaseModel, ConfigDict

from app.employees.router import Service
from app.reference import Department

REFERENCE_PATH = "/api/reference"

router = APIRouter(prefix=REFERENCE_PATH, tags=["reference"])


class CountryOption(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    code: str
    name: str
    currency: str


class ReferenceData(BaseModel):
    countries: list[CountryOption]
    departments: list[Department]
    job_titles: list[str]


@router.get("", response_model=ReferenceData)
def reference(service: Service):
    return ReferenceData(
        countries=[CountryOption.model_validate(c) for c in service.countries()],
        departments=list(Department),
        job_titles=service.job_titles(),
    )
