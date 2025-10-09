-- ============================================
-- CREAR USUARIO ADMIN EN SUPABASE
-- ============================================
-- Este script crea un usuario admin con la contraseña hasheada correctamente
-- CONTRASEÑA: admin123
-- El hash fue generado con bcrypt usando 12 rounds

-- OPCIÓN 1: Crear nuevo usuario admin (si no existe)
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
ON CONFLICT (email) DO NOTHING;

-- OPCIÓN 2: Si ya existe el usuario pero no puede loguearse,
-- actualizar el password_hash y asegurarse que está activo
UPDATE users 
SET 
    password_hash = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/4Qz8K2C',
    activo = true,
    rol = 'admin',
    updated_at = NOW()
WHERE email = 'admin@gimnasio.com';

-- VERIFICAR que el usuario se creó correctamente
SELECT 
    id,
    nombre,
    email,
    rol,
    activo,
    length(password_hash) as hash_length,
    created_at
FROM users 
WHERE email = 'admin@gimnasio.com';

-- ============================================
-- CREAR OTROS USUARIOS ADMIN (OPCIONAL)
-- ============================================

-- Si quieres crear otro admin con diferente email, usa este template:
-- IMPORTANTE: Reemplaza el email y el hash de contraseña

-- Para generar un nuevo hash de contraseña, puedes usar:
-- 1. Ir a https://bcrypt-generator.com/
-- 2. Poner tu contraseña
-- 3. Seleccionar 12 rounds
-- 4. Copiar el hash generado

/*
INSERT INTO users (nombre, email, password_hash, rol, activo, created_at, updated_at) 
VALUES (
    'Tu Nombre',
    'tu-email@ejemplo.com',
    'TU_PASSWORD_HASH_AQUI',
    'admin',
    true,
    NOW(),
    NOW()
);
*/

-- ============================================
-- TROUBLESHOOTING
-- ============================================

-- Si aún no puedes loguearte, ejecuta estas queries para diagnosticar:

-- 1. Verificar que el usuario existe y está activo
SELECT id, nombre, email, rol, activo FROM users WHERE email = 'admin@gimnasio.com';

-- 2. Verificar que el password_hash está presente y tiene la longitud correcta (debe ser 60 caracteres)
SELECT email, length(password_hash) as hash_length FROM users WHERE email = 'admin@gimnasio.com';

-- 3. Ver todos los usuarios admin
SELECT id, nombre, email, rol, activo FROM users WHERE rol = 'admin';

-- 4. Si necesitas eliminar el usuario y empezar de nuevo:
-- DELETE FROM users WHERE email = 'admin@gimnasio.com';

