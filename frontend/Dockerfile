# Usar imagen oficial de Node.js ligera
FROM node:20-slim AS builder

# Establecer directorio de trabajo
WORKDIR /app

# Copiar package.json 
COPY package.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Construir la aplicación Next.js (requiere output: 'standalone' en next.config.js)
RUN npm run build

# Imagen final para producción
FROM node:20-slim AS runner

WORKDIR /app

# Copiar los archivos generados desde el builder
COPY --from=builder /app/package.json .
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Exponer el puerto
EXPOSE 3000

# Variables de entorno
ENV NODE_ENV=production
ENV PORT=3000

# Iniciar Next.js
CMD ["node", "server.js"]