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
        { error: 'Solo los administradores pueden agregar usuarios' },
        { status: 403 }
      );
    }

    const { nombre, email, telefono, rol } = await request.json();

    // Validar datos requeridos
    if (!nombre || !email || !telefono || !rol) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    // Validar rol
    if (!['admin', 'deportista'].includes(rol)) {
      return NextResponse.json(
        { error: 'Rol inválido' },
        { status: 400 }
      );
    }

    // Crear el nuevo usuario
    const newUser = {
      id: Date.now().toString(),
      nombre: nombre.trim(),
      email: email.toLowerCase().trim(),
      telefono: telefono.trim(),
      rol,
      activo: true,
      created_at: new Date().toISOString()
    };

    // Guardar en el storage temporal
    adminStorage.users.add(newUser);

    return NextResponse.json({
      success: true,
      message: 'Usuario creado correctamente',
      user: newUser
    });

  } catch (error) {
    console.error('Error creando usuario:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
