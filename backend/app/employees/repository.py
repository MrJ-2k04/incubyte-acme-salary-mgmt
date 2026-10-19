from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import Country, Employee


class EmployeeRepository:
    def __init__(self, session: Session):
        self.session = session

    def add(self, employee: Employee) -> Employee:
        self.session.add(employee)
        return self.save(employee)

    def save(self, employee: Employee) -> Employee:
        self.session.commit()
        self.session.refresh(employee)
        return employee

    def get(self, employee_id: int) -> Employee | None:
        return self.session.get(Employee, employee_id)

    def country_exists(self, code: str) -> bool:
        return self.session.get(Country, code) is not None

    def email_taken(self, email: str, exclude_id: int | None = None) -> bool:
        query = select(Employee.id).where(func.lower(Employee.email) == email.lower())
        if exclude_id is not None:
            query = query.where(Employee.id != exclude_id)
        return self.session.scalar(query) is not None
