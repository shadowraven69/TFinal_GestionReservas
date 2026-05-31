from pydantic import BaseModel, ConfigDict, Field


class EspacioResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nombre: str
    ubicacion: str
    capacidad: int
    estado: str


class EspacioCreate(BaseModel):
    nombre: str = Field(min_length=1, max_length=120)
    ubicacion: str = Field(default="Sede Central", max_length=200)
    capacidad: int = Field(gt=0)
    estado: str = Field(default="activo", pattern=r"^(activo|inactivo|mantenimiento)$")


class EspacioUpdate(BaseModel):
    nombre: str | None = Field(default=None, min_length=1, max_length=120)
    ubicacion: str | None = Field(default=None, max_length=200)
    capacidad: int | None = Field(default=None, gt=0)
    estado: str | None = Field(default=None, pattern=r"^(activo|inactivo|mantenimiento)$")
