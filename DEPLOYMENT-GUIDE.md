# 🚀 Guía de Deploy - Plataforma de Gimnasio

## 📋 Arquitectura de Deploy (Costo Cero)

- 🎨 **Frontend**: Vercel (Next.js) - Gratis
- ⚙️ **Backend**: Render Free - Gratis  
- 🗄️ **Base de datos**: Supabase Free - Gratis

---

## 🎯 Paso 1: Deploy del Backend en Render

### 1.1 Preparar el Backend
```bash
# El backend ya está configurado con:
# - render.yaml ✅
# - package.json optimizado ✅
# - Scripts de build ✅
```

### 1.2 Crear Servicio en Render
1. Ve a [render.com](https://render.com) y crea cuenta
2. Click en **"New +"** → **"Web Service"**
3. Conecta tu repositorio de GitHub
4. Configuración:
   - **Name**: `gym-platform-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm run render-build`
   - **Start Command**: `cd backend && npm run render-start`
   - **Plan**: `Free`

### 1.3 Variables de Entorno en Render
Agrega estas variables en Render Dashboard:

```env
NODE_ENV=production
PORT=10000
SUPABASE_URL=https://ppujkawteiowcmkkbzri.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwdWprYXd0ZWlvd2Nta2tienJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNTkwMDksImV4cCI6MjA3NDgzNTAwOX0.6xjS_mf1ajbGIxtdNN3XGnYWvAoDoCXb5SmRGKvZ1LQ
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_real
JWT_SECRET=mi_jwt_secret_super_seguro_123
JWT_REFRESH_SECRET=mi_jwt_refresh_secret_super_seguro_456
```

### 1.4 Deploy del Backend
- Click en **"Create Web Service"**
- Render automáticamente hará el build y deploy
- Anota la URL del backend (ej: `https://gym-platform-backend.onrender.com`)

---

## 🎨 Paso 2: Deploy del Frontend en Vercel

### 2.1 Preparar el Frontend
```bash
# El frontend ya está configurado con:
# - vercel.json ✅
# - package.json optimizado ✅
# - Variables de entorno configuradas ✅
```

### 2.2 Crear Proyecto en Vercel
1. Ve a [vercel.com](https://vercel.com) y crea cuenta
2. Click en **"New Project"**
3. Conecta tu repositorio de GitHub
4. Configuración:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### 2.3 Variables de Entorno en Vercel
Agrega estas variables en Vercel Dashboard:

```env
NEXT_PUBLIC_SUPABASE_URL=https://ppujkawteiowcmkkbzri.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwdWprYXd0ZWlvd2Nta2tienJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNTkwMDksImV4cCI6MjA3NDgzNTAwOX0.6xjS_mf1ajbGIxtdNN3XGnYWvAoDoCXb5SmRGKvZ1LQ
NEXT_PUBLIC_API_URL=https://tu-backend-url.onrender.com
```

### 2.4 Deploy del Frontend
- Click en **"Deploy"**
- Vercel automáticamente hará el build y deploy
- Anota la URL del frontend (ej: `https://tu-proyecto.vercel.app`)

---

## 🔧 Paso 3: Configurar CORS en el Backend

### 3.1 Actualizar CORS en el Backend
En `backend/src/index.ts`, asegúrate de tener:

```typescript
app.use(cors({
  origin: [
    'https://tu-proyecto.vercel.app',
    'http://localhost:3000' // Para desarrollo
  ],
  credentials: true
}));
```

### 3.2 Redeploy del Backend
- Haz un commit con los cambios de CORS
- Render automáticamente redeployará

---

## 🗄️ Paso 4: Configurar Supabase

### 4.1 Variables de Entorno en Supabase
1. Ve a tu proyecto en [supabase.com](https://supabase.com)
2. Ve a **Settings** → **API**
3. Copia las URLs y keys necesarias
4. Úsalas en las variables de entorno de Render y Vercel

### 4.2 Configurar RLS (Row Level Security)
```sql
-- Ejemplo de políticas RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
```

---

## ✅ Checklist de Verificación

### Backend (Render)
- [ ] Servicio creado en Render
- [ ] Variables de entorno configuradas
- [ ] Build exitoso
- [ ] Health check funcionando (`/health`)
- [ ] CORS configurado correctamente

### Frontend (Vercel)
- [ ] Proyecto creado en Vercel
- [ ] Root Directory: `frontend`
- [ ] Variables de entorno configuradas
- [ ] Build exitoso
- [ ] Deploy funcionando

### Base de Datos (Supabase)
- [ ] Proyecto configurado
- [ ] Tablas creadas
- [ ] RLS configurado
- [ ] Variables de entorno correctas

---

## 🚨 Solución de Problemas Comunes

### Error: "Build failed"
```bash
# Verificar logs en Render/Vercel
# Verificar que todas las dependencias estén en package.json
# Verificar que las variables de entorno estén configuradas
```

### Error: "CORS policy"
```typescript
// Actualizar CORS en backend con la URL correcta del frontend
origin: ['https://tu-proyecto.vercel.app']
```

### Error: "Environment variables"
```bash
# Verificar que todas las variables estén configuradas en ambos servicios
# Verificar que los nombres coincidan exactamente
```

---

## 🎉 ¡Listo!

Tu plataforma de gimnasio estará funcionando con:
- ✅ Frontend en Vercel (siempre online)
- ✅ Backend en Render (gratis)
- ✅ Base de datos en Supabase (gratis)
- ✅ Costo total: **$0**

---

## 📞 URLs Finales

- **Frontend**: `https://tu-proyecto.vercel.app`
- **Backend**: `https://gym-platform-backend.onrender.com`
- **Base de datos**: `https://ppujkawteiowcmkkbzri.supabase.co`

¡Tu plataforma de gimnasio está lista para usar! 🏋️‍♂️
