# README - Rama `dev` - Proyecto de Reservas de Espacios Institucionales

## Arquitectura del Frontend y Backend

### Backend (FastAPI)
El backend está implementado con FastAPI y sigue una arquitectura modular por funcionalidad:

```
backend/
  app/
    api/
      auth.py          # Endpoints de autenticación (Integrante 1)
      usuarios.py      # Endpoints de gestión de usuarios (Integrante 1)
      espacios.py      # Endpoints de gestión de espacios (Integrante 2)
      reservas.py      # Endpoints de gestión de reservas (Integrante 3)
    models/
      usuario.py       # Modelo SQLAlchemy de usuarios (Integrante 1)
      espacio.py       # Modelo SQLAlchemy de espacios (Integrante 2)
      reserva.py       # Modelo SQLAlchemy de reservas (Integrante 3)
    schemas/
      usuario.py       # Schemas Pydantic de usuarios (Integrante 1)
      espacio.py       # Schemas Pydantic de espacios (Integrante 2)
      reserva.py       # Schemas Pydantic de reservas (Integrante 3)
    crud/
      usuarios.py      # Operaciones CRUD de usuarios (Integrante 1)
      espacios.py      # Operaciones CRUD de espacios (Integrante 2)
      reservas.py      # Operaciones CRUD de reservas (Integrante 3)
    auth/
      # Funciones de autenticación y JWT (Integrante 1)
    db/
      session.py       # Configuración de conexión a base de datos
      base_class.py    # Base declarativa para modelos SQLAlchemy
    initial_data/
      espacios.py      # Datos iniciales de espacios (Integrante 2)
      # Otros datos iniciales según corresponda
  main.py              # Punto de entrada de la aplicación
  requirements.txt     # Dependencias del backend
  Dockerfile           # Configuración para contenedor Docker
```

### Frontend (Next.js)
El frontend está implementado con Next.js y sigue una estructura por funcionalidad:

```
frontend/
  components/
    EspacioCard.js                 # Componente reutilizable para espacios (Integrante 2)
    # Otros componentes según corresponda
  pages/
    espacios.js                    # Vista pública para listar espacios (Integrante 2)
    admin/
      espacios.js                  # Vista de administración para gestionar espacios (Integrante 2)
    # Otras páginas según corresponda (login, reservas, etc.)
  services/
    espacioService.js              # Servicio para consumir API de espacios (Integrante 2)
    # Otros servicios según corresponda
  styles/
    globals.css                    # Estilos globales
  pages/
    _app.js                        # Componente raíz personalizado para manejar autenticación
  package.json                     # Dependencias del frontend
  Dockerfile                       # Configuración para contenedor Docker
```

### Base de Datos (PostgreSQL)
La base de datos está diseñada para soportar los tres módulos funcionales:

#### Tabla `usuarios` (Integrante 1)
- `id` (INTEGER, PK): Identificador único del usuario
- `username` (VARCHAR(80)): Nombre de usuario único
- `email` (VARCHAR(255)): Correo electrónico único
- `hashed_password` (VARCHAR(255)): Contraseña cifrada
- `rol` (VARCHAR(20)): Rol del usuario ('admin' o 'usuario')
- `created_at` (TIMESTAMP): Fecha de creación
- `updated_at` (TIMESTAMP): Fecha de última actualización

#### Tabla `espacios` (Integrante 2)
- `id_espacio` (INTEGER, PK): Identificador único del espacio
- `nombre` (VARCHAR(100)): Nombre del espacio
- `ubicacion` (VARCHAR(200)): Ubicación física del espacio
- `capacidad` (INTEGER): Capacidad máxima de personas
- `estado` (VARCHAR(20)): Estado actual (activo, inactivo, mantenimiento)

#### Tabla `reservas` (Integrante 3)
- `id_reserva` (INTEGER, PK): Identificador único de la reserva
- `id_usuario` (INTEGER, FK): Referencia al usuario que hizo la reserva
- `id_espacio` (INTEGER, FK): Referencia al espacio reservado
- `fecha_reserva` (DATE): Fecha de la reserva
- `hora_inicio` (TIME): Hora de inicio de la reserva
- `hora_fin` (TIME): Hora de fin de la reserva
- `estado` (VARCHAR(20)): Estado de la reserva (esperando, aprobada, rechazada, cancelada)
- `created_at` (TIMESTAMP): Fecha de creación
- `updated_at` (TIMESTAMP): Fecha de última actualización

## Tecnologías y Librerías

