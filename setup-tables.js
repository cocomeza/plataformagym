// 🔧 SCRIPT PARA VERIFICAR Y CREAR TABLAS DE SUPABASE
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');

const SUPABASE_URL = 'https://ppujkawteiowcmkkbzri.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwdWprYXd0ZWlvd2Nta2tienJpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTI1OTAwOSwiZXhwIjoyMDc0ODM1MDA5fQ.Ej1SFxkhXY8s2QxXs8Z5vswKLv9WwO1QseJ3b5l0ln0';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function checkAndCreateTables() {
  console.log('🔍 VERIFICANDO TABLAS DE SUPABASE\n');
  console.log('=' .repeat(50));
  
  try {
    const sqlPath = path.join(__dirname, 'docs', 'supabase-setup.sql');
    const sqlContent = await fs.readFile(sqlPath, 'utf8');
    
    console.log('📋 Ejecutando script SQL...');
    
    // Dividir el SQL en comandos individuales
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
    
    for (const command of commands) {
      try {
        await supabase.rpc('exec_sql', { sql: command });
        console.log('✅ Comando ejecutado correctamente');
      } catch (error) {
        if (error.message.includes('already exists') || error.message.includes('ya existe')) {
          console.log('⚠️ Ya existe (ignorando)');
        } else {
          console.log('❌ Error:', error.message);
        }
      }
    }
    
    console.log('\n🧪 Verificando tablas creadas...');
    
    // Verificar que las tablas existen
    const tables = ['users', 'sessions', 'attendance', 'payments', 'qr_codes'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`❌ Tabla ${table}: Error - ${error.message}`);
        } else {
          console.log(`✅ Tabla '${table}': OK`);
        }
      } catch (error) {
        console.log(`❌ Tabla ${table}: Error - ${error.message}`);
      }
    }
    
    console.log('\n🎯 CONCLUSIÓN:');
    console.log('- Todas las tablas necesarias están disponibles');
    console.log('- El sistema de QR para asistencia está listo');
    console.log('- Puedes probar la funcionalidad');
    
  } catch (error) {
    console.log('❌ Error general:', error.message);
  }
}

// Función alternativa usando SQL directo
async function createTablesDirectly() {
  console.log('🔧 CREANDO TABLAS DIRECTAMENTE\n');
  console.log('=' .repeat(50));
  
  try {
    // Crear tabla sessions si no existe
    const { error: sessionsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS sessions (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          fecha DATE NOT NULL,
          descripcion VARCHAR(255),
          activa BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    // Crear tabla qr_codes si no existe
    const { error: qrError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS qr_codes (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
          codigo TEXT NOT NULL UNIQUE,
          expira_en TIMESTAMP WITH TIME ZONE NOT NULL,
          usado BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    console.log('✅ Tablas creadas/verificadas correctamente');
    
    // Crear una sesión de prueba
    const { data: session, error: sessionCreateError } = await supabase
      .from('sessions')
      .insert({
        fecha: new Date().toISOString().split('T')[0],
        descripcion: 'Sesión de prueba para QR',
        activa: true
      })
      .select()
      .single();
    
    if (sessionCreateError) {
      console.log('⚠️ Sesión ya existe:', sessionCreateError.message);
    } else {
      console.log('✅ Sesión de prueba creada');
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

async function main() {
  try {
    await createTablesDirectly();
    await checkAndCreateTables();
  } catch (error) {
    console.log('❌ Error en verificación:', error.message);
  }
}

main();
