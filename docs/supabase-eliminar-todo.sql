-- ============================================
-- ELIMINAR TODA LA BASE DE DATOS
-- ============================================
-- Este script elimina TODO de la base de datos
-- ADVERTENCIA: Esto es IRREVERSIBLE
-- ============================================

-- PASO 1: Deshabilitar Row Level Security
-- ============================================
ALTER TABLE IF EXISTS attendance_codes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS qr_codes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS attendance DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;

-- PASO 2: Eliminar todas las políticas
-- ============================================
DROP POLICY IF EXISTS "Permitir lectura a service role" ON users;
DROP POLICY IF EXISTS "Permitir escritura a service role" ON users;
DROP POLICY IF EXISTS "Permitir actualización a service role" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;

DROP POLICY IF EXISTS "Permitir lectura a todos" ON sessions;
DROP POLICY IF EXISTS "Permitir escritura a service role" ON sessions;
DROP POLICY IF EXISTS "Permitir actualización a service role" ON sessions;
DROP POLICY IF EXISTS "Anyone can view active sessions" ON sessions;
DROP POLICY IF EXISTS "Admins can manage sessions" ON sessions;

DROP POLICY IF EXISTS "Permitir lectura a todos" ON attendance;
DROP POLICY IF EXISTS "Permitir escritura a todos" ON attendance;
DROP POLICY IF EXISTS "Users can view own attendance" ON attendance;
DROP POLICY IF EXISTS "Admins can view all attendance" ON attendance;
DROP POLICY IF EXISTS "Users can create own attendance" ON attendance;

DROP POLICY IF EXISTS "Permitir lectura a todos" ON payments;
DROP POLICY IF EXISTS "Permitir escritura a service role" ON payments;
DROP POLICY IF EXISTS "Permitir actualización a service role" ON payments;
DROP POLICY IF EXISTS "Users can view own payments" ON payments;
DROP POLICY IF EXISTS "Admins can manage all payments" ON payments;

DROP POLICY IF EXISTS "Permitir lectura a todos" ON qr_codes;
DROP POLICY IF EXISTS "Permitir escritura a service role" ON qr_codes;
DROP POLICY IF EXISTS "Admins can manage QR codes" ON qr_codes;

DROP POLICY IF EXISTS "Permitir lectura a todos" ON attendance_codes;
DROP POLICY IF EXISTS "Permitir escritura a service role" ON attendance_codes;
DROP POLICY IF EXISTS "Admins can manage attendance codes" ON attendance_codes;

-- PASO 3: Eliminar todas las vistas
-- ============================================
DROP VIEW IF EXISTS admin_dashboard CASCADE;
DROP VIEW IF EXISTS attendance_stats CASCADE;

-- PASO 4: Eliminar todos los triggers
-- ============================================
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;

-- PASO 5: Eliminar todas las funciones
-- ============================================
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- PASO 6: Eliminar todas las tablas
-- ============================================
DROP TABLE IF EXISTS attendance_codes CASCADE;
DROP TABLE IF EXISTS qr_codes CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- PASO 7: Eliminar extensiones (opcional)
-- ============================================
-- Nota: Normalmente NO deberías eliminar extensiones porque
-- otras bases de datos en el mismo servidor pueden usarlas
-- DROP EXTENSION IF EXISTS "uuid-ossp" CASCADE;

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Verificar que no queden tablas
SELECT 
    '✅ Tablas eliminadas' as status,
    COUNT(*) as tablas_restantes
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE';

-- Verificar que no queden vistas
SELECT 
    '✅ Vistas eliminadas' as status,
    COUNT(*) as vistas_restantes
FROM information_schema.views 
WHERE table_schema = 'public';

-- Verificar que no queden funciones personalizadas
SELECT 
    '✅ Funciones eliminadas' as status,
    COUNT(*) as funciones_restantes
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_type = 'FUNCTION';

-- Mensaje final
DO $$ 
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '==============================================';
    RAISE NOTICE '✅ BASE DE DATOS COMPLETAMENTE ELIMINADA';
    RAISE NOTICE '==============================================';
    RAISE NOTICE '';
    RAISE NOTICE 'La base de datos está ahora vacía.';
    RAISE NOTICE 'Puedes ejecutar el script de creación completo.';
    RAISE NOTICE '';
END $$;

