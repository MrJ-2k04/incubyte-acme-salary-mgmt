from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.employees.router import router as employees_router
from app.employees.service import (
    DuplicateEmailError,
    EmployeeNotFoundError,
    UnknownCountryError,
)
from app.insights.router import router as insights_router

HEALTH_PATH = "/health"

ERROR_RESPONSES = {
    EmployeeNotFoundError: (status.HTTP_404_NOT_FOUND, "Employee not found"),
    UnknownCountryError: (status.HTTP_422_UNPROCESSABLE_CONTENT, "Unknown country"),
    DuplicateEmailError: (status.HTTP_409_CONFLICT, "Email is already in use"),
}

app = FastAPI(title="ACME Salary Management API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(employees_router)
app.include_router(insights_router)


def domain_error_handler(request: Request, error: Exception) -> JSONResponse:
    code, message = ERROR_RESPONSES[type(error)]
    return JSONResponse(status_code=code, content={"detail": message})


for error_type in ERROR_RESPONSES:
    app.add_exception_handler(error_type, domain_error_handler)


# Never touches the database, so the keep-alive pinger does not wake Neon.
@app.get(HEALTH_PATH)
def health() -> dict[str, str]:
    return {"status": "ok"}
