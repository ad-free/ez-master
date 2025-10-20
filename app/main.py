from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import actions as actions_router
from app.routers import auth as auth_router
from app.routers import common as common_router
from app.routers import salary as salary_router

app = FastAPI(
    title="EZ Master API",
    version="1.0.0",
    docs_url="/",
    swagger_ui_parameters={
        "persistAuthorization": True,
    },
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://ad-free.github.io",
        "http://localhost:5173",
    ],  # Add your frontend URLs
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

app.include_router(auth_router.router)
app.include_router(actions_router.router)
app.include_router(salary_router.router)
app.include_router(common_router.router)
