// Test simple para verificar que el código se genera
console.log('🧪 Iniciando test de generación de código...');

// Simular la función generateAttendanceCode
const generateAttendanceCode = () => {
  console.log('🔄 Iniciando generación de código...');
  
  // Generar código localmente
  const code = Math.floor(1000 + Math.random() * 9000).toString();
  const expiresAt = Date.now() + (30 * 1000);
  
  console.log('✅ Código generado:', code);
  console.log('⏰ Expira en:', new Date(expiresAt).toLocaleTimeString());
  
  return { code, expiresAt };
};

// Ejecutar test
const result = generateAttendanceCode();
console.log('📊 Resultado:', result);
