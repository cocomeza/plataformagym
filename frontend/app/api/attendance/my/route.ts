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
    
    // Verificar que es deportista
    const { data: user } = await supabase
      .from('users')
      .select('rol')
      .eq('id', decoded.userId)
      .single();

    if (!user || user.rol !== 'deportista') {
      return NextResponse.json(
        { error: 'Solo los deportistas pueden ver sus asistencias' },
        { status: 403 }
      );
    }

    // Obtener asistencias del usuario
    const { data: attendance, error } = await supabase
      .from('attendance')
      .select(`
        id,
        user_id,
        session_id,
        metodo,
        fecha_hora,
        created_at
      `)
      .eq('user_id', decoded.userId)
      .order('fecha_hora', { ascending: false });

    if (error) {
      console.error('Error obteniendo asistencias:', error);
      return NextResponse.json(
        { error: 'Error al obtener asistencias' },
        { status: 500 }
      );
    }

    return NextResponse.json(attendance || []);

  } catch (error) {
    console.error('Error obteniendo asistencias:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
