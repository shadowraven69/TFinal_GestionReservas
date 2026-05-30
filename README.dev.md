# README de Desarrollo — Sistema de Reservas de Espacios Institucionales

## Arquitectura

El sistema sigue una arquitectura de **tres capas** con frontend y backend separados:

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js 14)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐  │
│  │  Páginas  │  │Servicios │  │ Context  │  │ Componentes│  │
│  │ (App Dir) │──│ (API)    │──│ (Auth)   │  │ (Navbar)   │  │
│  └──────────┘  └──────────┘  └──────────┘  └────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP (JSON)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend (FastAPI)                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐  │
│  │  Routers │  │ Schemas  │  │   CRUD   │  │  Services  │  │
│  │  (API)   │──│(Pydantic)│──│(SQLAlch.)│──│(Negocio)   │  │
│  └──────────┘  └──────────┘  └──────────┘  └────────────┘  │
│                        │                                     │
│              ┌─────────▼─────────┐                          │
│              │   Modelos (ORM)   │                          │
│              └─────────┬─────────┘                          │
└────────────────────────┬────────────────────────────────────┘
                         │ SQL
                         ▼
              ┌─────────────────────┐
              │    PostgreSQL       │
              └─────────────────────┘
```

## Estructura de Carpetas

```
backend/
├── app/
│   ├── api/              → Routers de FastAPI (auth, usuarios, espacios, reservas)
│   ├── models/           → Modelos SQLAlchemy (Usuario, Espacio, Reserva)
│   ├── schemas/          → Esquemas Pydantic (validación y serialización)
│   ├── crud/             → Operaciones de base de datos
│   ├── auth/             → Utilidades de autenticación (hash, JWT)
│   ├── services/         → Lógica de negocio
│   ├── deps.py           → Dependencias FastAPI (get_current_user, require_admin)
│   ├── config.py         → Configuración desde variables de entorno
│   ├── db.py             → Conexión a PostgreSQL con SQLAlchemy
│   └── main.py           → Punto de entrada de la aplicación
├── Dockerfile
└── requirements.txt

