# Sistema de Reservas de Espacios Institucionales

Aplicación web para la gestión de reservas de espacios institucionales. Permite a los usuarios consultar espacios disponibles, crear reservas, y a los administradores gestionar espacios y aprobar o rechazar solicitudes.

---

## Integrantes y Rol de Cada Uno

| Integrante | Módulo | Backend | Frontend | Base de Datos |
|------------|--------|---------|----------|---------------|
| **Integrante 1** | Usuarios, autenticación y roles | Login, registro, JWT, permisos | Pantallas de login, registro, navbar por rol | Tabla usuarios, roles, seed admin |
| **Integrante 2** | Espacios institucionales | CRUD de espacios, validación de estado | Consulta y gestión de espacios | Tabla espacios, datos iniciales |
| **Integrante 3** | Reservas y despliegue | Endpoints de reservas, reglas de negocio | Creación, consulta y gestión de reservas | Tabla reservas, relaciones, validaciones |

---

## Problema que Resuelve

Las instituciones educativas y organizaciones manejan la reserva de espacios (salones, auditorios, laboratorios) de forma manual con planillas de papel, correos electrónicos o pizarras físicas. Esto genera:

- **Conflictos de horario** por reservas duplicadas
- **Pérdida de información** cuando se borra una pizarra o se pierde una planilla
- **Falta de control** sobre quién reserva y para qué
- **Dificultad para los administradores** de tener una visión general de la ocupación

Este sistema resuelve todos esos problemas con una plataforma web centralizada con autenticación, roles y reglas de negocio.

---

## Arquitectura General

```
┌──────────────────────────────────────────────────────────────────┐
│                        NAVEGADOR WEB                             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Next.js 14 (App Router)                      │   │
│  │  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │   │
│  │  │ Páginas │  │ Servicios│  │ AuthCtx  │  │ Navbar   │  │   │
│  │  └────┬────┘  └────┬─────┘  └────┬─────┘  └──────────┘  │   │
│  └───────┼────────────┼─────────────┼───────────────────────┘   │
└──────────┼────────────┼─────────────┼───────────────────────────┘
           │            │             │
           ▼            ▼             ▼
     ┌────────────────────────────────────────────────────────────┐
     │              HTTP / JSON (REST API)                        │
     └──────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│                      FastAPI (Python)                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────────┐  │
│  │ Routers  │  │ Schemas  │  │   CRUD   │  │   Services     │  │
│  │ (API)    │──│(Pydantic)│──│(SQLAlch.)│──│(Reglas Negocio)│  │
│  └──────────┘  └──────────┘  └──────────┘  └────────────────┘  │
│  ┌──────────┐  ┌──────────┐                                     │
│  │   Auth   │  │   Deps   │                                     │
│  │(JWT+Hash)│  │(get_user)│                                     │
│  └──────────┘  └──────────┘                                     │
└───────────────────────────────┬─────────────────────────────────┘
                                │ SQLAlchemy ORM
                                ▼
┌──────────────────────────────────────────────────────────────────┐
│                     PostgreSQL                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                      │
│  │ usuarios │  │ espacios │  │ reservas │                      │
│  └──────────┘  └──────────┘  └──────────┘                      │
└──────────────────────────────────────────────────────────────────┘
```

**Flujo de una solicitud típica:**

1. El usuario interactúa con una página del frontend (Next.js)
2. El frontend llama al servicio correspondiente (`services/`)
3. El servicio envía una petición HTTP a la API (FastAPI)
4. El router valida la autenticación (JWT) y permisos (rol)
5. El schema Pydantic valida los datos de entrada
6. El CRUD ejecuta la operación en la base de datos (SQLAlchemy)
7. La respuesta viaja de vuelta por la misma cadena

---

## Tecnologías Usadas

### Backend
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Python | 3.11+ | Lenguaje de programación |
| FastAPI | Última | Framework web REST |
| SQLAlchemy | 2.x | ORM para base de datos |
| Pydantic | 2.x | Validación de datos |
| PostgreSQL | 15 | Base de datos relacional |
| python-jose | Última | Generación y validación de JWT |
| passlib[bcrypt] | Última | Hashing seguro de contraseñas |
| Uvicorn | Última | Servidor ASGI |

### Frontend
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Node.js | 18+ | Entorno de ejecución |
| Next.js | 14.2 | Framework React con App Router |
| React | 18.3 | Librería de interfaz de usuario |
| TypeScript | 5.4 | Tipado estático |

### Infraestructura
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Docker | 24+ | Contenerización |
| Docker Compose | 2.20+ | Orquestación de servicios |

