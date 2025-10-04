import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { attendanceStorage } from '@/lib/attendance-storage';

export async function GET(request: NextRequest) {
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
    
    // Verificar que es deportista
    if (decoded.rol !== 'deportista') {
      return NextResponse.json(
        { error: 'Solo los deportistas pueden ver sus asistencias' },
        { status: 403 }
      );
    }

    // Obtener asistencias del usuario desde el storage temporal
    const attendance = attendanceStorage.getUserAttendances(decoded.userId);

    return NextResponse.json(attendance);

  } catch (error) {
    console.error('Error obteniendo asistencias:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
