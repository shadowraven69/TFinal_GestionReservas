from pydantic import BaseModel
from typing import Optional

class EspacioBase(BaseModel):
    nombre: str
    ubicacion: str
    capacidad: int
    estado: str = "activo"

class EspacioCreate(EspacioBase):
    pass

class EspacioUpdate(BaseModel):
    nombre: Optional[str] = None
    ubicacion: Optional[str] = None
    capacidad: Optional[int] = None
    estado: Optional[str] = None

class Espacio(EspacioBase):
    id_espacio: int

    class Config:
        orm_mode = True