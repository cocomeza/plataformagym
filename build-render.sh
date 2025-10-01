#!/bin/bash

# Script de build para Render
echo "🚀 Iniciando build para Render..."

# Ir al directorio frontend
cd frontend

# Limpiar instalaciones anteriores
echo "🧹 Limpiando instalaciones anteriores..."
rm -rf node_modules
rm -rf .next

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

# Verificar que las variables de entorno estén configuradas
echo "🔍 Verificando variables de entorno..."
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    echo "❌ ERROR: NEXT_PUBLIC_SUPABASE_URL no está configurada"
    exit 1
fi

if [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    echo "❌ ERROR: NEXT_PUBLIC_SUPABASE_ANON_KEY no está configurada"
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
