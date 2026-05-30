# README de Operaciones — Sistema de Reservas de Espacios Institucionales

## Requisitos Previos

| Requisito | Versión Mínima | Propósito |
|-----------|---------------|-----------|
| Docker | 24+ | Ejecutar contenedores |
| Docker Compose | 2.20+ | Orquestar servicios |
| Git | 2.30+ | Control de versiones |
| WSL 2 (Windows) | — | Entorno Linux en Windows |

Verificar instalación:

```bash
docker --version
docker compose version
git --version
```

## Clonación del Repositorio

```bash
git clone <url-del-repositorio>
cd TFinal_GestionReservas
```

El proyecto utiliza tres ramas:
- `dev` — Desarrollo activo
- `ops` — Configuración de despliegue
- `main` — Versión final integrada

## Variables de Entorno

Crear un archivo `.env` en la raíz del proyecto antes de ejecutar Docker Compose:

```env
# Base de datos
DATABASE_URL=postgresql://postgres:postgres@db:5432/reservas_db

# JWT
SECRET_KEY=change-me-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# CORS
BACKEND_CORS_ORIGINS=["http://localhost:3000"]

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
```

| Variable | Descripción | Valor por Defecto |
|----------|-------------|-------------------|
| `DATABASE_URL` | URL de conexión a PostgreSQL | `postgresql://postgres:postgres@db:5432/reservas_db` |
| `SECRET_KEY` | Clave secreta para firmar JWT | `change-me-in-production` |
| `ALGORITHM` | Algoritmo de firma JWT | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Minutos hasta expiración del token | `60` |
| `BACKEND_CORS_ORIGINS` | Orígenes permitidos por CORS | `["http://localhost:3000"]` |
| `NEXT_PUBLIC_API_URL` | URL del backend para el frontend | `http://localhost:8000` |

> **Importante**: En producción, cambiar `SECRET_KEY` por una clave segura. Se puede generar con:
> ```bash
> openssl rand -hex 32
> ```

## Dockerfile del Backend

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

- Usa la imagen oficial `python:3.11-slim` para mantener el tamaño reducido
- Instala dependencias primero para aprovechar la cache de Docker
- Expone el puerto 8000 para la API
- Ejecuta Uvicorn como servidor ASGI

## Dockerfile del Frontend

```dockerfile
# Etapa de construcción
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Etapa de producción
FROM node:18-alpine
WORKDIR /app
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package*.json ./
RUN npm ci --only=production
EXPOSE 3000
CMD ["npm", "start"]
```

- Construcción en dos etapas (multi-stage build) para reducir el tamaño final
- Primera etapa: instala dependencias y compila la aplicación
- Segunda etapa: solo copia los archivos necesarios para producción
- Expone el puerto 3000

## Docker Compose

El archivo `docker-compose.yml` define tres servicios:

```yaml
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: reservas_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://postgres:postgres@db:5432/reservas_db
      SECRET_KEY: ${SECRET_KEY}
      ALGORITHM: ${ALGORITHM}
      ACCESS_TOKEN_EXPIRE_MINUTES: ${ACCESS_TOKEN_EXPIRE_MINUTES}
      BACKEND_CORS_ORIGINS: ${BACKEND_CORS_ORIGINS}
    depends_on:
      - db

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL}
    depends_on:
      - backend

volumes:
  pgdata:
```

### Servicios

| Servicio | Puerto | Depende de | Imagen |
|----------|--------|------------|--------|
| `db` | 5432 | — | postgres:15 |
| `backend` | 8000 | db | Construcción local |
| `frontend` | 3000 | backend | Construcción local |

### Red
Los tres servicios comparten la red por defecto de Docker Compose, lo que permite que se comuniquen por nombre de servicio (ej: `backend` se conecta a `db:5432`).

### Volumen
`pgdata` persiste los datos de PostgreSQL entre reinicios de contenedores.

## Comandos

### Levantar el sistema

```bash
# Construir imágenes e iniciar servicios
docker compose up --build

# En segundo plano (detached)
docker compose up --build -d
```

### Ver logs

```bash
# Todos los servicios
docker compose logs -f

# Un servicio específico
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f db
```

### Detener

```bash
# Detener servicios (sin eliminar volúmenes)
docker compose down

# Detener y eliminar volúmenes (borra datos de BD)
docker compose down -v
```

### Verificar estado

```bash
docker compose ps
```

### Acceder a los servicios

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:3000 |
| API Backend | http://localhost:8000 |
| Documentación Swagger | http://localhost:8000/docs |
| Base de datos | localhost:5432 |

## Solución de Errores Comunes

### Error: "port is already allocated"

```bash
# El puerto 3000 o 8000 ya está en uso
# Solución: detener el proceso que lo ocupa
netstat -ano | findstr :3000    # Windows
lsof -i :3000                    # Linux/Mac
```

### Error: "Connection refused" a la base de datos

```bash
# La base de datos tarda en iniciar
# Solución: esperar unos segundos y reintentar
# El backend se reconecta automáticamente al reintentar
```

### Error: "volume is in use"

```bash
# El volumen de la BD está siendo usado por otro contenedor
docker compose down
docker compose rm -f
docker compose up --build
```

### Error: "permission denied" en Windows/WSL

```bash
# Asegurarse de que Docker Desktop esté corriendo
# Verificar que WSL 2 esté configurado como backend
# En PowerShell:
wsl --set-default-version 2
```

### Error: .env file not found

```bash
# Crear el archivo .env en la raíz del proyecto
# Usar .env.example como plantilla si existe
cp .env.example .env
# Editar .env con los valores correctos
```

## Acceso al Sistema

Una vez que los servicios estén corriendo:

1. Abrir `http://localhost:3000` en el navegador
2. Registrarse como nuevo usuario o usar el admin predefinido:
   - **Usuario**: admin
   - **Contraseña**: admin123
3. Navegar por las secciones según el rol
