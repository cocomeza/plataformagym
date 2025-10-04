import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { adminStorage } from '@/lib/admin-storage';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token de autorización requerido' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const jwtSecret = process.env.JWT_SECRET;
    
    if (!jwtSecret) {
      return NextResponse.json({ error: 'JWT_SECRET no configurado' }, { status: 500 });
    }

    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'ID de usuario requerido' }, { status: 400 });
    }

    try {
      const decoded = jwt.verify(token, jwtSecret) as any;
      
      // Verificar que el usuario es admin
      if (decoded.rol !== 'admin') {
        return NextResponse.json({ error: 'Solo los administradores pueden desactivar usuarios' }, { status: 403 });
      }

      // Actualizar el estado del usuario en el storage
      const success = adminStorage.users.updateStatus(userId, false);
      
      if (!success) {
        return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
      }
      
      return NextResponse.json({
        success: true,
        message: 'Usuario desactivado correctamente',
        userId: userId
      });
      
    } catch (jwtError) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }
    
  } catch (error) {
    console.error('Error desactivando usuario:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token de autorización requerido' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const jwtSecret = process.env.JWT_SECRET;
    
    if (!jwtSecret) {
      return NextResponse.json({ error: 'JWT_SECRET no configurado' }, { status: 500 });
    }

    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'ID de usuario requerido' }, { status: 400 });
    }

    try {
      const decoded = jwt.verify(token, jwtSecret) as any;
      
      // Verificar que el usuario es admin
      if (decoded.rol !== 'admin') {
        return NextResponse.json({ error: 'Solo los administradores pueden reactivar usuarios' }, { status: 403 });
      }

      // Actualizar el estado del usuario en el storage
      const success = adminStorage.users.updateStatus(userId, true);
      
      if (!success) {
        return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
      }
      
      return NextResponse.json({
        success: true,
        message: 'Usuario reactivado correctamente',
        userId: userId
      });
      
    } catch (jwtError) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }
    
  } catch (error) {
    console.error('Error reactivando usuario:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
