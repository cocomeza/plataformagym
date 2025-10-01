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
    
    // Verificar que es admin
    const { data: user } = await supabase
      .from('users')
      .select('rol')
      .eq('id', decoded.userId)
      .single();

    if (!user || user.rol !== 'admin') {
      return NextResponse.json(
        { error: 'Acceso denegado. Se requieren permisos de administrador.' },
        { status: 403 }
      );
    }

    // Obtener estadísticas
    const today = new Date().toISOString().split('T')[0];
    
    // Total de usuarios deportistas
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('rol', 'deportista')
      .eq('activo', true);

    // Asistencias de hoy
    const { count: totalAttendance } = await supabase
      .from('attendance')
      .select('*', { count: 'exact', head: true })
      .gte('fecha_hora', today);

    // Pagos del mes actual
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count: totalPayments } = await supabase
      .from('payments')
      .select('*', { count: 'exact', head: true })
      .eq('estado', 'pagado')
      .gte('fecha', startOfMonth.toISOString().split('T')[0]);

    // Pagos pendientes (morosos)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { count: pendingPayments } = await supabase
      .from('payments')
      .select('*', { count: 'exact', head: true })
      .eq('estado', 'pendiente')
      .lte('fecha', thirtyDaysAgo.toISOString().split('T')[0]);

    return NextResponse.json({
      totalUsers: totalUsers || 0,
      totalAttendance: totalAttendance || 0,
      totalPayments: totalPayments || 0,
      pendingPayments: pendingPayments || 0
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
