import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

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
      
      // Aquí deberías validar el código contra una base de datos temporal
      // Por ahora simulamos la validación
      // En una implementación real, tendrías:
      // 1. Una tabla temporal de códigos activos
      // 2. Verificar que el código existe y no ha expirado
      // 3. Verificar que el usuario no haya usado ya este código
      // 4. Marcar la asistencia en la base de datos
      // 5. Invalidar el código usado
      
      // Simulación de validación exitosa
      const isValidCode = true; // En producción, esto vendría de la base de datos
      
      if (!isValidCode) {
        return NextResponse.json({ error: 'Código inválido o expirado' }, { status: 400 });
      }
      
      // Aquí registrarías la asistencia en la base de datos
      // const attendanceRecord = await createAttendanceRecord(decoded.userId, 'codigo');
      
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
