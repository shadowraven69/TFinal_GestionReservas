from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import espacios, reservas
from app.config import settings
from app.db import Base, engine
from app import models  # noqa: F401


app = FastAPI(title="Reservas de Espacios Institucionales", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.backend_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    Base.metadata.create_all(bind=engine)


@app.on_event("shutdown")
def on_shutdown() -> None:
    engine.dispose()


@app.get("/health", tags=["health"])
def health_check():
    return {"status": "ok"}


app.include_router(espacios.router)
app.include_router(reservas.router)
