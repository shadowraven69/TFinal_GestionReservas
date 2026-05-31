from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.crud.usuarios import create_usuario, get_usuario_by_email, get_usuario_by_username, get_usuarios, get_usuario, update_usuario, delete_usuario
from app.db import get_db
from app.deps import get_current_user, require_admin
from app.models.usuario import Usuario
from app.schemas.usuario import AdminUsuarioCreate, UsuarioCreate, UsuarioResponse, UsuarioUpdate


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


@router.put("/{usuario_id}", response_model=UsuarioResponse)
def update_usuario_endpoint(
    usuario_id: int,
    payload: UsuarioUpdate,
    current_user: Usuario = Depends(require_admin),
    db: Session = Depends(get_db),
):
    db_user = get_usuario(db, usuario_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
    if payload.username and payload.username != db_user.username:
        if get_usuario_by_username(db, payload.username):
            raise HTTPException(status_code=409, detail="Nombre de usuario ya está en uso")
            
    if payload.email and payload.email != db_user.email:
        if get_usuario_by_email(db, payload.email):
            raise HTTPException(status_code=409, detail="Email ya está en uso")
            
    return update_usuario(db, db_user, payload)


@router.delete("/{usuario_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_usuario_endpoint(
    usuario_id: int,
    current_user: Usuario = Depends(require_admin),
    db: Session = Depends(get_db),
):
    if current_user.id == usuario_id:
        raise HTTPException(status_code=400, detail="No puedes eliminarte a ti mismo")
        
    db_user = get_usuario(db, usuario_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
    delete_usuario(db, db_user)
    return None
