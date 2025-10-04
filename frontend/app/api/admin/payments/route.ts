import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { adminStorage } from '@/lib/admin-storage';

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
    
    // Verificar que es admin
    if (decoded.rol !== 'admin') {
      return NextResponse.json(
        { error: 'Acceso denegado. Se requieren permisos de administrador.' },
        { status: 403 }
      );
    }

    // Obtener todos los pagos desde el storage temporal
    const payments = adminStorage.payments.getAll();

    // Enriquecer con información del usuario
    const enrichedPayments = payments.map(payment => {
      const user = adminStorage.users.getById(payment.userId);
      return {
        ...payment,
        user: user ? {
          id: user.id,
          nombre: user.nombre,
          email: user.email
        } : null
      };
    });

    return NextResponse.json(enrichedPayments);

  } catch (error) {
    console.error('Error obteniendo pagos:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
