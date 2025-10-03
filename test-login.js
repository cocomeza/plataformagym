// 🔍 SCRIPT PARA DIAGNOSTICAR PROBLEMA DE LOGIN
const axios = require('axios');

const BASE_URL = 'https://gym-platform-backend.onrender.com';

async function testLoginFlow() {
  console.log('🔍 DIAGNOSTICANDO PROBLEMA DE LOGIN\n');
  console.log('=' .repeat(50));
  
  // Datos de prueba
  const testUser = {
    nombre: 'Test Login User',
    email: 'testlogin@example.com',
    password: 'test123',
    rol: 'deportista'
  };
  
  try {
    // 1. Primero registrar un usuario
    console.log('📝 1. Registrando usuario de prueba...');
    const registerResponse = await axios.post(`${BASE_URL}/api/auth/register`, testUser);
    console.log('✅ Registro exitoso:', registerResponse.data);
    
    // 2. Intentar hacer login
    console.log('\n🔐 2. Intentando hacer login...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    console.log('✅ Login exitoso:', loginResponse.data);
    
    // 3. Verificar que el token funciona
    if (loginResponse.data.token) {
      console.log('\n🛡️ 3. Probando token...');
      const profileResponse = await axios.get(`${BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${loginResponse.data.token}` }
      });
      console.log('✅ Token válido:', profileResponse.data);
    }
    
  } catch (error) {
    console.log('❌ Error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n🚨 PROBLEMA IDENTIFICADO:');
      console.log('❌ Error 401 - Credenciales inválidas');
      console.log('\n📋 POSIBLES CAUSAS:');
      console.log('1. La contraseña no coincide con la almacenada');
      console.log('2. El usuario no está activo en la base de datos');
      console.log('3. Problema con el hash de la contraseña');
    } else if (error.response?.status === 500) {
      console.log('\n🚨 PROBLEMA IDENTIFICADO:');
      console.log('❌ Error 500 - Error interno del servidor');
      console.log('\n📋 POSIBLES CAUSAS:');
      console.log('1. Variables de entorno no configuradas');
      console.log('2. Error en la conexión a Supabase');
      console.log('3. Error en la generación de JWT');
    }
  }
}

// Ejecutar el diagnóstico
testLoginFlow();
