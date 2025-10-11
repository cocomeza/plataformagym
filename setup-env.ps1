# Script para configurar variables de entorno para el frontend

Write-Host "Configurando variables de entorno para el frontend..." -ForegroundColor Green

# Navegar a la carpeta frontend
$frontendPath = Join-Path $PSScriptRoot "frontend"

# Contenido del archivo .env.local
$envContent = @"
# Variables de entorno para Frontend (Next.js)

# JWT Configuration
JWT_SECRET=gym_platform_jwt_secret_2024_secure_key_12345
JWT_REFRESH_SECRET=gym_platform_refresh_jwt_secret_2024_secure_key_67890

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000
NODE_ENV=development

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://ppujkawteiowcmkkbzri.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwdWprYXd0ZWlvd2Nta2tienJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNTkwMDksImV4cCI6MjA3NDgzNTAwOX0.6xjS_mf1ajbGIxtdNN3XGnYWvAoDoCXb5SmRGKvZ1LQ
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwdWprYXd0ZWlvd2Nta2tienJpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTI1OTAwOSwiZXhwIjoyMDc0ODM1MDA5fQ.Ej1SFxkhXY8s2QxXs8Z5vswKLv9WwO1QseJ3b5l0ln0
"@

# Crear archivo .env.local
$envPath = Join-Path $frontendPath ".env.local"
Set-Content -Path $envPath -Value $envContent

Write-Host "✅ Archivo .env.local creado exitosamente en: $envPath" -ForegroundColor Green
Write-Host ""
Write-Host "Ahora puedes iniciar el servidor con:" -ForegroundColor Yellow
Write-Host "  cd frontend" -ForegroundColor Cyan
Write-Host "  npm run dev" -ForegroundColor Cyan

