-- ============================================
-- RESET COMPLETO DE BASE DE DATOS
-- ============================================
-- Este script elimina y recrea toda la base de datos desde cero
-- ADVERTENCIA: Esto eliminará TODOS los datos existentes
-- ============================================

-- PASO 1: ELIMINAR TODO LO EXISTENTE
-- ============================================

-- Eliminar vistas
DROP VIEW IF EXISTS admin_dashboard CASCADE;
DROP VIEW IF EXISTS attendance_stats CASCADE;

-- Eliminar tablas (en orden para respetar foreign keys)
DROP TABLE IF EXISTS attendance_codes CASCADE;
DROP TABLE IF EXISTS qr_codes CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Eliminar funciones
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- ============================================
-- PASO 2: HABILITAR EXTENSIONES
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PASO 3: CREAR TABLAS
-- ============================================

-- Tabla de usuarios
CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL CHECK (rol IN ('admin', 'deportista')),
    activo BOOLEAN DEFAULT true,
    refresh_token TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de sesiones de entrenamiento
CREATE TABLE sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    fecha DATE NOT NULL,
    descripcion VARCHAR(255),
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de asistencias
CREATE TABLE attendance (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    metodo VARCHAR(10) NOT NULL CHECK (metodo IN ('qr', 'manual', 'codigo')),
    fecha_hora TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, session_id)
);

-- Tabla de pagos
CREATE TABLE payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    fecha DATE NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    metodo VARCHAR(20) NOT NULL CHECK (metodo IN ('efectivo', 'transferencia')),
    estado VARCHAR(20) NOT NULL CHECK (estado IN ('pagado', 'pendiente')),
    descripcion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de códigos QR
CREATE TABLE qr_codes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    codigo TEXT NOT NULL UNIQUE,
    expira_en TIMESTAMP WITH TIME ZONE NOT NULL,
    usado BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de códigos de asistencia (4 dígitos)
CREATE TABLE attendance_codes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    codigo VARCHAR(4) NOT NULL,
    token_codigo TEXT NOT NULL,
    expira_en TIMESTAMP WITH TIME ZONE NOT NULL,
    usado BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PASO 4: CREAR ÍNDICES
-- ============================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_rol ON users(rol);
CREATE INDEX idx_users_activo ON users(activo);
CREATE INDEX idx_attendance_user_id ON attendance(user_id);
CREATE INDEX idx_attendance_session_id ON attendance(session_id);
CREATE INDEX idx_attendance_fecha_hora ON attendance(fecha_hora);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_fecha ON payments(fecha);
CREATE INDEX idx_payments_estado ON payments(estado);
CREATE INDEX idx_qr_codes_codigo ON qr_codes(codigo);
CREATE INDEX idx_qr_codes_expira_en ON qr_codes(expira_en);
CREATE INDEX idx_attendance_codes_codigo ON attendance_codes(codigo);
CREATE INDEX idx_attendance_codes_expira_en ON attendance_codes(expira_en);

-- ============================================
-- PASO 5: CREAR TRIGGERS
-- ============================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at 
    BEFORE UPDATE ON payments
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- PASO 6: CREAR VISTAS
-- ============================================

-- Vista para dashboard de admin
CREATE VIEW admin_dashboard AS
SELECT 
    u.id,
    u.nombre,
    u.email,
    u.rol,
    u.activo,
    u.created_at,
    COUNT(DISTINCT a.id) as total_asistencias,
    COUNT(DISTINCT p.id) as total_pagos,
    MAX(p.fecha) as ultimo_pago,
    CASE 
        WHEN MAX(p.fecha) < CURRENT_DATE - INTERVAL '30 days' THEN 'Moroso'
        WHEN MAX(p.fecha) IS NULL THEN 'Sin pagos'
        ELSE 'Al día'
    END as estado_pago
FROM users u
LEFT JOIN attendance a ON u.id = a.user_id
LEFT JOIN payments p ON u.id = p.user_id
WHERE u.rol = 'deportista'
GROUP BY u.id, u.nombre, u.email, u.rol, u.activo, u.created_at;

-- Vista para estadísticas de asistencias
CREATE VIEW attendance_stats AS
SELECT 
    DATE(a.fecha_hora) as fecha,
    COUNT(*) as total_asistencias,
    COUNT(CASE WHEN a.metodo = 'qr' THEN 1 END) as asistencias_qr,
    COUNT(CASE WHEN a.metodo = 'manual' THEN 1 END) as asistencias_manual,
    COUNT(CASE WHEN a.metodo = 'codigo' THEN 1 END) as asistencias_codigo
