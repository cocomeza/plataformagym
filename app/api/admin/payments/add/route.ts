import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
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
        { error: 'Solo los administradores pueden registrar pagos' },
        { status: 403 }
      );
    }

    const { userId, monto, metodo, concepto } = await request.json();

    // Validar datos requeridos
    if (!userId || !monto || !metodo || !concepto) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    // Validar monto
    if (isNaN(monto) || monto <= 0) {
      return NextResponse.json(
        { error: 'El monto debe ser un número positivo' },
        { status: 400 }
      );
    }

    // Validar método de pago
    const metodosValidos = ['efectivo', 'tarjeta', 'transferencia', 'cheque'];
    if (!metodosValidos.includes(metodo)) {
      return NextResponse.json(
        { error: 'Método de pago inválido' },
        { status: 400 }
      );
    }

    // Crear el nuevo pago
    const newPayment = {
      id: Date.now().toString(),
      userId,
      monto: parseFloat(monto),
      metodo,
      concepto: concepto.trim(),
      estado: 'pagado',
      fecha: new Date().toISOString(),
      created_at: new Date().toISOString(),
      registrado_por: decoded.userId
    };

    // Guardar en el storage temporal
    adminStorage.payments.add(newPayment);

    return NextResponse.json({
      success: true,
      message: 'Pago registrado correctamente',
      payment: newPayment
    });

  } catch (error) {
    console.error('Error registrando pago:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
