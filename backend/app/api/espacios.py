from fastapi import APIRouter, Depends
from pydantic import BaseModel, ConfigDict
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import Espacio


router = APIRouter(prefix="/espacios", tags=["espacios"])


class EspacioResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nombre: str
    capacidad: int
    estado: str


@router.get("", response_model=list[EspacioResponse])
def listar_espacios(db: Session = Depends(get_db)):
    return db.query(Espacio).order_by(Espacio.nombre.asc()).all()
