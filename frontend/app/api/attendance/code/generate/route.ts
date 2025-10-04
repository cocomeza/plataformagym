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

    try {
      const decoded = jwt.verify(token, jwtSecret) as any;
      
      // Verificar que el usuario es admin
      if (decoded.rol !== 'admin') {
        return NextResponse.json({ error: 'Solo los administradores pueden generar códigos' }, { status: 403 });
      }
      
      // Generar código de 4 dígitos
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      
      // Calcular tiempo de expiración (30 segundos)
      const expiresIn = 0.5; // minutos (30 segundos)
      const expiresAt = Date.now() + (expiresIn * 60 * 1000);
      
      // Aquí podrías guardar el código en una base de datos temporal
      // Por ahora solo lo devolvemos
      
      return NextResponse.json({
        success: true,
        code,
        expiresAt,
        expiresIn
      });
      
    } catch (jwtError) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }
    
  } catch (error) {
    console.error('Error generando código de asistencia:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
