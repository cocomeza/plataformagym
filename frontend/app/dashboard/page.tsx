'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { 
  Dumbbell, 
  QrCode, 
  Calendar, 
  CreditCard, 
  LogOut, 
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import QRCode from 'qrcode.react';

interface AttendanceData {
  id: string;
  fecha_hora: string;
  metodo: string;
}

interface PaymentData {
  id: string;
  fecha: string;
  monto: number;
  metodo: string;
  estado: string;
}

export default function DashboardPage() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [attendance, setAttendance] = useState<AttendanceData[]>([]);
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [qrExpiry, setQrExpiry] = useState<number | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.rol !== 'deportista') {
      router.push('/admin');
      return;
    }

    loadData();
  }, [user, router]);

  const loadData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Cargar asistencias
      const attendanceResponse = await fetch('/api/attendance/my', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (attendanceResponse.ok) {
        const attendanceData = await attendanceResponse.json();
        setAttendance(attendanceData);
      }

      // Cargar pagos
      const paymentsResponse = await fetch('/api/payments/my', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (paymentsResponse.ok) {
        const paymentsData = await paymentsResponse.json();
        setPayments(paymentsData);
      }

    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateQR = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://gym-platform-backend.onrender.com/api/attendance/qr/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (data.success) {
        setQrCode(data.qrCode);
        setQrExpiry(data.expiresAt);
        
        // Auto-hide QR after expiry
        setTimeout(() => {
          setQrCode(null);
          setQrExpiry(null);
        }, data.expiresIn * 60 * 1000);
      }
    } catch (error) {
      console.error('Error generando QR:', error);
    }
  };

  const scanQR = async () => {
    // En una implementación real, aquí usarías la cámara del dispositivo
    const qrCode = prompt('Escanea el código QR o ingrésalo manualmente:');
    
    if (qrCode) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('https://gym-platform-backend.onrender.com/api/attendance/qr/scan', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ qrCode }),
        });

        const data = await response.json();
        
        if (data.success) {
          alert('¡Asistencia marcada correctamente!');
          loadData(); // Recargar datos
        } else {
          alert(data.error || 'Error al marcar asistencia');
        }
      } catch (error) {
        console.error('Error escaneando QR:', error);
        alert('Error de conexión');
      }
    }
  };

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

        {/* QR Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">
                Marcar Asistencia
              </h3>
              <p className="text-sm text-gray-600">
                Escanea el código QR del gimnasio para marcar tu asistencia
              </p>
            </div>
            <div className="card-content">
              {qrCode ? (
                <div className="text-center">
                  <div className="mb-4">
                    <QRCode value={qrCode} size={200} />
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Código QR válido por {qrExpiry ? Math.ceil((qrExpiry - Date.now()) / 60000) : 0} minutos
                  </p>
                  <button
                    onClick={() => {
                      setQrCode(null);
                      setQrExpiry(null);
                    }}
                    className="btn btn-secondary btn-sm"
                  >
                    Cerrar QR
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <button
                    onClick={generateQR}
                    className="btn btn-primary btn-md"
                  >
                    Generar Código QR
                  </button>
                  <p className="text-xs text-gray-500 mt-2">
                    O pide al recepcionista que marque tu asistencia
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">
                Escanear QR
              </h3>
              <p className="text-sm text-gray-600">
                Usa la cámara para escanear el código QR del gimnasio
              </p>
            </div>
            <div className="card-content">
              <div className="text-center">
                <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <button
                  onClick={scanQR}
                  className="btn btn-success btn-md"
                >
                  Escanear QR
                </button>
                <p className="text-xs text-gray-500 mt-2">
                  Funcionalidad de cámara (implementar en producción)
                </p>
              </div>
            </div>
          </div>
        </div>

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
  );
}
