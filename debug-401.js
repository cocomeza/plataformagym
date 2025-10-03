// 🔍 SCRIPT PARA DIAGNOSTICAR ERROR 401
const axios = require('axios');

const BASE_URL = 'https://gym-platform-backend.onrender.com';

async function debug401() {
  console.log('🔍 DIAGNOSTICANDO ERROR 401\n');
  console.log('=' .repeat(50));
  
  // Crear un usuario nuevo para la prueba
  const testUser = {
    nombre: 'Debug User',
    email: 'debug401@example.com',
    password: 'debug123',
    rol: 'deportista'
  };
  
  try {
    // 1. Registrar usuario
    console.log('📝 1. Registrando usuario de prueba...');
    const registerResponse = await axios.post(`${BASE_URL}/api/auth/register`, testUser);
    console.log('✅ Registro exitoso:', {
      success: registerResponse.data.success,
      user: registerResponse.data.user
    });
    
    // 2. Verificar que el usuario existe en la base de datos
    console.log('\n🔍 2. Verificando usuario en base de datos...');
    
    // 3. Intentar login con credenciales correctas
    console.log('\n🔐 3. Intentando login con credenciales correctas...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    console.log('✅ Login exitoso:', {
      success: loginResponse.data.success,
      hasToken: !!loginResponse.data.token,
      user: loginResponse.data.user
    });
    
    // 4. Intentar login con credenciales incorrectas
    console.log('\n❌ 4. Probando login con credenciales incorrectas...');
    try {
      await axios.post(`${BASE_URL}/api/auth/login`, {
        email: testUser.email,
        password: 'password_incorrecta'
      });
    } catch (error) {
      console.log('✅ Error 401 esperado:', error.response?.status, error.response?.data);
    }
    
    // 5. Verificar logs del servidor
    console.log('\n📊 5. Verificando configuración del servidor...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Servidor funcionando:', healthResponse.data);
    
  } catch (error) {
    console.log('❌ Error inesperado:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n🚨 PROBLEMA IDENTIFICADO:');
      console.log('❌ Error 401 - Credenciales inválidas');
      console.log('\n📋 POSIBLES CAUSAS:');
      console.log('1. La contraseña no coincide con la almacenada');
      console.log('2. El usuario no está activo en la base de datos');
      console.log('3. Problema con el hash de la contraseña');
      console.log('4. El usuario no existe en la base de datos');
    }
  }
}

debug401();
