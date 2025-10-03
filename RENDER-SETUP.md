# 🚀 Configuración de Variables de Entorno en Render

## 📋 Variables que necesitas configurar en Render:

### **1. Ve a tu dashboard de Render:**
- https://dashboard.render.com/
- Selecciona tu servicio `gym-platform-backend`

### **2. Ve a la sección "Environment":**
- Haz clic en "Environment" en el menú lateral
- Agrega las siguientes variables:

```env
SUPABASE_URL=https://ppujkawteiowcmkkbzri.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwdWprYXd0ZWlvd2Nta2tienJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNTkwMDksImV4cCI6MjA3NDgzNTAwOX0.6xjS_mf1ajbGIxtdNN3XGnYWvAoDoCXb5SmRGKvZ1LQ
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwdWprYXd0ZWlvd2Nta2tienJpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTI1OTAwOSwiZXhwIjoyMDc0ODM1MDA5fQ.Ej1SFxkhXY8s2QxXs8Z5vswKLv9WwO1QseJ3b5l0ln0
JWT_SECRET=gym_platform_jwt_secret_2024_secure_key_12345
JWT_REFRESH_SECRET=gym_platform_refresh_jwt_secret_2024_secure_key_67890
```

### **3. Después de agregar las variables:**
- Haz clic en "Save Changes"
- Render hará un redeploy automático
- Espera 2-3 minutos para que se complete

### **4. Verificar que funciona:**
- Ve a: `https://gym-platform-backend.onrender.com/health`
- Debería mostrar: `{"status":"OK","message":"API del Gimnasio funcionando correctamente"}`

## 🔧 Si aún no funciona:

### **Verificar logs de Render:**
1. Ve a tu servicio en Render
2. Haz clic en "Logs"
3. Busca errores relacionados con:
   - Variables de entorno faltantes
   - Errores de conexión a Supabase
   - Errores de JWT

### **Verificar base de datos:**
1. Ve a tu proyecto de Supabase
2. Verifica que la tabla `users` existe
3. Verifica que tienes permisos para leer/escribir

## 📞 Pasos de prueba:

1. **Configura las variables de entorno** en Render
2. **Espera el redeploy** (2-3 minutos)
3. **Prueba el health check**: `https://gym-platform-backend.onrender.com/health`
4. **Regístrate** en tu aplicación de Netlify
5. **Haz login** con las mismas credenciales

¡Esto debería resolver el problema!
