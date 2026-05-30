<<<<<<< HEAD
from pydantic import BaseModel, EmailStr
from typing import Optional

class UsuarioBase(BaseModel):
    email: EmailStr
    username: str
    activo: bool = True

class UsuarioCreate(UsuarioBase):
    password: str

class UsuarioUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    activo: Optional[bool] = None
    password: Optional[str] = None

class Usuario(UsuarioBase):
    id: int
    rol: str  # 'admin' or 'usuario'

    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
=======
from pydantic import BaseModel, ConfigDict, Field, field_validator


class UsuarioCreate(BaseModel):
    username: str = Field(min_length=3, max_length=80)
    email: str = Field(max_length=255)
    password: str = Field(min_length=6)


class AdminUsuarioCreate(UsuarioCreate):
    """Permite al admin asignar un rol al crear un usuario."""

    rol: str = Field(default="usuario", pattern="^(admin|usuario)$")

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        if "@" not in value or "." not in value.split("@")[-1]:
            raise ValueError("El email debe tener un formato válido")
        return value


class UsuarioLogin(BaseModel):
    username: str
    password: str


class UsuarioResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    email: str
    rol: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UsuarioResponse
>>>>>>> a6ca756 (feat(auth): add password hashing and JWT utilities)
