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
): Promise<void> => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({
        error: 'Token de acceso requerido'
      });
      return;
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
      res.status(401).json({
        error: 'Token inválido o usuario inactivo'
      });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      rol: user.rol
    };

    next();
  } catch (error) {
    res.status(403).json({
      error: 'Token inválido'
    });
    return;
  }
};

export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (req.user?.rol !== 'admin') {
    res.status(403).json({
      error: 'Acceso denegado. Se requieren permisos de administrador.'
    });
    return;
  }
  next();
};

export const requireDeportista = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (req.user?.rol !== 'deportista') {
    res.status(403).json({
      error: 'Acceso denegado. Se requieren permisos de deportista.'
    });
    return;
  }
  next();
};
