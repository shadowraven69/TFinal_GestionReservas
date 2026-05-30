from sqlalchemy.orm import Session

from app.models.usuario import Usuario
from app.schemas.usuario import UsuarioCreate


def get_usuario(db: Session, usuario_id: int) -> Usuario | None:
    return db.query(Usuario).filter(Usuario.id == usuario_id).first()


def get_usuario_by_username(db: Session, username: str) -> Usuario | None:
    return db.query(Usuario).filter(Usuario.username == username).first()


def get_usuario_by_email(db: Session, email: str) -> Usuario | None:
    return db.query(Usuario).filter(Usuario.email == email).first()


def get_usuarios(db: Session, skip: int = 0, limit: int = 100) -> list[Usuario]:
    return db.query(Usuario).order_by(Usuario.username.asc()).offset(skip).limit(limit).all()


def create_usuario(db: Session, usuario: UsuarioCreate) -> Usuario:
    from app.auth.auth import hash_password

    db_usuario = Usuario(
        username=usuario.username,
        email=usuario.email,
        hashed_password=hash_password(usuario.password),
        rol=getattr(usuario, "rol", "usuario"),
    )
    db.add(db_usuario)
    db.commit()
    db.refresh(db_usuario)
    return db_usuario
