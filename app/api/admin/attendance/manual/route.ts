import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'ID de usuario requerido' },
        { status: 400 }
      );
    }

    // Verificar que el usuario existe y es deportista
    const { data: targetUser, error: userError } = await supabase
      .from('users')
      .select('id, rol')
      .eq('id', userId)
      .eq('rol', 'deportista')
      .eq('activo', true)
      .single();

    if (userError || !targetUser) {
      return NextResponse.json(
        { error: 'Usuario no encontrado o no es deportista' },
        { status: 404 }
      );
    }

    // Crear o obtener sesión del día
    const today = new Date().toISOString().split('T')[0];
    let { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('id')
      .eq('fecha', today)
      .eq('activa', true)
      .single();

    if (sessionError || !session) {
      // Crear nueva sesión del día
      const { data: newSession, error: createSessionError } = await supabase
        .from('sessions')
        .insert({
          fecha: today,
          descripcion: `Sesión del ${today}`,
          activa: true
        })
        .select()
        .single();

      if (createSessionError || !newSession) {
        return NextResponse.json(
          { error: 'Error al crear sesión' },
          { status: 500 }
        );
      }
      session = newSession;
    }

    // Verificar que session no es null
    if (!session) {
      return NextResponse.json(
        { error: 'No se pudo obtener o crear la sesión' },
        { status: 500 }
      );
    }

    // Verificar si ya marcó asistencia hoy
    const { data: existingAttendance } = await supabase
      .from('attendance')
      .select('id')
      .eq('user_id', userId)
      .eq('session_id', session.id)
      .single();

    if (existingAttendance) {
      return NextResponse.json(
        { error: 'El usuario ya marcó asistencia hoy' },
        { status: 400 }
      );
    }

    // Marcar asistencia manual
    const { data: attendance, error: attendanceError } = await supabase
      .from('attendance')
      .insert({
        user_id: userId,
        session_id: session.id,
        metodo: 'manual',
        fecha_hora: new Date().toISOString()
      })
      .select()
      .single();

    if (attendanceError) {
      console.error('Error marcando asistencia:', attendanceError);
      return NextResponse.json(
        { error: 'Error al marcar asistencia' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Asistencia marcada correctamente',
      attendance
    });

  } catch (error) {
    console.error('Error marcando asistencia manual:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
