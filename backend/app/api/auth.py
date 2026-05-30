from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth.auth import create_access_token, verify_password
from app.crud.usuarios import create_usuario, get_usuario_by_email, get_usuario_by_username
from app.db import get_db
from app.schemas.usuario import UsuarioCreate, UsuarioLogin, UsuarioResponse, TokenResponse


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UsuarioResponse, status_code=status.HTTP_201_CREATED)
def register(payload: UsuarioCreate, db: Session = Depends(get_db)):
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

    usuario = create_usuario(db, payload)
    return usuario


@router.post("/login", response_model=TokenResponse)
def login(payload: UsuarioLogin, db: Session = Depends(get_db)):
    usuario = get_usuario_by_username(db, payload.username)
    if usuario is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales inválidas",
        )

    if not verify_password(payload.password, usuario.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales inválidas",
        )

    access_token = create_access_token(data={"sub": str(usuario.id), "rol": usuario.rol})
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UsuarioResponse.model_validate(usuario),
    )
