import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/database';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    rol: string;
  };
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        error: 'Token de acceso requerido'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // Verificar que el usuario existe y está activo
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, rol, activo')
      .eq('id', decoded.userId)
      .eq('activo', true)
      .single();

    if (error || !user) {
      return res.status(401).json({
        error: 'Token inválido o usuario inactivo'
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      rol: user.rol
    };

    next();
  } catch (error) {
    return res.status(403).json({
      error: 'Token inválido'
    });
  }
};

export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.rol !== 'admin') {
    return res.status(403).json({
      error: 'Acceso denegado. Se requieren permisos de administrador.'
    });
  }
  next();
};

export const requireDeportista = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.rol !== 'deportista') {
    return res.status(403).json({
      error: 'Acceso denegado. Se requieren permisos de deportista.'
    });
  }
  next();
};
