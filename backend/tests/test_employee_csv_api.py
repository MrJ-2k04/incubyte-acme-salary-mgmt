from app.employees.router import EMPLOYEES_PATH

ROW = "Asha Rao,asha@acmecorp.com,Software Engineer,Engineering,IN,2400000,2022-04-01"
HEADER = "full_name,email,job_title,department,country_code,salary,hired_on"


def upload(client, text: str):
    files = {"file": ("employees.csv", text.encode(), "text/csv")}
    return client.post(f"{EMPLOYEES_PATH}/import", files=files)


def test_import_endpoint_returns_a_report(client):
    response = upload(client, f"{HEADER}\n{ROW}\n")

    assert response.status_code == 200
    assert response.json() == {"imported": 1, "rejected": []}


def test_import_endpoint_rejects_a_file_with_missing_columns(client):
    assert upload(client, "full_name\nAsha\n").status_code == 422


def test_export_endpoint_downloads_csv_with_current_filters(client):
    upload(client, f"{HEADER}\n{ROW}\n")

    response = client.get(f"{EMPLOYEES_PATH}/export", params={"country": "US"})

    assert response.headers["content-type"].startswith("text/csv")
    assert "attachment" in response.headers["content-disposition"]
    assert response.text.strip().count("\n") == 0
