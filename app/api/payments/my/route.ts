import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { adminStorage } from '@/lib/admin-storage';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Token requerido' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // Obtener pagos del usuario desde el almacenamiento en memoria
    const payments = adminStorage.payments.getByUser(decoded.userId);
    
    return NextResponse.json({
      success: true,
      payments: payments || []
    });

  } catch (error) {
    console.error('Error obteniendo pagos:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}