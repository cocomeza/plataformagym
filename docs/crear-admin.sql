-- CREAR USUARIO ADMIN MANUALMENTE
-- IMPORTANTE: Reemplaza 'TU_USER_ID_AQUI' con el ID del usuario que creaste en Authentication

-- Paso 1: Copia el ID del usuario que creaste en Authentication > Users
-- Paso 2: Reemplaza 'TU_USER_ID_AQUI' abajo con ese ID
-- Paso 3: Ejecuta este SQL

INSERT INTO users (id, nombre, email, telefono, rol, activo, created_at)
VALUES (
    'TU_USER_ID_AQUI'::uuid,  -- Reemplaza esto con el ID del usuario de Authentication
    'Administrador',
    'admin@test.com',
    '',
    'admin',
    true,
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    rol = 'admin',
    nombre = 'Administrador';

