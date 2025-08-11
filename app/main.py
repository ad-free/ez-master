from __future__ import annotations

from fastapi import FastAPI

from app.routers import auth as auth_router
from app.routers import actions as actions_router
from app.routers import salary as salary_router


app = FastAPI(title="EZ Master API", version="1.0.0", docs_url="/")


app.include_router(auth_router.router)
app.include_router(actions_router.router)
app.include_router(salary_router.router)


