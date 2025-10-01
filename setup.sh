#!/bin/bash

# Script de configuración para la Plataforma de Gimnasio
# Ejecutar con: bash setup.sh

echo "🏋️ Configurando Plataforma de Gimnasio..."
echo "========================================"

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor instala Node.js 18+ desde https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Se requiere Node.js 18 o superior. Versión actual: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detectado"

# Instalar dependencias
echo "📦 Instalando dependencias..."
cd frontend
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencias instaladas correctamente"
else
    echo "❌ Error instalando dependencias"
    exit 1
fi

# Crear archivo de configuración
echo "⚙️ Configurando variables de entorno..."

if [ ! -f .env.local ]; then
    cp env.local.example .env.local
    echo "✅ Archivo .env.local creado"
    echo "⚠️  IMPORTANTE: Edita .env.local con tus credenciales de Supabase"
else
    echo "ℹ️  El archivo .env.local ya existe"
fi

cd ..

# Crear directorio de documentación si no existe
mkdir -p docs

echo ""
echo "🎉 ¡Configuración completada!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Configura tu proyecto en Supabase (https://supabase.com)"
echo "2. Ejecuta el script SQL en docs/supabase-setup.sql"
echo "3. Edita frontend/.env.local con tus credenciales"
echo "4. Ejecuta: npm run dev"
echo ""
echo "📚 Documentación:"
echo "- README.md: Información general"
echo "- docs/deployment-guide.md: Guía de deployment"
echo "- docs/supabase-setup.sql: Script de base de datos"
echo ""
echo "🚀 Para iniciar en desarrollo:"
echo "npm run dev"
echo ""
echo "¡Disfruta tu nueva plataforma de gimnasio! 💪"