### Backend
- **FastAPI**: Framework web moderno para construir APIs con Python
- **Uvicorn**: Servidor ASGI para ejecutar aplicaciones FastAPI
- **SQLAlchemy**: ORM para interactuar con la base de datos PostgreSQL
- **Psycopg2-binary**: Adaptador de PostgreSQL para Python
- **Pydantic**: Validación de datos y gestión de configuraciones
- **Python-JWT**: Implementación de JSON Web Tokens para autenticación
- **Passlib**: Biblioteca para hash de contraseñas seguras
- **Python-Multipart**: Soporte para manejo de formularios en FastAPI
- **Python-Dotenv**: Gestión de variables de entorno

### Frontend
- **Next.js**: Framework de React para aplicaciones web renderizadas en el servidor
- **React**: Biblioteca para construir interfaces de usuario
- **Axios**: Cliente HTTP para consumir APIs REST
- **Tailwind CSS**: Framework CSS para diseño responsivo (configurado en package.json y estilos)

### Base de Datos
- **PostgreSQL**: Sistema de gestión de bases de datos relacionales objeto-relacional

## Modelo de Base de Datos

### Relaciones entre tablas
1. **Usuarios ↔ Reservas**: Un usuario puede tener múltiples reservas (uno-a-muchos)
2. **Espacios ↔ Reservas**: Un espacio puede tener múltiples reservas (uno-a-muchos)

### Restricciones de integridad
- Claves primarias únicas en todas las tablas
- Claves foráneas que garantizan referencialidad entre tablas
- Campos únicos donde aplica (username, email en usuarios; nombre en espacios)
- Restricciones de check para valores válidos de estado y rol

## Endpoints Desarrollados

### Autenticación (Integrante 1)
- POST /auth/login - Iniciar sesión y obtener JWT
- POST /usuarios - Registrar nuevo usuario
- GET /usuarios - Listar usuarios (solo admin)

### Espacios (Integrante 2)
- POST /espacios/ - Crear nuevo espacio (solo admin)
- GET /espacios/ - Listar espacios (todos autenticados, filtro por estado opcional)
- GET /espacios/{id} - Obtener espacio específico
- PUT /espacios/{id} - Actualizar espacio (solo admin)
- DELETE /espacios/{id} - Eliminar espacio (solo admin)

### Reservas (Integrante 3)
- POST /reservas/ - Crear nueva reserva
- GET /reservas/ - Listar reservas (filtrado según rol)
- GET /reservas/mis-reservas - Listar reservas del usuario actual
- PUT /reservas/{id}/estado - Actualizar estado de reserva (solo admin)
- PUT /reservas/{id}/cancelar - Cancelar reserva (usuario propietario o admin)

## Autenticación JWT y Roles

### Flujo de Autenticación
1. El usuario envía credenciales a `/auth/login`
2. El backend verifica las credenciales y genera un JWT firmado
3. El frontend almacena el JWT en localStorage
4. Para peticiones protegidas, el frontend incluye el JWT en el header Authorization: Bearer <token>
5. El backend valida el JWT en cada petición protegida

### Roles y Permisos
- **Usuario**: Puede consultar espacios, crear reservas, ver y cancelar sus propias reservas
- **Admin**: Puede realizar todas las operaciones de usuarios PLUS:
  - Gestionar usuarios (crear, listar)
  - Gestionar espacios (crear, leer, actualizar, eliminar)
  - Gestionar reservas (ver todas, aprobar, rechazar, cancelar cualquiera)

### Middleware de Protección
- `get_current_active_user`: Verifica que el usuario esté autenticado y activo
- `get_current_admin_user`: Verifica que el usuario esté autenticado, activo y tenga rol admin

## Reglas de Negocio Implementadas

### Validaciones en Espacios
1. Nombre de espacio debe ser único
2. Estado debe ser uno de: activo, inactivo, mantenimiento
3. Capacidad debe ser un número positivo mayor a cero

### Validaciones en Reservas (Integrante 3 - coordinación necesaria)
1. Solo usuarios autenticados pueden crear reservas
2. No permitir reservas superpuestas en el mismo espacio
3. Exigir mínimo 24 horas de anticipación para reservas
4. Permitir reservas solo en horarios válidos:
   - Lunes a viernes: 7:00 a.m. a 8:00 p.m.
   - Sábados: 8:00 a.m. a 12:00 m.
   - Domingos: no permitido
5. Validar que hora_inicio sea menor que hora_fin
6. Bloquear reservas en espacios inactivos, en mantenimiento o no disponibles
7. Validar que la cantidad de asistentes no supere la capacidad del espacio
8. Crear reservas inicialmente en estado `esperando`
9. Considerar reservas `esperando` y `aprobada` como bloqueantes
10. No considerar reservas `rechazada` como bloqueantes

## Instrucciones para Ejecutar en Desarrollo

### Prerrequisitos
- Git para clonar el repositorio
- Docker y Docker Compose para contenedores
- O alternativamente:
  - Python 3.9+ y pip para backend
  - Node.js 14+ y npm para frontend
  - PostgreSQL para base de datos

