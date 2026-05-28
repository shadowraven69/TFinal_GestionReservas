from datetime import date, time

from sqlalchemy.orm import Session, joinedload

from app.models.reserva import ESTADOS_BLOQUEANTES, Reserva


def get_reservas(db: Session, skip: int = 0, limit: int = 100) -> list[Reserva]:
    return (
        db.query(Reserva)
        .options(joinedload(Reserva.usuario), joinedload(Reserva.espacio))
        .order_by(Reserva.fecha.desc(), Reserva.hora_inicio.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_mis_reservas(db: Session, usuario_id: int) -> list[Reserva]:
    return (
        db.query(Reserva)
        .options(joinedload(Reserva.usuario), joinedload(Reserva.espacio))
        .filter(Reserva.usuario_id == usuario_id)
        .order_by(Reserva.fecha.desc(), Reserva.hora_inicio.desc())
        .all()
    )


def get_reserva(db: Session, reserva_id: int) -> Reserva | None:
    return (
        db.query(Reserva)
        .options(joinedload(Reserva.usuario), joinedload(Reserva.espacio))
        .filter(Reserva.id == reserva_id)
        .first()
    )


def get_reservas_bloqueantes(
    db: Session,
    espacio_id: int,
    fecha: date,
    hora_inicio: time,
    hora_fin: time,
    exclude_id: int | None = None,
) -> list[Reserva]:
    query = db.query(Reserva).filter(
        Reserva.espacio_id == espacio_id,
        Reserva.fecha == fecha,
        Reserva.estado.in_(ESTADOS_BLOQUEANTES),
        Reserva.hora_inicio < hora_fin,
        Reserva.hora_fin > hora_inicio,
    )
    if exclude_id is not None:
        query = query.filter(Reserva.id != exclude_id)
    return query.all()
