import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    // Buscar usuario en la base de datos
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('activo', true)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // Verificar que las variables de entorno estén configuradas
    if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
      return NextResponse.json(
        { error: 'Configuración del servidor incompleta' },
        { status: 500 }
      );
    }

    // Generar JWT
    const jwtSecret = process.env.JWT_SECRET as string;
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET as string;
    
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        rol: user.rol 
      },
      jwtSecret,
      { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      jwtRefreshSecret,
      { expiresIn: '7d' }
    );

    // Actualizar refresh token en la base de datos
    await supabase
      .from('users')
      .update({ refresh_token: refreshToken })
      .eq('id', user.id);

    return NextResponse.json({
      success: true,
      token,
      refreshToken,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
