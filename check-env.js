// 🔍 SCRIPT PARA VERIFICAR VARIABLES DE ENTORNO
// Ejecutar con: node check-env.js

const axios = require('axios');

const BASE_URL = 'https://gym-platform-backend.onrender.com';

async function checkEnvironmentVariables() {
  console.log('🔍 VERIFICANDO VARIABLES DE ENTORNO EN RENDER\n');
  console.log('=' .repeat(50));
  
  try {
    // Intentar hacer un registro real para ver si las variables están configuradas
    const testUser = {
      nombre: 'Test User',
      email: 'test@example.com',
      password: 'test123',
      rol: 'deportista'
    };
    
    console.log('📝 Probando registro con variables de entorno...');
    const response = await axios.post(`${BASE_URL}/api/auth/register`, testUser);
    
    console.log('✅ Respuesta del registro:', response.data);
    
    // Si llegamos aquí, las variables están configuradas
    if (response.data.success || response.data.token) {
      console.log('\n🎉 ¡VARIABLES DE ENTORNO CONFIGURADAS CORRECTAMENTE!');
      console.log('✅ El sistema está funcionando con Supabase y JWT');
    } else {
      console.log('\n⚠️ Variables de entorno configuradas pero respuesta inesperada');
    }
    
  } catch (error) {
    console.log('❌ Error en el registro:', error.response?.data || error.message);
    
    if (error.response?.data?.error?.includes('Configuración del servidor incompleta')) {
      console.log('\n🚨 PROBLEMA IDENTIFICADO:');
      console.log('❌ Las variables de entorno NO están configuradas en Render');
      console.log('\n📋 SOLUCIÓN:');
      console.log('1. Ve a: https://dashboard.render.com/');
      console.log('2. Selecciona tu servicio: gym-platform-backend');
      console.log('3. Ve a "Environment"');
      console.log('4. Agrega estas variables:');
      console.log('   SUPABASE_URL=https://ppujkawteiowcmkkbzri.supabase.co');
      console.log('   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwdWprYXd0ZWlvd2Nta2tienJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNTkwMDksImV4cCI6MjA3NDgzNTAwOX0.6xjS_mf1ajbGIxtdNN3XGnYWvAoDoCXb5SmRGKvZ1LQ');
      console.log('   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwdWprYXd0ZWlvd2Nta2tienJpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTI1OTAwOSwiZXhwIjoyMDc0ODM1MDA5fQ.Ej1SFxkhXY8s2QxXs8Z5vswKLv9WwO1QseJ3b5l0ln0');
      console.log('   JWT_SECRET=gym_platform_jwt_secret_2024_secure_key_12345');
      console.log('   JWT_REFRESH_SECRET=gym_platform_refresh_jwt_secret_2024_secure_key_67890');
      console.log('5. Haz clic en "Save Changes"');
      console.log('6. Espera 2-3 minutos para el redeploy');
    } else if (error.response?.data?.error?.includes('Ya existe un usuario')) {
      console.log('\n🎉 ¡VARIABLES DE ENTORNO CONFIGURADAS!');
      console.log('✅ El usuario ya existe, lo que significa que Supabase está funcionando');
      console.log('✅ Las variables de entorno están correctamente configuradas');
    } else {
      console.log('\n❓ Error inesperado. Revisa los logs de Render para más detalles.');
    }
  }
}

// Ejecutar la verificación
checkEnvironmentVariables().catch(console.error);
