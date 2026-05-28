from datetime import date, datetime, time

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.crud.reservas import get_reserva, get_reservas_bloqueantes
from app.models import Espacio, Reserva, Usuario
from app.schemas.reserva import ReservaCreate


def validar_horario(fecha: date, hora_inicio: time, hora_fin: time) -> None:
    if hora_inicio >= hora_fin:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="La hora de inicio debe ser menor que la hora de fin")

    dia_semana = fecha.weekday()
    if dia_semana == 6:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No se permiten reservas los domingos")

    if dia_semana == 5:
        apertura, cierre = time(8, 0), time(12, 0)
        mensaje = "Los sábados solo se permiten reservas entre 08:00 y 12:00"
    else:
        apertura, cierre = time(7, 0), time(20, 0)
        mensaje = "De lunes a viernes solo se permiten reservas entre 07:00 y 20:00"

    if hora_inicio < apertura or hora_fin > cierre:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=mensaje)


def validar_anticipacion(fecha: date, hora_inicio: time) -> None:
    inicio = datetime.combine(fecha, hora_inicio)
    segundos_anticipacion = (inicio - datetime.now()).total_seconds()
    if segundos_anticipacion < 24 * 60 * 60:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="La reserva debe hacerse con mínimo 24 horas de anticipación")


def validar_solapamiento(
    db: Session,
    espacio_id: int,
    fecha: date,
    hora_inicio: time,
    hora_fin: time,
    exclude_id: int | None = None,
) -> None:
    bloqueantes = get_reservas_bloqueantes(db, espacio_id, fecha, hora_inicio, hora_fin, exclude_id)
    if bloqueantes:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="El espacio ya tiene una reserva en ese horario")


def validar_espacio_activo(espacio: Espacio | None) -> None:
    if espacio is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="El espacio solicitado no existe")
    if espacio.estado != "activo":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El espacio no está activo para reservas")


def validar_capacidad(asistentes: int, espacio_capacidad: int) -> None:
    if asistentes > espacio_capacidad:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="La cantidad de asistentes supera la capacidad del espacio")


def validar_creacion(db: Session, data: ReservaCreate, usuario: Usuario, espacio: Espacio | None) -> None:
    if usuario is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Debes iniciar sesión para crear reservas")
    validar_espacio_activo(espacio)
    validar_capacidad(data.asistentes, espacio.capacidad)
    validar_horario(data.fecha, data.hora_inicio, data.hora_fin)
    validar_anticipacion(data.fecha, data.hora_inicio)
    validar_solapamiento(db, data.espacio_id, data.fecha, data.hora_inicio, data.hora_fin)


def crear_reserva(db: Session, data: ReservaCreate, usuario: Usuario) -> Reserva:
    espacio = db.query(Espacio).filter(Espacio.id == data.espacio_id).first()
    validar_creacion(db, data, usuario, espacio)

    reserva = Reserva(
        usuario_id=usuario.id,
        espacio_id=data.espacio_id,
        fecha=data.fecha,
        hora_inicio=data.hora_inicio,
        hora_fin=data.hora_fin,
        asistentes=data.asistentes,
        estado="esperando",
    )
    db.add(reserva)
    db.commit()
    db.refresh(reserva)
    return get_reserva(db, reserva.id) or reserva


def cambiar_estado(db: Session, reserva_id: int, nuevo_estado: str, admin_user: Usuario) -> Reserva:
    if admin_user.rol != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Solo un administrador puede cambiar el estado de una reserva")
    if nuevo_estado not in {"aprobada", "rechazada"}:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El estado solo puede cambiarse a aprobada o rechazada")

    reserva = get_reserva(db, reserva_id)
    if reserva is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="La reserva no existe")
    reserva.estado = nuevo_estado
    db.commit()
    db.refresh(reserva)
    return get_reserva(db, reserva.id) or reserva


def cancelar_reserva(db: Session, reserva_id: int, usuario: Usuario) -> Reserva:
    reserva = get_reserva(db, reserva_id)
    if reserva is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="La reserva no existe")
    if reserva.usuario_id != usuario.id and usuario.rol != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Solo el dueño de la reserva o un administrador pueden cancelarla")

    reserva.estado = "cancelada"
    db.commit()
    db.refresh(reserva)
    return get_reserva(db, reserva.id) or reserva
