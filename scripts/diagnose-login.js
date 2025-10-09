/**
 * Script de diagnóstico para problemas de login
 * 
 * Uso:
 * node scripts/diagnose-login.js admin@gimnasio.com
 */

const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const email = process.argv[2] || 'admin@gimnasio.com';

async function diagnose() {
  console.log('🔍 DIAGNÓSTICO DE LOGIN\n');
  console.log(`📧 Verificando usuario: ${email}\n`);

  // 1. Verificar variables de entorno
  console.log('1️⃣ Verificando variables de entorno...');
  const checks = {
    'NEXT_PUBLIC_SUPABASE_URL': !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    'SUPABASE_SERVICE_ROLE_KEY': !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    'JWT_SECRET': !!process.env.JWT_SECRET,
    'JWT_REFRESH_SECRET': !!process.env.JWT_REFRESH_SECRET,
  };

  let allOk = true;
  for (const [key, value] of Object.entries(checks)) {
    const icon = value ? '✅' : '❌';
    console.log(`   ${icon} ${key}: ${value ? 'Configurado' : 'FALTA'}`);
    if (!value) allOk = false;
  }
  
  if (!allOk) {
    console.log('\n❌ Faltan variables de entorno críticas!');
    console.log('   Crea un archivo .env con las variables necesarias\n');
    return;
  }

  console.log('   ✅ Todas las variables de entorno están configuradas\n');

  // 2. Verificar conexión a Supabase
  console.log('2️⃣ Verificando conexión a Supabase...');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (error) {
      console.log('   ❌ Error de conexión:', error.message);
      return;
    }
    console.log('   ✅ Conexión exitosa a Supabase\n');
  } catch (error) {
    console.log('   ❌ Error al conectar:', error.message);
    return;
  }

  // 3. Buscar usuario
  console.log('3️⃣ Buscando usuario en la base de datos...');
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (userError || !user) {
    console.log('   ❌ Usuario no encontrado');
    console.log('   💡 Ejecuta: node scripts/create-admin.js\n');
    return;
  }

  console.log('   ✅ Usuario encontrado\n');

  // 4. Verificar datos del usuario
  console.log('4️⃣ Datos del usuario:');
  console.log(`   ID: ${user.id}`);
  console.log(`   Nombre: ${user.nombre}`);
  console.log(`   Email: ${user.email}`);
  console.log(`   Rol: ${user.rol}`);
  console.log(`   Activo: ${user.activo ? '✅ Sí' : '❌ No'}`);
  console.log(`   Tiene password_hash: ${user.password_hash ? '✅ Sí' : '❌ No'}`);
  
  if (user.password_hash) {
    console.log(`   Longitud del hash: ${user.password_hash.length} caracteres`);
    console.log(`   Hash empieza con: ${user.password_hash.substring(0, 10)}...`);
  }
  console.log('');

  // 5. Verificar estado del usuario
  console.log('5️⃣ Verificando condiciones de login...');
  const issues = [];

  if (!user.activo) {
    issues.push('Usuario está INACTIVO');
  }

  if (!user.password_hash) {
    issues.push('Falta password_hash');
  }

  if (user.password_hash && user.password_hash.length !== 60) {
    issues.push(`Hash incorrecto (longitud: ${user.password_hash.length}, esperado: 60)`);
  }

  if (issues.length > 0) {
    console.log('   ❌ Problemas encontrados:');
    issues.forEach(issue => console.log(`      - ${issue}`));
    console.log('\n   💡 Ejecuta: node scripts/create-admin.js para corregir\n');
    return;
  }

  console.log('   ✅ Usuario cumple todas las condiciones\n');

  // 6. Verificar contraseña
  console.log('6️⃣ Verificando contraseña por defecto (admin123)...');
  const defaultPassword = 'admin123';
  
  try {
    const isValid = await bcrypt.compare(defaultPassword, user.password_hash);
    
    if (isValid) {
      console.log('   ✅ La contraseña "admin123" es válida\n');
      
      console.log('🎉 TODO ESTÁ BIEN!');
      console.log('   El login debería funcionar con:');
      console.log(`   Email: ${email}`);
      console.log(`   Contraseña: ${defaultPassword}\n`);
      
      console.log('💡 Si aún no funciona, verifica:');
      console.log('   1. Que estés usando la URL correcta de la API');
      console.log('   2. Que las variables de entorno estén cargadas en producción');
      console.log('   3. Revisa los logs del servidor para más detalles\n');
    } else {
      console.log('   ❌ La contraseña "admin123" NO es válida\n');
      console.log('   💡 El hash no coincide con la contraseña por defecto');
      console.log('   💡 Ejecuta: node scripts/create-admin.js para actualizar\n');
    }
  } catch (error) {
    console.log('   ❌ Error al verificar contraseña:', error.message);
  }
}

diagnose().catch(console.error);

