/**
 * Script para crear o actualizar un usuario admin en Supabase
 * 
 * Uso:
 * node scripts/create-admin.js
 * 
 * O con variables de entorno personalizadas:
 * EMAIL=admin@gimnasio.com PASSWORD=admin123 node scripts/create-admin.js
 */

const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuración
const ADMIN_EMAIL = process.env.EMAIL || 'admin@gimnasio.com';
const ADMIN_PASSWORD = process.env.PASSWORD || 'admin123';
const ADMIN_NAME = process.env.NAME || 'Administrador';

async function createAdmin() {
  console.log('🔧 Creando usuario admin en Supabase...\n');

  // Verificar variables de entorno
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ ERROR: Faltan variables de entorno');
    console.error('Asegúrate de tener configuradas:');
    console.error('- NEXT_PUBLIC_SUPABASE_URL');
    console.error('- SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  console.log('✅ Variables de entorno encontradas');
  console.log(`📧 Email: ${ADMIN_EMAIL}`);
  console.log(`🔑 Contraseña: ${ADMIN_PASSWORD}`);
  console.log(`👤 Nombre: ${ADMIN_NAME}\n`);

  // Crear cliente de Supabase
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    // Generar hash de contraseña
    console.log('🔐 Generando hash de contraseña...');
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(ADMIN_PASSWORD, saltRounds);
    console.log(`✅ Hash generado (${password_hash.length} caracteres)`);
    console.log(`   Hash: ${password_hash}\n`);

    // Verificar si el usuario ya existe
    console.log('🔍 Verificando si el usuario ya existe...');
    const { data: existingUser, error: selectError } = await supabase
      .from('users')
      .select('*')
      .eq('email', ADMIN_EMAIL)
      .single();

    if (existingUser) {
      console.log('⚠️  El usuario ya existe, actualizando...');
      
      // Actualizar usuario existente
      const { data, error } = await supabase
        .from('users')
        .update({
          nombre: ADMIN_NAME,
          password_hash: password_hash,
          rol: 'admin',
          activo: true,
          updated_at: new Date().toISOString()
        })
        .eq('email', ADMIN_EMAIL)
        .select()
        .single();

      if (error) {
        console.error('❌ Error al actualizar usuario:', error);
        process.exit(1);
      }

      console.log('✅ Usuario admin actualizado exitosamente!\n');
      console.log('👤 Datos del usuario:');
      console.log(`   ID: ${data.id}`);
      console.log(`   Nombre: ${data.nombre}`);
      console.log(`   Email: ${data.email}`);
      console.log(`   Rol: ${data.rol}`);
      console.log(`   Activo: ${data.activo}\n`);
    } else {
      console.log('➕ Creando nuevo usuario...');
      
      // Crear nuevo usuario
      const { data, error } = await supabase
        .from('users')
        .insert({
          nombre: ADMIN_NAME,
          email: ADMIN_EMAIL,
          password_hash: password_hash,
          rol: 'admin',
          activo: true
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error al crear usuario:', error);
        process.exit(1);
      }

      console.log('✅ Usuario admin creado exitosamente!\n');
      console.log('👤 Datos del usuario:');
      console.log(`   ID: ${data.id}`);
      console.log(`   Nombre: ${data.nombre}`);
      console.log(`   Email: ${data.email}`);
      console.log(`   Rol: ${data.rol}`);
      console.log(`   Activo: ${data.activo}\n`);
    }

    console.log('🎉 ¡Listo! Ahora puedes iniciar sesión con:');
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Contraseña: ${ADMIN_PASSWORD}\n`);

  } catch (error) {
    console.error('❌ Error inesperado:', error);
    process.exit(1);
  }
}

// Función para verificar el login
async function verifyLogin() {
  console.log('\n🔍 Verificando login...\n');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    // Buscar usuario
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', ADMIN_EMAIL)
      .eq('activo', true)
      .single();

    if (error || !user) {
      console.error('❌ Usuario no encontrado o inactivo');
      return;
    }

    console.log('✅ Usuario encontrado');
    
    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(ADMIN_PASSWORD, user.password_hash);
    
    if (isValidPassword) {
      console.log('✅ Contraseña válida - El login debería funcionar!');
    } else {
      console.error('❌ Contraseña inválida - El hash no coincide');
      console.log('\n🔧 Ejecuta el script nuevamente para actualizar el hash');
    }

  } catch (error) {
    console.error('❌ Error al verificar login:', error);
  }
}

// Ejecutar
createAdmin()
  .then(() => verifyLogin())
  .catch(console.error);