---

## Resumen del Despliegue

El sistema se despliega con Docker Compose y consta de tres contenedores:

```bash
# 1. Clonar el repositorio
git clone <url-del-repositorio>
cd TFinal_GestionReservas

# 2. Crear archivo .env (ver README.ops.md para detalles)
#    DATABASE_URL, SECRET_KEY, ALGORITHM, etc.

# 3. Construir y levantar todos los servicios
docker compose up --build
```

| Servicio | Puerto | Tecnología |
|----------|--------|------------|
| Frontend | 3000 | Next.js 14 |
| Backend | 8000 | FastAPI + Uvicorn |
| Base de datos | 5432 | PostgreSQL 15 |

Una vez corriendo, la aplicación está disponible en `http://localhost:3000`.

---

## Tutorial de Uso

### 1. Iniciar sesión como administrador

1. Abrir `http://localhost:3000`
2. Hacer clic en **Iniciar Sesión**
3. Ingresar:
   - **Usuario**: `admin`
   - **Contraseña**: `admin123`
4. Serás redirigido al panel de administración

### 2. Registrar un nuevo usuario

1. Cerrar sesión y hacer clic en **Registrarse**
2. Completar: nombre de usuario, email y contraseña
3. Al registrarte, serás redirigido al login
4. Iniciar sesión con tus nuevas credenciales

### 3. Consultar espacios disponibles

1. Estando autenticado, hacer clic en **Espacios** en la barra de navegación
2. Se mostrarán todos los espacios activos con su nombre y capacidad
3. Los espacios inactivos o en mantenimiento no aparecen en la lista pública

### 4. Crear una reserva (usuario)

1. Hacer clic en **Nueva Reserva**
2. Seleccionar un espacio, fecha, hora de inicio y hora de fin
3. Ingresar la cantidad de asistentes
4. Enviar la solicitud
5. La reserva quedará en estado `esperando` hasta que un admin la apruebe

### 5. Gestionar reservas (admin)

1. Iniciar sesión como admin
2. Ir a **Reservas** en el panel de administración
3. Ver todas las reservas del sistema
4. Hacer clic en **Aprobar** o **Rechazar** según corresponda

### 6. Gestionar espacios (admin)

1. Ir a **Espacios** en el panel de administración
2. Crear nuevos espacios con nombre y capacidad
3. Editar espacios existentes
4. Cambiar el estado: activo, inactivo o mantenimiento

### 7. Ver estado de tus reservas (usuario)

1. Hacer clic en **Mis Reservas**
2. Ver el estado de cada reserva: `esperando`, `aprobada`, `rechazada` o `cancelada`
3. Si está en estado `esperando`, puedes cancelarla

---

## Conclusiones

### Dificultades Encontradas

- **Coordinación entre módulos**: Al dividir el trabajo por módulos verticales, fue necesario asegurar que los schemas y modelos fueran consistentes entre integrantes para evitar conflictos de integración.
- **Reglas de negocio complejas**: Validar superposición de horarios, capacidad del espacio y restricciones de días/horarios requirió lógica cuidadosa en SQLAlchemy.
- **Docker en Windows**: La configuración de volúmenes y redes en WSL 2 presentó desafíos de permisos y rutas.

### Aprendizajes

- **Arquitectura vertical**: Dividir por módulos funcionales (no por capas) permitió que cada integrante entendiera el flujo completo del sistema.
- **FastAPI + SQLAlchemy**: La combinación de dependencias inyectadas, schemas Pydantic y ORM resulta muy productiva para APIs REST.
- **JWT en la práctica**: Implementar autenticación stateless con tokens requiere coordinar frontend (almacenamiento, envío) y backend (generación, validación, renovación).
- **Docker Compose**: Orquestar múltiples servicios con variables de entorno compartidas simplifica el despliegue y la reproducibilidad.

### Mejoras Futuras

- **Tests automatizados**: Agregar pytest + httpx para backend y vitest + testing-library para frontend
- **Notificaciones**: Enviar emails cuando una reserva sea aprobada o rechazada
- **Calendario visual**: Vista de calendario mensual/semanal para la ocupación de espacios
- **Editar reservas**: Permitir al usuario modificar una reserva existente (no solo cancelarla)
- **Paginación**: Agregar paginación en listados de usuarios, espacios y reservas
- **Recuperación de contraseña**: Flujo de "olvidé mi contraseña" con email de recuperación
- **Dashboard**: Panel con estadísticas de uso, ocupación por espacio, reservas más frecuentes
