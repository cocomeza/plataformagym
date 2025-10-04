import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { adminStorage } from '@/lib/admin-storage';

export async function POST(request: NextRequest) {
  try {
    const { nombre, email, password, rol = 'deportista' } = await request.json();

    if (!nombre || !email || !password) {
      return NextResponse.json(
        { error: 'Nombre, email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    // Verificar si el usuario ya existe
    const users = adminStorage.users.getAll();
    const existingUser = users.find(u => u.email === email);

    if (existingUser) {
      return NextResponse.json(
        { error: 'El email ya está registrado' },
        { status: 400 }
      );
    }

    // Crear nuevo usuario
    const newUser = {
      id: Date.now().toString(),
      nombre,
      email,
      telefono: '',
      rol,
      activo: true,
      created_at: new Date().toISOString()
    };

    // Agregar usuario al almacenamiento
    adminStorage.users.add(newUser);

    // Verificar que las variables de entorno estén configuradas
    if (!process.env.JWT_SECRET) {
      return NextResponse.json(
        { error: 'Configuración del servidor incompleta' },
        { status: 500 }
      );
    }

    // Generar JWT
    const jwtSecret = process.env.JWT_SECRET as string;

    const token = jwt.sign(
      { 
        userId: newUser.id, 
        email: newUser.email, 
        rol: newUser.rol 
      },
      jwtSecret,
      { expiresIn: '1h' }
    );

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: newUser.id,
        nombre: newUser.nombre,
        email: newUser.email,
        rol: newUser.rol
      }
    });

  } catch (error) {
    console.error('Error en registro:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}