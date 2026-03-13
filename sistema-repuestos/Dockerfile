# 1. Usamos una imagen de Node.js estable
FROM node:20

# 2. Instalamos las dependencias necesarias para que Chrome (Puppeteer) funcione en Linux
RUN apt-get update && apt-get install -y \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libgcc1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    lsb-release \
    wget \
    xdg-utils \
    --no-install-recommends && rm -rf /var/lib/apt/lists/*

# 3. Creamos el directorio de trabajo
WORKDIR /app
RUN chown -R node:node /app
USER node
# 4. Copiamos los archivos de dependencias
COPY --chown=node:node package*.json ./

# 5. Instalamos las dependencias de Node
RUN npm install

RUN npx puppeteer browsers install chrome
# 6. Copiamos el resto del código
COPY --chown=node:node . .

# 7. Exponemos el puerto del servidor
EXPOSE 3000

# 8. Comando para iniciar
CMD ["npm", "run", "dev"]