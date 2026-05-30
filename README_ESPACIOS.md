# Módulo de Espacios Institucionales - Integrante 2

## Descripción
Este módulo implementa la funcionalidad completa para la gestión de espacios institucionales en el sistema de reservas. Incluye backend, frontend y base de datos, siguiendo la asignación vertical del proyecto donde cada integrante debe dominar todas las capas de su módulo.

## Componentes Implementados

### Backend (FastAPI)
- **Modelo de espacio**: Definición de la entidad Espacio con campos id_espacio, nombre, ubicacion, capacidad y estado
- **Schemas Pydantic**: Validación de datos para creación y actualización de espacios
- **Endpoints CRUD**:
  - POST /espacios/ - Crear espacio (solo administradores)
  - GET /espacios/ - Listar espacios (todos los usuarios autenticados, con filtro opcional por estado)
  - GET /espacios/{id} - Obtener espacio específico
  - PUT /espacios/{id} - Actualizar espacio (solo administradores)
  - DELETE /espacios/{id} - Eliminar espacio (solo administradores)
- **Validaciones**:
  - Nombre de espacio único
  - Estado válido (activo, inactivo, mantenimiento)
  - Capacidad positiva (> 0)
- **Seguridad**:
  - Protección JWT en todos los endpoints
  - Rol admin requerido para operaciones de modificación
  - Integración con el sistema de autenticación del Integrante 1

### Base de Datos (PostgreSQL)
- **Tabla espacios**:
  - id_espacio (INTEGER, PK)
  - nombre (VARCHAR(100), único)
  - ubicacion (VARCHAR(200))
  - capacidad (INTEGER)
  - estado (VARCHAR(20): activo, inactivo, mantenimiento)
- **Datos iniciales**: 6 espacios de prueba en diferentes estados para validación

### Frontend (Next.js)
- **Servicio de espacios**: Consumo de API con manejo automático de JWT vía interceptors
- **Vista pública**: Listado de espacios con filtros por estado (accesible para todos los usuarios autenticados)
- **Vista administrativa**: Gestión completa de espacios (crear, editar, eliminar) con modales (solo para administradores)
- **Componentes reutilizables**: Tarjeta de espacio para visualización consistente
- **Manejo de estados**: Indicadores de carga, mensajes de éxito y error

## Integración con Otros Módulos

### Con Módulo de Usuarios (Integrante 1)
- Utiliza el sistema de autenticación JWT implementado por el Integrante 1
- Todos los endpoints requieren autenticación Bearer token
- Los endpoints de modificación (POST, PUT, DELETE) verifican rol admin
- El frontend obtiene y gestiona el token JWT tras el login

### Con Módulo de Reservas (Integrante 3)
- Los espacios serán referenciados por las reservas mediante clave foránea id_espacio
- Al crear una reserva, el Integrante 3 validará:
  - Existencia del espacio (GET /espacios/{id})
  - Estado activo del espacio
  - Capacidad suficiente para la reserva
  - Ausencia de conflictos de horario

## Cómo Ejecutar

### Prerrequisitos
- Docker y Docker Compose
- Node.js y npm (para desarrollo frontend)
- Python 3.9+ y pip (para desarrollo backend)

### Con Docker Compose (Recomendado)
```bash
# Desde la raíz del proyecto
docker-compose up --build
```

Luego acceder a:
- API Backend: http://localhost:8000 (documentación en http://localhost:8000/docs)
- Frontend: http://localhost:3000/espacios
- Panel de administración: http://localhost:3000/admin/espacios

### Desarrollo Local
#### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Endpoints de la API

### Gestión de Espacios
| Método | Endpoint | Descripción | Acceso |
|--------|----------|-------------|---------|
| POST | /espacios/ | Crear nuevo espacio | Solo admin |
| GET | /espacios/ | Listar espacios (con filtro opcional por estado) | Todos autenticados |
| GET | /espacios/{id} | Obtener espacio específico | Todos autenticados |
| PUT | /espacios/{id} | Actualizar espacio | Solo admin |
| DELETE | /espacios/{id} | Eliminar espacio | Solo admin |

## Casos de Uso

### Para Usuarios Normales
1. Iniciar sesión (usando el módulo de autenticación del Integrante 1)
2. Consultar espacios disponibles (/espacios/)
3. Filtrar espacios por estado (activo, inactivo, mantenimiento)
4. Ver detalles de un espacio específico

### Para Administradores
1. Iniciar sesión con credenciales de admin
2. Acceder al panel de administración de espacios
3. Crear nuevos espacios con validación de datos
4. Editar espacios existentes
5. Eliminar espacios no utilizados
6. Ver lista completa de espacios con capacidad de filtrado

## Pruebas Recomendadas

1. **Autenticación**:
   - Verificar que endpoints protegidos requieren token válido
   - Confirmar que usuarios normales no pueden acceder a endpoints admin
   - Validar que tokens expirados son rechazados

2. **Creación de Espacios**:
   - Intentar crear espacio con nombre duplicado → Error 400
   - Intentar crear espacio con estado inválido → Error 400
   - Intentar crear espacio con capacidad negativa o cero → Error 400
   - Crear espacio válido → Éxito 201

3. **Lectura de Espacios**:
   - Listar todos los espacios → Devolver array
   - Filtrar por estado activo → Solo espacios activos
   - Obtener espacio existente por ID → Devolver objeto
   - Obtener espacio inexistente por ID → Error 404

4. **Actualización de Espacios**:
   - Actualizar campos parciales → Solo campos especificados cambiados
   - Intentar actualizar con estado inválido → Error 400
   - Intentar actualizar con capacidad inválida → Error 400
   - Actualizar espacio inexistente → Error 404

5. **Eliminación de Espacios**:
   - Eliminar espacio existente → Éxito 204
   - Eliminar espacio inexistente → Error 404
   - (Nota: Verificación de reservas asociadas será implementada por el Integrante 3)

## Consideraciones de Diseño

### Consistencia de Datos
- Las mismas validaciones se aplican en backend y frontend para evitar inconsistencias
- Los mensajes de error son claros y específicos para facilitar la depuración
- Los estados de espacio siguen un conjunto limitado y bien definido

### Seguridad
- Nunca se devuelven contraseñas o datos sensibles en las respuestas
- Todos los endpoints modificadores requieren autenticación y autorización adecuadas
- Los tokens JWT se manejan de forma segura en el frontend (httpOnly cookies podrían ser una mejora futura)

### Usabilidad
- Interfaces responsivas que funcionan en móvil y escritorio
- Indicadores visuales claros para estados de carga y operaciones en curso
- Mensajes de feedback inmediatos para acciones del usuario
- Validación temprana en frontend para mejorar experiencia de usuario

## Próximos Pasos

1. **Integración completa**: Probar con los módulos de usuarios y reservas para validar flujos completos
2. **Pruebas de rendimiento**: Evaluar comportamiento bajo carga moderada
3. **Mejoras de seguridad**: Considerar refresh tokens y mecanismos de revocación
4. **Escalabilidad**: Preparar para horizontal scaling si es necesario
5. **Documentación de API**: Enriquecer Swagger con ejemplos y descripciones detalladas

---
*Implementado por: Integrante 2*
*Proyecto: Gestión de Reservas de Espacios Institucionales*
*Fecha: $(date)*