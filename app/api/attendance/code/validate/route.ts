import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { attendanceStorage } from '@/lib/attendance-storage';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token de autorización requerido' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const jwtSecret = process.env.JWT_SECRET;
    
    if (!jwtSecret) {
      return NextResponse.json({ error: 'JWT_SECRET no configurado' }, { status: 500 });
    }

    const body = await request.json();
    const { code } = body;

    if (!code || typeof code !== 'string' || !/^\d{4}$/.test(code)) {
      return NextResponse.json({ error: 'Código inválido. Debe ser un número de 4 dígitos' }, { status: 400 });
    }

    try {
      const decoded = jwt.verify(token, jwtSecret) as any;
      
      // Simular validación del código (en producción esto vendría de la base de datos)
      // Por ahora aceptamos cualquier código de 4 dígitos válido
      const isValidCode = true;
      
      if (!isValidCode) {
        return NextResponse.json({ error: 'Código inválido o expirado' }, { status: 400 });
      }
      
      // Verificar si el usuario ya marcó asistencia hoy
      if (attendanceStorage.hasUserAttendedToday(decoded.userId)) {
        return NextResponse.json({ error: 'Ya marcaste asistencia hoy' }, { status: 400 });
      }
      
      // Crear el registro de asistencia
      const attendanceRecord = {
        id: Date.now().toString(),
        userId: decoded.userId,
        userName: decoded.nombre,
        fecha_hora: new Date().toISOString(),
        metodo: 'codigo',
        codigo_usado: code,
        created_at: new Date().toISOString()
      };
      
      // Guardar en el storage temporal
      attendanceStorage.addAttendance(attendanceRecord);
      
      return NextResponse.json({
        success: true,
        message: 'Asistencia marcada correctamente',
        attendanceTime: new Date().toISOString()
      });
      
    } catch (jwtError) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }
    
  } catch (error) {
    console.error('Error validando código de asistencia:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
