'use client';

import { useState } from 'react';

export default function TestLoginPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testLogin = async () => {
    setLoading(true);
    setResult(null);

    try {
      console.log('🔍 Probando API de login...');
      
      const response = await fetch('/api/auth/login', {
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
      
      setResult({
        status: response.status,
        success: data.success,
        data: data,
        error: data.error
      });
      
    } catch (error: any) {
      console.error('💥 Error de conexión:', error.message);
      setResult({
        status: 'ERROR',
        success: false,
        error: error.message,
        data: null
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Test de API Login
          </h1>
          
          <button
            onClick={testLogin}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Probando...' : 'Probar Login API'}
          </button>

          {result && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Resultado:
              </h2>
              <div className="bg-gray-100 p-4 rounded-md">
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
