import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';
import QRCode from 'qrcode';

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

    // Verificar que JWT_SECRET esté configurado
    if (!process.env.JWT_SECRET) {
      return NextResponse.json(
        { error: 'Token de acceso requerido' },
        { status: 401 }
      );
    }

    const jwtSecret = process.env.JWT_SECRET as string;
    const decoded = jwt.verify(token, jwtSecret) as any;
    
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

    // Crear sesión del día
    const today = new Date().toISOString().split('T')[0];
    const { data: existingSession } = await supabase
      .from('sessions')
      .select('id')
      .eq('fecha', today)
      .eq('activa', true)
      .single();

    let sessionId;
    if (existingSession) {
      sessionId = existingSession.id;
    } else {
      const { data: session, error: sessionError } = await supabase
        .from('sessions')
        .insert({
          fecha: today,
          descripcion: `Sesión del ${today}`,
          activa: true
        })
        .select()
        .single();

      if (sessionError) {
        return NextResponse.json(
          { error: 'Error al crear la sesión' },
          { status: 500 }
        );
      }
      sessionId = session.id;
    }

    // Generar código QR único
    const qrData = {
      sessionId,
      timestamp: Date.now(),
      expiresAt: Date.now() + (parseInt(process.env.QR_EXPIRY_MINUTES || '5') * 60 * 1000)
    };

    // Verificar que JWT_SECRET esté configurado
    if (!process.env.JWT_SECRET) {
      return NextResponse.json(
        { error: 'Configuración del servidor incompleta' },
        { status: 500 }
      );
    }

    const jwtSecret = process.env.JWT_SECRET as string;

    const qrCode = jwt.sign(qrData, jwtSecret);
    
    // Generar imagen QR
    const qrImageUrl = await QRCode.toDataURL(qrCode, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    // Guardar QR en la base de datos
    const { data: qrRecord, error: qrError } = await supabase
      .from('qr_codes')
      .insert({
        session_id: sessionId,
        codigo: qrCode,
        expira_en: new Date(qrData.expiresAt).toISOString(),
        usado: false
      })
      .select()
      .single();

    if (qrError) {
      console.error('Error guardando QR:', qrError);
    }

    return NextResponse.json({
      success: true,
      qrCode,
      qrImageUrl,
      sessionId,
      expiresAt: qrData.expiresAt,
      expiresIn: parseInt(process.env.QR_EXPIRY_MINUTES || '5')
    });

  } catch (error) {
    console.error('Error generando QR:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
