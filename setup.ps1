# Script de configuración para la Plataforma de Gimnasio (PowerShell)
# Ejecutar con: .\setup.ps1

Write-Host "🏋️ Configurando Plataforma de Gimnasio..." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

# Verificar Node.js
try {
    $nodeVersion = node -v
    if ($LASTEXITCODE -ne 0) {
        throw "Node.js no encontrado"
    }
    Write-Host "✅ Node.js $nodeVersion detectado" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js no está instalado. Por favor instala Node.js 18+ desde https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Verificar versión de Node.js
$versionNumber = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
if ($versionNumber -lt 18) {
    Write-Host "❌ Se requiere Node.js 18 o superior. Versión actual: $nodeVersion" -ForegroundColor Red
    exit 1
}

# Instalar dependencias
Write-Host "📦 Instalando dependencias..." -ForegroundColor Yellow
Set-Location frontend

try {
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Dependencias instaladas correctamente" -ForegroundColor Green
    } else {
        throw "Error en npm install"
    }
} catch {
    Write-Host "❌ Error instalando dependencias" -ForegroundColor Red
    exit 1
}

# Crear archivo de configuración
Write-Host "⚙️ Configurando variables de entorno..." -ForegroundColor Yellow

if (!(Test-Path ".env.local")) {
    Copy-Item "env.local.example" ".env.local"
    Write-Host "✅ Archivo .env.local creado" -ForegroundColor Green
    Write-Host "⚠️  IMPORTANTE: Edita .env.local con tus credenciales de Supabase" -ForegroundColor Yellow
} else {
    Write-Host "ℹ️  El archivo .env.local ya existe" -ForegroundColor Blue
}

Set-Location ..

# Crear directorio de documentación si no existe
if (!(Test-Path "docs")) {
    New-Item -ItemType Directory -Path "docs"
}

Write-Host ""
Write-Host "🎉 ¡Configuración completada!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Próximos pasos:" -ForegroundColor Cyan
Write-Host "1. Configura tu proyecto en Supabase (https://supabase.com)" -ForegroundColor White
Write-Host "2. Ejecuta el script SQL en docs/supabase-setup.sql" -ForegroundColor White
Write-Host "3. Edita frontend/.env.local con tus credenciales" -ForegroundColor White
Write-Host "4. Ejecuta: npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "📚 Documentación:" -ForegroundColor Cyan
Write-Host "- README.md: Información general" -ForegroundColor White
Write-Host "- docs/deployment-guide.md: Guía de deployment" -ForegroundColor White
Write-Host "- docs/supabase-setup.sql: Script de base de datos" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Para iniciar en desarrollo:" -ForegroundColor Cyan
Write-Host "npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "¡Disfruta tu nueva plataforma de gimnasio! 💪" -ForegroundColor Green
