-- Configuración inicial de la base de datos para la plataforma de gimnasio

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

-- Tabla de códigos QR (para sistema QR - mantener por compatibilidad)
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

-- Índices para mejorar rendimiento
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_rol ON users(rol);
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

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Políticas de seguridad (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_codes ENABLE ROW LEVEL SECURITY;

-- Política para usuarios: pueden ver y editar su propio perfil
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Política para admins: pueden ver todos los usuarios
CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND rol = 'admin'
        )
    );

-- Política para sesiones: todos pueden ver sesiones activas
CREATE POLICY "Anyone can view active sessions" ON sessions
    FOR SELECT USING (activa = true);

-- Política para admins: pueden gestionar sesiones
CREATE POLICY "Admins can manage sessions" ON sessions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND rol = 'admin'
        )
    );

-- Política para asistencias: usuarios pueden ver sus propias asistencias
CREATE POLICY "Users can view own attendance" ON attendance
    FOR SELECT USING (auth.uid() = user_id);

-- Política para asistencias: admins pueden ver todas las asistencias
CREATE POLICY "Admins can view all attendance" ON attendance
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND rol = 'admin'
        )
    );

-- Política para asistencias: usuarios pueden crear sus propias asistencias
CREATE POLICY "Users can create own attendance" ON attendance
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para pagos: usuarios pueden ver sus propios pagos
CREATE POLICY "Users can view own payments" ON payments
    FOR SELECT USING (auth.uid() = user_id);

-- Política para pagos: admins pueden gestionar todos los pagos
CREATE POLICY "Admins can manage all payments" ON payments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND rol = 'admin'
        )
    );

-- Política para códigos QR: solo admins pueden gestionar
CREATE POLICY "Admins can manage QR codes" ON qr_codes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND rol = 'admin'
        )
    );

-- Política para códigos de asistencia: solo admins pueden gestionar
CREATE POLICY "Admins can manage attendance codes" ON attendance_codes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND rol = 'admin'
        )
    );

-- Insertar usuario admin por defecto (contraseña: admin123)
INSERT INTO users (nombre, email, password_hash, rol) VALUES 
('Administrador', 'admin@gimnasio.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/4Qz8K2C', 'admin');

-- Crear vista para dashboard de admin
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
        ELSE 'Al día'
    END as estado_pago
FROM users u
LEFT JOIN attendance a ON u.id = a.user_id
LEFT JOIN payments p ON u.id = p.user_id
WHERE u.rol = 'deportista'
GROUP BY u.id, u.nombre, u.email, u.rol, u.activo, u.created_at;

-- Crear vista para estadísticas de asistencias
CREATE VIEW attendance_stats AS
SELECT 
    DATE(a.fecha_hora) as fecha,
    COUNT(*) as total_asistencias,
    COUNT(CASE WHEN a.metodo = 'qr' THEN 1 END) as asistencias_qr,
    COUNT(CASE WHEN a.metodo = 'manual' THEN 1 END) as asistencias_manual
FROM attendance a
GROUP BY DATE(a.fecha_hora)
ORDER BY fecha DESC;
