# 🔐 Variables de Entorno - Copy & Paste

## 📋 Para Vercel (Frontend)

Copia estas variables en **Vercel Dashboard** → **Settings** → **Environment Variables**:

```env
NEXT_PUBLIC_SUPABASE_URL=https://ppujkawteiowcmkkbzri.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwdWprYXd0ZWlvd2Nta2tienJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNTkwMDksImV4cCI6MjA3NDgzNTAwOX0.6xjS_mf1ajbGIxtdNN3XGnYWvAoDoCXb5SmRGKvZ1LQ
NEXT_PUBLIC_API_URL=https://gym-platform-backend.onrender.com
NODE_ENV=production
```

---

## ⚙️ Para Render (Backend)

Copia estas variables en **Render Dashboard** → **Environment**:

```env
NODE_ENV=production
PORT=10000
SUPABASE_URL=https://ppujkawteiowcmkkbzri.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwdWprYXd0ZWlvd2Nta2tienJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNTkwMDksImV4cCI6MjA3NDgzNTAwOX0.6xjS_mf1ajbGIxtdNN3XGnYWvAoDoCXb5SmRGKvZ1LQ
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwdWprYXd0ZWlvd2Nta2tienJpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTI1OTAwOSwiZXhwIjoyMDc0ODM1MDA5fQ.Ej1SFxkhXY8s2QxXs8Z5vswKLv9WwO1QseJ3b5l0ln0
JWT_SECRET=gym_platform_jwt_secret_2024_secure_key_12345
JWT_REFRESH_SECRET=gym_platform_refresh_jwt_secret_2024_secure_key_67890
```

---

## 🗄️ Para Supabase

### URLs y Keys de Supabase:
- **Project URL**: `https://ppujkawteiowcmkkbzri.supabase.co`
- **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwdWprYXd0ZWlvd2Nta2tienJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNTkwMDksImV4cCI6MjA3NDgzNTAwOX0.6xjS_mf1ajbGIxtdNN3XGnYWvAoDoCXb5SmRGKvZ1LQ`
- **Service Role Key**: `[Obtener desde Supabase Dashboard]`

---

## 🔄 Orden de Deploy

1. **Primero**: Deploy del Backend en Render
2. **Segundo**: Obtener URL del Backend
3. **Tercero**: Deploy del Frontend en Vercel (con la URL del Backend)
4. **Cuarto**: Actualizar CORS en Backend con URL del Frontend
5. **Quinto**: Redeploy del Backend

---

## ⚠️ Importante

- Todas las variables están configuradas con los valores reales
- Cambia `https://gym-platform-backend.onrender.com` por la URL real de tu backend en Render
- Cambia `https://tu-proyecto.vercel.app` por la URL real de tu frontend en Vercel
