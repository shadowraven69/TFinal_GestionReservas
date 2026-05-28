from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.crud.reservas import get_mis_reservas, get_reservas
from app.db import get_db
from app.deps import get_current_user, require_admin
from app.models import Usuario
from app.schemas.reserva import ReservaCreate, ReservaEstadoUpdate, ReservaResponse
from app.services.reservas import cambiar_estado, cancelar_reserva, crear_reserva


router = APIRouter(prefix="/reservas", tags=["reservas"])


@router.post("", response_model=ReservaResponse, status_code=201)
def crear_reserva_endpoint(
    data: ReservaCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    return crear_reserva(db, data, current_user)


@router.get("", response_model=list[ReservaResponse])
def listar_reservas_endpoint(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    admin_user: Usuario = Depends(require_admin),
):
    _ = admin_user
    return get_reservas(db, skip, limit)


@router.get("/mis-reservas", response_model=list[ReservaResponse])
def listar_mis_reservas_endpoint(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    return get_mis_reservas(db, current_user.id)


@router.put("/{reserva_id}/estado", response_model=ReservaResponse)
def cambiar_estado_endpoint(
    reserva_id: int,
    data: ReservaEstadoUpdate,
    db: Session = Depends(get_db),
    admin_user: Usuario = Depends(require_admin),
):
    return cambiar_estado(db, reserva_id, data.nuevo_estado, admin_user)


@router.put("/{reserva_id}/cancelar", response_model=ReservaResponse)
def cancelar_reserva_endpoint(
    reserva_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    return cancelar_reserva(db, reserva_id, current_user)
