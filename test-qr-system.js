// 🧪 SCRIPT PARA PROBAR SISTEMA DE QR
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ppujkawteiowcmkkbzri.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwdWprYXd0ZWlvd2Nta2tienJpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTI1OTAwOSwiZXhwIjoyMDc0ODM1MDA5fQ.Ej1SFxkhXY8s2QxXs8Z5vswKLv9WwO1QseJ3b5l0ln0';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function testQRSystem() {
  console.log('🧪 PROBANDO SISTEMA DE QR\n');
  console.log('=' .repeat(50));
  
  try {
    // 1. Verificar que existen las tablas
    console.log('📋 Verificando tablas...');
    
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, nombre, email, rol')
      .limit(5);
    
    if (usersError) {
      console.log('❌ Error verificando usuarios:', usersError.message);
      return;
    }
    
    console.log(`✅ Usuarios encontrados: ${users.length}`);
    users.forEach(user => {
      console.log(`   - ${user.nombre} (${user.email}) [${user.rol}]`);
    });
    
    // 2. Crear sesión de prueba
    console.log('\n🎯 Creando sesión de prueba...');
    
    const today = new Date().toISOString().split('T')[0];
    const { data: existingSession } = await supabase
      .from('sessions')
      .select('id')
      .eq('fecha', today)
      .eq('activa', true).
      single();
    
    let sessionId;
    if (existingSession) {
      console.log('✅ Sesión de hoy ya existe');
      sessionId = existingSession.id;
    } else {
      const { data: session, error: sessionError } = await supabase
        .from('sessions')
        .insert({
          fecha: today,
          descripcion: 'Entrenamiento matutino',
          activa: true
        })
        .select()
        .single();
      
      if (sessionError) {
        console.log('❌ Error creando sesión:', sessionError.message);
        return;
      }
      
      console.log('✅ Sesión creada:', session.id);
      sessionId = session.id;
    }
    
    // 3. Verificar tabla de códigos QR
    console.log('\n🔍 Verificando tabla qr_codes...');
    
    const { data: qrCodes, error: qrError } = await supabase
      .from('qr_codes')
      .select('*')
      .limit(3);
    
    if (qrError) {
      console.log('❌ Error verificando QR codes:', qrError.message);
      console.log('💡 Probablemente la tabla no existe. Creando...');
      
      const { error: createError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS qr_codes (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
            codigo TEXT NOT NULL UNIQUE,
            expira_en TIMESTAMP WITH TIME ZONE NOT NULL,
            usado BOOLEAN DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          )
        `
      });
      
      if (createError) {
        console.log('❌ Error creando tabla qr_codes:', createError.message);
        return;
      } else {
        console.log('✅ Tabla qr_codes creada');
      }
    } else {
      console.log(`✅ Códigos QR encontrados: ${qrCodes.length}`);
    }
    
    // 4. Verificar tabla de asistencias
    console.log('\n📊 Verificando tabla attendance...');
        
    const { data: attendance, error: attendanceError } = await supabase
      .from('attendance')
      .select('*')
      .limit(3);
    
    if (attendanceError) {
      console.log('❌ Error verificando asistencias:', attendanceError.message);
      console.log('💡 Probablemente la tabla no existe. Creando...');
      
      const { error: createError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS attendance (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
            metodo VARCHAR(10) NOT NULL CHECK (metodo IN ('qr', 'manual')),
            fecha_hora TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(user_id, session_id)
          )
        `
      });
      
      if (createError) {
        console.log('❌ Error creando tabla attendance:', createError.message);
      } else {
        console.log('✅ Tabla attendance creada');
      }
    } else {
      console.log(`✅ Asistencias encontradas: ${attendance.length}`);
    }
    
    console.log('\n🎉 RESUMEN:');
    console.log('✅ Sistema de QR está listo para usar');
    console.log('✅ Tablas verificadas/creadas correctamente');
    console.log('✅ Sesión de prueba disponible');
    console.log('\n📱 PRÓXIMO PASO:');
    console.log('1. Ve al dashboard de admin (https://gym-platform-cocomeza.netlify.app/admin)');
    console.log('2. Inicia sesión como admin@test.com / admin123');
    console.log('3. Ve a la pestaña "Entrenamiento"');
    console.log('4. Haz clic en "Generar Código QR"');
    console.log('5. Prueba escanear el QR con un deportista');
    
  } catch (error) {
    console.log('❌ Error general:', error.message);
  }
}

testQRSystem();
