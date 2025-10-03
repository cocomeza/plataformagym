// 🔍 SCRIPT PARA PROBAR CORS DESDE NETLIFY
const axios = require('axios');

const BASE_URL = 'https://gym-platform-backend.onrender.com';

async function testCORS() {
  console.log('🔍 PROBANDO CORS DESDE NETLIFY\n');
  console.log('=' .repeat(50));
  
  try {
    // Simular request desde Netlify
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'testlogin@example.com',
      password: 'test123'
    }, {
      headers: {
        'Origin': 'https://gym-platform-cocomeza.netlify.app',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ CORS funcionando correctamente:', response.data);
    
  } catch (error) {
    console.log('❌ Error CORS:', error.response?.data || error.message);
    
    if (error.message.includes('CORS')) {
      console.log('\n🚨 PROBLEMA DE CORS IDENTIFICADO');
    }
  }
}

testCORS();
