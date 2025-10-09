# 🔧 Solución para problemas de login con admin

## Problema
Cuando intentas hacer login con la cuenta de admin, aparece el error "Credenciales incorrectas" en modo producción.

## Causas comunes

1. **Hash de contraseña incorrecto**: El `password_hash` en la base de datos no coincide con el formato esperado (bcrypt con 12 rounds)
2. **Usuario inactivo**: El campo `activo` está en `false`
3. **Falta el password_hash**: Se creó el usuario sin el campo `password_hash`
4. **Variables de entorno incorrectas**: Las credenciales de Supabase no están configuradas correctamente en producción

## ✅ Solución rápida

### Opción 1: Usar el script de Node.js (Recomendado)

1. **Instalar dependencias** (si es necesario):
   ```bash
   npm install
   ```

2. **Configurar variables de entorno**:
   Asegúrate de tener un archivo `.env` en la raíz del proyecto con:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
   SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
   JWT_SECRET=tu_jwt_secret
   JWT_REFRESH_SECRET=tu_jwt_refresh_secret
   ```

3. **Ejecutar el script de diagnóstico**:
   ```bash
   node scripts/diagnose-login.js admin@gimnasio.com
   ```
   
   Este script te dirá exactamente qué está mal.

4. **Crear/actualizar el usuario admin**:
   ```bash
   node scripts/create-admin.js
   ```
   
   O con credenciales personalizadas:
   ```bash
   EMAIL=admin@gimnasio.com PASSWORD=admin123 NAME="Administrador" node scripts/create-admin.js
   ```

### Opción 2: Usar SQL directamente en Supabase

1. Ve a tu proyecto en Supabase
2. Abre el **SQL Editor**
3. Copia y pega el contenido de `docs/crear-admin-correcto.sql`
4. Ejecuta el script

## 🔍 Verificación

Después de ejecutar la solución, verifica:

1. **En Supabase Dashboard**:
   - Ve a Table Editor → users
   - Busca el usuario con email `admin@gimnasio.com`
   - Verifica que:
     - ✅ `activo` = true
     - ✅ `rol` = 'admin'
     - ✅ `password_hash` tiene 60 caracteres
     - ✅ `password_hash` empieza con `$2a$12$`

2. **Prueba el login**:
   - Email: `admin@gimnasio.com`
   - Contraseña: `admin123`

## 🔐 Información técnica

### Hash de contraseña correcto

El sistema usa **bcrypt** con **12 rounds** para hashear contraseñas.

El hash correcto para la contraseña `admin123` es:
```
$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/4Qz8K2C
```

### Cómo generar un nuevo hash

**Opción 1: Usar el script**
```bash
EMAIL=tu@email.com PASSWORD=tu_password node scripts/create-admin.js
```

**Opción 2: Usar una herramienta online**
1. Ve a https://bcrypt-generator.com/
2. Ingresa tu contraseña
3. Selecciona **12 rounds**
4. Copia el hash generado
5. Usa el UPDATE en SQL:
```sql
UPDATE users 
SET password_hash = 'TU_HASH_AQUI'
WHERE email = 'admin@gimnasio.com';
```

## 🚨 Si aún no funciona

### 1. Verifica las variables de entorno en producción

En tu plataforma de hosting (Vercel, Netlify, etc.), verifica que todas las variables estén configuradas:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`

### 2. Verifica la URL de la API

El frontend intenta conectarse a la API usando `NEXT_PUBLIC_API_URL`. Verifica que:

```env
# En desarrollo
NEXT_PUBLIC_API_URL=http://localhost:3001

# En producción
NEXT_PUBLIC_API_URL=https://tu-api-en-produccion.com
```

### 3. Revisa los logs

- **En el navegador**: Abre DevTools → Console para ver errores del frontend
- **En el servidor**: Revisa los logs de tu API para ver qué está fallando

### 4. Verifica Row Level Security (RLS)

Si usas RLS en Supabase, asegúrate de que estás usando el **Service Role Key** en el servidor, no el Anon Key.

En `app/api/auth/login/route.ts` debe usar:
```typescript
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!  // ← Service Role, no Anon Key
);
```

## 📝 Credenciales por defecto

Después de ejecutar la solución:

- **Email**: `admin@gimnasio.com`
- **Contraseña**: `admin123`

⚠️ **IMPORTANTE**: Cambia estas credenciales en producción por seguridad.

## 🔄 Crear usuario admin con diferentes credenciales

```bash
# Usando el script
EMAIL=tu@email.com PASSWORD=tuPassword NAME="Tu Nombre" node scripts/create-admin.js

# O usando SQL
INSERT INTO users (nombre, email, password_hash, rol, activo) 
VALUES (
    'Tu Nombre',
    'tu@email.com',
    '$2a$12$TU_HASH_AQUI',
    'admin',
    true
);
```

## 📞 Soporte adicional

Si después de seguir todos estos pasos aún tienes problemas:

1. Ejecuta el diagnóstico completo:
   ```bash
   node scripts/diagnose-login.js admin@gimnasio.com
   ```

2. Comparte el output del diagnóstico para ayuda adicional

3. Verifica que estés en modo producción correctamente (no mezclando variables de desarrollo con producción)

