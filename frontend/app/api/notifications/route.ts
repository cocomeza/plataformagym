import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { NOTIFICATION_TYPES } from '@/lib/notifications';

export async function GET(request: NextRequest) {
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
      
      // Aquí deberías obtener las notificaciones del usuario desde la base de datos
      // Por ahora simulamos algunas notificaciones
      const notifications = [
        {
          id: '1',
          userId: decoded.userId,
          type: NOTIFICATION_TYPES.WELCOME,
          title: '¡Bienvenido al gimnasio!',
          message: 'Gracias por unirte a nuestro gimnasio. ¡Esperamos verte pronto entrenando!',
          isRead: false,
          createdAt: new Date().toISOString(),
          priority: 'high'
        },
        {
          id: '2',
          userId: decoded.userId,
          type: NOTIFICATION_TYPES.PAYMENT_REMINDER,
          title: 'Recordatorio de pago',
          message: 'Tu membresía vence en 3 días. Renueva para continuar disfrutando de nuestros servicios.',
          isRead: false,
          createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 día atrás
          priority: 'medium'
        }
      ];
      
      return NextResponse.json({
        success: true,
        notifications: notifications
      });
      
    } catch (jwtError) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }
    
  } catch (error) {
    console.error('Error obteniendo notificaciones:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

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
    const { type, title, message, userIds, priority = 'medium' } = body;

    try {
      const decoded = jwt.verify(token, jwtSecret) as any;
      
      // Verificar que el usuario es admin
      if (decoded.rol !== 'admin') {
        return NextResponse.json({ error: 'Solo los administradores pueden crear notificaciones' }, { status: 403 });
      }

      // Validar datos requeridos
      if (!type || !title || !message) {
        return NextResponse.json({ error: 'Tipo, título y mensaje son requeridos' }, { status: 400 });
      }

      // Aquí deberías guardar la notificación en la base de datos
      // Por ahora simulamos la operación
      console.log(`Admin ${decoded.userId} creó notificación: ${title}`);
      
      return NextResponse.json({
        success: true,
        message: 'Notificación creada correctamente',
        notification: {
          id: Date.now().toString(),
          type,
          title,
          message,
          priority,
          createdAt: new Date().toISOString()
        }
      });
      
    } catch (jwtError) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }
    
  } catch (error) {
    console.error('Error creando notificación:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
