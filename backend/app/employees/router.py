from typing import Annotated

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.db import get_session
from app.employees.schemas import (
    EmployeeCreate,
    EmployeePage,
    EmployeeQuery,
    EmployeeRead,
    EmployeeUpdate,
)
from app.employees.service import EmployeeService

EMPLOYEES_PATH = "/api/employees"

router = APIRouter(prefix=EMPLOYEES_PATH, tags=["employees"])


def get_service(session: Annotated[Session, Depends(get_session)]) -> EmployeeService:
    return EmployeeService(session)


Service = Annotated[EmployeeService, Depends(get_service)]


@router.get("", response_model=EmployeePage)
def list_employees(service: Service, query: Annotated[EmployeeQuery, Query()]):
    return service.list(query)


@router.post("", response_model=EmployeeRead, status_code=status.HTTP_201_CREATED)
def create_employee(service: Service, data: EmployeeCreate):
    return service.create(data)


@router.get("/{employee_id}", response_model=EmployeeRead)
def get_employee(service: Service, employee_id: int):
    return service.get(employee_id)


@router.patch("/{employee_id}", response_model=EmployeeRead)
def update_employee(service: Service, employee_id: int, data: EmployeeUpdate):
    return service.update(employee_id, data)


@router.post("/{employee_id}/archive", response_model=EmployeeRead)
def archive_employee(service: Service, employee_id: int):
    return service.archive(employee_id)


@router.post("/{employee_id}/restore", response_model=EmployeeRead)
def restore_employee(service: Service, employee_id: int):
    return service.restore(employee_id)