### Opción 1: Con Docker Compose (Recomendado)
1. Clonar el repositorio: `git clone <repository-url>`
2. Navegar al directorio: `cd TFinal_GestionReservas`
3. Copiar variables de entorno: `cp .env.example .env`
4. Construir y levantar servicios: `docker-compose up --build`
5. Esperar a que todos los servicios estén listos
6. Acceder a:
   - API Backend: http://localhost:8000 (documentación en http://localhost:8000/docs)
   - Frontend: http://localhost:3000/espacios
   - Panel de administración: http://localhost:3000/admin/espacios

### Opción 2: Desarrollo Local
#### Backend
1. Navegar al directorio backend: `cd backend`
2. Instalar dependencias: `pip install -r requirements.txt`
3. Configurar variables de entorno (crear .env basado en .env.example)
4. Inicializar base de datos: Las tablas se crean automáticamente al iniciar la aplicación
5. Iniciar servidor: `uvicorn app.main:app --reload`
6. La API estará disponible en http://localhost:8000

#### Frontend
1. Navegar al directorio frontend: `cd frontend`
2. Instalar dependencias: `npm install`
3. Configurar variables de entorno (crear .env.local basado en .env.example)
4. Iniciar servidor de desarrollo: `npm run dev`
5. La aplicación estará disponible en http://localhost:3000

## Variables de Entorno

### Backend (.env)
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/reservas_db
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Pruebas Funcionales Básicas

Para validar la implementación, realizar las siguientes pruebas:

1. **Autenticación**:
   - Registrar un nuevo usuario
   - Iniciar sesión con credenciales válidas → Debe retornar JWT
   - Iniciar sesión con credenciales inválidas → Debe retornar error 401
   - Acceder a endpoint protegido sin token → Debe retornar error 401
   - Acceder a endpoint protegido con token expirado → Debe retornar error 401

2. **Espacios (Integrante 2)**:
   - Iniciar sesión como usuario normal
   - GET /espacios/ → Debería devolver lista de espacios iniciales
   - GET /espacios/?estado=activo → Debería devolver solo espacios activos
   - GET /espacios/{id} válido → Debería devolver el espacio específico
   - GET /espacios/{id} inexistente → Debería retornar error 404
   - Intentar POST /espacios/ sin token → Debe retornar error 401
   - Intentar POST /espacios/ como usuario normal → Debe retornar error 403
   - Iniciar sesión como admin
   - POST /espacios/ con datos válidos → Debe crear espacio y retornar 201
   - POST /espacios/ con nombre duplicado → Debe retornar error 400
   - POST /espacios/ con estado inválido → Debe retornar error 400
   - POST /espacios/ con capacidad <= 0 → Debe retornar error 400
   - PUT /espacios/{id} válido como admin → Debería actualizar el espacio
   - DELETE /espacios/{id} válido como admin → Debería eliminar el espacio y retornar 204

3. **Flujo completo**:
   - Iniciar sesión como usuario normal
   - Consultar espacios disponibles
   - Intentar crear reserva en espacio activo → Debería crear reserva en estado esperando
   - Intentar crear reserva en espacio inactivo → Debería retornar error
   - Cerrar sesión e iniciar sesión como admin
   - Ver todas las reservas
   - Aprobar una reserva pendiente
   - Ver que el estado cambió a aprobada

## Guía de Solución de Problemas Comunes

### Problemas de Conexión a Base de Datos
- **Síntoma**: Errores de conexión al iniciar la aplicación
- **Solución**: 
  - Verificar que PostgreSQL esté ejecutándose
  - Comprobar las credenciales en DATABASE_URL
  - Asegurarse de que la base de datos reservas_db exista

### Problemas de CORS
- **Síntoma**: El frontend no puede consumir la API debido a políticas CORS
- **Solución**:
  - Verificar que el middleware CORS esté configurado correctamente en main.py
  - En desarrollo, allow_origins=["*"] es aceptable
  - En producción, especificar los orígenes exactos

### Problemas de Autenticación JWT
- **Síntoma**: Token rechazado o usuario no autorizado
- **Solución**:
  - Verificar que SECRET_KEY sea consistente en todas las instancias
  - Comprobar que el token no esté expirado
  - Asegurarse de que el header Authorization tenga el formato correcto: Bearer <token>

### Problemas de Puertos en Conflicto
- **Síntoma**: Error al iniciar los contenedores debido a puertos ya en uso
- **Solución**:
  - Cambiar los puertos en docker-compose.yml si es necesario
  - Detener otros servicios que puedan estar usando los mismos puertos
  - Verificar que ningún otro proceso esté usando los puertos 8000 y 3000

---
*Documentación preparada para la rama `dev` del proyecto*
*Última actualización: $(date)*