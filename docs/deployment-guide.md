# 🚀 Guía de Deployment - Plataforma de Gimnasio

Esta guía te ayudará a desplegar la plataforma de gimnasio en Vercel de manera completa.

## 📋 Prerrequisitos

- Cuenta de Vercel
- Cuenta de Supabase
- Node.js 18+ instalado
- Git configurado

## 🗄️ Configuración de Supabase

### 1. Crear Proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Crea una cuenta o inicia sesión
3. Crea un nuevo proyecto
4. Anota la URL y las claves de API

### 2. Configurar Base de Datos

1. Ve a la sección "SQL Editor" en tu dashboard de Supabase
2. Ejecuta el script SQL que está en `docs/supabase-setup.sql`
3. Verifica que las tablas se crearon correctamente

### 3. Configurar Políticas de Seguridad

Las políticas RLS (Row Level Security) ya están incluidas en el script SQL, pero puedes ajustarlas según tus necesidades.

## 🔧 Configuración del Proyecto

### 1. Clonar y Instalar

```bash
git clone <tu-repositorio>
cd gym-platform
npm run install:all
```

### 2. Configurar Variables de Entorno

Crea un archivo `.env.local` en la carpeta `frontend`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key

# JWT (genera claves seguras)
JWT_SECRET=tu_jwt_secret_muy_seguro_aqui
JWT_REFRESH_SECRET=tu_jwt_refresh_secret_muy_seguro_aqui

# Configuración
NODE_ENV=production
```

## 🚀 Deployment en Vercel

### 1. Instalar Vercel CLI

```bash
npm install -g vercel
```

### 2. Configurar Vercel

```bash
cd frontend
vercel login
vercel init
```

### 3. Configurar Variables de Entorno en Vercel

En el dashboard de Vercel, ve a Settings > Environment Variables y agrega:

```
SUPABASE_URL=tu_supabase_url
SUPABASE_ANON_KEY=tu_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_supabase_service_role_key
JWT_SECRET=tu_jwt_secret_muy_seguro
JWT_REFRESH_SECRET=tu_jwt_refresh_secret_muy_seguro
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
NODE_ENV=production
```

### 4. Deploy

```bash
vercel --prod
```

## 🔐 Configuración de Seguridad

### 1. Generar Claves JWT Seguras

```bash
# Generar JWT_SECRET
openssl rand -base64 32

# Generar JWT_REFRESH_SECRET
openssl rand -base64 32
```

### 2. Configurar CORS

En `vercel.json`, ajusta el CORS_ORIGIN con tu dominio de producción:

```json
{
  "env": {
    "CORS_ORIGIN": "https://tu-dominio.vercel.app"
  }
}
```

## 📊 Configuración de Dominio Personalizado (Opcional)

1. En Vercel, ve a Settings > Domains
2. Agrega tu dominio personalizado
3. Configura los registros DNS según las instrucciones
4. Actualiza CORS_ORIGIN con tu dominio

## 🧪 Testing Post-Deployment

### 1. Verificar Health Check

```bash
curl https://tu-dominio.vercel.app/api/health
```

### 2. Probar Registro de Usuario

1. Ve a tu dominio
2. Regístrate como deportista
3. Verifica que se creó en Supabase

### 3. Probar Login de Admin

1. Usa las credenciales: `admin@gimnasio.com` / `admin123`
2. Verifica acceso al panel de administración

## 🔄 Actualizaciones

Para actualizar la aplicación:

```bash
git add .
git commit -m "Descripción del cambio"
git push origin main
vercel --prod
```

## 📱 Configuración Adicional

### 1. Notificaciones Push (Futuro)

Para implementar notificaciones push, necesitarás:
- Service Worker
- Firebase Cloud Messaging
- Permisos del navegador

### 2. PWA (Progressive Web App)

Para convertir en PWA:
- Agregar manifest.json
- Implementar service worker
- Configurar cache strategies

## 🐛 Troubleshooting

### Error de CORS
- Verificar CORS_ORIGIN en variables de entorno
- Asegurar que el dominio coincida exactamente

### Error de JWT
- Verificar que JWT_SECRET esté configurado
- Verificar que las claves sean las mismas en todas las variables

### Error de Supabase
- Verificar URL y claves de Supabase
- Verificar políticas RLS
- Verificar que las tablas existan

### Error 500 en API Routes
- Revisar logs en Vercel Functions
- Verificar variables de entorno
- Verificar conexión a Supabase

## 📞 Soporte

Si encuentras problemas:

1. Revisa los logs en Vercel Dashboard
2. Verifica la configuración de Supabase
3. Consulta la documentación de Next.js API Routes
4. Revisa la documentación de Supabase

## 🎉 ¡Listo!

Tu plataforma de gimnasio debería estar funcionando en Vercel. Los usuarios pueden:

- ✅ Registrarse e iniciar sesión
- ✅ Marcar asistencia con QR
- ✅ Ver su historial de asistencias
- ✅ Los admins pueden gestionar usuarios y asistencias

¡Felicitaciones por tu nueva plataforma de gimnasio! 🏋️‍♂️