frontend/
├── src/
│   ├── app/              → Páginas (App Router de Next.js)
│   │   ├── login/        → Inicio de sesión
│   │   ├── register/     → Registro de usuarios
│   │   ├── espacios/     → Consulta de espacios
│   │   ├── admin/        → Panel de administración
│   │   │   ├── espacios/ → Gestión de espacios
│   │   │   └── reservas/ → Gestión de reservas
│   │   └── reservas/     → Creación y consulta de reservas
│   ├── components/       → Componentes reutilizables (Navbar)
│   ├── context/          → Contextos de React (AuthContext)
│   ├── services/         → Llamadas a la API
│   └── types/            → Interfaces de TypeScript
├── Dockerfile
└── package.json
```

## Tecnologías y Librerías

### Backend
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Python | 3.11+ | Lenguaje |
| FastAPI | Última | Framework web |
| SQLAlchemy | 2.x | ORM |
| Pydantic | 2.x | Validación de datos |
| python-jose | Última | JWT |
| passlib[bcrypt] | Última | Hashing de contraseñas |
| psycopg2-binary | Última | Driver PostgreSQL |
| uvicorn | Última | Servidor ASGI |

### Frontend
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Node.js | 18+ | Entorno de ejecución |
| Next.js | 14.2 | Framework React |
| React | 18.3 | Librería UI |
| TypeScript | 5.4 | Tipado estático |

## Modelo de Base de Datos

### Entidades

**Usuario** (`usuarios`)
| Campo | Tipo | Restricciones |
|-------|------|---------------|
| id | Integer | PK, autoincrement |
| username | String(80) | UNIQUE, NOT NULL |
| email | String(255) | UNIQUE, NOT NULL |
| hashed_password | String | NOT NULL |
| rol | String(30) | DEFAULT 'usuario' |
| created_at | DateTime | server_default=now() |
| updated_at | DateTime | onupdate=now() |

**Espacio** (`espacios`)
| Campo | Tipo | Restricciones |
|-------|------|---------------|
| id | Integer | PK, autoincrement |
| nombre | String(120) | NOT NULL |
| capacidad | Integer | NOT NULL |
| estado | String(30) | DEFAULT 'activo' |
| created_at | DateTime | server_default=now() |
| updated_at | DateTime | onupdate=now() |

**Reserva** (`reservas`)
| Campo | Tipo | Restricciones |
|-------|------|---------------|
| id | Integer | PK, autoincrement |
| usuario_id | Integer | FK → usuarios.id |
| espacio_id | Integer | FK → espacios.id |
| fecha | Date | NOT NULL |
| hora_inicio | Time | NOT NULL |
| hora_fin | Time | NOT NULL |
| estado | String(30) | DEFAULT 'esperando' |
| created_at | DateTime | server_default=now() |
| updated_at | DateTime | onupdate=now() |

### Relaciones
- Un **Usuario** tiene muchas **Reservas**
- Un **Espacio** tiene muchas **Reservas**
- Una **Reserva** pertenece a un **Usuario** y a un **Espacio**

## Endpoints de la API

| Método | Ruta | Autenticación | Descripción |
|--------|------|---------------|-------------|
| POST | `/auth/register` | Pública | Registrar un nuevo usuario |
| POST | `/auth/login` | Pública | Iniciar sesión, devuelve JWT |
| GET | `/usuarios/me` | Usuario | Obtener perfil del usuario actual |
| GET | `/usuarios` | Admin | Listar todos los usuarios |
| POST | `/usuarios` | Admin | Crear usuario (con rol) |
| GET | `/espacios` | Pública | Listar espacios |
| POST | `/espacios` | Admin | Crear espacio |
| PUT | `/espacios/{id}` | Admin | Actualizar espacio |
| POST | `/reservas` | Usuario | Crear reserva |
| GET | `/reservas` | Admin | Listar todas las reservas |
| GET | `/reservas/mis-reservas` | Usuario | Ver mis reservas |
| PUT | `/reservas/{id}/estado` | Admin | Aprobar o rechazar reserva |
| PUT | `/reservas/{id}/cancelar` | Usuario | Cancelar reserva propia |
| GET | `/health` | Pública | Health check del servidor |

## Autenticación JWT y Roles

1. El usuario se registra en `POST /auth/register` o se le crea por admin
2. Inicia sesión en `POST /auth/login` con username y password
3. El servidor valida las credenciales con bcrypt y devuelve un JWT firmado con HS256
4. El frontend guarda el token en `localStorage`
5. Cada petición protegida envía el token en el header `Authorization: Bearer <token>`
6. El backend verifica el token con `get_current_user()` y opcionalmente el rol con `require_admin()`
7. **Roles**: `admin` puede todo; `usuario` puede crear reservas, ver sus reservas y cancelarlas

## Reglas de Negocio

1. Solo usuarios autenticados pueden crear reservas
2. Solo administradores pueden aprobar o rechazar reservas
3. No se permiten reservas superpuestas en el mismo espacio y horario
4. Las reservas requieren mínimo 24 horas de anticipación
5. Horarios permitidos:
   - Lunes a viernes: 7:00 a 20:00
   - Sábados: 8:00 a 12:00
   - Domingos: no permitido
6. La hora de inicio debe ser menor que la hora de fin
7. No se puede reservar en espacios inactivos o en mantenimiento
8. La cantidad de asistentes no puede superar la capacidad del espacio
9. Las reservas nuevas se crean en estado `esperando`
10. Las reservas en estado `esperando` o `aprobada` bloquean el horario; las `rechazada` y `cancelada` no

## Ejecución en Desarrollo

### Requisitos previos
- Python 3.11+
- Node.js 18+
- PostgreSQL corriendo en localhost:5432

### Backend

```bash
# 1. Clonar el repositorio
git clone <repo-url>
cd TFinal_GestionReservas

# 2. Crear y activar entorno virtual
python -m venv venv
source venv/bin/activate   # Linux/Mac
.\venv\Scripts\activate    # Windows

# 3. Instalar dependencias
cd backend
pip install -r requirements.txt

# 4. Configurar variables de entorno
#    Crear archivo .env en backend/ con:
#    DATABASE_URL=postgresql://postgres:postgres@localhost:5432/reservas_db
#    SECRET_KEY=una-clave-segura-aqui
#    ALGORITHM=HS256
#    ACCESS_TOKEN_EXPIRE_MINUTES=60
#    BACKEND_CORS_ORIGINS=["http://localhost:3000"]

# 5. Ejecutar servidor
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

El backend estará disponible en `http://localhost:8000` y la documentación Swagger en `http://localhost:8000/docs`.

### Frontend

```bash
# 1. Desde la raíz del proyecto
cd frontend

# 2. Instalar dependencias
npm install

# 3. Configurar variable de entorno
#    Crear archivo .env.local en frontend/ con:
#    NEXT_PUBLIC_API_URL=http://localhost:8000

# 4. Ejecutar servidor de desarrollo
npm run dev
```

El frontend estará disponible en `http://localhost:3000`.

### Usuario admin predefinido
- **Username**: admin
- **Email**: admin@admin.com
- **Password**: admin123
- **Rol**: admin

El admin se crea automáticamente al iniciar el backend si no existe.
