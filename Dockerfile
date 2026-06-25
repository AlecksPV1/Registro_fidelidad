FROM node:20-bullseye-slim

# Instalar dependencias necesarias para Puppeteer (Chromium) y OpenSSL (Prisma)
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    procps \
    libxss1 \
    libnss3 \
    libatk-bridge2.0-0 \
    libgtk-3-0 \
    libgbm-dev \
    libasound2 \
    openssl \
    && rm -rf /var/lib/apt/lists/*

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Generar cliente de Prisma
RUN npx prisma generate

# Construir la aplicación Next.js
RUN npm run build

# Exponer el puerto de Next.js (Fly.io usará este por defecto)
EXPOSE 3000

# Script de inicio: Asegura que la base de datos esté lista y lanza ambos servidores
# Nota: Prisma db push es seguro usarlo si la base de datos es local SQLite
CMD npx prisma db push && npm run start
