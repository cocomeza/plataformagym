'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import ProtectedRoute from '@/components/ProtectedRoute';
import { adminStorage, User as AdminUser } from '@/lib/admin-storage';
import { attendanceStorage, AttendanceRecord } from '@/lib/attendance-storage';
import { supabaseUtils, SupabaseUser, SupabasePayment } from '@/lib/supabase-utils';
import { notificationsStorage, Notification } from '@/lib/notifications-storage';
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
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [payments, setPayments] = useState<SupabasePayment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
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
      const token = localStorage.getItem('token');
      
      // Cargar estadísticas básicas (simuladas por ahora)
      setStats({
        totalUsers: users.length,
        totalAttendance: attendance.length,
        totalPayments: payments.length,
        pendingPayments: 0
      });

      // Cargar usuarios con fallback inteligente
      console.log('📊 Cargando usuarios...');
      
       // Intentar Supabase primero, luego fallback a local
       let usersData: any[] = [];
       try {
         await supabaseUtils.listTables();
         const supabaseUsers = await supabaseUtils.getAllUsers();
         
         if (supabaseUsers && supabaseUsers.length > 0) {
           console.log('✅ Usuarios cargados desde Supabase:', supabaseUsers);
           usersData = supabaseUsers;
         } else {
           throw new Error('No hay usuarios en Supabase');
         }
       } catch (error) {
         console.log('⚠️ Supabase no disponible, usando almacenamiento local');
         usersData = adminStorage.users.getAll();
         console.log('👥 Usuarios cargados desde almacenamiento local:', usersData);
       }
       setUsers(usersData || []);

      // Cargar asistencias desde el almacenamiento local
      const attendanceData = attendanceStorage.getAllAttendances();
      setAttendance(attendanceData || []);
      console.log('📊 Asistencias cargadas:', attendanceData);

      // Cargar pagos con fallback inteligente
      console.log('💰 Cargando pagos...');
      
       try {
         const supabasePayments = await supabaseUtils.getAllPayments();
         
         if (supabasePayments && supabasePayments.length > 0) {
           console.log('✅ Pagos cargados desde Supabase:', supabasePayments);
           setPayments(supabasePayments);
         } else {
           throw new Error('No hay pagos en Supabase');
         }
       } catch (error) {
         console.log('⚠️ Supabase no disponible para pagos, usando almacenamiento local');
         const localPayments = adminStorage.payments.getAll();
         
         // Mapear Payment[] a SupabasePayment[]
         const mappedPayments: SupabasePayment[] = (localPayments || []).map(payment => ({
           id: payment.id,
           userId: payment.userId,
           userName: usersData.find(u => u.id === payment.userId)?.nombre || 'Usuario',
           monto: payment.monto,
           metodo: payment.metodo,
           concepto: payment.concepto,
           estado: payment.estado,
           fecha: payment.fecha,
           created_at: payment.created_at,
           registrado_por: payment.registrado_por
         }));
         
         console.log('💰 Pagos cargados desde almacenamiento local:', mappedPayments);
         setPayments(mappedPayments);
       }

      // Cargar notificaciones desde almacenamiento local
      const notificationsData = notificationsStorage.getAll();
      setNotifications(notificationsData);
      console.log('📢 Notificaciones cargadas:', notificationsData);

    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAttendanceCode = async () => {
    console.log('🔄 Iniciando generación de código...');
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
        console.log('✅ Código generado desde backend:', data.code);
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
      // Intentar actualizar estado en Supabase primero
      const success = await supabaseUtils.updateUserStatus(userId, !isActive);
      
      if (success) {
        alert(`Usuario ${action}do correctamente en Supabase`);
        loadAdminData(); // Recargar datos
      } else {
        // Fallback: usar almacenamiento local
        console.log('💡 Usando almacenamiento local para actualizar usuario');
        adminStorage.users.updateStatus(userId, !isActive);
        alert(`Usuario ${action}do correctamente (almacenamiento local)`);
        loadAdminData(); // Recargar datos
      }
    } catch (error) {
      console.error('Error actualizando usuario:', error);
      // Fallback: usar almacenamiento local
      console.log('💡 Usando almacenamiento local para actualizar usuario');
      adminStorage.users.updateStatus(userId, !isActive);
      alert(`Usuario ${action}do correctamente (almacenamiento local)`);
      loadAdminData(); // Recargar datos
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
        setShowNotificationForm(false);
        setNotificationForm({
          type: 'gym_announcement',
          title: '',
          message: '',
          priority: 'medium'
        });
      } else {
        // Fallback: usar almacenamiento local
        console.log('💡 Usando almacenamiento local para crear notificación');
        const newNotification = notificationsStorage.add({
          titulo: notificationForm.title,
          mensaje: notificationForm.message,
          tipo: 'info',
          fecha: new Date().toISOString(),
          leida: false
        });
        
        console.log('✅ Notificación creada localmente:', newNotification);
        alert('Notificación creada correctamente (almacenamiento local)');
        setShowNotificationForm(false);
        setNotificationForm({
          type: 'gym_announcement',
          title: '',
          message: '',
          priority: 'medium'
        });
      }
    } catch (error) {
      console.error('Error creando notificación:', error);
      // Fallback: usar almacenamiento local
      console.log('💡 Usando almacenamiento local para crear notificación');
      const newNotification = notificationsStorage.add({
        titulo: notificationForm.title,
        mensaje: notificationForm.message,
        tipo: 'info',
        fecha: new Date().toISOString(),
        leida: false
      });
      
      console.log('✅ Notificación creada localmente:', newNotification);
      alert('Notificación creada correctamente (almacenamiento local)');
      setShowNotificationForm(false);
      setNotificationForm({
        type: 'gym_announcement',
        title: '',
        message: '',
        priority: 'medium'
      });
    }
  };

  const createUser = async () => {
    if (!userForm.nombre || !userForm.email || !userForm.telefono) {
      alert('Por favor completa todos los campos');
      return;
    }

    try {
      // Solo intentar agregar usuario a Supabase
      const success = await supabaseUtils.addUser({
        nombre: userForm.nombre,
        email: userForm.email,
        telefono: userForm.telefono,
        rol: userForm.rol as 'admin' | 'deportista',
        activo: true
      });
      
      if (success) {
        alert('Usuario creado correctamente en Supabase');
        setShowUserForm(false);
        setUserForm({
          nombre: '',
          email: '',
          telefono: '',
          rol: 'deportista'
        });
        loadAdminData(); // Recargar datos
      } else {
        alert('Error: No se pudo crear el usuario');
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
      // Intentar agregar pago a Supabase primero
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
        alert('Pago registrado correctamente en Supabase');
        setShowPaymentForm(false);
        setPaymentForm({
          userId: '',
          monto: '',
          metodo: 'efectivo',
          concepto: ''
        });
        loadAdminData(); // Recargar datos
      } else {
        // Fallback: usar almacenamiento local
        console.log('💡 Usando almacenamiento local para el pago');
        const newPayment = {
          id: Date.now().toString(),
          userId: paymentForm.userId,
          monto: parseFloat(paymentForm.monto),
          metodo: paymentForm.metodo,
          concepto: paymentForm.concepto,
          estado: 'Completado',
          fecha: new Date().toISOString(),
          created_at: new Date().toISOString(),
          registrado_por: user?.nombre || 'Admin'
        };
        
        adminStorage.payments.add(newPayment);
        alert('Pago registrado correctamente (almacenamiento local)');
        setShowPaymentForm(false);
        setPaymentForm({
          userId: '',
          monto: '',
          metodo: 'efectivo',
          concepto: ''
        });
        loadAdminData(); // Recargar datos
      }
    } catch (error) {
      console.error('Error registrando pago:', error);
      alert('Error de conexión');
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
