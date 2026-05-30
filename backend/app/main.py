from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.api import auth, espacios, reservas, usuarios
from app.auth.auth import hash_password
from app.config import settings
from app.db import Base, engine, SessionLocal
from app import models  # noqa: F401


app = FastAPI(
    title="Gestión de Reservas de Espacios Institucionales",
    description="API para gestionar reservas de espacios institucionales",
    version="1.0.0",
)

# Configurar CORS
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
    seed_admin_user()


@app.on_event("shutdown")
def on_shutdown() -> None:
    engine.dispose()


@app.get("/", tags=["health"])
def read_root():
    return {"mensaje": "Bienvenido al sistema de gestión de reservas de espacios institucionales"}


@app.get("/health", tags=["health"])
def health_check():
    return {"status": "ok"}


def seed_admin_user() -> None:
    db: Session = SessionLocal()
    try:
        from app.models.usuario import Usuario

        admin = db.query(Usuario).filter(Usuario.rol == "admin").first()
        if admin is not None:
            return

        db.add(
            Usuario(
                username="admin",
                email="admin@admin.com",
                hashed_password=hash_password("admin123"),
                rol="admin",
            )
        )
        db.commit()
    finally:
        db.close()


# Incluir routers
app.include_router(auth.router)
app.include_router(usuarios.router)
app.include_router(espacios.router)
app.include_router(reservas.router)
