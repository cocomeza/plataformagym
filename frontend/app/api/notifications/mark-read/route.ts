import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function PUT(request: NextRequest) {
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
    const { notificationId, markAllAsRead = false } = body;

    try {
      const decoded = jwt.verify(token, jwtSecret) as any;
      
      // Aquí deberías actualizar las notificaciones en la base de datos
      // Por ahora simulamos la operación
      if (markAllAsRead) {
        console.log(`Usuario ${decoded.userId} marcó todas las notificaciones como leídas`);
      } else {
        console.log(`Usuario ${decoded.userId} marcó la notificación ${notificationId} como leída`);
      }
      
      return NextResponse.json({
        success: true,
        message: markAllAsRead ? 'Todas las notificaciones marcadas como leídas' : 'Notificación marcada como leída'
      });
      
    } catch (jwtError) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }
    
  } catch (error) {
    console.error('Error marcando notificación como leída:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
