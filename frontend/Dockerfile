# Usar una imagen base de Node.js
FROM node:20-alpine

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar dependencias ya instaladas (npm install ya se ejecutó en el host)
COPY package*.json ./
COPY node_modules ./node_modules

# Copiar el resto del código
COPY . .

# Exponer el puerto donde correrá la aplicación
EXPOSE 3000

# Comando para ejecutar la aplicación en desarrollo
# En producción, se usaría "npm start" después de "npm run build"
CMD ["npm", "run", "dev"]
