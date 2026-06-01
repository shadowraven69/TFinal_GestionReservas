from datetime import date, time

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.crud.espacios import create_espacio, get_espacio_by_nombre, update_espacio
from app.crud.reservas import get_reservas_bloqueantes
from app.db import get_db
from app.deps import get_current_user, require_admin
from app.models import Espacio
from app.models.usuario import Usuario
from app.schemas.disponibilidad import DisponibilidadSlot
from app.schemas.espacio import EspacioCreate, EspacioResponse, EspacioUpdate


router = APIRouter(prefix="/espacios", tags=["espacios"])


@router.get("", response_model=list[EspacioResponse])
def listar_espacios(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
):
    """Listar espacios públicos. No requiere autenticación."""
    return db.query(Espacio).order_by(Espacio.nombre.asc()).offset(skip).limit(limit).all()


@router.get("/{espacio_id}", response_model=EspacioResponse)
def obtener_espacio(
    espacio_id: int,
    db: Session = Depends(get_db),
):
    """Obtener un espacio por ID."""
    espacio = db.query(Espacio).filter(Espacio.id == espacio_id).first()
    if not espacio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Espacio no encontrado",
        )
    return espacio


@router.get("/{espacio_id}/disponibilidad", response_model=list[DisponibilidadSlot])
def obtener_disponibilidad(
    espacio_id: int,
    fecha: date = Query(..., description="Fecha en formato YYYY-MM-DD"),
    db: Session = Depends(get_db),
):
    """Obtener disponibilidad horaria de un espacio para una fecha dada. No requiere autenticación."""
    espacio = db.query(Espacio).filter(Espacio.id == espacio_id).first()
    if not espacio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Espacio no encontrado",
        )

    slots: list[DisponibilidadSlot] = []
    hora_apertura = 7
    hora_cierre = 20

    for h in range(hora_apertura, hora_cierre):
        slot_inicio = time(h, 0)
        slot_fin = time(h + 1, 0)

        if espacio.estado == "mantenimiento":
            estado = "mantenimiento"
        else:
            bloqueantes = get_reservas_bloqueantes(db, espacio_id, fecha, slot_inicio, slot_fin)
            estado = "ocupado" if bloqueantes else "libre"

        slots.append(
            DisponibilidadSlot(
                hora_inicio=slot_inicio.strftime("%H:%M"),
                hora_fin=slot_fin.strftime("%H:%M"),
                estado=estado,
            )
        )

    return slots


@router.post("", response_model=EspacioResponse, status_code=status.HTTP_201_CREATED)
def crear_espacio(
    payload: EspacioCreate,
    current_user: Usuario = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Crear un espacio. Solo admin."""
    if get_espacio_by_nombre(db, payload.nombre) is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="El nombre del espacio ya existe",
        )
    return create_espacio(db, payload)


@router.put("/{espacio_id}", response_model=EspacioResponse)
def actualizar_espacio(
    espacio_id: int,
    payload: EspacioUpdate,
    current_user: Usuario = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Actualizar un espacio. Solo admin."""
    espacio = update_espacio(db, espacio_id, payload)
    if espacio is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Espacio no encontrado",
        )
    return espacio


@router.delete("/{espacio_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_espacio(
    espacio_id: int,
    current_user: Usuario = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Eliminar un espacio. Solo admin."""
    espacio = db.query(Espacio).filter(Espacio.id == espacio_id).first()
    if not espacio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Espacio no encontrado",
        )
    db.delete(espacio)
    db.commit()
    return None
