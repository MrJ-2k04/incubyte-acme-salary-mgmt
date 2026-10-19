import csv
import io
from collections.abc import Iterable, Iterator

from app.models import Employee

IMPORT_COLUMNS = (
    "full_name",
    "email",
    "job_title",
    "department",
    "country_code",
    "salary",
    "hired_on",
)
CSV_COLUMNS = (*IMPORT_COLUMNS[:5], "currency", *IMPORT_COLUMNS[5:], "archived_at")
BYTE_ORDER_MARK = "﻿"
FIRST_DATA_LINE = 2


class InvalidCsvError(Exception):
    pass


def write_csv(employees: Iterable[Employee]) -> str:
    buffer = io.StringIO()
    writer = csv.writer(buffer, lineterminator="\n")
    writer.writerow(CSV_COLUMNS)
    for employee in employees:
        writer.writerow(getattr(employee, column) or "" for column in CSV_COLUMNS)
    return buffer.getvalue()


def read_csv(text: str) -> Iterator[tuple[int, dict[str, str]]]:
    # Excel adds a byte order mark when saving as UTF-8 CSV.
    reader = csv.DictReader(io.StringIO(text.removeprefix(BYTE_ORDER_MARK)))
    missing = [column for column in IMPORT_COLUMNS if column not in (reader.fieldnames or [])]
    if missing:
        raise InvalidCsvError(f"Missing columns: {', '.join(missing)}")
    for line, row in enumerate(reader, start=FIRST_DATA_LINE):
        yield line, {column: row[column] for column in IMPORT_COLUMNS}
