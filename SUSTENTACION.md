# Guía de Sustentación — Sistema de Reservas de Espacios Institucionales

---

## 1. Arquitectura General del Sistema

**Qué decir:**

> "Nuestro sistema sigue una arquitectura de tres capas: Frontend en Next.js, Backend en FastAPI y Base de datos PostgreSQL. El frontend se comunica con el backend mediante una API REST que devuelve JSON. El backend usa SQLAlchemy como ORM para interactuar con la base de datos. Todo se despliega con Docker Compose en tres contenedores."

**Diagrama para explicar:**

```
Navegador (React/Next.js)
       ↕ HTTP JSON
API REST (FastAPI)
       ↕ SQLAlchemy ORM
PostgreSQL
```

**Puntos clave:**
- Frontend y backend están **totalmente separados** (no hay server-side rendering de la API)
- La autenticación es **stateless** (JWT) — el backend no guarda sesiones
- Cada capa es **independiente** y se puede escalar por separado

---

## 2. Flujo de Autenticación JWT

**Qué decir:**

> "Usamos JWT (JSON Web Token) para autenticación stateless. Cuando un usuario inicia sesión, el backend genera un token firmado con una clave secreta usando el algoritmo HS256. Ese token contiene el ID del usuario y su rol. El frontend guarda el token en localStorage y lo envía en cada petición en el header Authorization: Bearer. El backend verifica el token en cada endpoint protegido usando una dependencia de FastAPI."

**Flujo paso a paso:**

```
1. POST /auth/login → usuario envía username + password
2. Backend busca usuario en DB, verifica hash con bcrypt
3. Backend genera JWT: jwt.encode({"sub": user.id, "rol": user.rol}, SECRET_KEY, algorithm="HS256")
4. Backend devuelve: { access_token, token_type: "bearer", user: {...} }
5. Frontend guarda token y user en localStorage
6. Próximas peticiones: header "Authorization: Bearer <token>"
7. Backend verifica con get_current_user(): decode JWT, busca usuario, lo inyecta en la request
```

**Mostrar en código — `backend/app/auth/auth.py`:**

```python
def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=60))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
```

**Mostrar en código — `backend/app/deps.py`:**

```python
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Usuario:
    payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
    user_id = payload.get("sub")
    usuario = db.query(Usuario).filter(Usuario.id == int(user_id)).first()
    if not usuario:
        raise HTTPException(status_code=401, detail="Usuario no encontrado")
    return usuario
```

---

## 3. Roles y Permisos

**Qué decir:**

> "Manejamos dos roles: admin y usuario. El rol se almacena en la tabla de usuarios. Cuando un usuario se registra, por defecto es 'usuario'. El admin puede crear usuarios con rol específico. Usamos una dependencia require_admin() que verifica el rol después de la autenticación."

**Mostrar en código — `backend/app/deps.py`:**

```python
def require_admin(current_user: Usuario = Depends(get_current_user)) -> Usuario:
    if current_user.rol != "admin":
        raise HTTPException(status_code=403, detail="Se requieren permisos de administrador")
    return current_user
```

**Qué puede hacer cada rol:**

| Acción | usuario | admin |
|--------|---------|-------|
| Registrarse | ✅ | ✅ |
| Iniciar sesión | ✅ | ✅ |
| Consultar espacios | ✅ | ✅ |
| Crear reserva | ✅ | ✅ |
| Ver mis reservas | ✅ | ✅ |
| Cancelar reserva propia | ✅ | ✅ |
| Aprobar/rechazar reservas | ❌ | ✅ |
| Crear/editar espacios | ❌ | ✅ |
| Listar todos los usuarios | ❌ | ✅ |
| Crear usuarios con rol | ❌ | ✅ |

---

## 4. Modelo de Base de Datos

**Qué decir:**

> "Tenemos tres tablas principales: usuarios, espacios y reservas. Las reservas tienen una clave foránea hacia usuarios y otra hacia espacios. La tabla de espacios tiene un campo estado que puede ser activo, inactivo o mantenimiento. La tabla de reservas tiene un campo estado que puede ser esperando, aprobada, rechazada o cancelada."

**Diagrama de entidades:**

```
usuarios                  reservas                      espacios
┌──────────────┐    ┌─────────────────────┐    ┌──────────────────┐
│ id (PK)      │──┐ │ id (PK)             │┌──│ id (PK)          │
│ username     │  └─│ usuario_id (FK)     ││  │ nombre           │
│ email        │    │ espacio_id (FK)    ──┘  │ capacidad        │
│ hashed_pass  │    │ fecha               │   │ estado           │
│ rol          │    │ hora_inicio         │   │ created_at       │
│ created_at   │    │ hora_fin            │   │ updated_at       │
│ updated_at   │    │ estado              │   └──────────────────┘
└──────────────┘    │ created_at          │
                    │ updated_at          │
                    └─────────────────────┘
```

