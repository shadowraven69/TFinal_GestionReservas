# Usar una imagen base de Node.js
FROM node:20-alpine

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar el archivo de paquetes y instalar dependencias
COPY package*.json ./
RUN npm install

# Copiar el resto del código
COPY . .

# Exponer el puerto donde correrá la aplicación
EXPOSE 3000

# Comando para ejecutar la aplicación en desarrollo
# En producción, se usaría "npm start" después de "npm run build"
CMD ["npm", "run", "dev"]