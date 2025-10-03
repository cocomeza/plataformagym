'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { 
  Dumbbell, 
  Users, 
  CreditCard, 
  BarChart3, 
  QrCode,
  LogOut,
  Plus,
  Search,
  Filter,
  Download
} from 'lucide-react';
import QRCode from 'qrcode.react';

interface DashboardStats {
  totalUsers: number;
  totalAttendance: number;
  totalPayments: number;
  pendingPayments: number;
}

interface User {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  activo: boolean;
  total_asistencias: number;
  total_pagos: number;
  ultimo_pago: string;
  estado_pago: string;
}

interface Attendance {
  id: string;
  user_id: string;
  session_id: string;
  metodo: string;
  fecha_hora: string;
  user: {
    nombre: string;
  };
}

export default function AdminPage() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalAttendance: 0,
    totalPayments: 0,
    pendingPayments: 0
  });
  const [users, setUsers] = useState<User[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [qrExpiry, setQrExpiry] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.rol !== 'admin') {
      router.push('/dashboard');
      return;
    }

    loadData();
  }, [user, router]);

  const loadData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Cargar estadísticas
      const statsResponse = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      // Cargar usuarios
      const usersResponse = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData);
      }

      // Cargar asistencias
      const attendanceResponse = await fetch('/api/admin/attendance', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (attendanceResponse.ok) {
        const attendanceData = await attendanceResponse.json();
        setAttendance(attendanceData);
      }

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
        },
      });

      const data = await response.json();
      
      if (data.success) {
        setQrCode(data.attendanceCode);
        setQrExpiry(data.expiresAt);
        
        // Auto-hide code after expiry
        setTimeout(() => {
          setQrCode(null);
          setQrExpiry(null);
        }, data.expiresIn * 60 * 1000);
      }
    } catch (error) {
      console.error('Error generando código:', error);
    }
  };

  const markAttendance = async (userId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/attendance/manual', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Asistencia marcada correctamente');
        loadData(); // Recargar datos
      } else {
        alert(data.error || 'Error al marcar asistencia');
      }
    } catch (error) {
      console.error('Error marcando asistencia:', error);
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Dumbbell className="h-8 w-8 text-primary-600" />
              <h1 className="ml-2 text-2xl font-bold text-gray-900">
                Panel de Administración
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Hola, {user?.nombre}
              </span>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
              { id: 'users', name: 'Usuarios', icon: Users },
              { id: 'attendance', name: 'Asistencias', icon: QrCode },
              { id: 'payments', name: 'Pagos', icon: CreditCard },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
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
              <div className="card">
                <div className="card-content">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Users className="h-8 w-8 text-primary-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        Total Usuarios
                      </h3>
                      <p className="text-2xl font-bold text-primary-600">
                        {stats.totalUsers}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-content">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <QrCode className="h-8 w-8 text-success-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        Asistencias Hoy
                      </h3>
                      <p className="text-2xl font-bold text-success-600">
                        {stats.totalAttendance}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-content">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <CreditCard className="h-8 w-8 text-warning-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        Pagos del Mes
                      </h3>
                      <p className="text-2xl font-bold text-warning-600">
                        {stats.totalPayments}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-content">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <CreditCard className="h-8 w-8 text-danger-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        Morosos
                      </h3>
                      <p className="text-2xl font-bold text-danger-600">
                        {stats.pendingPayments}
                      </p>
                    </div>
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
                {qrCode ? (
                  <div className="text-center">
                    <div className="mb-6">
                      <div className="inline-block bg-primary-100 rounded-2xl p-8 border-4 border-primary-500">
                        <div className="text-6xl font-bold text-primary-700 font-mono">
                          {qrCode}
                        </div>
                      </div>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-md mb-4">
                      <p className="text-sm text-yellow-800 font-medium">
                        ⏰ Código válido por {qrExpiry ? Math.ceil((qrExpiry - Date.now()) / 60000) : 0} minutos
                      </p>
                      <p className="text-xs text-yellow-700 mt-1">
                        Los deportistas deben ingresar este código en su dashboard
                      </p>
                    </div>
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(qrCode);
                          alert('Código copiado al portapapeles');
                        }}
                        className="btn btn-primary btn-md mr-2"
                      >
                        📋 Copiar Código
                      </button>
                      <button
                        onClick={() => {
                          setQrCode(null);
                          setQrExpiry(null);
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
                      Haz clic en el botón para generar un código de asistencia
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
                <button className="btn btn-primary btn-md">
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
                        <td className="table-cell">{user.total_asistencias}</td>
                        <td className="table-cell">
                          <span className={`badge ${
                            user.estado_pago === 'Al día' ? 'badge-success' : 'badge-danger'
                          }`}>
                            {user.estado_pago}
                          </span>
                        </td>
                        <td className="table-cell">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => markAttendance(user.id)}
                              className="btn btn-success btn-sm"
                            >
                              Marcar Asistencia
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
                    {attendance.map((item) => (
                      <tr key={item.id} className="table-row">
                        <td className="table-cell">{item.user.nombre}</td>
                        <td className="table-cell">
                          {new Date(item.fecha_hora).toLocaleDateString('es-AR')}
                        </td>
                        <td className="table-cell">
                          {new Date(item.fecha_hora).toLocaleTimeString('es-AR')}
                        </td>
                        <td className="table-cell">
                          <span className={`badge ${
                            item.metodo === 'qr' ? 'badge-success' : 'badge-warning'
                          }`}>
                            {item.metodo.toUpperCase()}
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
          <div className="card">
            <div className="card-header">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  Gestión de Pagos
                </h3>
                <button className="btn btn-primary btn-md">
                  <Plus className="h-4 w-4 mr-2" />
                  Registrar Pago
                </button>
              </div>
            </div>
            <div className="card-content">
              <p className="text-gray-500 text-center py-8">
                Funcionalidad de pagos en desarrollo...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