FROM attendance a
GROUP BY DATE(a.fecha_hora)
ORDER BY fecha DESC;

-- ============================================
-- PASO 7: CONFIGURAR ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_codes ENABLE ROW LEVEL SECURITY;

-- IMPORTANTE: Crear políticas permisivas para uso con Service Role Key
-- El Service Role Key bypasea RLS automáticamente, pero estas políticas
-- son necesarias para el frontend cuando use el anon key

-- Políticas para users
CREATE POLICY "Permitir lectura a service role" ON users
    FOR SELECT USING (true);

CREATE POLICY "Permitir escritura a service role" ON users
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir actualización a service role" ON users
    FOR UPDATE USING (true);

-- Políticas para sessions
CREATE POLICY "Permitir lectura a todos" ON sessions
    FOR SELECT USING (true);

CREATE POLICY "Permitir escritura a service role" ON sessions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir actualización a service role" ON sessions
    FOR UPDATE USING (true);

-- Políticas para attendance
CREATE POLICY "Permitir lectura a todos" ON attendance
    FOR SELECT USING (true);

CREATE POLICY "Permitir escritura a todos" ON attendance
    FOR INSERT WITH CHECK (true);

-- Políticas para payments
CREATE POLICY "Permitir lectura a todos" ON payments
    FOR SELECT USING (true);

CREATE POLICY "Permitir escritura a service role" ON payments
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir actualización a service role" ON payments
    FOR UPDATE USING (true);

-- Políticas para qr_codes
CREATE POLICY "Permitir lectura a todos" ON qr_codes
    FOR SELECT USING (true);

CREATE POLICY "Permitir escritura a service role" ON qr_codes
    FOR INSERT WITH CHECK (true);

-- Políticas para attendance_codes
CREATE POLICY "Permitir lectura a todos" ON attendance_codes
    FOR SELECT USING (true);

CREATE POLICY "Permitir escritura a service role" ON attendance_codes
    FOR INSERT WITH CHECK (true);

-- ============================================
-- PASO 8: INSERTAR DATOS INICIALES
-- ============================================

-- Insertar usuario ADMIN con contraseña: admin123
-- Hash generado con bcrypt, 12 rounds
INSERT INTO users (nombre, email, password_hash, rol, activo, created_at, updated_at) 
VALUES (
    'Administrador',
    'admin@gimnasio.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/4Qz8K2C',
    'admin',
    true,
    NOW(),
    NOW()
);

-- Insertar sesión de hoy (opcional)
INSERT INTO sessions (fecha, descripcion, activa, created_at) 
VALUES (
    CURRENT_DATE,
    'Sesión de entrenamiento',
    true,
    NOW()
);

-- ============================================
-- PASO 9: VERIFICACIÓN
-- ============================================

-- Verificar que todo se creó correctamente
DO $$ 
BEGIN
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'VERIFICACIÓN DE BASE DE DATOS';
    RAISE NOTICE '==============================================';
    RAISE NOTICE '';
END $$;

-- Verificar tablas
SELECT 
    'Tablas creadas' as verificacion,
    COUNT(*) as total
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE';

-- Verificar vistas
SELECT 
    'Vistas creadas' as verificacion,
    COUNT(*) as total
FROM information_schema.views 
WHERE table_schema = 'public';

-- Verificar usuario admin
SELECT 
    '✅ Usuario admin creado' as verificacion,
    id,
    nombre,
    email,
    rol,
    activo,
    length(password_hash) as hash_length,
    substring(password_hash, 1, 10) as hash_inicio
FROM users 
WHERE email = 'admin@gimnasio.com';

-- Verificar sesión
SELECT 
    '✅ Sesión creada' as verificacion,
    id,
    fecha,
    descripcion,
    activa
FROM sessions 
WHERE fecha = CURRENT_DATE;

-- Resumen final
DO $$ 
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '==============================================';
    RAISE NOTICE '✅ BASE DE DATOS CREADA EXITOSAMENTE';
    RAISE NOTICE '==============================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Credenciales de admin:';
    RAISE NOTICE '  Email: admin@gimnasio.com';
    RAISE NOTICE '  Contraseña: admin123';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  IMPORTANTE: Cambia estas credenciales en producción';
    RAISE NOTICE '==============================================';
END $$;

