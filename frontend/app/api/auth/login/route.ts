import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { adminStorage } from '@/lib/admin-storage';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    // Buscar usuario en el almacenamiento en memoria
    const users = adminStorage.users.getAll();
    const user = users.find(u => u.email === email && u.activo === true);

    if (!user) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // Verificar contraseña (sistema simple para demo)
    const validPasswords = {
      'admin@test.com': 'admin123'
    };

    if (validPasswords[email as keyof typeof validPasswords] !== password) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // Generar JWT con secreto por defecto si no está configurado
    const jwtSecret = process.env.JWT_SECRET || 'gym-platform-jwt-secret-key-2025';

    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        rol: user.rol 
      },
      jwtSecret,
      { expiresIn: '1h' }
    );

    return NextResponse.json({
      success: true,
      token,
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