from sqlalchemy.orm import Session

from app.employees.repository import EmployeeRepository
from app.employees.schemas import EmployeeCreate
from app.models import Employee


class UnknownCountryError(Exception):
    pass


class DuplicateEmailError(Exception):
    pass


class EmployeeService:
    def __init__(self, session: Session):
        self.repository = EmployeeRepository(session)

    def create(self, data: EmployeeCreate) -> Employee:
        if not self.repository.country_exists(data.country_code):
            raise UnknownCountryError(data.country_code)
        email = data.email.lower()
        if self.repository.email_taken(email):
            raise DuplicateEmailError(email)
        return self.repository.add(Employee(**data.model_dump() | {"email": email}))
