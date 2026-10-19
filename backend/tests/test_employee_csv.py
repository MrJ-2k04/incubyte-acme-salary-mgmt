import csv
import io

import pytest

from app.employees.csv_io import CSV_COLUMNS, IMPORT_COLUMNS, InvalidCsvError
from app.employees.schemas import EmployeeQuery
from app.employees.service import EmployeeService
from tests.factories import employee_data

HEADER = "full_name,email,job_title,department,country_code,salary,hired_on"


def csv_text(*rows: str, header: str = HEADER) -> str:
    return "\n".join([header, *rows]) + "\n"


def test_export_writes_a_header_and_one_line_per_matching_employee(session):
    service = EmployeeService(session)
    service.create(employee_data(email="a@acmecorp.com", country_code="IN"))
    service.create(employee_data(email="b@acmecorp.com", country_code="US"))

    lines = list(csv.reader(io.StringIO("".join(service.export_csv(EmployeeQuery(country="US"))))))

    assert lines[0] == list(CSV_COLUMNS)
    assert len(lines) == 2
    assert lines[1][1] == "b@acmecorp.com"


def test_import_adds_every_valid_row(session):
    service = EmployeeService(session)

    report = service.import_csv(
        csv_text(
            "Asha Rao,asha@acmecorp.com,Software Engineer,Engineering,IN,2400000,2022-04-01",
            "Ben Clark,ben@acmecorp.com,Accountant,Finance,US,90000,2024-02-01",
        )
    )

    assert report.imported == 2
    assert report.rejected == []
    assert service.list(EmployeeQuery()).total == 2


def test_import_reports_bad_rows_by_line_number_and_keeps_the_good_ones(session):
    service = EmployeeService(session)
    service.create(employee_data(email="taken@acmecorp.com"))

    report = service.import_csv(
        csv_text(
            "Asha Rao,asha@acmecorp.com,Software Engineer,Engineering,IN,2400000,2022-04-01",
            "No Pay,nopay@acmecorp.com,Accountant,Finance,US,0,2024-02-01",
            "Nowhere,nowhere@acmecorp.com,Accountant,Finance,ZZ,90000,2024-02-01",
            "Taken,TAKEN@acmecorp.com,Accountant,Finance,US,90000,2024-02-01",
            "Twice,asha@acmecorp.com,Accountant,Finance,US,90000,2024-02-01",
        )
    )

    assert report.imported == 1
    assert [(r.line, r.errors) for r in report.rejected] == [
        (3, ["salary: Input should be greater than 0"]),
        (4, ["country_code: Unknown country ZZ"]),
        (5, ["email: Already in use"]),
        (6, ["email: Repeated in this file"]),
    ]


def test_import_reads_excel_csv_with_byte_order_mark_and_extra_columns(session):
    text = "\ufeff" + csv_text(
        "Asha Rao,asha@acmecorp.com,Software Engineer,Engineering,IN,2400000,2022-04-01,INR",
        header=HEADER + ",currency",
    )

    assert EmployeeService(session).import_csv(text).imported == 1


def test_import_rejects_a_file_missing_required_columns(session):
    with pytest.raises(InvalidCsvError, match="salary"):
        EmployeeService(session).import_csv("full_name,email\nAsha,asha@acmecorp.com\n")


def test_exported_files_have_every_column_import_needs():
    assert set(IMPORT_COLUMNS) <= set(CSV_COLUMNS)
