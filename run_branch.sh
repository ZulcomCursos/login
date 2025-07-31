#!/bin/bash

echo "🔧 Iniciando entorno de desarrollo..."
read -p "👤 Ingresa tu nombre de rama (ej: practicante1): " BRANCH

# Define archivo .env según la rama
case "$BRANCH" in
  practicante1)
    ENV_FILE=".env.practicante1"
    ;;
  practicante2)
    ENV_FILE=".env.practicante2"
    ;;
  practicante3)
    ENV_FILE=".env.practicante3"
    ;;
  *)
    echo "❌ Rama desconocida. Asegúrate de tener un archivo .env para '$BRANCH'"
    exit 1
    ;;
esac

cd /home/desarrollador/proyecto_zulcom || { echo "❌ No se encontró la carpeta del proyecto"; exit 1; }

# Cambiar de rama
echo "🚀 Cambiando a la rama $BRANCH..."
git checkout $BRANCH || { echo "❌ Error al cambiar de rama"; exit 1; }

# Instalar dependencias
echo "📦 Instalando dependencias (si hace falta)..."
npm install

# Levantar la app con el archivo .env correspondiente
echo "🌐 Iniciando servidor con $ENV_FILE..."
ENV_FILE=$ENV_FILE nodemon app.js
