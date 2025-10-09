-- ============================================
-- CONFIGURACIÓN RÁPIDA - GIMNASIO PLATFORM
-- Copia y pega todo este script en el SQL Editor de Supabase
-- ============================================

-- Habilitar UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- TABLA: users
CREATE TABLE IF NOT EXISTS users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    rol VARCHAR(20) NOT NULL CHECK (rol IN ('admin', 'deportista')) DEFAULT 'deportista',
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLA: attendances
CREATE TABLE IF NOT EXISTS attendances (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    userId UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    userName VARCHAR(100) NOT NULL,
    fecha_hora TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metodo VARCHAR(20) NOT NULL DEFAULT 'Manual',
    codigo_usado VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLA: payments
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

-- TABLA: notifications
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

-- ÍNDICES
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_attendances_userId ON attendances(userId);
CREATE INDEX IF NOT EXISTS idx_payments_userId ON payments(userId);
CREATE INDEX IF NOT EXISTS idx_notifications_userId ON notifications(userId);

-- HABILITAR RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendances ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS: Users pueden ver su propio perfil
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

-- POLÍTICAS: Admins pueden ver todos los usuarios
DROP POLICY IF EXISTS "Admins can view all users" ON users;
CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND rol = 'admin')
    );

-- POLÍTICAS: Admins pueden crear usuarios
DROP POLICY IF EXISTS "Admins can create users" ON users;
CREATE POLICY "Admins can create users" ON users
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND rol = 'admin')
    );

-- POLÍTICAS: Admins pueden actualizar usuarios
DROP POLICY IF EXISTS "Admins can update all users" ON users;
CREATE POLICY "Admins can update all users" ON users
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND rol = 'admin')
    );

-- POLÍTICAS: Users pueden ver sus asistencias
DROP POLICY IF EXISTS "Users can view own attendances" ON attendances;
CREATE POLICY "Users can view own attendances" ON attendances
    FOR SELECT USING (auth.uid() = userId);

-- POLÍTICAS: Admins pueden ver todas las asistencias
DROP POLICY IF EXISTS "Admins can view all attendances" ON attendances;
CREATE POLICY "Admins can view all attendances" ON attendances
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND rol = 'admin')
    );

-- POLÍTICAS: Users pueden crear asistencias
DROP POLICY IF EXISTS "Users can create own attendances" ON attendances;
CREATE POLICY "Users can create own attendances" ON attendances
    FOR INSERT WITH CHECK (auth.uid() = userId);

-- POLÍTICAS: Admins pueden crear asistencias
DROP POLICY IF EXISTS "Admins can create any attendance" ON attendances;
CREATE POLICY "Admins can create any attendance" ON attendances
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND rol = 'admin')
    );

-- POLÍTICAS: Users pueden ver sus pagos
DROP POLICY IF EXISTS "Users can view own payments" ON payments;
CREATE POLICY "Users can view own payments" ON payments
    FOR SELECT USING (auth.uid() = userId);

-- POLÍTICAS: Admins pueden gestionar pagos
DROP POLICY IF EXISTS "Admins can manage payments" ON payments;
CREATE POLICY "Admins can manage payments" ON payments
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND rol = 'admin')
    );

-- POLÍTICAS: Users pueden ver notificaciones
DROP POLICY IF EXISTS "Users can view notifications" ON notifications;
CREATE POLICY "Users can view notifications" ON notifications
    FOR SELECT USING (userId IS NULL OR auth.uid() = userId);

-- POLÍTICAS: Admins pueden crear notificaciones
DROP POLICY IF EXISTS "Admins can create notifications" ON notifications;
CREATE POLICY "Admins can create notifications" ON notifications
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND rol = 'admin')
    );

-- POLÍTICAS: Users pueden actualizar sus notificaciones
DROP POLICY IF EXISTS "Users can update notifications" ON notifications;
CREATE POLICY "Users can update notifications" ON notifications
    FOR UPDATE USING (userId IS NULL OR auth.uid() = userId);

-- TRIGGER: Crear usuario automáticamente al registrarse
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Notificación de ejemplo
INSERT INTO notifications (titulo, mensaje, tipo, leida)
VALUES (
    '¡Bienvenido!',
    'Gracias por unirte. Recuerda marcar tu asistencia cada día.',
    'info',
    false
) ON CONFLICT DO NOTHING;

