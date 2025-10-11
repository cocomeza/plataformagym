-- ============================================
-- CREAR USUARIO ADMIN EN SUPABASE AUTH
-- ============================================
-- Este script crea el usuario admin en Supabase Auth
-- y lo sincroniza con la tabla users

-- IMPORTANTE: Ejecutar esto en Supabase SQL Editor

-- 1. Crear usuario en Supabase Auth (esto se hace desde el dashboard)
-- Ve a Authentication > Users > Add user
-- Email: admin@gimnasio.com
-- Password: admin123

-- 2. Una vez creado el usuario en Auth, ejecutar este SQL:

-- Verificar que el usuario existe en la tabla users
SELECT id, nombre, email, rol, activo FROM users WHERE email = 'admin@gimnasio.com';

-- Si no existe, crearlo
INSERT INTO users (nombre, email, password_hash, rol, activo, created_at, updated_at) 
VALUES (
    'Administrador',
    'admin@gimnasio.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/4Qz8K2C',
    'admin',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (email) DO UPDATE SET
    rol = 'admin',
    activo = true,
    updated_at = NOW();

-- Verificar resultado
SELECT id, nombre, email, rol, activo FROM users WHERE email = 'admin@gimnasio.com';

-- ============================================
-- PASOS MANUALES EN SUPABASE DASHBOARD:
-- ============================================

-- 1. Ve a https://supabase.com/dashboard
-- 2. Selecciona tu proyecto
-- 3. Ve a Authentication > Users
-- 4. Click en "Add user"
-- 5. Completa:
--    - Email: admin@gimnasio.com
--    - Password: admin123
--    - Confirm Password: admin123
-- 6. Click en "Create user"
-- 7. Ejecuta el SQL de arriba

-- ============================================
-- VERIFICACIÓN FINAL:
-- ============================================

-- Verificar usuario en Auth (desde dashboard)
-- Verificar usuario en tabla users (ejecutar este SQL):
SELECT 
    '✅ Usuario en tabla users' as verificacion,
    id,
    nombre,
    email,
    rol,
    activo
FROM users 
WHERE email = 'admin@gimnasio.com';

-- El usuario debería aparecer en ambos lugares:
-- 1. Authentication > Users (en el dashboard)
-- 2. Table Editor > users (en la tabla)
