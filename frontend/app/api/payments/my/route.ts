import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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
    
    // Obtener pagos del usuario
    const { data: payments, error } = await supabase
      .from('payments')
      .select(`
        id,
        user_id,
        fecha,
        monto,
        metodo,
        estado,
        descripcion,
        created_at
      `)
      .eq('user_id', decoded.userId)
      .order('fecha', { ascending: false });

    if (error) {
      console.error('Error obteniendo pagos:', error);
      return NextResponse.json(
        { error: 'Error al obtener pagos' },
        { status: 500 }
      );
    }

    return NextResponse.json(payments || []);

  } catch (error) {
    console.error('Error obteniendo pagos:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
