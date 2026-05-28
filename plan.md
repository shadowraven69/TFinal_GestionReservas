# Plan de Trabajo - Proyecto de Reservas de Espacios Institucionales

## 1. Objetivo del Proyecto

Desarrollar y desplegar una aplicacion web para gestionar reservas de espacios institucionales, integrando frontend, backend, base de datos, autenticacion JWT, control de roles, reglas de negocio, documentacion tecnica y despliegue con Docker Compose.

El proyecto debe entregarse en un repositorio GitHub con tres ramas:

- `dev`: desarrollo del frontend, backend y documentacion tecnica.
- `ops`: configuracion de despliegue con Docker, Docker Compose y documentacion operativa.
- `main`: version final integrada, manual de usuario e informe final.

Stack definido:

- Frontend: Next.js.
- Backend: FastAPI.
- Base de datos: PostgreSQL.
- ORM: SQLAlchemy.
- Autenticacion: JWT.
- Despliegue: Docker y Docker Compose.

## 2. Integrantes y Distribucion Equitativa

El equipo no se divide por capas aisladas. Cada integrante debe tocar backend, frontend y base de datos, porque en la sustentacion todos deben demostrar que entienden el sistema completo.

La distribucion sera por modulos funcionales verticales:

| Integrante | Modulo Principal | Backend | Frontend | Base de Datos |
|---|---|---|---|---|
| Integrante 1 | Usuarios, autenticacion y roles | Endpoints de login, registro, JWT y permisos | Pantallas de login, sesion y navegacion por rol | Tabla `usuarios`, roles y usuario admin inicial |
| Integrante 2 | Espacios institucionales | Endpoints CRUD de espacios y validacion de estado | Pantallas para consultar y gestionar espacios | Tabla `espacios` y datos iniciales de espacios |
| Integrante 3 | Reservas y despliegue | Endpoints de reservas, estados y reglas de negocio | Pantallas para crear, consultar, cancelar, aprobar y rechazar reservas | Tabla `reservas`, relaciones y validaciones de integridad |

Todos tambien participan en Docker, documentacion, pruebas e integracion. Esta division evita el error clasico de que una persona "solo sabe frontend" o "solo sabe base de datos". Eso en una sustentacion te deja vendido.

## 3. Fase 1 - Organizacion Inicial

### Paso 1. Crear repositorio en GitHub

Responsable principal: todos

Tareas:

- Crear el repositorio del proyecto.
- Crear las ramas `dev`, `ops` y `main`.
- Configurar reglas basicas de trabajo:
  - Todo desarrollo funcional se hace primero en `dev`.
  - Todo despliegue se trabaja en `ops`.
  - `main` recibe la version final integrada.
- Verificar que cada integrante tenga acceso al repositorio.

Entregable:

- Repositorio GitHub creado con las tres ramas requeridas.

## 4. Fase 2 - Analisis del Problema y Diseno

Responsable principal: todos

Tareas:

- Definir el nombre de la aplicacion.
- Confirmar las entidades principales:
  - Usuarios
  - Espacios
  - Reservas
- Definir roles:
  - `admin`
  - `usuario`
- Definir estados de reserva:
  - `esperando`
  - `aprobada`
  - `rechazada`
  - `cancelada`
- Disenar el flujo principal:
  - Inicio de sesion.
  - Usuario consulta espacios.
  - Usuario crea reserva.
  - Backend valida reglas de negocio.
  - Admin aprueba o rechaza reserva.
  - Usuario consulta estado de sus reservas.

Entregables:

- Modelo inicial de base de datos.
- Lista clara de endpoints.
- Lista clara de pantallas.
- Reglas de negocio entendidas por todo el equipo.

## 5. Fase 3 - Backend en Rama `dev`

Responsable principal: todos, cada uno en su modulo funcional

### Paso 1. Crear estructura del backend

Estructura sugerida:

```text
backend/
  app/
    api/
      auth.py
      usuarios.py
      espacios.py
      reservas.py
    models/
      usuario.py
      espacio.py
      reserva.py
    schemas/
      usuario.py
      espacio.py
      reserva.py
    crud/
    auth/
    db.py
    main.py
  requirements.txt
  README.md
```

Tareas:

- Crear proyecto FastAPI.
- Configurar conexion a PostgreSQL.
- Configurar SQLAlchemy.
- Crear archivo de dependencias `requirements.txt`.
- Verificar Swagger en `/docs`.

### Paso 2. Implementar modelos y base de datos

Tareas:

- Crear tabla `usuarios`.
- Crear tabla `espacios`.
- Crear tabla `reservas`.
- Definir relaciones:
  - Una reserva pertenece a un usuario.
  - Una reserva pertenece a un espacio.

### Paso 3. Implementar autenticacion y roles

Tareas:

- Registrar usuarios con contrasena cifrada.
- Iniciar sesion.
- Generar JWT.
- Proteger endpoints privados.
- Validar rol `admin` en endpoints administrativos.

### Paso 4. Implementar endpoints

Endpoints minimos:

