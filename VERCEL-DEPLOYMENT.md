# 🚀 Guía de Deployment en Vercel

## 📋 Pasos para desplegar en Vercel

### 1. Importar el proyecto

1. Ve a [vercel.com](https://vercel.com)
2. Haz clic en **"Add New Project"**
3. Importa el repositorio: `cocomeza/plataformagym`
4. Selecciona la rama `main`

### 2. Configurar el proyecto

**Framework Preset:** Next.js
**Root Directory:** `frontend`
**Build Command:** `npm run build`
**Output Directory:** `.next`

### 3. Configurar Variables de Entorno

⚠️ **IMPORTANTE:** Agrega estas variables de entorno en Vercel Settings > Environment Variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://ppujkawteiowcmkkbzri.supabase.co

SUPABASE_URL=https://ppujkawteiowcmkkbzri.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwdWprYXd0ZWlvd2Nta2tienJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNTkwMDksImV4cCI6MjA3NDgzNTAwOX0.6xjS_mf1ajbGIxtdNN3XGnYWvAoDoCXb5SmRGKvZ1LQ

SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwdWprYXd0ZWlvd2Nta2tienJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNTkwMDksImV4cCI6MjA3NDgzNTAwOX0.6xjS_mf1ajbGIxtdNN3XGnYWvAoDoCXb5Sm
