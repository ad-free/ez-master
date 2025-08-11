EZ Master API

A FastAPI application that wraps EZ Tool endpoints used in `scripts/ez_master.py` into HTTP APIs.

## Features
- Login to obtain bearer token
- Get profile (user_id) using bearer token
- Register Work From Home (WFH) over a date range
- Register Overtime (OT) over a date range and time window
- Download salary PDF for a given month

## Requirements
- Python 3.10+

## Setup
```bash
python -m venv .venv
# Windows PowerShell
. .venv\\Scripts\\Activate.ps1
# macOS/Linux
# source .venv/bin/activate

pip install -r requirements.txt
```

## Run
```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
- Swagger UI: http://127.0.0.1:8000/

## Endpoints

### POST /login
Authenticate with EZ and return a bearer token.

Request body:
```json
{
  "username": "your-email@example.com",
  "password": "your-password"
}
```

Response body:
```json
{
  "token": "<bearer-token>"
}
```

Errors:
- 401: Invalid credentials

---

### GET /profile
Get the current user's EZ profile identifier.

Authentication:
- Use HTTP Bearer in the Authorization header. In Swagger, click Authorize and enter `Bearer <token>`.

Response body:
```json
{
  "user_id": "<EZ_USER_ID>"
}
```

Errors:
- 401: Invalid or expired token

---

### POST /wfh/register
Register Work From Home for a date range.

Request body:
```json
{
  "username": "your-email@example.com",
  "password": "your-password",
  "from_date": "2024-09-20",
  "to_date": "2024-09-22",
  "reason": "WFH as planned"
}
```

Response body:
```json
{
  "status": "ok",
  "user_id": "<EZ_USER_ID>",
  "dates": ["2024-09-20T00:00:00", "2024-09-21T00:00:00", "2024-09-22T00:00:00"]
}
```

Errors:
- 400: Validation failures or EZ API rejection

---

### POST /ot/register
Register Overtime for a date range and time window.

Request body:
```json
{
  "username": "your-email@example.com",
  "password": "your-password",
  "from_date": "2024-09-20",
  "to_date": "2024-09-20",
  "from_time": "21:00",
  "to_time": "23:00",
  "ot_type": "PLAN",
  "reason": "Weekly meeting"
}
```

Response body:
```json
{
  "status": "ok",
  "user_id": "<EZ_USER_ID>",
  "dates": ["2024-09-20T00:00:00"]
}
```

Errors:
- 400: Validation failures or EZ API rejection

---

### POST /salary/download
Download the salary PDF for a given month.

Request body:
```json
{
  "username": "your-email@example.com",
  "password": "your-password",
  "date": "2025-03"
}
```

Response:
- application/pdf stream with a suggested filename like `salary_YYYY-MM.pdf`

Errors:
- 400: EZ API rejection or data not available

## Notes
- The API delegates to the same external EZ endpoints and payloads as the original CLI script.
- Dates must be `YYYY-MM-DD`; times `HH:MM` (24-hour).
- For local development, Uvicorn serves HTTP. Use http:// URLs unless you run Uvicorn with TLS flags.

