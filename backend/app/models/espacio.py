from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.sql.sqltypes import Enum
from sqlalchemy.orm import relationship
from app.db import Base

class Espacio(Base):
    __tablename__ = "espacios"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    ubicacion = Column(String(200), nullable=False, default="Principal")
    capacidad = Column(Integer, nullable=False)
    estado = Column(String(20), nullable=False, default="activo")  # activo, inactivo, mantenimiento

    reservas = relationship("Reserva", back_populates="espacio")

    def __repr__(self):
        return f"<Espacio {self.nombre}>"
