from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.crud.usuarios import create_usuario, get_usuario_by_email, get_usuario_by_username, get_usuarios
from app.db import get_db
from app.deps import get_current_user, require_admin
from app.models.usuario import Usuario
from app.schemas.usuario import AdminUsuarioCreate, UsuarioCreate, UsuarioResponse


router = APIRouter(prefix="/usuarios", tags=["usuarios"])


@router.get("/me", response_model=UsuarioResponse)
def get_me(current_user: Usuario = Depends(get_current_user)):
    return current_user


@router.get("", response_model=list[UsuarioResponse])
def list_usuarios(
    current_user: Usuario = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return get_usuarios(db)


@router.post("", response_model=UsuarioResponse, status_code=status.HTTP_201_CREATED)
def create_usuario_admin(
    payload: AdminUsuarioCreate,
    current_user: Usuario = Depends(require_admin),
    db: Session = Depends(get_db),
):
    if get_usuario_by_username(db, payload.username) is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="El nombre de usuario ya está registrado",
        )
    if get_usuario_by_email(db, payload.email) is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="El email ya está registrado",
        )

    return create_usuario(db, payload)
