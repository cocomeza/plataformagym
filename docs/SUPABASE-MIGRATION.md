# Migración a Supabase - Plataforma de Gimnasio

## ✅ Cambios Realizados

Se ha migrado completamente el sistema de almacenamiento local (localStorage) a Supabase. Ahora todos los datos se guardan en la base de datos de Supabase:

### Componentes Actualizados

1. **`frontend/lib/auth-context.tsx`**
   - ✅ Usa Supabase Auth para autenticación
   - ✅ Eliminado uso de localStorage para tokens
   - ✅ Sincronización automática de sesiones

2. **`frontend/lib/supabase-utils.ts`**
   - ✅ Funciones completas para usuarios
   - ✅ Funciones completas para pagos
   - ✅ Funciones completas para asistencias
   - ✅ Funciones completas para notificaciones

3. **`frontend/app/admin/page.tsx`**
   - ✅ Usa solo Supabase (sin fallback a localStorage)
   - ✅ Todas las operaciones CRUD en Supabase

4. **`frontend/app/dashboard/page.tsx`**
   - ✅ Carga datos directamente desde Supabase
   - ✅ Marca asistencias en Supabase
   - ✅ Gestiona notificaciones en Supabase

## 📋 Configuración de Supabase

### Paso 1: Crear Proyecto en Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Crea un nuevo proyecto
3. Anota:
   - URL del proyecto (NEXT_PUBLIC_SUPABASE_URL)
   - Anon/Public Key (NEXT_PUBLIC_SUPABASE_ANON_KEY)

### Paso 2: Configurar Variables de Entorno

Crea el archivo `frontend/.env.local`:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=tu_url_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

### Paso 3: Ejecutar SQL de Configuración

En el panel de Supabase, ve a **SQL Editor** y ejecuta el siguiente script:

```sql
-- ============================================
-- CONFIGURACIÓN DE BASE DE DATOS - GIMNASIO
-- ============================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLA: users
-- Información de usuarios del gimnasio
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    rol VARCHAR(20) NOT NULL CHECK (rol IN ('admin', 'deportista')) DEFAULT 'deportista',
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: attendances
-- Registro de asistencias al gimnasio
-- ============================================
CREATE TABLE IF NOT EXISTS attendances (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    userId UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    userName VARCHAR(100) NOT NULL,
    fecha_hora TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metodo VARCHAR(20) NOT NULL DEFAULT 'Manual',
    codigo_usado VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: payments
-- Registro de pagos de membresías
-- ============================================
CREATE TABLE IF NOT EXISTS payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    userId UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    userName VARCHAR(100) NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    metodo VARCHAR(20) NOT NULL DEFAULT 'efectivo',
    concepto VARCHAR(255) NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'Completado',
    fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    registrado_por VARCHAR(100)
);

-- ============================================
-- TABLA: notifications
-- Notificaciones del sistema
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    mensaje TEXT NOT NULL,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('info', 'warning', 'success', 'error')) DEFAULT 'info',
    fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    leida BOOLEAN DEFAULT false,
    userId UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ÍNDICES para mejorar rendimiento
-- ============================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_rol ON users(rol);
CREATE INDEX IF NOT EXISTS idx_attendances_userId ON attendances(userId);
CREATE INDEX IF NOT EXISTS idx_attendances_fecha_hora ON attendances(fecha_hora);
CREATE INDEX IF NOT EXISTS idx_payments_userId ON payments(userId);
CREATE INDEX IF NOT EXISTS idx_payments_fecha ON payments(fecha);
CREATE INDEX IF NOT EXISTS idx_notifications_userId ON notifications(userId);
CREATE INDEX IF NOT EXISTS idx_notifications_leida ON notifications(leida);

-- ============================================
-- POLÍTICAS DE SEGURIDAD (RLS)
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendances ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ========== POLÍTICAS PARA USERS ==========

-- Los usuarios pueden ver su propio perfil
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

-- Los usuarios pueden actualizar su propio perfil
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Los admins pueden ver todos los usuarios
CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND rol = 'admin'
        )
    );

-- Los admins pueden crear usuarios
CREATE POLICY "Admins can create users" ON users
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND rol = 'admin'
        )
    );

-- Los admins pueden actualizar cualquier usuario
CREATE POLICY "Admins can update all users" ON users
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND rol = 'admin'
        )
    );

-- ========== POLÍTICAS PARA ATTENDANCES ==========

-- Los usuarios pueden ver sus propias asistencias
CREATE POLICY "Users can view own attendances" ON attendances
    FOR SELECT USING (auth.uid() = userId);

-- Los admins pueden ver todas las asistencias
CREATE POLICY "Admins can view all attendances" ON attendances
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND rol = 'admin'
        )
    );

-- Los usuarios pueden crear sus propias asistencias
CREATE POLICY "Users can create own attendances" ON attendances
    FOR INSERT WITH CHECK (auth.uid() = userId);

-- Los admins pueden crear cualquier asistencia
CREATE POLICY "Admins can create any attendance" ON attendances
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND rol = 'admin'
        )
    );

-- ========== POLÍTICAS PARA PAYMENTS ==========

-- Los usuarios pueden ver sus propios pagos
CREATE POLICY "Users can view own payments" ON payments
    FOR SELECT USING (auth.uid() = userId);

-- Los admins pueden ver todos los pagos
CREATE POLICY "Admins can view all payments" ON payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND rol = 'admin'
        )
    );

-- Los admins pueden crear pagos
CREATE POLICY "Admins can create payments" ON payments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND rol = 'admin'
        )
    );

-- ========== POLÍTICAS PARA NOTIFICATIONS ==========

-- Los usuarios pueden ver notificaciones generales o específicas para ellos
CREATE POLICY "Users can view relevant notifications" ON notifications
    FOR SELECT USING (
        userId IS NULL OR auth.uid() = userId
    );

-- Los admins pueden ver todas las notificaciones
CREATE POLICY "Admins can view all notifications" ON notifications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND rol = 'admin'
        )
    );

-- Los admins pueden crear notificaciones
CREATE POLICY "Admins can create notifications" ON notifications
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND rol = 'admin'
        )
    );

-- Los usuarios pueden actualizar el estado de sus notificaciones
CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (
        userId IS NULL OR auth.uid() = userId
    );

-- ============================================
-- FUNCIONES Y TRIGGERS
-- ============================================

-- Función para crear usuario en tabla users cuando se registra en Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, nombre, rol, activo)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'nombre', split_part(NEW.email, '@', 1)),
        'deportista',
        true
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear usuario automáticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- DATOS INICIALES
-- ============================================

-- Notificación de bienvenida (ejemplo)
INSERT INTO notifications (titulo, mensaje, tipo, leida)
VALUES (
    '¡Bienvenido a la plataforma!',
    'Gracias por unirte a nuestro gimnasio. Recuerda marcar tu asistencia cada día.',
    'info',
    false
) ON CONFLICT DO NOTHING;

```

