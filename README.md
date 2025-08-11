# EZ Master API

A production-ready FastAPI service exposing a simple HTTP API over the EZ Tool. It mirrors the core functionality of `scripts/ez_master.py` and adds token-based auth, OpenAPI docs, and deployment artifacts.

[![Release Notes](https://github.com/ad-free/ez-master/actions/workflows/release-notes.yml/badge.svg)](https://github.com/ad-free/ez-master/actions/workflows/release-notes.yml)
![Python](https://img.shields.io/badge/python-3.12-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.116.1-009688?logo=fastapi)
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

## Table of Contents

- [EZ Master API](#ez-master-api)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Requirements](#requirements)
  - [Local setup](#local-setup)
  - [Authentication](#authentication)
  - [API reference (selected)](#api-reference-selected)
    - [POST /login](#post-login)
    - [GET /profile](#get-profile)
    - [POST /wfh/register](#post-wfhregister)
    - [POST /ot/register](#post-otregister)
    - [POST /salary/download](#post-salarydownload)
  - [Docker](#docker)
  - [Deploy on Render](#deploy-on-render)
  - [CLI (optional)](#cli-optional)
  - [CI/CD](#cicd)
  - [Notes](#notes)

## Features

- Login to obtain bearer token (also set as an HttpOnly cookie for Swagger convenience)
- Get full EZ profile using bearer token
- Register Work From Home (WFH) over a date range
- Register Overtime (OT) over a date range and time window
- Download salary PDF for a given month

## Requirements

- Python 3.12+

## Local setup

```bash
python -m venv .venv
# Windows PowerShell
. .venv\Scripts\Activate.ps1
# macOS/Linux
# source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

- Swagger UI: <http://127.0.0.1:8000/>

## Authentication

- POST `/login` with EZ credentials returns a `token` and sets `ez_token` cookie (HttpOnly, SameSite=Lax).
- Subsequent calls can authenticate either by:
  - Authorization header: `Authorization: Bearer <token>`
  - Or the `ez_token` cookie set by `/login` (Swagger works without manually pasting headers).
- Swagger is configured to persist authorization between refreshes.

## API reference (selected)

### POST /login

Authenticate and return a bearer token.

Request

```json
{ "username": "your-email@example.com", "password": "your-password" }
```

Response

```json
{ "token": "<bearer-token>" }
```

### GET /profile

Return the current user's EZ profile.

Auth

- Use bearer header or rely on the `ez_token` cookie from `/login`.

Response (example)

```json
{
  "ID": "<EZ_USER_ID>",
  "Email": "user@example.com",
  "LastName": "Doe",
  "FirstName": "John",
  "ChucVu": "...",
  "ChucDanh": "...",
  "PhongBan": "..."
}
```

### POST /wfh/register

Register WFH for an inclusive date range.

Auth

- Bearer header or `ez_token` cookie

Request

```json
{ "from_date": "2025-01-01", "to_date": "2025-01-03", "reason": "WFH as planned" }
```

Response

```json
{ "status": "ok", "user_id": "<EZ_USER_ID>", "dates": ["2025-01-01T00:00:00", "..."] }
```

### POST /ot/register

Register OT for an inclusive date range and time window.

Auth

- Bearer header or `ez_token` cookie

Request

```json
{
  "from_date": "2025-01-01",
  "to_date": "2025-01-03",
  "from_time": "18:00",
  "to_time": "20:00",
  "ot_type": "PLAN",
  "ot_benefit_type": "DILIGENCE",
  "reason": "Release prep"
}
```

Response

```json
{ "status": "ok", "user_id": "<EZ_USER_ID>", "dates": ["2025-01-01T00:00:00", "..."] }
```

### POST /salary/download

Download the salary PDF for the specified month.

Auth

- Bearer header or `ez_token` cookie

Parameters

- `date` (optional, YYYY-MM). Defaults to current month (UTC) if omitted.

Response

- application/pdf stream with filename `salary_YYYY-MM.pdf`

## Docker

Build and run using the provided Dockerfile (Python 3.12-slim base):

```bash
docker build -t ez-master .
docker run -p 8000:8000 ez-master
# or
docker run -e PORT=8080 -p 8080:8080 ez-master
```

## Deploy on Render

This repo includes a minimal `render.yaml` (Python runtime) to ease deployment.

- Health check: `/healthcheck`
- Start command: `uvicorn --host 0.0.0.0 --port 8080 app.main:app`
- Steps:
  - Connect your GitHub repo on Render
  - Create a new Web Service using the repo
  - Render will build with `pip install -r requirements.txt` and start the app

## CLI (optional)

Original script remains available:

```bash
python scripts/ez_master.py --help
```

## CI/CD

- A GitHub Action updates release notes automatically on each published release.

## Notes

- Dates: `YYYY-MM-DD`; times: `HH:MM` (24-hour).
- The API sends the same payloads to EZ as the CLI, with additional validation.
