'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Dumbbell, Users, CreditCard, BarChart3 } from 'lucide-react';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push(user.rol === 'admin' ? '/admin' : '/dashboard');
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Dumbbell className="h-8 w-8 text-primary-600" />
              <h1 className="ml-2 text-2xl font-bold text-gray-900">
                Gimnasio Pro
              </h1>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => router.push('/login')}
                className="btn btn-secondary btn-md"
              >
                Iniciar Sesión
              </button>
              <button
                onClick={() => router.push('/register')}
                className="btn btn-primary btn-md"
              >
                Registrarse
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            Plataforma de Gestión
            <span className="text-primary-600"> Deportiva</span>
          </h2>
          <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
            Sistema completo para la gestión de gimnasios en Argentina. 
            Control de asistencias, pagos, usuarios y mucho más.
          </p>
          <div className="mt-10 flex justify-center space-x-4">
            <button
              onClick={() => router.push('/register')}
              className="btn btn-primary btn-lg"
            >
              Comenzar Ahora
            </button>
            <button
              onClick={() => router.push('/login')}
              className="btn btn-secondary btn-lg"
            >
              Ya tengo cuenta
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="card text-center">
              <div className="card-content">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-primary-100">
                  <Dumbbell className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  Control de Asistencia
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  Sistema QR dinámico y marcación manual para un control preciso
                </p>
              </div>
            </div>

            <div className="card text-center">
              <div className="card-content">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-success-100">
                  <Users className="h-6 w-6 text-success-600" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  Gestión de Usuarios
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  Administra deportistas y roles con facilidad
                </p>
              </div>
            </div>

            <div className="card text-center">
              <div className="card-content">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-warning-100">
                  <CreditCard className="h-6 w-6 text-warning-600" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  Control de Pagos
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  Efectivo y transferencias con seguimiento de morosos
                </p>
              </div>
            </div>

            <div className="card text-center">
              <div className="card-content">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-secondary-100">
                  <BarChart3 className="h-6 w-6 text-secondary-600" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  Reportes y Estadísticas
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  Dashboard completo con métricas en tiempo real
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 bg-primary-600 rounded-2xl">
          <div className="px-6 py-16 sm:px-16 sm:py-24">
            <div className="text-center">
              <h3 className="text-3xl font-bold text-white">
                ¿Listo para modernizar tu gimnasio?
              </h3>
              <p className="mt-4 text-xl text-primary-100">
                Únete a la revolución digital del fitness en Argentina
              </p>
              <div className="mt-8">
                <button
                  onClick={() => router.push('/register')}
                  className="btn bg-white text-primary-600 hover:bg-primary-50 btn-lg"
                >
                  Crear Cuenta Gratis
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 Gimnasio Pro. Desarrollado con ❤️ para Argentina.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