- `POST /auth/login`
- `POST /usuarios`
- `GET /usuarios`
- `POST /espacios`
- `GET /espacios`
- `PUT /espacios/{id}`
- `POST /reservas`
- `GET /reservas`
- `GET /reservas/mis-reservas`
- `PUT /reservas/{id}/estado`
- `PUT /reservas/{id}/cancelar`

### Paso 5. Implementar reglas de negocio

Validaciones obligatorias:

- Solo usuarios autenticados pueden crear reservas.
- Solo `admin` puede aprobar o rechazar reservas.
- No permitir reservas superpuestas.
- Exigir minimo 24 horas de anticipacion.
- Permitir reservas solo en horarios validos:
  - Lunes a viernes: 7:00 a.m. a 8:00 p.m.
  - Sabados: 8:00 a.m. a 12:00 m.
  - Domingos: no permitido.
- Validar que `hora_inicio` sea menor que `hora_fin`.
- Bloquear reservas en espacios inactivos, en mantenimiento o no disponibles.
- Validar que la cantidad de asistentes no supere la capacidad del espacio.
- Crear reservas inicialmente en estado `esperando`.
- Considerar reservas `esperando` y `aprobada` como bloqueantes.
- No considerar reservas `rechazada` como bloqueantes.

Entregable:

- Backend funcional con Swagger, JWT, roles, endpoints y reglas de negocio.

## 6. Fase 4 - Frontend en Rama `dev`

Responsable principal: todos, cada uno en las pantallas de su modulo funcional

### Paso 1. Crear proyecto Next.js

El frontend se desarrollara con Next.js.

Tareas:

- Crear la aplicacion Next.js dentro de la carpeta `frontend/`.
- Definir estructura basica de carpetas para paginas, componentes, servicios y estilos.
- Configurar variables de entorno para la URL del backend.
- Crear servicios para consumir la API de FastAPI.
- Definir manejo del token JWT en el cliente.

### Paso 2. Crear pantallas principales

Pantallas minimas:

- Login.
- Panel de usuario.
- Consulta de espacios.
- Creacion de reserva.
- Mis reservas.
- Panel de administrador.
- Gestion de espacios.
- Gestion de reservas.

### Paso 3. Integrar con backend

Tareas:

- Consumir endpoints de autenticacion.
- Guardar token JWT.
- Enviar token en peticiones protegidas.
- Mostrar opciones segun rol.
- Mostrar mensajes de error provenientes del backend.
- Validar formularios en cliente.

Entregable:

- Frontend funcional conectado al backend, con vistas separadas para `admin` y `usuario`.

## 7. Fase 5 - Base de Datos y Datos Iniciales

Responsable principal: todos, cada uno en las tablas y datos de su modulo funcional

Tareas:

- Configurar PostgreSQL.
- Definir variables de entorno para conexion.
- Crear datos iniciales para pruebas:
  - Un usuario administrador.
  - Un usuario normal.
  - Varios espacios institucionales.
- Verificar persistencia de datos.

Entregable:

- Base de datos funcional y lista para pruebas locales y despliegue.

## 8. Fase 6 - Despliegue en Rama `ops`

Responsable principal: todos

Tareas:

- Crear `Dockerfile` del backend.
- Crear `Dockerfile` del frontend.
- Crear `docker-compose.yml`.
- Crear `.env.example`.
- Configurar servicios:
  - Frontend.
  - Backend.
  - PostgreSQL.
- Configurar red entre contenedores.
- Configurar volumen para persistencia de PostgreSQL.
- Exponer puertos necesarios.
- Verificar que el sistema levante con:

```bash
docker compose up --build
```

Entregable:

- Sistema completo ejecutandose con Docker Compose en Linux o WSL.

## 9. Fase 7 - Documentacion

La documentacion es parte central de la nota. No se deja para el ultimo dia.

### README de rama `dev`

Responsable principal: todos

Debe incluir:

- Arquitectura del frontend y backend.
- Estructura de carpetas.
- Tecnologias y librerias.
- Modelo de base de datos.
- Endpoints desarrollados.
- Autenticacion JWT y roles.
- Reglas de negocio implementadas.
- Instrucciones para ejecutar en desarrollo.

### README de rama `ops`

Responsable principal: todos

Debe incluir:

- Requisitos previos.
- Clonacion del repositorio.
- Configuracion de `.env`.
- Explicacion de variables de entorno.
- Dockerfile del frontend.
- Dockerfile del backend.
- Explicacion de `docker-compose.yml`.
- Puertos utilizados.
- Comandos de construccion y ejecucion.
- Apagado, reinicio y solucion de errores comunes.

### README de rama `main`

Responsable principal: todos

Debe incluir:

- Nombre de la aplicacion.
- Descripcion general.
- Objetivo.
- Integrantes y rol de cada uno.
- Problema que resuelve.
- Arquitectura general.
- Tecnologias usadas.
- Resumen del despliegue.
- Tutorial de uso con imagenes.
- Conclusiones.
- Dificultades.
- Aprendizajes.
- Mejoras futuras.

Entregable:

- Tres README completos, claros y reproducibles.

## 10. Fase 8 - Integracion en Rama `main`

Responsable principal: todos

Tareas:

