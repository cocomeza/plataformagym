'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import ProtectedRoute from '@/components/ProtectedRoute';
import { supabaseUtils, SupabaseUser, SupabasePayment, SupabaseAttendance, SupabaseNotification } from '@/lib/supabase-utils';
import toast from 'react-hot-toast';
import { 
  Dumbbell, 
  Users, 
  CreditCard, 
  BarChart3, 
  ClipboardCheck,
  LogOut,
  Plus,
  Search,
  Filter,
  Download,
  Activity,
  ShieldCheck,
  UserX,
  UserCheck
} from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  totalAttendance: number;
  totalPayments: number;
  pendingPayments: number;
}

// Tipos se importan desde supabase-utils

export default function AdminDashboard() {
  // Admin panel with full-stack functionality and local fallback
  // Updated: 2025-01-06 21:20:00 - Force Netlify cache update
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalAttendance: 0,
    totalPayments: 0,
    pendingPayments: 0
  });
  const [users, setUsers] = useState<SupabaseUser[]>([]);
  const [attendance, setAttendance] = useState<SupabaseAttendance[]>([]);
  const [payments, setPayments] = useState<SupabasePayment[]>([]);
  const [notifications, setNotifications] = useState<SupabaseNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [attendanceCode, setAttendanceCode] = useState<string | null>(null);
  const [codeExpiry, setCodeExpiry] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showNotificationForm, setShowNotificationForm] = useState(false);
  const [notificationForm, setNotificationForm] = useState({
    type: 'gym_announcement',
    title: '',
    message: '',
    priority: 'medium'
  });
  const [showUserForm, setShowUserForm] = useState(false);
  const [userForm, setUserForm] = useState<{
    nombre: string;
    email: string;
    telefono: string;
    rol: 'admin' | 'deportista';
  }>({
    nombre: '',
    email: '',
    telefono: '',
    rol: 'deportista'
  });
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    userId: '',
    monto: '',
    metodo: 'efectivo',
    concepto: ''
  });

  useEffect(() => {
    loadAdminData();
  }, [user, router]);

  // Debug: monitorear cambios en attendanceCode
  useEffect(() => {
    console.log('📊 Estado del código:', { attendanceCode, codeExpiry });
  }, [attendanceCode, codeExpiry]);

  const loadAdminData = async () => {
    try {
      console.log('📊 Cargando datos desde Supabase...');
      
      // Cargar usuarios desde Supabase
      const usersData = await supabaseUtils.getAllUsers();
      setUsers(usersData || []);
      console.log('✅ Usuarios cargados desde Supabase:', usersData);

      // Cargar asistencias desde Supabase
      const attendanceData = await supabaseUtils.getAllAttendances();
      setAttendance(attendanceData || []);
      console.log('✅ Asistencias cargadas desde Supabase:', attendanceData);

      // Cargar pagos desde Supabase
      const paymentsData = await supabaseUtils.getAllPayments();
      setPayments(paymentsData || []);
      console.log('✅ Pagos cargados desde Supabase:', paymentsData);

      // Cargar notificaciones desde Supabase
      const notificationsData = await supabaseUtils.getAllNotifications();
      setNotifications(notificationsData || []);
      console.log('✅ Notificaciones cargadas desde Supabase:', notificationsData);

      // Actualizar estadísticas
      setStats({
        totalUsers: usersData.length,
        totalAttendance: attendanceData.length,
        totalPayments: paymentsData.length,
        pendingPayments: paymentsData.filter(p => p.estado === 'Pendiente').length
      });

    } catch (error) {
      console.error('❌ Error cargando datos desde Supabase:', error);
      // Fallback: mostrar mensaje de error pero no romper la app
      toast.error('Error cargando datos. Verifica la conexión con Supabase.');
    } finally {
      setLoading(false);
    }
  };

  const generateAttendanceCode = async () => {
    console.log('🔄 Generando código de asistencia...');
    try {
      // Generar código de 4 dígitos
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      const expiresAt = Date.now() + (5 * 60 * 1000); // Expira en 5 minutos
      
      setAttendanceCode(code);
      setCodeExpiry(expiresAt);
      
      // Auto-hide code after expiry
      setTimeout(() => {
        setAttendanceCode(null);
        setCodeExpiry(null);
        console.log('⏰ Código expirado');
      }, 5 * 60 * 1000);
      
      console.log('✅ Código de asistencia generado:', code);
    } catch (error) {
      console.error('❌ Error generando código:', error);
      alert('Error al generar código de asistencia');
    }
  };

  const markAttendance = async (userId: string) => {
    try {
      // Verificar que el usuario existe
      const user = users.find(u => u.id === userId);
      if (!user) {
        alert('Usuario no encontrado');
        return;
      }

      // Verificar si ya asistió hoy
      const hasAttended = await supabaseUtils.hasUserAttendedToday(userId);
      if (hasAttended) {
        alert('El usuario ya asistió hoy');
        return;
      }

      // Registrar asistencia en Supabase
      const success = await supabaseUtils.addAttendance({
        userId: userId,
        userName: user.nombre,
        metodo: 'Manual',
        fecha_hora: new Date().toISOString(),
        codigo_usado: 'Manual'
      });

      if (success) {
        alert('✅ Asistencia marcada correctamente');
        loadAdminData(); // Recargar datos
      } else {
        alert('❌ Error al marcar asistencia');
      }
      
    } catch (error) {
      console.error('❌ Error marcando asistencia:', error);
      alert('Error al marcar asistencia');
    }
  };

  const toggleUserStatus = async (userId: string, userName: string, isActive: boolean) => {
    const action = isActive ? 'desactivar' : 'reactivar';
    const confirmMessage = isActive 
      ? `¿Estás seguro de que quieres desactivar a ${userName}?\n\nEsto impedirá que pueda acceder al gimnasio.`
      : `¿Estás seguro de que quieres reactivar a ${userName}?\n\nEsto permitirá que vuelva a acceder al gimnasio.`;
    
    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      // Actualizar estado en Supabase
      const success = await supabaseUtils.updateUserStatus(userId, !isActive);
      
      if (success) {
        alert(`✅ Usuario ${action}do correctamente`);
        loadAdminData(); // Recargar datos
      } else {
        alert(`❌ Error al ${action} usuario`);
      }
    } catch (error) {
      console.error('❌ Error actualizando usuario:', error);
      alert(`Error al ${action} usuario`);
    }
  };

  const createNotification = async () => {
    if (!notificationForm.title || !notificationForm.message) {
      alert('Por favor completa todos los campos');
      return;
    }

    try {
      // Crear notificación en Supabase
      const success = await supabaseUtils.addNotification({
        titulo: notificationForm.title,
        mensaje: notificationForm.message,
        tipo: 'info',
        fecha: new Date().toISOString(),
        leida: false
      });
      
      if (success) {
        alert('✅ Notificación creada correctamente');
        setShowNotificationForm(false);
        setNotificationForm({
          type: 'gym_announcement',
          title: '',
          message: '',
          priority: 'medium'
        });
        loadAdminData(); // Recargar datos
      } else {
        alert('❌ Error al crear notificación');
      }
    } catch (error) {
      console.error('❌ Error creando notificación:', error);
      alert('Error al crear notificación');
    }
  };

  const createUser = async () => {
    if (!userForm.nombre || !userForm.email || !userForm.telefono) {
      alert('Por favor completa todos los campos');
      return;
    }

    try {
      console.log('🔄 Creando usuario en Supabase...', {
        nombre: userForm.nombre,
        email: userForm.email,
        telefono: userForm.telefono,
        rol: userForm.rol
      });

      // Solo intentar agregar usuario a Supabase
      const success = await supabaseUtils.addUser({
        nombre: userForm.nombre,
        email: userForm.email,
        telefono: userForm.telefono,
        rol: userForm.rol,
        activo: true
      });
      
      if (success) {
        console.log('✅ Usuario creado correctamente en Supabase');
        alert('Usuario creado correctamente en Supabase');
        setShowUserForm(false);
        setUserForm({
          nombre: '',
          email: '',
          telefono: '',
          rol: 'deportista'
        });
        loadAdminData(); // Recargar datos para mostrar el nuevo usuario
      } else {
        console.error('❌ Error creando usuario en Supabase');
        alert('Error: No se pudo crear el usuario. Verifica la conexión con Supabase.');
      }
    } catch (error) {
      console.error('❌ Error creando usuario:', error);
      alert('Error de conexión con Supabase');
    }
  };

  const registerPayment = async () => {
    if (!paymentForm.userId || !paymentForm.monto || !paymentForm.concepto) {
      alert('Por favor completa todos los campos');
      return;
    }

    try {
      // Agregar pago a Supabase
      const success = await supabaseUtils.addPayment({
        userId: paymentForm.userId,
        userName: users.find(u => u.id === paymentForm.userId)?.nombre || 'Usuario',
        monto: parseFloat(paymentForm.monto),
        metodo: paymentForm.metodo,
        concepto: paymentForm.concepto,
        estado: 'Completado',
        fecha: new Date().toISOString(),
        registrado_por: user?.nombre || 'Admin'
      });
      
      if (success) {
        alert('✅ Pago registrado correctamente');
        setShowPaymentForm(false);
        setPaymentForm({
          userId: '',
          monto: '',
          metodo: 'efectivo',
          concepto: ''
        });
        loadAdminData(); // Recargar datos
      } else {
        alert('❌ Error al registrar el pago');
      }
    } catch (error) {
      console.error('❌ Error registrando pago:', error);
      alert('Error al registrar pago');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando panel de administración...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Dumbbell className="h-8 w-8 text-primary-600" />
                  <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">Bienvenido, {user?.nombre}</span>
                <button
                  onClick={signOut}
                  className="btn btn-outline btn-sm flex items-center space-x-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Navigation Tabs */}
          <div className="mb-8">
            <nav className="flex space-x-8">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
                { id: 'users', label: 'Usuarios', icon: Users },
                { id: 'attendance', label: 'Asistencias', icon: ClipboardCheck },
                { id: 'payments', label: 'Pagos', icon: CreditCard },
                { id: 'notifications', label: 'Notificaciones', icon: Activity }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-3 py-2 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Users className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Total Usuarios</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <ClipboardCheck className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Asistencias Hoy</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.totalAttendance}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <CreditCard className="h-8 w-8 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Total Pagos</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.totalPayments}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Activity className="h-8 w-8 text-red-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Pagos Pendientes</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.pendingPayments}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Generate Attendance Code */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Generar Código de Asistencia</h3>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={generateAttendanceCode}
                    className="btn btn-primary"
                  >
                    Generar Código
                  </button>
                  {attendanceCode && (
                    <div className="flex items-center space-x-4 bg-green-50 p-4 rounded-lg border border-green-200">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Código:</span>
                        <span className="text-3xl font-bold text-green-600 bg-white px-4 py-2 rounded border-2 border-green-300">
                          {attendanceCode}
                        </span>
                      </div>
                      {codeExpiry && (
                        <div className="flex items-center space-x-1">
                          <span className="text-sm text-orange-600 font-medium">
                            ⚠️ Expira en {Math.ceil((codeExpiry - Date.now()) / 1000)} segundos
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h2>
                <button
                  onClick={() => setShowUserForm(true)}
                  className="btn btn-primary flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Nuevo Usuario</span>
                </button>
              </div>

              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead className="table-header">
                      <tr className="table-row">
                        <th className="table-head">Nombre</th>
                        <th className="table-head">Email</th>
                        <th className="table-head">Rol</th>
                        <th className="table-head">Asistencias</th>
                        <th className="table-head">Estado Pago</th>
                        <th className="table-head">Estado</th>
                        <th className="table-head">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="table-body">
                      {users.map((user) => (
                        <tr key={user.id} className="table-row">
                          <td className="table-cell">{user.nombre}</td>
                          <td className="table-cell">{user.email}</td>
                          <td className="table-cell">
                            <span className={`badge ${
                              user.rol === 'admin' ? 'badge-warning' : 'badge-secondary'
                            }`}>
                              {user.rol}
                            </span>
                          </td>
                          <td className="table-cell">
                            {attendance.filter(a => a.userId === user.id).length}
                          </td>
                          <td className="table-cell">
                            <span className="badge badge-info">
                              {payments.filter(p => p.userId === user.id).length} pagos
                            </span>
                          </td>
                          <td className="table-cell">
                            <span className={`badge ${
                              user.activo ? 'badge-success' : 'badge-danger'
                            }`}>
                              {user.activo ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td className="table-cell">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => markAttendance(user.id)}
                                className="btn btn-success btn-sm"
                                title="Marcar Asistencia"
                              >
                                <ClipboardCheck className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => toggleUserStatus(user.id, user.nombre, user.activo)}
                                className={`btn btn-sm ${
                                  user.activo ? 'btn-danger' : 'btn-success'
                                }`}
                                title={user.activo ? 'Desactivar usuario' : 'Reactivar usuario'}
                              >
                                {user.activo ? (
                                  <UserX className="h-4 w-4" />
                                ) : (
                                  <UserCheck className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Attendance Tab */}
          {activeTab === 'attendance' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Asistencias del Día</h2>
                <div className="flex space-x-2">
                  <button className="btn btn-outline btn-sm flex items-center space-x-2">
                    <Filter className="h-4 w-4" />
                    <span>Filtrar</span>
                  </button>
                  <button className="btn btn-outline btn-sm flex items-center space-x-2">
                    <Download className="h-4 w-4" />
                    <span>Exportar</span>
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead className="table-header">
                      <tr className="table-row">
                        <th className="table-head">Usuario</th>
                        <th className="table-head">Fecha</th>
                        <th className="table-head">Hora</th>
                        <th className="table-head">Método</th>
                      </tr>
                    </thead>
                    <tbody className="table-body">
                      {attendance.map((record) => (
                        <tr key={record.id} className="table-row">
                          <td className="table-cell">{record.userName}</td>
                          <td className="table-cell">
                            {new Date(record.fecha_hora).toLocaleDateString()}
                          </td>
                          <td className="table-cell">
                            {new Date(record.fecha_hora).toLocaleTimeString()}
                          </td>
                          <td className="table-cell">
                            <span className={`badge ${
                              record.metodo === 'Código' ? 'badge-success' : 'badge-info'
                            }`}>
                              {record.metodo}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Payments Tab */}
          {activeTab === 'payments' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Gestión de Pagos</h2>
                <button
                  onClick={() => setShowPaymentForm(true)}
                  className="btn btn-primary flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Registrar Pago</span>
                </button>
              </div>

              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead className="table-header">
                      <tr className="table-row">
                        <th className="table-head">Usuario</th>
                        <th className="table-head">Monto</th>
                        <th className="table-head">Método</th>
                        <th className="table-head">Concepto</th>
                        <th className="table-head">Fecha</th>
                        <th className="table-head">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="table-body">
                      {payments.map((payment) => (
                        <tr key={payment.id} className="table-row">
                          <td className="table-cell">{payment.userName || 'Usuario'}</td>
                          <td className="table-cell">${payment.monto}</td>
                          <td className="table-cell">{payment.metodo}</td>
                          <td className="table-cell">{payment.concepto}</td>
                          <td className="table-cell">
                            {new Date(payment.fecha).toLocaleDateString()}
                          </td>
                          <td className="table-cell">
                            <span className={`badge ${
                              payment.estado === 'Completado' ? 'badge-success' : 'badge-warning'
                            }`}>
                              {payment.estado}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Notificaciones</h2>
                <button
                  onClick={() => setShowNotificationForm(true)}
                  className="btn btn-primary flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Nueva Notificación</span>
                </button>
              </div>

              {showNotificationForm && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Crear Notificación</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Título
                      </label>
                      <input
                        type="text"
                        value={notificationForm.title}
                        onChange={(e) => setNotificationForm({...notificationForm, title: e.target.value})}
                        className="input"
                        placeholder="Título de la notificación"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mensaje
                      </label>
                      <textarea
                        value={notificationForm.message}
                        onChange={(e) => setNotificationForm({...notificationForm, message: e.target.value})}
                        className="input"
                        rows={3}
                        placeholder="Mensaje de la notificación"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={createNotification}
                        className="btn btn-success btn-md"
                      >
                        Crear Notificación
                      </button>
                      <button 
                        onClick={() => setShowNotificationForm(false)}
                        className="btn btn-secondary btn-md"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>

        {/* Modal Agregar Usuario */}
        {showUserForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Agregar Nuevo Usuario</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    value={userForm.nombre}
                    onChange={(e) => setUserForm({...userForm, nombre: e.target.value})}
                    className="input"
                    placeholder="Nombre completo"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={userForm.email}
                    onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                    className="input"
                    placeholder="email@ejemplo.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={userForm.telefono}
                    onChange={(e) => setUserForm({...userForm, telefono: e.target.value})}
                    className="input"
                    placeholder="+54 11 1234-5678"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rol
                  </label>
                  <select
                    value={userForm.rol}
                    onChange={(e) => setUserForm({...userForm, rol: e.target.value as 'admin' | 'deportista'})}
                    className="input"
                  >
                    <option value="deportista">Deportista</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={createUser}
                    className="btn btn-primary btn-md"
                  >
                    Crear Usuario
                  </button>
                  <button
                    onClick={() => setShowUserForm(false)}
                    className="btn btn-secondary btn-md"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Registrar Pago */}
        {showPaymentForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Registrar Pago</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Usuario
                  </label>
                  <select
                    value={paymentForm.userId}
                    onChange={(e) => setPaymentForm({...paymentForm, userId: e.target.value})}
                    className="input"
                  >
                    <option value="">Seleccionar usuario</option>
                    {users.filter(u => u.rol === 'deportista').map(user => (
                      <option key={user.id} value={user.id}>{user.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Monto
                  </label>
                  <input
                    type="number"
                    value={paymentForm.monto}
                    onChange={(e) => setPaymentForm({...paymentForm, monto: e.target.value})}
                    className="input"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Método de Pago
                  </label>
                  <select
                    value={paymentForm.metodo}
                    onChange={(e) => setPaymentForm({...paymentForm, metodo: e.target.value})}
                    className="input"
                  >
                    <option value="efectivo">Efectivo</option>
                    <option value="transferencia">Transferencia</option>
                    <option value="tarjeta">Tarjeta</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Concepto
                  </label>
                  <input
                    type="text"
                    value={paymentForm.concepto}
                    onChange={(e) => setPaymentForm({...paymentForm, concepto: e.target.value})}
                    className="input"
                    placeholder="Mensualidad, etc."
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={registerPayment}
                    className="btn btn-primary btn-md"
                  >
                    Registrar Pago
                  </button>
                  <button
                    onClick={() => setShowPaymentForm(false)}
                    className="btn btn-secondary btn-md"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
