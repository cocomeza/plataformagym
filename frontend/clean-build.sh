#!/bin/bash

# Script para limpiar archivos residuales antes del build

echo "🧹 Limpiando archivos residuales..."

# Limpiar caché de Next.js
rm -rf .next
rm -rf out
rm -rf dist

# Limpiar node_modules (opcional, solo si hay problemas)
# rm -rf node_modules
# npm install

# Limpiar archivos temporales
rm -rf .turbo
rm -rf .swc

echo "✅ Limpieza completada"
echo "🚀 Ejecutando build..."

# Ejecutar build
npm run build

echo "✅ Build completado"
