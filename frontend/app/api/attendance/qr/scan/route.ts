import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación del deportista
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
        { error: 'Solo los deportistas pueden marcar asistencia' },
        { status: 403 }
      );
    }

    const { qrCode } = await request.json();

    if (!qrCode) {
      return NextResponse.json(
        { error: 'Código QR requerido' },
        { status: 400 }
      );
    }

    // Verificar y decodificar QR
    let qrData;
    try {
      qrData = jwt.verify(qrCode, process.env.JWT_SECRET!) as any;
    } catch (error) {
      return NextResponse.json(
        { error: 'Código QR inválido' },
        { status: 400 }
      );
    }

    // Verificar si el QR ha expirado
    if (Date.now() > qrData.expiresAt) {
      return NextResponse.json(
        { error: 'El código QR ha expirado' },
        { status: 400 }
      );
    }

    // Verificar si el QR ya fue usado
    const { data: qrRecord } = await supabase
      .from('qr_codes')
      .select('usado')
      .eq('codigo', qrCode)
      .single();

    if (qrRecord?.usado) {
      return NextResponse.json(
        { error: 'Este código QR ya fue utilizado' },
        { status: 400 }
      );
    }

    // Verificar si ya marcó asistencia hoy
    const today = new Date().toISOString().split('T')[0];
    const { data: existingAttendance } = await supabase
      .from('attendance')
      .select('id')
      .eq('user_id', decoded.userId)
      .eq('session_id', qrData.sessionId)
      .single();

    if (existingAttendance) {
      return NextResponse.json(
        { error: 'Ya marcaste asistencia hoy' },
        { status: 400 }
      );
    }

    // Marcar asistencia
    const { data: attendance, error: attendanceError } = await supabase
      .from('attendance')
      .insert({
        user_id: decoded.userId,
        session_id: qrData.sessionId,
        metodo: 'qr',
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

    // Marcar QR como usado
    await supabase
      .from('qr_codes')
      .update({ usado: true })
      .eq('codigo', qrCode);

    return NextResponse.json({
      success: true,
      message: 'Asistencia marcada correctamente',
      attendance
    });

  } catch (error) {
    console.error('Error escaneando QR:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