- Probar backend completo.
- Probar frontend completo.
- Probar Docker Compose.
- Integrar cambios de `dev` y `ops` en `main`.
- Verificar que el README de `main` funcione como informe final.
- Confirmar que cada integrante tenga commits visibles.

Entregable:

- Version final integrada en `main`.

## 11. Fase 9 - Pruebas Obligatorias

Responsable principal: todos

Pruebas funcionales minimas:

| Caso | Resultado Esperado |
|---|---|
| Login con usuario valido | Retorna JWT |
| Login con credenciales incorrectas | Retorna error |
| Usuario crea reserva valida | Reserva queda en estado `esperando` |
| Usuario intenta reservar espacio ocupado | Retorna error por conflicto |
| Usuario intenta reservar con menos de 24 horas | Retorna error |
| Usuario intenta reservar domingo | Retorna error |
| Usuario intenta reservar fuera de horario | Retorna error |
| Usuario supera capacidad del espacio | Retorna error |
| Usuario reserva espacio inactivo | Retorna error |
| Admin aprueba reserva | Estado cambia a `aprobada` |
| Admin rechaza reserva | Estado cambia a `rechazada` |
| Usuario consulta sus reservas | Solo ve sus reservas |
| Admin consulta reservas | Ve todas las reservas |
| Docker Compose levanta servicios | Frontend, backend y base de datos funcionan |

Entregable:

- Evidencia de pruebas para la sustentacion.

## 12. Fase 10 - Preparacion de Sustentacion

Responsable principal: todos

Cada integrante debe poder explicar:

- Arquitectura general del sistema.
- Su aporte individual.
- Flujo de autenticacion JWT.
- Roles y permisos.
- Modelo de base de datos.
- Reglas de negocio.
- Despliegue con Docker Compose.
- Errores encontrados y como se solucionaron.

Demo sugerida:

1. Levantar el sistema con Docker Compose.
2. Entrar al frontend.
3. Iniciar sesion como usuario.
4. Consultar espacios.
5. Crear una reserva valida.
6. Intentar crear una reserva invalida para demostrar reglas de negocio.
7. Iniciar sesion como admin.
8. Aprobar o rechazar una reserva.
9. Mostrar Swagger del backend.
10. Mostrar estructura del repositorio y ramas.
11. Mostrar commits de cada integrante.

## 13. Cronograma Sugerido para 20 Dias

| Dias | Actividad | Responsable Principal |
|---|---|---|
| 1-2 | Crear repositorio, ramas y diseno inicial | Todos |
| 3-5 | Modelos, schemas y tablas por modulo | Todos |
| 6-8 | Endpoints por modulo funcional | Todos |
| 6-9 | Pantallas Next.js por modulo funcional | Todos |
| 9-11 | Integracion frontend-backend por modulo | Todos |
| 10-12 | Reglas de negocio, permisos y validaciones cruzadas | Todos |
| 12-14 | Dockerfiles, Compose y `.env.example` | Todos |
| 14-16 | Pruebas funcionales e integracion | Todos |
| 16-18 | README de `dev`, `ops` y `main` | Todos |
| 19 | Ensayo de sustentacion | Todos |
| 20 | Ajustes finales y entrega | Todos |

## 14. Reparticion Segun Criterios de Evaluacion

| Criterio | Porcentaje | Responsable Principal | Participacion del Equipo |
|---|---:|---|---|
| Desarrollo | 20% | Todos | Cada integrante desarrolla backend, frontend y DB de su modulo |
| Despliegue | 10% | Todos | Cada integrante verifica que su modulo funcione en Docker |
| Documentacion | 20% | Todos | Cada integrante documenta su modulo y revisa la documentacion general |
| Sustentacion | 50% | Todos | Cada integrante explica su modulo y tambien el flujo completo del sistema |

La sustentacion vale la mitad de la nota. Por eso cada integrante debe entender mas que "su parte". Si una persona solo sabe explicar una carpeta, el equipo queda debil. El objetivo es que todos puedan defender la arquitectura completa.

## 15. Checklist Final

- [ ] Repositorio GitHub creado.
- [ ] Ramas `dev`, `ops` y `main` creadas.
- [ ] Backend FastAPI funcional.
- [ ] Base de datos PostgreSQL funcional.
- [ ] Autenticacion JWT implementada.
- [ ] Roles `admin` y `usuario` implementados.
- [ ] Endpoints de usuarios implementados.
- [ ] Endpoints de espacios implementados.
- [ ] Endpoints de reservas implementados.
- [ ] Reglas de negocio implementadas.
- [ ] Frontend funcional.
- [ ] Vistas diferenciadas por rol.
- [ ] Manejo de errores en frontend y backend.
- [ ] Dockerfile del backend creado.
- [ ] Dockerfile del frontend creado.
- [ ] `docker-compose.yml` funcional.
- [ ] `.env.example` creado.
- [ ] README de `dev` completo.
- [ ] README de `ops` completo.
- [ ] README de `main` completo.
- [ ] Imagenes del tutorial agregadas.
- [ ] Commits de cada integrante visibles.
- [ ] Pruebas realizadas.
- [ ] Sustentacion ensayada.
