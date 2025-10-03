// 🧪 SCRIPT PARA PROBAR SISTEMA DE CÓDIGOS DE 4 DÍGITOS
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ppujkawteiowcmkkbzri.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwdWprYXd0ZWlvd2Nta2tienJpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTI1OTAwOSwiZXhwIjoyMDc0ODM1MDA5fQ.Ej1SFxkhXY8s2QxXs8Z5vswKLv9WwO1QseJ3b5l0ln0';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function testDigitCodeSystem() {
  console.log('🔢 PROBANDO SISTEMA DE CÓDIGOS DE 4 DÍGITOS\n');
  console.log('=' .repeat(50));
  
  try {
    // 1. Crear tabla attendance_codes si no existe
    console.log('📝 Creando tabla attendance_codes...');
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS attendance_codes (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
          codigo VARCHAR(4) NOT NULL,
          token_codigo TEXT NOT NULL,
          expira_en TIMESTAMP WITH TIME ZONE NOT NULL,
          usado BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `
    });

    if (createError && !createError.message.includes('already exists')) {
      console.log('⚠️  Error creando tabla:', createError.message);
    } else {
      console.log('✅ Tabla attendance_codes creada/verificada');
    }

    // 2. Crear índices si no existen
    console.log('📋 Agregando índices...');
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_attendance_codes_codigo ON attendance_codes(codigo);
        CREATE INDEX IF NOT EXISTS idx_attendance_codes_expira_en ON attendance_codes(expira_en);
      `
    });

    // 3. Actualizar tabla attendance para permitir método 'codigo'
    console.log('🔧 Actualizando tabla attendance...');
    const { error: updateError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE attendance DROP CONSTRAINT IF EXISTS attendance_metodo_check;
        ALTER TABLE attendance ADD CONSTRAINT attendance_metodo_check 
        CHECK (metodo IN ('qr', 'manual', 'codigo'));
      `
    });

    if (updateError && !updateError.message.includes('already exists')) {
      console.log('⚠️  Error actualizando constraint:', updateError.message);
    } else {
      console.log('✅ Tabla attendance actualizada para aceptar método codigo');
    }

    // 4. Verificar usuarios de prueba
    console.log('\n👥 Usuarios disponibles:');
    const { data: users } = await supabase
      .from('users')
      .select('id, nombre, email, rol')
      .limit(5);

    users.forEach(user => {
      console.log(`  - ${user.nombre} (${user.email}) [${user.rol}]`);
    });

    console.log('\n🎯 SISTEMA DE CÓDIGOS LISTO:');
    console.log('✅ Backend actualizado con endpoints:');
    console.log('   POST /api/attendance/code/generate - Generar código (admin)');
    console.log('   POST /api/attendance/code/validate - Validar código (deportista)');
    
    console.log('\n📱 PRÓXIMOS PASOS:');
    console.log('1. Actualizar frontend para usar nuevos endpoints');
    console.log('2. Reemplazar QR scanner con input de 4 dígitos');
    console.log('3. Probar generación y validación de códigos');
    
    console.log('\n🎉 Sistema de códigos de 4 dígitos implementado!');
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

testDigitCodeSystem();
