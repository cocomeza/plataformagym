# 🧪 TESTING MANUAL COMPLETO DEL SISTEMA

## 📋 **PASOS PARA PROBAR TODO EL SISTEMA:**

### **1. 🔍 Verificar que el backend funciona:**
- Ve a: `https://gym-platform-backend.onrender.com/health`
- **Debería mostrar:** `{"status":"OK","message":"API del Gimnasio funcionando correctamente"}`

### **2. 📝 Probar Registro de Usuarios:**

#### **A. Admin:**
1. Ve a tu aplicación: `https://gym-platform-frontend.netlify.app`
2. Haz clic en "Registrarse"
3. Completa el formulario:
   - **Email:** `admin@test.com`
   - **Contraseña:** `admin123`
   - **Nombre:** `Admin Test`
   - **Rol:** `admin`
4. Haz clic en "Registrarse"
5. **Debería mostrar:** Mensaje de éxito y redirigir al login

#### **B. Cliente:**
1. Repite el proceso con:
   - **Email:** `cliente@test.com`
   - **Contraseña:** `cliente123`
   - **Nombre:** `Cliente Test`
   - **Rol:** `cliente`

#### **C. Deportista:**
1. Repite el proceso con:
   - **Email:** `deportista@test.com`
   - **Contraseña:** `deportista123`
   - **Nombre:** `Deportista Test`
   - **Rol:** `deportista`

### **3. 🔐 Probar Login:**

#### **A. Login como Admin:**
1. Ve a la página de login
2. Ingresa:
   - **Email:** `admin@test.com`
   - **Contraseña:** `admin123`
3. Haz clic en "Iniciar Sesión"
4. **Debería:** Redirigir al dashboard de admin

#### **B. Login como Cliente:**
1. Repite con:
   - **Email:** `cliente@test.com`
   - **Contraseña:** `cliente123`
2. **Debería:** Redirigir al dashboard de cliente

#### **C. Login como Deportista:**
1. Repite con:
   - **Email:** `deportista@test.com`
   - **Contraseña:** `deportista123`
2. **Debería:** Redirigir al dashboard de deportista

### **4. 📊 Verificar Dashboards:**

#### **A. Dashboard Admin:**
- **Debería mostrar:** Panel completo con todas las opciones
- **Funciones disponibles:** Gestión de usuarios, clases, equipos, etc.

#### **B. Dashboard Cliente:**
- **Debería mostrar:** Panel de cliente
- **Funciones disponibles:** Ver clases, reservar, ver perfil

#### **C. Dashboard Deportista:**
- **Debería mostrar:** Panel de deportista
- **Funciones disponibles:** Ver entrenamientos, progreso, perfil

### **5. 🛡️ Probar Rutas Protegidas:**

#### **A. Acceso sin token:**
1. Abre una nueva pestaña
2. Ve a: `https://gym-platform-backend.onrender.com/auth/profile`
3. **Debería mostrar:** Error 401 (No autorizado)

#### **B. Acceso con token válido:**
1. Desde el dashboard, verifica que puedes acceder a tu perfil
2. **Debería mostrar:** Información del usuario

### **6. 🔄 Probar Logout:**
1. Desde cualquier dashboard
2. Haz clic en "Cerrar Sesión"
3. **Debería:** Redirigir al login y limpiar el token

## 🚨 **PROBLEMAS COMUNES Y SOLUCIONES:**

### **❌ Error 500 en registro:**
- **Causa:** Variables de entorno no configuradas en Render
- **Solución:** Configurar variables en Render dashboard

### **❌ Error 401 en login:**
- **Causa:** Usuario no existe o contraseña incorrecta
- **Solución:** Verificar que el usuario se registró correctamente

### **❌ Error de CORS:**
- **Causa:** Frontend y backend en dominios diferentes
- **Solución:** Verificar configuración de CORS en backend

### **❌ Dashboard no carga:**
- **Causa:** Token JWT inválido o expirado
- **Solución:** Hacer logout y login nuevamente

## 📊 **RESULTADOS ESPERADOS:**

### **✅ Sistema Funcionando Correctamente:**
- ✅ Health check responde
- ✅ Registro de usuarios funciona
- ✅ Login de usuarios funciona
- ✅ Dashboards se cargan correctamente
- ✅ Rutas protegidas funcionan
- ✅ Logout funciona

### **❌ Sistema con Problemas:**
- ❌ Health check falla
- ❌ Registro no funciona
- ❌ Login no funciona
- ❌ Dashboards no cargan
- ❌ Rutas protegidas fallan

## 🎯 **PRÓXIMOS PASOS:**

1. **Ejecuta todas las pruebas** paso a paso
2. **Anota cualquier error** que encuentres
3. **Verifica que cada rol** funciona correctamente
4. **Confirma que el flujo completo** funciona

¡Con estas pruebas podrás verificar que todo el sistema funciona correctamente!
