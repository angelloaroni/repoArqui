FROM node:20

# Directorio de trabajo
WORKDIR /app

# Copiar dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar proyecto
COPY . .

# Puerto del Sidecar
EXPOSE 4000

# Iniciar Sidecar
CMD ["npm", "start"]