**Relaciones:**
- Un **usuario** tiene muchas **reservas**
- Un **espacio** tiene muchas **reservas**
- Una **reserva** pertenece a un **usuario** y a un **espacio**

---

## 5. Reglas de Negocio

**Qué decir (elegir 3-4 para explicar en detalle):**

> "Implementamos 10 reglas de negocio. Las más importantes son:"

| # | Regla | Cómo se implementa |
|---|-------|-------------------|
| 1 | Solo usuarios autenticados | Dependencia `get_current_user()` |
| 2 | Solo admin aprueba/rechaza | Dependencia `require_admin()` |
| 3 | Sin reservas superpuestas | Consulta SQL que busca overlaps en `services/reservas.py` |
| 4 | Mínimo 24hs anticipación | Validación en `services/reservas.py` con `datetime` |
| 5 | Horarios válidos | Validación de día y hora contra rangos definidos |
| 6 | hora_inicio < hora_fin | Validación directa de campos |
| 7 | Espacios inactivos bloqueados | Validación del estado del espacio antes de crear |
| 8 | Asistentes ≤ capacidad | Comparación contra `espacio.capacidad` |
| 9 | Estado inicial "esperando" | Default en el modelo |
| 10 | Estados bloqueantes | Solo "esperando" y "aprobada" se consideran ocupadas |

**Mostrar ejemplo de validación de superposición:**

```python
def validar_sin_superposicion(db, espacio_id, fecha, hora_inicio, hora_fin):
    conflictos = db.query(Reserva).filter(
        Reserva.espacio_id == espacio_id,
        Reserva.fecha == fecha,
        Reserva.estado.in_(["esperando", "aprobada"]),
        Reserva.hora_inicio < hora_fin,
        Reserva.hora_fin > hora_inicio,
    ).first()
    if conflictos:
        raise HTTPException(409, "El espacio ya está reservado en ese horario")
```

---

## 6. Despliegue con Docker Compose

**Qué decir:**

> "Usamos Docker Compose con tres servicios. El frontend usa un multi-stage build para optimizar el tamaño. El backend usa Python slim. La base de datos PostgreSQL tiene un volumen persistente. Todos los servicios se comunican por una red interna de Docker."

**Mostrar el comando:**

```bash
docker compose up --build
```

**Explicar los servicios:**

```yaml
services:
  db:        # PostgreSQL 15, puerto 5432, volumen persistente
  backend:   # FastAPI en Python 3.11, puerto 8000
  frontend:  # Next.js 14 en Node 18, puerto 3000
```

**Variables de entorno clave:**
- `DATABASE_URL` — conexión a PostgreSQL (usando `db` como hostname)
- `SECRET_KEY` — clave para firmar JWT
- `NEXT_PUBLIC_API_URL` — URL del backend para el frontend

---

## 7. Demo Paso a Paso (11 pasos)

### Preparación
```bash
docker compose up --build -d
# Esperar 10 segundos a que la BD esté lista
```

### Paso 1 — Mostrar Swagger
Abrir `http://localhost:8000/docs`
> _"Esta es la documentación automática de FastAPI. Podemos probar cada endpoint desde acá."_

### Paso 2 — Mostrar frontend
Abrir `http://localhost:3000`
> _"Este es el frontend en Next.js. Ven que estamos en la página principal."_

### Paso 3 — Iniciar sesión como admin
Ir a "Iniciar Sesión", usar: admin / admin123
> _"Usamos el administrador predefinido. Al iniciar sesión, ven que la navbar cambia y muestra las opciones de administración."_

### Paso 4 — Consultar espacios
Ir a "Espacios" en la navbar
> _"Acá vemos los espacios disponibles. Si no hay ninguno, podemos crear uno desde el panel de admin."_

### Paso 5 — Crear un espacio (admin)
Ir a "Espacios" en el panel admin, crear uno
> _"Como admin podemos gestionar los espacios: crearlos, editarlos y cambiar su estado."_

### Paso 6 — Cerrar sesión y registrarse como usuario
Cerrar sesión, ir a "Registrarse"
> _"Ahora vamos a probar el registro de un usuario normal."_

### Paso 7 — Crear una reserva válida
Iniciar sesión como el nuevo usuario, ir a "Nueva Reserva"
> _"Completamos los datos con una fecha futura respetando horarios y capacidad."_

### Paso 8 — Mostrar validaciones (reserva inválida)
Intentar crear una reserva que viole una regla de negocio:
- Mismo espacio y horario (superposición)
- Domingo o fuera de horario
- Menos de 24hs de anticipación
> _"Acá ven que el sistema rechaza la reserva y muestra el error específico."_

