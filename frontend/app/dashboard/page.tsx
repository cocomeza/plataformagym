'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import ProtectedRoute from '@/components/ProtectedRoute';
import { supabaseUtils, SupabaseAttendance, SupabasePayment, SupabaseNotification } from '@/lib/supabase-utils';
import toast from 'react-hot-toast';
import { 
  Dumbbell, 
  QrCode, 
  Calendar, 
  CreditCard, 
  LogOut, 
  CheckCircle,
  Clock,
  AlertCircle,
  Bell
} from 'lucide-react';

export default function DashboardPage() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [attendance, setAttendance] = useState<SupabaseAttendance[]>([]);
  const [payments, setPayments] = useState<SupabasePayment[]>([]);
  const [notifications, setNotifications] = useState<SupabaseNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [attendanceCode, setAttendanceCode] = useState('');

  useEffect(() => {

    loadData();
  }, [user, router]);

  const loadData = async () => {
    if (!user) return;
    
    try {
      console.log('📊 Cargando datos del usuario desde Supabase...');
      
      // Cargar asistencias del usuario
      const attendanceData = await supabaseUtils.getUserAttendances(user.id);
      setAttendance(attendanceData || []);
      console.log('✅ Asistencias cargadas:', attendanceData);

      // Cargar pagos (filtrar por usuario en el cliente por ahora)
      const allPayments = await supabaseUtils.getAllPayments();
      const userPayments = allPayments.filter(p => p.userId === user.id);
      setPayments(userPayments || []);
      console.log('✅ Pagos cargados:', userPayments);

      // Cargar notificaciones del usuario
      const notificationsData = await supabaseUtils.getUserNotifications(user.id);
      setNotifications(notificationsData || []);
      console.log('✅ Notificaciones cargadas:', notificationsData);

    } catch (error) {
      console.error('❌ Error cargando datos:', error);
      // Fallback: mostrar mensaje pero no romper la app
      toast.error('Error cargando datos. Verifica la conexión.');
    } finally {
      setLoading(false);
    }
  };


  const markAttendance = async () => {
    if (!user) return;
    
    const code = prompt('Ingresa el código de asistencia de 4 dígitos:');
    
    if (code && code.length === 4 && /^\d{4}$/.test(code)) {
      try {
        // Verificar si ya asistió hoy
        const hasAttended = await supabaseUtils.hasUserAttendedToday(user.id);
        if (hasAttended) {
          alert('Ya marcaste asistencia hoy');
          return;
        }

        // Registrar asistencia en Supabase
        const success = await supabaseUtils.addAttendance({
          userId: user.id,
          userName: user.nombre,
          metodo: 'Código',
          fecha_hora: new Date().toISOString(),
          codigo_usado: code
        });
        
        if (success) {
          alert('✅ ¡Asistencia marcada correctamente!');
          loadData(); // Recargar datos
        } else {
          alert('❌ Error al marcar asistencia');
        }
      } catch (error) {
        console.error('❌ Error validando código:', error);
        alert('Error de conexión');
      }
    } else if (code) {
      alert('Por favor ingresa un código válido de 4 dígitos');
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const success = await supabaseUtils.markNotificationAsRead(notificationId);
      
      if (success) {
        // Actualizar el estado local
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId ? { ...notif, leida: true } : notif
          )
        );
      }
    } catch (error) {
      console.error('❌ Error marcando notificación como leída:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.leida).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  const todayAttendance = attendance.find(a => 
    new Date(a.fecha_hora).toDateString() === new Date().toDateString()
  );

  const lastPayment = payments[0];
  const isPaymentUpToDate = lastPayment && 
    lastPayment.estado === 'pagado' && 
    new Date(lastPayment.fecha) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  return (
    <ProtectedRoute requiredRole="deportista">
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Dumbbell className="h-8 w-8 text-primary-600" />
              <h1 className="ml-2 text-2xl font-bold text-gray-900">
                Mi Gimnasio
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Hola, {user?.nombre}
              </span>
              
              {/* Notificaciones */}
              <div className="relative">
                <button className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none">
                  <Bell className="h-6 w-6" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </div>

              <button
                onClick={signOut}
                className="btn btn-secondary btn-sm"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="card-content">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {todayAttendance ? (
                    <CheckCircle className="h-8 w-8 text-success-600" />
                  ) : (
                    <Clock className="h-8 w-8 text-warning-600" />
                  )}
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Asistencia Hoy
                  </h3>
                  <p className="text-sm text-gray-600">
                    {todayAttendance ? 'Ya marcaste asistencia' : 'Pendiente'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-content">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {isPaymentUpToDate ? (
                    <CheckCircle className="h-8 w-8 text-success-600" />
                  ) : (
                    <AlertCircle className="h-8 w-8 text-danger-600" />
                  )}
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Estado de Pago
                  </h3>
                  <p className="text-sm text-gray-600">
                    {isPaymentUpToDate ? 'Al día' : 'Pendiente de pago'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-content">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Calendar className="h-8 w-8 text-primary-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Asistencias del Mes
                  </h3>
                  <p className="text-sm text-gray-600">
                    {attendance.length} días
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Code Section */}
        <div className="grid grid-cols-1 gap-8 mb-8">
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">
                🔢 Marcar Asistencia
              </h3>
              <p className="text-sm text-gray-600">
                Ingresa el código de 4 dígitos que te proporciona el administrador
              </p>
            </div>
            <div className="card-content">
              <div className="text-center">
                <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">🔢</span>
                </div>
                <button
                  onClick={markAttendance}
                  className="btn btn-success btn-lg"
                >
                  🔢 Marcar Asistencia
                </button>
                <p className="text-sm text-gray-500 mt-4">
                  Pide el código de 4 dígitos al recepcionista o administrador del gimnasio
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Notificaciones */}
        {notifications.length > 0 && (
          <div className="card mb-8">
            <div className="card-header">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  🔔 Notificaciones
                </h3>
                <span className="text-sm text-gray-500">
                  {unreadCount} sin leer
                </span>
              </div>
            </div>
            <div className="card-content">
              <div className="space-y-3">
                {notifications.slice(0, 3).map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`p-4 rounded-lg border-l-4 ${
                      notification.tipo === 'error' ? 'border-red-500 bg-red-50' :
                      notification.tipo === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                      notification.tipo === 'success' ? 'border-green-500 bg-green-50' :
                      'border-blue-500 bg-blue-50'
                    } ${!notification.leida ? 'font-medium' : 'opacity-75'}`}
                    onClick={() => !notification.leida && markNotificationAsRead(notification.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">
                          {notification.titulo}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.mensaje}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(notification.fecha).toLocaleString('es-AR')}
                        </p>
                      </div>
                      {!notification.leida && (
                        <div className="w-2 h-2 bg-red-500 rounded-full ml-2"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {notifications.length > 3 && (
                <div className="mt-4 text-center">
                  <button className="text-sm text-primary-600 hover:text-primary-700">
                    Ver todas las notificaciones ({notifications.length})
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">
                Asistencias Recientes
              </h3>
            </div>
            <div className="card-content">
              {attendance.length > 0 ? (
                <div className="space-y-3">
                  {attendance.slice(0, 5).map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(item.fecha_hora).toLocaleDateString('es-AR')}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(item.fecha_hora).toLocaleTimeString('es-AR')} - {item.metodo.toUpperCase()}
                        </p>
                      </div>
                      <CheckCircle className="h-5 w-5 text-success-600" />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No hay asistencias registradas
                </p>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">
                Historial de Pagos
              </h3>
            </div>
            <div className="card-content">
              {payments.length > 0 ? (
                <div className="space-y-3">
                  {payments.slice(0, 5).map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          ${payment.monto} - {payment.metodo}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(payment.fecha).toLocaleDateString('es-AR')}
                        </p>
                      </div>
                      <span className={`badge ${
                        payment.estado === 'pagado' ? 'badge-success' : 'badge-warning'
                      }`}>
                        {payment.estado}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No hay pagos registrados
                </p>
              )}
            </div>
          </div>
        </div>
      </main>

      </div>
    </ProtectedRoute>
  );
}
