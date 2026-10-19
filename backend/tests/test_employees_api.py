from app.employees.router import EMPLOYEES_PATH

NEW_EMPLOYEE = {
    "full_name": "Asha Rao",
    "email": "asha.rao@acmecorp.com",
    "job_title": "Software Engineer",
    "department": "Engineering",
    "country_code": "IN",
    "salary": 2400000,
    "hired_on": "2022-04-01",
}


def create(client, **overrides):
    return client.post(EMPLOYEES_PATH, json=NEW_EMPLOYEE | overrides)


def test_post_creates_an_employee(client):
    response = create(client)

    assert response.status_code == 201
    assert response.json()["currency"] == "INR"


def test_post_rejects_invalid_fields(client):
    response = create(client, salary=0, email="not-an-email")

    assert response.status_code == 422
    fields = {error["loc"][-1] for error in response.json()["detail"]}
    assert fields == {"salary", "email"}


def test_post_rejects_unknown_country(client):
    assert create(client, country_code="ZZ").status_code == 422


def test_post_rejects_reused_email(client):
    create(client)

    assert create(client).status_code == 409


def test_get_returns_one_employee_or_404(client):
    employee_id = create(client).json()["id"]

    assert client.get(f"{EMPLOYEES_PATH}/{employee_id}").json()["full_name"] == "Asha Rao"
    assert client.get(f"{EMPLOYEES_PATH}/999").status_code == 404


def test_patch_edits_given_fields(client):
    employee_id = create(client).json()["id"]

    response = client.patch(f"{EMPLOYEES_PATH}/{employee_id}", json={"salary": 2600000})

    assert response.json()["salary"] == 2600000


def test_archive_and_restore(client):
    employee_id = create(client).json()["id"]

    archived = client.post(f"{EMPLOYEES_PATH}/{employee_id}/archive").json()
    restored = client.post(f"{EMPLOYEES_PATH}/{employee_id}/restore").json()

    assert archived["archived_at"] is not None
    assert restored["archived_at"] is None


def test_list_reads_the_status_from_query_params(client):
    create(client)
    employee_id = create(client, full_name="Ben Clark", email="ben@acmecorp.com").json()["id"]
    client.post(f"{EMPLOYEES_PATH}/{employee_id}/archive")

    response = client.get(EMPLOYEES_PATH, params={"status": "archived"})

    assert [e["full_name"] for e in response.json()["items"]] == ["Ben Clark"]


def test_list_reads_filters_and_paging_from_query_params(client):
    create(client)
    create(client, full_name="Ben Clark", email="ben@acmecorp.com", country_code="US")

    body = client.get(EMPLOYEES_PATH, params={"country": "US", "size": 10}).json()

    assert body["total"] == 1
    assert body["items"][0]["full_name"] == "Ben Clark"


def test_list_rejects_page_size_over_the_cap(client):
    assert client.get(EMPLOYEES_PATH, params={"size": 500}).status_code == 422
