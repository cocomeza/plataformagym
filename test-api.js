// Script simple para probar la API de login
const testLogin = async () => {
  try {
    console.log('🔍 Probando API de login...');
    
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@test.com',
        password: 'admin123'
      }),
    });

    console.log('📡 Status:', response.status);
    console.log('📡 Headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.json();
    console.log('📦 Response:', data);
    
    if (data.success) {
      console.log('✅ Login exitoso!');
      console.log('👤 Usuario:', data.user);
      console.log('🔑 Token generado:', data.token ? 'Sí' : 'No');
    } else {
      console.log('❌ Error:', data.error);
    }
    
  } catch (error) {
    console.error('💥 Error de conexión:', error.message);
  }
};

// Ejecutar la prueba
testLogin();
