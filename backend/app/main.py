from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, usuarios, espacios, reservas
from app.db.session import engine
from app.db.base_class import Base

# Crear tablas
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Gestión de Reservas de Espacios Institucionales",
    description="API para gestionar reservas de espacios institucionales",
    version="1.0.0"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especificar los orígenes permitidos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir routers
app.include_router(auth.router, prefix="/auth", tags=["autenticación"])
app.include_router(usuarios.router, prefix="/usuarios", tags=["usuarios"])
app.include_router(espacios.router, prefix="/espacios", tags=["espacios"])
app.include_router(reservas.router, prefix="/reservas", tags=["reservas"])

@app.get("/")
def read_root():
    return {"message": "Bienvenido al sistema de gestión de reservas de espacios institucionales"}