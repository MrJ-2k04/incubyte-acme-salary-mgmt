from sqlalchemy.orm import Session

from app.employees.repository import EmployeeRepository
from app.employees.schemas import EmployeeCreate
from app.models import Employee


class EmployeeService:
    def __init__(self, session: Session):
        self.repository = EmployeeRepository(session)

    def create(self, data: EmployeeCreate) -> Employee:
        return self.repository.add(Employee(**data.model_dump()))
