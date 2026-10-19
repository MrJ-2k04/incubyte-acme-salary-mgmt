from sqlalchemy.orm import Session

from app.models import Employee


class EmployeeRepository:
    def __init__(self, session: Session):
        self.session = session

    def add(self, employee: Employee) -> Employee:
        self.session.add(employee)
        self.session.commit()
        self.session.refresh(employee)
        return employee