### Paso 4: Configurar Autenticación

1. En el panel de Supabase, ve a **Authentication > Providers**
2. Habilita **Email** como proveedor
3. Configura las opciones:
   - ✅ Enable email confirmations (desactivar para desarrollo)
   - ✅ Secure email change (activar)
   - ✅ Enable email OTP (opcional)

### Paso 5: Crear Usuario Administrador

Una vez que la tabla `users` esté creada:

1. Ve a **Authentication > Users** en Supabase
2. Crea un nuevo usuario:
   - Email: `admin@gimnasio.com`
   - Password: (tu contraseña segura)
3. Ve a **Table Editor > users**
4. Encuentra el usuario recién creado
5. Cambia el campo `rol` a `'admin'`

O ejecuta este SQL después de crear el usuario en Auth:

```sql
UPDATE users 
SET rol = 'admin', nombre = 'Administrador' 
WHERE email = 'admin@gimnasio.com';
```

## 🚀 Probar la Aplicación

1. Inicia la aplicación:
   ```bash
   cd frontend
   npm run dev
   ```

2. Accede a `http://localhost:3000`

3. Inicia sesión con el usuario admin

4. Verifica que:
   - ✅ El login funciona
   - ✅ Se cargan los datos
   - ✅ Se pueden crear usuarios
   - ✅ Se pueden registrar asistencias
   - ✅ Se pueden registrar pagos
   - ✅ Se pueden crear notificaciones

## 📝 Estructura de Datos

### Tabla `users`
- `id` (UUID) - Primary Key, vinculado a auth.users
- `nombre` (VARCHAR)
- `email` (VARCHAR) - Unique
- `telefono` (VARCHAR)
- `rol` ('admin' | 'deportista')
- `activo` (BOOLEAN)
- `created_at` (TIMESTAMP)

### Tabla `attendances`
- `id` (UUID) - Primary Key
- `userId` (UUID) - Foreign Key a users
- `userName` (VARCHAR)
- `fecha_hora` (TIMESTAMP)
- `metodo` (VARCHAR) - 'Manual', 'Código', etc.
- `codigo_usado` (VARCHAR) - Opcional
- `created_at` (TIMESTAMP)

### Tabla `payments`
- `id` (UUID) - Primary Key
- `userId` (UUID) - Foreign Key a users
- `userName` (VARCHAR)
- `monto` (DECIMAL)
- `metodo` (VARCHAR) - 'efectivo', 'transferencia', 'tarjeta'
- `concepto` (VARCHAR)
- `estado` (VARCHAR) - 'Completado', 'Pendiente'
- `fecha` (TIMESTAMP)
- `created_at` (TIMESTAMP)
- `registrado_por` (VARCHAR)

### Tabla `notifications`
- `id` (UUID) - Primary Key
- `titulo` (VARCHAR)
- `mensaje` (TEXT)
- `tipo` ('info' | 'warning' | 'success' | 'error')
- `fecha` (TIMESTAMP)
- `leida` (BOOLEAN)
- `userId` (UUID) - Foreign Key a users (nullable para notificaciones generales)
- `created_at` (TIMESTAMP)

## ⚠️ Notas Importantes

1. **Row Level Security (RLS)**: Todas las tablas tienen RLS habilitado para seguridad
2. **Autenticación**: Los usuarios deben existir tanto en `auth.users` como en `users`
3. **Roles**: Solo hay dos roles: 'admin' y 'deportista'
4. **Sincronización**: El trigger `handle_new_user()` sincroniza automáticamente nuevos usuarios

## 🔧 Solución de Problemas

### Error: "No rows returned"
- Verifica que las políticas RLS estén correctamente configuradas
- Asegúrate de que el usuario tenga el rol correcto

### Error: "Invalid JWT"
- Verifica las variables de entorno
- Reinicia el servidor de desarrollo

### Error: "relation does not exist"
- Asegúrate de haber ejecutado todo el SQL de configuración
- Verifica el nombre de las tablas en el Table Editor

## 📚 Recursos

- [Documentación de Supabase](https://supabase.com/docs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