### Paso 9 — Admin aprueba la reserva
Iniciar sesión como admin, ir a "Reservas", aprobar
> _"El admin puede ver todas las reservas y cambiar su estado."_

### Paso 10 — Mostrar estructura del repositorio
```bash
git log --oneline
git branch -a
```
> _"Mostramos el historial de commits y las ramas del repositorio."_

### Paso 11 — Mostrar commits de cada integrante
```bash
git shortlog -sn
```
> _"Acá se ve la contribución de cada integrante."_

---

## 8. Posibles Preguntas y Respuestas

### "¿Por qué JWT y no sesiones?"
> "JWT es stateless, lo que significa que el backend no necesita almacenar sesiones. Esto facilita escalar horizontalmente porque cualquier instancia del backend puede verificar cualquier token sin compartir memoria o una base de datos de sesiones."

### "¿Cómo se protegen las rutas del frontend?"
> "El frontend verifica el rol desde el contexto de autenticación para mostrar u ocultar elementos de la UI, pero la seguridad real está en el backend. Cada endpoint protegido verifica el token y el rol antes de ejecutar cualquier operación."

### "¿Qué pasa si el token expira?"
> "El token expira después de 60 minutos. El usuario debe iniciar sesión nuevamente. Es una limitación aceptable para un MVP. En producción se podrían implementar refresh tokens."

### "¿Cómo manejaron la superposición de reservas?"
> "Hacemos una consulta SQL que busca reservas existentes para el mismo espacio y fecha, donde los horarios se superpongan y el estado sea esperando o aprobada. Si existe alguna, rechazamos la nueva reserva."

### "¿Qué pasa si el servidor se cae?"
> "Docker Compose reinicia los contenedores automáticamente. Los datos persisten porque PostgreSQL usa un volumen de Docker. La única pérdida serían las sesiones JWT activas, pero el usuario puede volver a iniciar sesión."

### "Diferencias entre desarrollo y producción"
> "En desarrollo usamos uvicorn --reload para hot-reload. En producción, el Dockerfile construye una imagen optimizada con multi-stage build. Las variables de entorno cambian (SECRET_KEY, CORS origins)."

---

## 9. Explicación Individual por Integrante

### Integrante 1 — Usuarios, Auth y Roles
**Debe saber explicar:**
- Cómo funciona el hash de contraseñas con bcrypt
- Cómo se genera y verifica el JWT
- Cómo se implementaron los roles
- El flujo de registro y login
- Cómo el frontend maneja el token (localStorage, AuthContext)
- La protección de rutas por rol en frontend y backend

**Archivos clave:**
- `backend/app/auth/auth.py` — hash y JWT
- `backend/app/deps.py` — get_current_user, require_admin
- `backend/app/api/auth.py` — endpoints de auth
- `backend/app/api/usuarios.py` — CRUD usuarios
- `frontend/src/context/AuthContext.tsx` — estado de auth
- `frontend/src/app/login/page.tsx` — login
- `frontend/src/app/register/page.tsx` — registro

### Integrante 2 — Espacios
**Debe saber explicar:**
- CRUD de espacios
- Validación de estado (activo, inactivo, mantenimiento)
- Cómo se lista y filtra espacios

**Archivos clave:**
- `backend/app/models/espacio.py` — modelo
- `backend/app/schemas/espacio.py` — schemas
- `backend/app/api/espacios.py` — endpoints
- `frontend/src/app/espacios/page.tsx` — listado público
- `frontend/src/app/admin/espacios/page.tsx` — gestión admin

### Integrante 3 — Reservas y Despliegue
**Debe saber explicar:**
- Reglas de negocio de reservas
- Validación de superposición de horarios
- Flujo de aprobación/rechazo
- Docker Compose y despliegue

**Archivos clave:**
- `backend/app/models/reserva.py` — modelo
- `backend/app/api/reservas.py` — endpoints
- `backend/app/services/reservas.py` — reglas de negocio
- `docker-compose.yml` — orquestación
- `Dockerfile` (backend y frontend)

---

## 10. Checklist Pre-Sustentación

- [ ] Probar `docker compose up --build` de principio a fin
- [ ] Probar los 14 casos de PRUEBAS.md
- [ ] Tener Swagger abierto en `http://localhost:8000/docs`
- [ ] Tener frontend abierto en `http://localhost:3000`
- [ ] Tener terminal lista para `git log` y `git branch`
- [ ] Cada integrante preparó su explicación individual
- [ ] Probar la demo completa (11 pasos) de corrido
- [ ] Preparar respuestas a posibles preguntas
- [ ] Tener capturas de pantalla del sistema funcionando
- [ ] Verificar que README.md esté completo y legible
