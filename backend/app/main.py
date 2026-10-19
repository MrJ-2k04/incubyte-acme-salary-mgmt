from fastapi import FastAPI

HEALTH_PATH = "/health"

app = FastAPI(title="ACME Salary Management API")


# Never touches the database, so the keep-alive pinger does not wake Neon.
@app.get(HEALTH_PATH)
def health() -> dict[str, str]:
    return {"status": "ok"}
