#!/bin/bash

# Script de build para Render
echo "🚀 Iniciando build para Render..."

# Ir al directorio services/backend
cd services/backend

# Limpiar instalaciones anteriores
echo "🧹 Limpiando instalaciones anteriores..."
rm -rf node_modules
rm -rf dist

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

# Verificar que las variables de entorno estén configuradas
echo "🔍 Verificando variables de entorno..."
if [ -z "$SUPABASE_URL" ]; then
    echo "❌ ERROR: SUPABASE_URL no está configurada"
    exit 1
fi

if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ ERROR: SUPABASE_SERVICE_ROLE_KEY no está configurada"
    exit 1
fi

# Ejecutar build
echo "🔨 Ejecutando build..."
npm run build

# Verificar que el build fue exitoso
if [ $? -eq 0 ]; then
    echo "✅ Build completado exitosamente!"
else
    echo "❌ ERROR: Build falló"
    exit 1
fi
