FROM node:20

# Directorio de trabajo
WORKDIR /app

# Copiar dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el proyecto
COPY . .

# Puerto del backend
EXPOSE 3000

# Esperar a Vault, cargar llaves e iniciar el backend
CMD ["sh", "-c", "sleep 15 && node src/scripts/init-vault.js && npm run dev"]