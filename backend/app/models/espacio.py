from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.sql.sqltypes import Enum
from app.db.base_class import Base

class Espacio(Base):
    __tablename__ = "espacios"

    id_espacio = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    ubicacion = Column(String(200), nullable=False)
    capacidad = Column(Integer, nullable=False)
    estado = Column(String(20), nullable=False, default="activo")  # activo, inactivo, mantenimiento

    def __repr__(self):
        return f"<Espacio {self.nombre}>"