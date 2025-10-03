// 🔍 SCRIPT PARA VERIFICAR ENDPOINT DE DEBUG
const axios = require('axios');

const BASE_URL = 'https://gym-platform-backend.onrender.com';

async function checkDebugEndpoint() {
  console.log('🔍 VERIFICANDO ENDPOINT DE DEBUG\n');
  
  try {
    const response = await axios.get(`${BASE_URL}/api/auth/debug/env`);
    console.log('✅ Respuesta del debug:', JSON.stringify(response.data, null, 2));
    
    if (response.data.hasSupabaseUrl && response.data.hasSupabaseServiceKey && response.data.hasJwtSecret) {
      console.log('\n🎉 ¡TODAS LAS VARIABLES DE ENTORNO ESTÁN CONFIGURADAS!');
    } else {
      console.log('\n❌ FALTAN VARIABLES DE ENTORNO:');
      if (!response.data.hasSupabaseUrl) console.log('   - SUPABASE_URL');
      if (!response.data.hasSupabaseServiceKey) console.log('   - SUPABASE_SERVICE_ROLE_KEY');
      if (!response.data.hasJwtSecret) console.log('   - JWT_SECRET');
      if (!response.data.hasJwtRefreshSecret) console.log('   - JWT_REFRESH_SECRET');
    }
    
  } catch (error) {
    console.log('❌ Error:', error.response?.data || error.message);
  }
}

checkDebugEndpoint();
