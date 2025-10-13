'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import ProtectedRoute from '@/components/ProtectedRoute';
import { adminStorage, User as AdminUser } from '@/lib/admin-storage';
import { attendanceStorage, AttendanceRecord } from '@/lib/attendance-storage';
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

interface Attendance {
  id: string;
  userId: string;
  userName: string;
  metodo: string;
  fecha_hora: string;
  codigo_usado?: string;
}

export default function AdminPage() {
  // Admin panel with full-stack functionality and local fallback
  // Updated: 2025-01-06 21:15:00 - Force Netlify cache update
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalAttendance: 0,
    totalPayments: 0,
    pendingPayments: 0
  });
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
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
  const [userForm, setUserForm] = useState({
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

  const loadAdminData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Cargar estadísticas básicas (simuladas por ahora)
      setStats({
        totalUsers: users.length,
        totalAttendance: attendance.length,
        totalPayments: payments.length,
        pendingPayments: 0
      });

      // Cargar usuarios desde el almacenamiento local
      const usersData = adminStorage.users.getAll();
      setUsers(usersData);

      // Cargar asistencias desde el almacenamiento local
      const attendanceData = attendanceStorage.getAllAttendances();
      setAttendance(attendanceData || []);
      console.log('📊 Asistencias cargadas:', attendanceData);

      // Cargar pagos desde el almacenamiento local
      const paymentsData = adminStorage.payments.getAll();
      setPayments(paymentsData || []);
      console.log('💰 Pagos cargados:', paymentsData);

    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAttendanceCode = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://gym-platform-backend.onrender.com/api/attendance/code/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.success) {
        setAttendanceCode(data.code);
        setCodeExpiry(data.expiresAt);
        
        // Auto-hide code after expiry
        setTimeout(() => {
          setAttendanceCode(null);
          setCodeExpiry(null);
        }, data.expiresIn * 60 * 1000);
      } else {
        console.error('Error del backend:', data.error);
        // Fallback: generar código localmente si el backend falla
        const code = Math.floor(1000 + Math.random() * 9000).toString();
        const expiresAt = Date.now() + (30 * 1000);
        setAttendanceCode(code);
        setCodeExpiry(expiresAt);
        setTimeout(() => {
          setAttendanceCode(null);
          setCodeExpiry(null);
        }, 30000);
        console.log('🔢 Código generado localmente:', code);
      }
    } catch (error) {
      console.error('Error generando código:', error);
      // Fallback: generar código localmente si hay error de conexión
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      const expiresAt = Date.now() + (30 * 1000);
      setAttendanceCode(code);
      setCodeExpiry(expiresAt);
      setTimeout(() => {
        setAttendanceCode(null);
        setCodeExpiry(null);
      }, 30000);
      console.log('🔢 Código generado localmente (fallback):', code);
    }
  };

  const markAttendance = async (userId: string) => {
    try {
      // Marcar asistencia localmente
      const user = adminStorage.users.getById(userId);
      if (!user) {
        alert('Usuario no encontrado');
        return;
      }

      if (attendanceStorage.hasUserAttendedToday(userId)) {
        alert('El usuario ya asistió hoy');
        return;
      }

      const attendanceRecord = {
        id: Date.now().toString(),
        userId: userId,
        userName: user.nombre,
        metodo: 'Manual',
        fecha_hora: new Date().toISOString(),
        codigo_usado: 'Manual',
        created_at: new Date().toISOString() // Required by AttendanceRecord interface
      };

      attendanceStorage.addAttendance(attendanceRecord);
      
      alert('Asistencia marcada correctamente');
      loadAdminData(); // Recargar datos
      
    } catch (error) {
      console.error('Error marcando asistencia:', error);
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
      const token = localStorage.getItem('token');
      const method = isActive ? 'POST' : 'PUT';
      
      const response = await fetch('https://gym-platform-backend.onrender.com/api/admin/users/deactivate', {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();
      
      if (data.success) {
        alert(`Usuario ${action}do correctamente`);
        loadAdminData(); // Recargar datos
      } else {
        alert(data.error || `Error al ${action} usuario`);
      }
    } catch (error) {
      console.error(`Error ${action}do usuario:`, error);
      alert('Error de conexión');
    }
  };

  const createNotification = async () => {
    if (!notificationForm.title || !notificationForm.message) {
      alert('Por favor completa todos los campos');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://gym-platform-backend.onrender.com/api/notifications', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationForm),
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Notificación creada correctamente');
        setNotificationForm({
          type: 'gym_announcement',
          title: '',
          message: '',
          priority: 'medium'
        });
        setShowNotificationForm(false);
      } else {
        alert(data.error || 'Error al crear notificación');
      }
    } catch (error) {
      console.error('Error creando notificación:', error);
      alert('Error de conexión');
    }
  };

  const createUser = async () => {
    if (!userForm.nombre || !userForm.email || !userForm.telefono) {
      alert('Por favor completa todos los campos');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://gym-platform-backend.onrender.com/api/admin/users/add', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userForm),
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Usuario creado correctamente');
        setUserForm({
          nombre: '',
          email: '',
          telefono: '',
          rol: 'deportista'
        });
        setShowUserForm(false);
        loadAdminData(); // Recargar datos
      } else {
        alert(data.error || 'Error al crear usuario');
      }
    } catch (error) {
      console.error('Error creando usuario:', error);
      alert('Error de conexión');
    }
  };

  const registerPayment = async () => {
    if (!paymentForm.userId || !paymentForm.monto || !paymentForm.concepto) {
      alert('Por favor completa todos los campos');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://gym-platform-backend.onrender.com/api/admin/payments/add', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentForm),
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Pago registrado correctamente');
        setPaymentForm({
          userId: '',
          monto: '',
          metodo: 'efectivo',
          concepto: ''
        });
        setShowPaymentForm(false);
        loadAdminData(); // Recargar datos
      } else {
        alert(data.error || 'Error al registrar pago');
      }
    } catch (error) {
      console.error('Error registrando pago:', error);
      alert('Error de conexión');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-orange-600 to-red-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="bg-white/10 p-2 rounded-lg">
                <Dumbbell className="h-8 w-8 text-white" />
              </div>
              <div className="ml-3">
                <h1 className="text-2xl font-bold text-white">
                  POWER GYM ADMIN
                </h1>
                <p className="text-orange-200 text-sm">Panel de Administración</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-white/90">
                <span className="text-sm font-medium">¡Hola!</span>
                <span className="block text-lg font-bold">{user?.nombre}</span>
              </div>
              <button
                onClick={signOut}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors border border-white/30"
              >
                <LogOut className="h-4 w-4 mr-2 inline" />
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-t-xl border-b border-gray-200 mb-8 shadow-sm">
          <nav className="flex">
            {[
              { id: 'dashboard', name: 'Dashboard', icon: BarChart3, color: 'blue' },
              { id: 'users', name: 'Usuarios', icon: Users, color: 'green' },
              { id: 'attendance', name: 'Asistencias', icon: ClipboardCheck, color: 'purple' },
              { id: 'notifications', name: 'Notificaciones', icon: ShieldCheck, color: 'indigo' },
              { id: 'payments', name: 'Pagos', icon: CreditCard, color: 'orange' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-4 px-6 border-b-2 font-medium text-sm transition-all duration-200 ${
                  activeTab === tab.id
                    ? `border-${tab.color}-500 text-${tab.color}-600 bg-${tab.color}-50`
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <tab.icon className={`h-5 w-5 mr-3 ${activeTab === tab.id ? `text-${tab.color}-500` : 'text-gray-400'}`} />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium opacity-90 mb-1">Total Usuarios</h3>
                    <p className="text-3xl font-bold">{stats.totalUsers}</p>
                    <span className="text-sm opacity-75">Atletas registrados</span>
                  </div>
                  <div className="bg-white/20 rounded-full p-3">
                    <Users className="h-6 w-6" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium opacity-90 mb-1">Asistencias Hoy</h3>
                    <p className="text-3xl font-bold">{stats.totalAttendance}</p>
                    <span className="text-sm opacity-75">Entrenamientos activos</span>
                  </div>
                  <div className="bg-white/20 rounded-full p-3">
                    <Activity className="h-6 w-6" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium opacity-90 mb-1">Pagos del Mes</h3>
                    <p className="text-3xl font-bold">{stats.totalPayments}</p>
                    <span className="text-sm opacity-75">Membresías activas</span>
                  </div>
                  <div className="bg-white/20 rounded-full p-3">
                    <CreditCard className="h-6 w-6" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium opacity-90 mb-1">Pendientes</h3>
                    <p className="text-3xl font-bold">{stats.pendingPayments}</p>
                    <span className="text-sm opacity-75">Por pagar</span>
                  </div>
                  <div className="bg-white/20 rounded-full p-3">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                </div>
              </div>
            </div>

            {/* Attendance Code Generator */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">
                  🔢 Generar Código de Asistencia
                </h3>
                <p className="text-sm text-gray-600">
                  Genera un código de 4 dígitos que los deportistas pueden ingresar para marcar asistencia
                </p>
              </div>
              <div className="card-content">
                {attendanceCode ? (
                  <div className="text-center">
                    <div className="mb-6">
                      <div className="inline-block bg-primary-100 rounded-2xl p-8 border-4 border-primary-500">
                        <div className="text-6xl font-bold text-primary-700 font-mono">
                          {attendanceCode}
                        </div>
                      </div>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-md mb-4">
                      <p className="text-sm text-yellow-800 font-medium">
                        ⏰ Código válido por {codeExpiry ? Math.ceil((codeExpiry - Date.now()) / 1000) : 0} segundos
                      </p>
                      <p className="text-xs text-yellow-700 mt-1">
                        Los deportistas deben ingresar este código en su dashboard
                      </p>
                    </div>
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(attendanceCode);
                          alert('Código copiado al portapapeles');
                        }}
                        className="btn btn-primary btn-md mr-2"
                      >
                        📋 Copiar Código
                      </button>
                      <button
                        onClick={() => {
                          setAttendanceCode(null);
                          setCodeExpiry(null);
                        }}
                        className="btn btn-secondary btn-md"
                      >
                        ❌ Cerrar Código
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="mb-6">
                      <div className="inline-block bg-gray-100 rounded-2xl p-8">
                        <div className="text-6xl font-bold text-gray-500 font-mono">
                          ----
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Haz clic en el botón para generar un código de asistencia<br/>
                      <span className="text-xs text-orange-600 font-medium">⚠️ El código expira en 30 segundos</span>
                    </p>
                    <button
                      onClick={generateAttendanceCode}
                      className="btn btn-primary btn-lg"
                    >
                      🔢 Generar Código Asistencia
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="card">
            <div className="card-header">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  Gestión de Usuarios
                </h3>
                <button 
                  onClick={() => setShowUserForm(true)}
                  className="btn btn-primary btn-md"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Usuario
                </button>
              </div>
            </div>
            <div className="card-content">
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
                          {attendanceStorage.getUserAttendances(user.id).length}
                        </td>
                        <td className="table-cell">
                          <span className="badge badge-info">
                            {adminStorage.payments.getByUser(user.id).length} pagos
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
                              disabled={!user.activo}
                              title={!user.activo ? 'Usuario inactivo' : 'Marcar asistencia'}
                            >
                              Marcar Asistencia
                            </button>
                            <button
                              onClick={() => toggleUserStatus(user.id, user.nombre, user.activo)}
                              className={`btn btn-sm ${
                                user.activo ? 'btn-danger' : 'btn-success'
                              }`}
                              title={user.activo ? 'Desactivar usuario' : 'Reactivar usuario'}
                            >
                              {user.activo ? (
                                <>
                                  <UserX className="h-4 w-4 mr-1" />
                                  Desactivar
                                </>
                              ) : (
                                <>
                                  <UserCheck className="h-4 w-4 mr-1" />
                                  Reactivar
                                </>
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
          <div className="card">
            <div className="card-header">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  Asistencias del Día
                </h3>
                <div className="flex space-x-2">
                  <button className="btn btn-secondary btn-sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtrar
                  </button>
                  <button className="btn btn-secondary btn-sm">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </button>
                </div>
              </div>
            </div>
            <div className="card-content">
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
                    {attendance.length > 0 ? (
                      attendance.map((item) => (
                        <tr key={item.id} className="table-row">
                          <td className="table-cell">{item.userName}</td>
                          <td className="table-cell">
                            {new Date(item.fecha_hora).toLocaleDateString('es-AR')}
                          </td>
                          <td className="table-cell">
                            {new Date(item.fecha_hora).toLocaleTimeString('es-AR')}
                          </td>
                          <td className="table-cell">
                            <span className={`badge ${
                              item.metodo === 'codigo' ? 'badge-success' : 'badge-warning'
                            }`}>
                              {item.metodo.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr className="table-row">
                        <td colSpan={4} className="table-cell text-center text-gray-500 py-8">
                          No hay asistencias registradas hoy
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div className="card">
              <div className="card-header">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">
                    🔔 Gestión de Notificaciones
                  </h3>
                  <button 
                    onClick={() => setShowNotificationForm(!showNotificationForm)}
                    className="btn btn-primary btn-md"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Notificación
                  </button>
                </div>
              </div>
              
              {showNotificationForm && (
                <div className="card-content border-t">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo de Notificación
                      </label>
                      <select 
                        value={notificationForm.type}
                        onChange={(e) => setNotificationForm({...notificationForm, type: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="gym_announcement">Anuncio del Gimnasio</option>
                        <option value="payment_reminder">Recordatorio de Pago</option>
                        <option value="attendance_reminder">Recordatorio de Asistencia</option>
                        <option value="promotion">Promoción/Oferta</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Título
                      </label>
                      <input 
                        type="text"
                        value={notificationForm.title}
                        onChange={(e) => setNotificationForm({...notificationForm, title: e.target.value})}
                        placeholder="Título de la notificación"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mensaje
                      </label>
                      <textarea 
                        value={notificationForm.message}
                        onChange={(e) => setNotificationForm({...notificationForm, message: e.target.value})}
                        placeholder="Mensaje de la notificación"
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Prioridad
                      </label>
                      <select 
                        value={notificationForm.priority}
                        onChange={(e) => setNotificationForm({...notificationForm, priority: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="low">Baja</option>
                        <option value="medium">Media</option>
                        <option value="high">Alta</option>
                      </select>
                    </div>
                    
                    <div className="flex space-x-3">
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

            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">
                  Notificaciones Enviadas
                </h3>
              </div>
              <div className="card-content">
                <div className="text-center py-8 text-gray-500">
                  <ShieldCheck className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Aquí se mostrarán las notificaciones enviadas</p>
                  <p className="text-sm">Funcionalidad en desarrollo...</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div className="card">
            <div className="card-header">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  Gestión de Pagos
                </h3>
                <button 
                  onClick={() => setShowPaymentForm(true)}
                  className="btn btn-primary btn-md"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Registrar Pago
                </button>
              </div>
            </div>
            <div className="card-content">
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
                    {payments.length > 0 ? (
                      payments.map((payment) => (
                        <tr key={payment.id} className="table-row">
                          <td className="table-cell">
                            {payment.user ? payment.user.nombre : 'Usuario no encontrado'}
                          </td>
                          <td className="table-cell">
                            ${payment.monto.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="table-cell">
                            <span className={`badge ${
                              payment.metodo === 'efectivo' ? 'badge-success' :
                              payment.metodo === 'tarjeta' ? 'badge-primary' :
                              payment.metodo === 'transferencia' ? 'badge-info' : 'badge-warning'
                            }`}>
                              {payment.metodo.toUpperCase()}
                            </span>
                          </td>
                          <td className="table-cell">{payment.concepto}</td>
                          <td className="table-cell">
                            {new Date(payment.fecha).toLocaleDateString('es-AR')}
                          </td>
                          <td className="table-cell">
                            <span className={`badge ${
                              payment.estado === 'pagado' ? 'badge-success' : 'badge-danger'
                            }`}>
                              {payment.estado.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr className="table-row">
                        <td colSpan={6} className="table-cell text-center text-gray-500 py-8">
                          No hay pagos registrados
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Agregar Usuario */}
      {showUserForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Agregar Nuevo Usuario
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  value={userForm.nombre}
                  onChange={(e) => setUserForm({...userForm, nombre: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Juan Pérez"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="juan@ejemplo.com"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+54 11 1234-5678"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rol
                </label>
                <select
                  value={userForm.rol}
                  onChange={(e) => setUserForm({...userForm, rol: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="deportista">Deportista</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowUserForm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
              <button
                onClick={createUser}
                className="btn btn-primary btn-md"
              >
                Crear Usuario
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Registrar Pago */}
      {showPaymentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Registrar Pago
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Usuario
                </label>
                <select
                  value={paymentForm.userId}
                  onChange={(e) => setPaymentForm({...paymentForm, userId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar usuario</option>
                  {users.filter(u => u.rol === 'deportista').map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.nombre}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monto
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={paymentForm.monto}
                  onChange={(e) => setPaymentForm({...paymentForm, monto: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Método de Pago
                </label>
                <select
                  value={paymentForm.metodo}
                  onChange={(e) => setPaymentForm({...paymentForm, metodo: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="cheque">Cheque</option>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Mensualidad, Clase especial, etc."
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowPaymentForm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
              <button
                onClick={registerPayment}
                className="btn btn-primary btn-md"
              >
                Registrar Pago
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </ProtectedRoute>
  );
}
