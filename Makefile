ifeq ($(OS),Windows_NT)
    UVICORN = .venv/Scripts/uvicorn
else
    UVICORN = .venv/bin/uvicorn
endif

start:
	uvicorn app.main:app --reload --host 0.0.0.0 --port 5000

dev:
	$(UVICORN) app.main:app --reload --host 0.0.0.0 --port 5000

pip-compile:
	uv pip compile requirements.in -o requirements.txt
