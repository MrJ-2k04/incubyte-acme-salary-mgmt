from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import Country, Employee


class EmployeeRepository:
    def __init__(self, session: Session):
        self.session = session

    def add(self, employee: Employee) -> Employee:
        self.session.add(employee)
        self.session.commit()
        self.session.refresh(employee)
        return employee

    def country_exists(self, code: str) -> bool:
        return self.session.get(Country, code) is not None

    def email_taken(self, email: str) -> bool:
        query = select(Employee.id).where(func.lower(Employee.email) == email.lower())
        return self.session.scalar(query) is not None
