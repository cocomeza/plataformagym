# Script de build para Render (PowerShell)
Write-Host "🚀 Iniciando build para Render..." -ForegroundColor Green

# Ir al directorio frontend
Set-Location frontend

# Limpiar instalaciones anteriores
Write-Host "🧹 Limpiando instalaciones anteriores..." -ForegroundColor Yellow
if (Test-Path "node_modules") { Remove-Item -Recurse -Force "node_modules" }
if (Test-Path ".next") { Remove-Item -Recurse -Force ".next" }

# Instalar dependencias
Write-Host "📦 Instalando dependencias..." -ForegroundColor Blue
npm install

# Verificar que las variables de entorno estén configuradas
Write-Host "🔍 Verificando variables de entorno..." -ForegroundColor Cyan
if (-not $env:NEXT_PUBLIC_SUPABASE_URL) {
    Write-Host "❌ ERROR: NEXT_PUBLIC_SUPABASE_URL no está configurada" -ForegroundColor Red
    exit 1
}

if (-not $env:NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    Write-Host "❌ ERROR: NEXT_PUBLIC_SUPABASE_ANON_KEY no está configurada" -ForegroundColor Red
    exit 1
}

# Ejecutar build
Write-Host "🔨 Ejecutando build..." -ForegroundColor Magenta
npm run build

# Verificar que el build fue exitoso
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build completado exitosamente!" -ForegroundColor Green
} else {
    Write-Host "❌ ERROR: Build falló" -ForegroundColor Red
    exit 1
}
