'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { 
  Dumbbell, 
  Users, 
  CreditCard, 
  BarChart3, 
  Clock, 
  Shield, 
  Star, 
  CheckCircle,
  ArrowRight,
  Play,
  Menu,
  X,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram
} from 'lucide-react';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-lg fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Dumbbell className="h-10 w-10 text-primary-600" />
              <h1 className="ml-3 text-2xl font-bold text-gray-900">
                Gimnasio Pro
              </h1>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <a href="#inicio" className="text-gray-700 hover:text-primary-600 transition-colors">Inicio</a>
              <a href="#caracteristicas" className="text-gray-700 hover:text-primary-600 transition-colors">Características</a>
              <a href="#galeria" className="text-gray-700 hover:text-primary-600 transition-colors">Galería</a>
              <a href="#precios" className="text-gray-700 hover:text-primary-600 transition-colors">Precios</a>
            </nav>

            <div className="hidden md:flex space-x-4">
              <button
                onClick={() => router.push('/login')}
                className="px-4 py-2 text-primary-600 border border-primary-600 rounded-lg hover:bg-primary-50 transition-colors"
              >
                Iniciar Sesión
              </button>
              <button
                onClick={() => router.push('/register')}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Registrarse
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t">
              <nav className="flex flex-col space-y-4">
                <a href="#inicio" className="text-gray-700 hover:text-primary-600">Inicio</a>
                <a href="#caracteristicas" className="text-gray-700 hover:text-primary-600">Características</a>
                <a href="#galeria" className="text-gray-700 hover:text-primary-600">Galería</a>
                <a href="#precios" className="text-gray-700 hover:text-primary-600">Precios</a>
                <div className="flex flex-col space-y-2 pt-4 border-t">
                  <button
                    onClick={() => router.push('/login')}
                    className="px-4 py-2 text-primary-600 border border-primary-600 rounded-lg"
                  >
                    Iniciar Sesión
                  </button>
                  <button
                    onClick={() => router.push('/register')}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg"
                  >
                    Registrarse
                  </button>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section id="inicio" className="pt-20 bg-gradient-to-br from-gray-900 via-gray-800 to-black relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                Transforma tu
                <span className="text-primary-400"> Gimnasio</span>
              </h1>
              <p className="mt-6 text-xl text-gray-300 leading-relaxed">
                Sistema completo de gestión para gimnasios modernos. 
                Control de asistencias, pagos, usuarios y estadísticas en tiempo real.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => router.push('/register')}
                  className="px-8 py-4 bg-primary-600 text-white rounded-lg text-lg font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center"
                >
                  Comenzar Ahora
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
                <button className="px-8 py-4 border-2 border-white text-white rounded-lg text-lg font-semibold hover:bg-white hover:text-gray-900 transition-colors flex items-center justify-center">
                  <Play className="mr-2 h-5 w-5" />
                  Ver Demo
                </button>
              </div>
            </div>
            
            {/* Hero Image */}
            <div className="relative">
              <div className="rounded-2xl overflow-hidden h-96 lg:h-[500px]">
                <img 
                  src="https://i.postimg.cc/qBcNNLCt/hero-gym.jpg" 
                  alt="Gimnasio moderno con equipamiento profesional"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback si la imagen no existe
                    e.currentTarget.style.display = 'none';
                    const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                    if (nextElement) {
                      nextElement.style.display = 'flex';
                    }
                  }}
                />
                <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl h-96 lg:h-[500px] flex items-center justify-center" style={{display: 'none'}}>
                  <div className="text-center text-white">
                    <Dumbbell className="h-24 w-24 mx-auto mb-4 opacity-80" />
                    <p className="text-xl font-semibold">Imagen del Gimnasio</p>
                    <p className="text-sm opacity-75">Equipamiento moderno y espacios amplios</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="caracteristicas" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Características Principales
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Todo lo que necesitas para gestionar tu gimnasio de manera profesional y eficiente
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center mb-6">
                <Clock className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Control de Asistencia
              </h3>
              <p className="text-gray-600">
                Sistema de códigos de 4 dígitos que expiran en 30 segundos para máxima seguridad
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-success-100 rounded-lg flex items-center justify-center mb-6">
                <Users className="h-8 w-8 text-success-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Gestión de Usuarios
              </h3>
              <p className="text-gray-600">
                Administra deportistas, roles y estados de activación con facilidad
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-warning-100 rounded-lg flex items-center justify-center mb-6">
                <CreditCard className="h-8 w-8 text-warning-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Control de Pagos
              </h3>
              <p className="text-gray-600">
                Registra pagos en efectivo y transferencias con seguimiento completo
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-secondary-100 rounded-lg flex items-center justify-center mb-6">
                <BarChart3 className="h-8 w-8 text-secondary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Reportes y Estadísticas
              </h3>
              <p className="text-gray-600">
                Dashboard completo con métricas y estadísticas en tiempo real
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="galeria" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Nuestras Instalaciones
            </h2>
            <p className="text-xl text-gray-600">
              Espacios modernos y equipamiento de última generación
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Galería de imágenes del gimnasio */}
            <div className="relative rounded-xl overflow-hidden h-64 group cursor-pointer">
              <img 
                src="https://i.postimg.cc/667NS5BJ/gym-weights.jpg" 
                alt="Área de pesas con equipamiento profesional"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                  if (nextElement) {
                    nextElement.style.display = 'flex';
                  }
                }}
              />
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl h-64 flex items-center justify-center absolute inset-0" style={{display: 'none'}}>
                <div className="text-center text-white">
                  <Dumbbell className="h-12 w-12 mx-auto mb-2 opacity-80" />
                  <p className="font-semibold">Área de Pesas</p>
                </div>
              </div>
            </div>
            
            <div className="relative rounded-xl overflow-hidden h-64 group cursor-pointer">
              <img 
                src="https://i.postimg.cc/rm15FLkf/gym-clases.jpg" 
                alt="Clases grupales en el gimnasio"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                  if (nextElement) {
                    nextElement.style.display = 'flex';
                  }
                }}
              />
              <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl h-64 flex items-center justify-center absolute inset-0" style={{display: 'none'}}>
                <div className="text-center text-white">
                  <Users className="h-12 w-12 mx-auto mb-2 opacity-80" />
                  <p className="font-semibold">Clases Grupales</p>
                </div>
              </div>
            </div>
            
            <div className="relative rounded-xl overflow-hidden h-64 group cursor-pointer">
              <img 
                src="https://i.postimg.cc/d0BqqWfk/gym-cardio.jpg" 
                alt="Área de cardio con bicicletas y equipamiento"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                  if (nextElement) {
                    nextElement.style.display = 'flex';
                  }
                }}
              />
              <div className="bg-gradient-to-br from-success-600 to-success-800 rounded-xl h-64 flex items-center justify-center absolute inset-0" style={{display: 'none'}}>
                <div className="text-center text-white">
                  <Play className="h-12 w-12 mx-auto mb-2 opacity-80" />
                  <p className="font-semibold">Cardio</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="precios" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Planes de Membresía
            </h2>
            <p className="text-xl text-gray-600">
              Elige el plan que mejor se adapte a tus necesidades
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Plan Básico */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Básico</h3>
                <p className="text-gray-600 mb-6">2 veces por semana</p>
                <div className="mb-8">
                  <span className="text-4xl font-bold text-gray-900">$20.000</span>
                  <span className="text-gray-600">/mes</span>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-success-600 mr-3" />
                    <span>Acceso 2 días por semana</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-success-600 mr-3" />
                    <span>Equipamiento completo</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-success-600 mr-3" />
                    <span>App móvil incluida</span>
                  </li>
                </ul>
                <button
                  onClick={() => router.push('/register')}
                  className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold"
                >
                  Elegir Plan
                </button>
              </div>
            </div>

            {/* Plan Intermedio */}
            <div className="bg-white p-8 rounded-2xl shadow-xl border-2 border-primary-600 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Más Popular
                </span>
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Intermedio</h3>
                <p className="text-gray-600 mb-6">3 veces por semana</p>
                <div className="mb-8">
                  <span className="text-4xl font-bold text-gray-900">$25.000</span>
                  <span className="text-gray-600">/mes</span>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-success-600 mr-3" />
                    <span>Acceso 3 días por semana</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-success-600 mr-3" />
                    <span>Equipamiento completo</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-success-600 mr-3" />
                    <span>App móvil incluida</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-success-600 mr-3" />
                    <span>Clases grupales incluidas</span>
                  </li>
                </ul>
                <button
                  onClick={() => router.push('/register')}
                  className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold"
                >
                  Elegir Plan
                </button>
              </div>
            </div>

            {/* Plan Premium */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Premium</h3>
                <p className="text-gray-600 mb-6">Todos los días</p>
                <div className="mb-8">
                  <span className="text-4xl font-bold text-gray-900">$30.000</span>
                  <span className="text-gray-600">/mes</span>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-success-600 mr-3" />
                    <span>Acceso ilimitado</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-success-600 mr-3" />
                    <span>Equipamiento premium</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-success-600 mr-3" />
                    <span>App móvil incluida</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-success-600 mr-3" />
                    <span>Todas las clases incluidas</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-success-600 mr-3" />
                    <span>Asesoramiento personalizado</span>
                  </li>
                </ul>
                <button
                  onClick={() => router.push('/register')}
                  className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold"
                >
                  Elegir Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            ¿Listo para comenzar?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Únete a nuestra comunidad y transforma tu experiencia fitness
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push('/register')}
              className="px-8 py-4 bg-white text-primary-600 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Crear Cuenta Gratis
            </button>
            <button
              onClick={() => router.push('/login')}
              className="px-8 py-4 border-2 border-white text-white rounded-lg text-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors"
            >
              Ya tengo cuenta
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Logo y descripción */}
            <div className="md:col-span-2">
              <div className="flex items-center mb-4">
                <Dumbbell className="h-8 w-8 text-primary-400" />
                <h3 className="ml-2 text-xl font-bold">Gimnasio Pro</h3>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                Sistema completo de gestión para gimnasios modernos. 
                Control de asistencias, pagos y usuarios en tiempo real.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                  <Facebook className="h-6 w-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                  <Instagram className="h-6 w-6" />
                </a>
              </div>
            </div>

            {/* Enlaces rápidos */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Enlaces Rápidos</h4>
              <ul className="space-y-2">
                <li><a href="#inicio" className="text-gray-400 hover:text-white transition-colors">Inicio</a></li>
                <li><a href="#caracteristicas" className="text-gray-400 hover:text-white transition-colors">Características</a></li>
                <li><a href="#galeria" className="text-gray-400 hover:text-white transition-colors">Galería</a></li>
                <li><a href="#precios" className="text-gray-400 hover:text-white transition-colors">Precios</a></li>
              </ul>
            </div>

            {/* Contacto */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Contacto</h4>
              <ul className="space-y-2">
                <li className="flex items-center text-gray-400">
                  <Phone className="h-4 w-4 mr-2" />
                  <span>+54 11 1234-5678</span>
                </li>
                <li className="flex items-center text-gray-400">
                  <Mail className="h-4 w-4 mr-2" />
                  <span>info@gimnasio.com</span>
                </li>
                <li className="flex items-center text-gray-400">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>Buenos Aires, Argentina</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              &copy; 2025 Gimnasio Pro. Desarrollado por{" "}
              <span className="text-primary-400 font-semibold">boton creativo</span>.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}