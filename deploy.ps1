# 🚀 Script de Deploy Rápido - Plataforma de Gimnasio
# Ejecutar: .\deploy.ps1

Write-Host "🏋️ DEPLOY DE PLATAFORMA DE GIMNASIO" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "frontend") -or -not (Test-Path "backend")) {
    Write-Host "❌ ERROR: Ejecuta este script desde la raíz del proyecto" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Estructura del proyecto verificada" -ForegroundColor Green
Write-Host ""

# Verificar que los archivos de configuración existen
$configFiles = @("vercel.json", "render.yaml", "DEPLOYMENT-GUIDE.md", "ENVIRONMENT-VARIABLES.md")
foreach ($file in $configFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file encontrado" -ForegroundColor Green
    } else {
        Write-Host "❌ $file NO encontrado" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "📋 PRÓXIMOS PASOS:" -ForegroundColor Yellow
Write-Host "==================" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. 🗄️  BACKEND EN RENDER:" -ForegroundColor Cyan
Write-Host "   - Ve a https://render.com"
Write-Host "   - Crea un Web Service"
Write-Host "   - Conecta tu repositorio de GitHub"
Write-Host "   - Usa el archivo render.yaml"
Write-Host "   - Configura las variables de entorno (ver ENVIRONMENT-VARIABLES.md)"
Write-Host ""
Write-Host "2. 🎨 FRONTEND EN VERCEL:" -ForegroundColor Cyan
Write-Host "   - Ve a https://vercel.com"
Write-Host "   - Crea un nuevo proyecto"
Write-Host "   - Conecta tu repositorio de GitHub"
Write-Host "   - Root Directory: frontend"
Write-Host "   - Configura las variables de entorno (ver ENVIRONMENT-VARIABLES.md)"
Write-Host ""
Write-Host "3. 🔧 CONFIGURAR CORS:" -ForegroundColor Cyan
Write-Host "   - Después del deploy, actualiza CORS en el backend"
Write-Host "   - Con la URL real del frontend"
Write-Host ""
Write-Host "📖 Para más detalles, lee DEPLOYMENT-GUIDE.md" -ForegroundColor Magenta
Write-Host ""
Write-Host "🎉 ¡Tu plataforma estará funcionando con costo CERO!" -ForegroundColor Green
