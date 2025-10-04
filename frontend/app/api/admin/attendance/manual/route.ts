import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { attendanceStorage } from '@/lib/attendance-storage';
import { adminStorage } from '@/lib/admin-storage';

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const authHeader = request.headers.get('authorization');
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return NextResponse.json(
        { error: 'Token de acceso requerido' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // Verificar que es admin
    if (decoded.rol !== 'admin') {
      return NextResponse.json(
        { error: 'Acceso denegado. Se requieren permisos de administrador.' },
        { status: 403 }
      );
    }

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'ID de usuario requerido' },
        { status: 400 }
      );
    }

    // Verificar que el usuario existe y es deportista
    const targetUser = adminStorage.users.getById(userId);
    if (!targetUser || targetUser.rol !== 'deportista' || !targetUser.activo) {
      return NextResponse.json(
        { error: 'Usuario no encontrado o no es deportista activo' },
        { status: 404 }
      );
    }

    // Verificar si ya marcó asistencia hoy
    if (attendanceStorage.hasUserAttendedToday(userId)) {
      return NextResponse.json(
        { error: 'El usuario ya marcó asistencia hoy' },
        { status: 400 }
      );
    }

    // Crear el registro de asistencia manual
    const attendanceRecord = {
      id: Date.now().toString(),
      userId: userId,
      userName: targetUser.nombre,
      fecha_hora: new Date().toISOString(),
      metodo: 'manual',
      created_at: new Date().toISOString()
    };

    // Guardar en el storage temporal
    attendanceStorage.addAttendance(attendanceRecord);

    return NextResponse.json({
      success: true,
      message: 'Asistencia marcada correctamente',
      attendance: attendanceRecord
    });

  } catch (error) {
    console.error('Error marcando asistencia manual:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
