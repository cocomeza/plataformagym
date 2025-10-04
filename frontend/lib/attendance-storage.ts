// Sistema temporal de almacenamiento de asistencias
// En producción esto se reemplazaría por una base de datos real

interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  fecha_hora: string;
  metodo: string;
  codigo_usado?: string;
  created_at: string;
}

// Almacenamiento temporal en memoria
let attendanceRecords: AttendanceRecord[] = [];

export const attendanceStorage = {
  // Agregar nueva asistencia
  addAttendance(record: AttendanceRecord): void {
    attendanceRecords.push(record);
    console.log('📝 Asistencia agregada al storage:', record);
  },

  // Obtener asistencias por usuario
  getUserAttendances(userId: string): AttendanceRecord[] {
    return attendanceRecords
      .filter(record => record.userId === userId)
      .sort((a, b) => new Date(b.fecha_hora).getTime() - new Date(a.fecha_hora).getTime());
  },

  // Obtener todas las asistencias (para admin)
  getAllAttendances(): AttendanceRecord[] {
    return attendanceRecords
      .sort((a, b) => new Date(b.fecha_hora).getTime() - new Date(a.fecha_hora).getTime());
  },

  // Obtener asistencias de hoy
  getTodayAttendances(): AttendanceRecord[] {
    const today = new Date().toDateString();
    return attendanceRecords.filter(record => 
      new Date(record.fecha_hora).toDateString() === today
    );
  },

  // Verificar si usuario ya marcó asistencia hoy
  hasUserAttendedToday(userId: string): boolean {
    const today = new Date().toDateString();
    return attendanceRecords.some(record => 
      record.userId === userId && 
      new Date(record.fecha_hora).toDateString() === today
    );
  },

  // Obtener estadísticas
  getStats() {
    const today = new Date().toDateString();
    const todayAttendances = attendanceRecords.filter(record => 
      new Date(record.fecha_hora).toDateString() === today
    );

    return {
      totalAttendances: attendanceRecords.length,
      todayAttendances: todayAttendances.length,
      uniqueUsersToday: new Set(todayAttendances.map(a => a.userId)).size,
      methodStats: {
        codigo: todayAttendances.filter(a => a.metodo === 'codigo').length,
        manual: todayAttendances.filter(a => a.metodo === 'manual').length,
      }
    };
  },

  // Limpiar storage (útil para testing)
  clear(): void {
    attendanceRecords = [];
    console.log('🧹 Storage de asistencias limpiado');
  }
};

export type { AttendanceRecord };
