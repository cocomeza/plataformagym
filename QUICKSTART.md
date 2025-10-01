# 🚀 Inicio Rápido - Plataforma de Gimnasio

## ⚡ Configuración en 5 minutos

### 1. Instalar dependencias

**Windows:**
```powershell
.\setup.ps1
```

**Linux/Mac:**
```bash
bash setup.sh
```

### 2. Configurar Supabase

1. Ve a [supabase.com](https://supabase.com) y crea un proyecto
2. Copia la URL y las claves de API
3. Ejecuta el script SQL en `docs/supabase-setup.sql`
4. Edita `frontend/.env.local` con tus credenciales:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_key_aqui
JWT_SECRET=tu_secret_muy_seguro
JWT_REFRESH_SECRET=tu_refresh_secret_muy_seguro
```

### 3. Iniciar la aplicación

```bash
npm run dev
```

### 4. ¡Listo! 🎉

- **Frontend:** http://localhost:3000
- **Admin:** admin@gimnasio.com / admin123
- **Deportista:** Regístrate desde la página principal

## 📱 Funcionalidades

### Para Deportistas
- ✅ Registro e inicio de sesión
- ✅ Marcación de asistencia por QR
- ✅ Ver historial de asistencias
- ✅ Ver estado de pagos

### Para Administradores
- ✅ Dashboard con estadísticas
- ✅ Generar códigos QR
- ✅ Marcar asistencia manual
- ✅ Gestionar usuarios
- ✅ Ver reportes

## 🚀 Deploy en Vercel

1. Instala Vercel CLI: `npm i -g vercel`
2. Configura variables de entorno en Vercel
3. Deploy: `vercel --prod`

## 📚 Documentación Completa

- `README.md` - Información general
- `docs/deployment-guide.md` - Guía de deployment
- `docs/supabase-setup.sql` - Script de base de datos

## 🆘 Problemas Comunes

**Error de CORS:** Verifica las variables de entorno
**Error de JWT:** Asegúrate de que JWT_SECRET esté configurado
**Error de Supabase:** Verifica URL y claves de API

## 💪 ¡Disfruta tu plataforma de gimnasio!
