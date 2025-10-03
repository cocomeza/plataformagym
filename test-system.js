// 🧪 SCRIPT DE TESTING COMPLETO DEL SISTEMA
// Ejecutar con: node test-system.js

const axios = require('axios');

const BASE_URL = 'https://gym-platform-backend.onrender.com';
const FRONTEND_URL = 'https://gym-platform-frontend.netlify.app';

// Datos de prueba
const testUsers = {
  admin: {
    email: 'admin@test.com',
    password: 'admin123',
    name: 'Admin Test',
    role: 'admin'
  },
  cliente: {
    email: 'cliente@test.com',
    password: 'cliente123',
    name: 'Cliente Test',
    role: 'cliente'
  },
  deportista: {
    email: 'deportista@test.com',
    password: 'deportista123',
    name: 'Deportista Test',
    role: 'deportista'
  }
};

async function testHealthCheck() {
  console.log('🔍 1. Testing Health Check...');
  try {
    const response = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health Check OK:', response.data);
    return true;
  } catch (error) {
    console.log('❌ Health Check FAILED:', error.message);
    return false;
  }
}

async function testRegistration(userData) {
  console.log(`\n📝 2. Testing Registration for ${userData.role}...`);
  try {
    const response = await axios.post(`${BASE_URL}/auth/register`, userData);
    console.log(`✅ Registration OK for ${userData.role}:`, response.data);
    return response.data;
  } catch (error) {
    console.log(`❌ Registration FAILED for ${userData.role}:`, error.response?.data || error.message);
    return null;
  }
}

async function testLogin(userData) {
  console.log(`\n🔐 3. Testing Login for ${userData.role}...`);
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: userData.email,
      password: userData.password
    });
    console.log(`✅ Login OK for ${userData.role}:`, response.data);
    return response.data;
  } catch (error) {
    console.log(`❌ Login FAILED for ${userData.role}:`, error.response?.data || error.message);
    return null;
  }
}

async function testProtectedRoute(token, role) {
  console.log(`\n🛡️ 4. Testing Protected Route for ${role}...`);
  try {
    const response = await axios.get(`${BASE_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ Protected Route OK for ${role}:`, response.data);
    return true;
  } catch (error) {
    console.log(`❌ Protected Route FAILED for ${role}:`, error.response?.data || error.message);
    return false;
  }
}

async function testDashboardAccess(token, role) {
  console.log(`\n📊 5. Testing Dashboard Access for ${role}...`);
  try {
    const response = await axios.get(`${BASE_URL}/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ Dashboard Access OK for ${role}:`, response.data);
    return true;
  } catch (error) {
    console.log(`❌ Dashboard Access FAILED for ${role}:`, error.response?.data || error.message);
    return false;
  }
}

async function runCompleteTest() {
  console.log('🚀 INICIANDO TEST COMPLETO DEL SISTEMA\n');
  console.log('=' .repeat(50));
  
  // 1. Health Check
  const healthOk = await testHealthCheck();
  if (!healthOk) {
    console.log('\n❌ SISTEMA NO FUNCIONA - Health Check falló');
    return;
  }
  
  const results = {
    admin: { registration: false, login: false, protected: false, dashboard: false },
    cliente: { registration: false, login: false, protected: false, dashboard: false },
    deportista: { registration: false, login: false, protected: false, dashboard: false }
  };
  
  // 2. Test para cada tipo de usuario
  for (const [role, userData] of Object.entries(testUsers)) {
    console.log(`\n${'='.repeat(30)} TESTING ${role.toUpperCase()} ${'='.repeat(30)}`);
    
    // Registration
    const regResult = await testRegistration(userData);
    results[role].registration = regResult !== null;
    
    // Login
    const loginResult = await testLogin(userData);
    results[role].login = loginResult !== null;
    
    if (loginResult && loginResult.token) {
      // Protected Route
      results[role].protected = await testProtectedRoute(loginResult.token, role);
      
      // Dashboard Access
      results[role].dashboard = await testDashboardAccess(loginResult.token, role);
    }
  }
  
  // 3. Resumen de resultados
  console.log('\n' + '='.repeat(50));
  console.log('📊 RESUMEN DE RESULTADOS');
  console.log('='.repeat(50));
  
  for (const [role, result] of Object.entries(results)) {
    console.log(`\n👤 ${role.toUpperCase()}:`);
    console.log(`   📝 Registration: ${result.registration ? '✅' : '❌'}`);
    console.log(`   🔐 Login: ${result.login ? '✅' : '❌'}`);
    console.log(`   🛡️ Protected Route: ${result.protected ? '✅' : '❌'}`);
    console.log(`   📊 Dashboard: ${result.dashboard ? '✅' : '❌'}`);
  }
  
  // 4. Verificación final
  const allWorking = Object.values(results).every(r => 
    r.registration && r.login && r.protected && r.dashboard
  );
  
  console.log('\n' + '='.repeat(50));
  if (allWorking) {
    console.log('🎉 ¡SISTEMA COMPLETAMENTE FUNCIONAL!');
    console.log('✅ Todos los usuarios pueden registrarse, hacer login y acceder al dashboard');
  } else {
    console.log('⚠️ SISTEMA CON PROBLEMAS');
    console.log('❌ Algunas funcionalidades no están funcionando correctamente');
  }
  console.log('='.repeat(50));
}

// Ejecutar el test
runCompleteTest().catch(console.error);
