# Usa una imagen base oficial de Node.js
FROM node:18-alpine

# Configura el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia los archivos de tu proyecto al contenedor
COPY package.json package-lock.json ./

# Instala las dependencias
RUN npm install

# Copia todo el código del proyecto al contenedor
COPY . .

# Expone el puerto en el que tu app escuchará
EXPOSE 8080

# Define el comando para iniciar la app
CMD ["node", "service.js"]
