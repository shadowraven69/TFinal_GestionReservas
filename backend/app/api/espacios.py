from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.models.espacio import Espacio
from app.schemas.espacio import Espacio, EspacioCreate, EspacioUpdate
from app.core.security import get_current_active_user, get_current_admin_user
from app.models.usuario import Usuario

router = APIRouter()

@router.post("/", response_model=Espacio, status_code=status.HTTP_201_CREATED)
def create_espacio(
    *,
    db: Session = Depends(get_db),
    espacio_in: EspacioCreate,
    current_user: Usuario = Depends(get_current_admin_user)
):
    """
    Crear un nuevo espacio institucional. Solo para administradores.
    """
    # Verificar si ya existe un espacio con el mismo nombre
    db_espacio = db.query(Espacio).filter(Espacio.nombre == espacio_in.nombre).first()
    if db_espacio:
        raise HTTPException(
            status_code=400,
            detail="Ya existe un espacio con este nombre"
        )
    
    # Validar el estado
    if espacio_in.estado not in ["activo", "inactivo", "mantenimiento"]:
        raise HTTPException(
            status_code=400,
            detail="Estado inválido. Debe ser: activo, inactivo o mantenimiento"
        )
    
    # Validar capacidad positiva
    if espacio_in.capacidad <= 0:
        raise HTTPException(
            status_code=400,
            detail="La capacidad debe ser un número positivo"
        )
    
    espacio = Espacio(**espacio_in.dict())
    db.add(espacio)
    db.commit()
    db.refresh(espacio)
    return espacio

@router.get("/", response_model=List[Espacio])
def read_espacios(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    estado: str = None,
    current_user: Usuario = Depends(get_current_active_user)
):
    """
    Obtener lista de espacios institucionales.
    Los usuarios autenticados pueden ver todos los espacios.
    Los administradores pueden filtrar por estado opcionalmente.
    """
    query = db.query(Espacio)
    
    # Si se especifica un estado, filtrar por él
    if estado:
        query = query.filter(Espacio.estado == estado)
    
    espacios = query.offset(skip).limit(limit).all()
    return espacios

@router.get("/{id_espacio}", response_model=Espacio)
def read_espacio(
    *,
    db: Session = Depends(get_db),
    id_espacio: int,
    current_user: Usuario = Depends(get_current_active_user)
):
    """
    Obtener un espacio institucional específico por su ID.
    """
    espacio = db.query(Espacio).filter(Espacio.id_espacio == id_espacio).first()
    if not espacio:
        raise HTTPException(
            status_code=404,
            detail="Espacio no encontrado"
        )
    return espacio

@router.put("/{id_espacio}", response_model=Espacio)
def update_espacio(
    *,
    db: Session = Depends(get_db),
    id_espacio: int,
    espacio_in: EspacioUpdate,
    current_user: Usuario = Depends(get_current_admin_user)
):
    """
    Actualizar un espacio institucional. Solo para administradores.
    """
    espacio = db.query(Espacio).filter(Espacio.id_espacio == id_espacio).first()
    if not espacio:
        raise HTTPException(
            status_code=404,
            detail="Espacio no encontrado"
        )
    
    # Validar el estado si se proporciona
    if espacio_in.estado is not None:
        if espacio_in.estado not in ["activo", "inactivo", "mantenimiento"]:
            raise HTTPException(
                status_code=400,
                detail="Estado inválido. Debe ser: activo, inactivo o mantenimiento"
            )
    
    # Validar capacidad si se proporciona
    if espacio_in.capacidad is not None and espacio_in.capacidad <= 0:
        raise HTTPException(
            status_code=400,
            detail="La capacidad debe ser un número positivo"
        )
    
    # Actualizar solo los campos proporcionados
    update_data = espacio_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(espacio, field, value)
    
    db.add(espacio)
    db.commit()
    db.refresh(espacio)
    return espacio

@router.delete("/{id_espacio}", status_code=status.HTTP_204_NO_CONTENT)
def delete_espacio(
    *,
    db: Session = Depends(get_db),
    id_espacio: int,
    current_user: Usuario = Depends(get_current_admin_user)
):
    """
    Eliminar un espacio institucional. Solo para administradores.
    """
    espacio = db.query(Espacio).filter(Espacio.id_espacio == id_espacio).first()
    if not espacio:
        raise HTTPException(
            status_code=404,
            detail="Espacio no encontrado"
        )
    
    # Verificar si el espacio tiene reservas activas (esto se haría en el módulo de reservas)
    # Por ahora, eliminamos directamente
    db.delete(espacio)
    db.commit()
    return None