import { Router } from 'express';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import QRCode from 'qrcode';
import { createClient } from '@supabase/supabase-js';

// Extender Request para incluir user
interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    rol: string;
  };
}

const router = Router();

// Configurar Supabase
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Middleware de autenticación
const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Token de acceso requerido' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Token inválido' });
    return;
  }
};

// Generar código QR para asistencia
router.post('/qr/generate', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    
    // Verificar que es admin
    const { data: user } = await supabase
      .from('users')
      .select('rol')
      .eq('id', userId)
      .single();

    if (!user || user.rol !== 'admin') {
      return res.status(403).json({ error: 'Solo los administradores pueden generar códigos QR' });
    }

    // Buscar o crear sesión activa para hoy
    const today = new Date().toISOString().split('T')[0];
    let { data: session } = await supabase
      .from('sessions')
      .select('*')
      .eq('fecha', today)
      .eq('activa', true)
      .single();

    if (!session) {
      const { data: newSession, error: sessionError } = await supabase
        .from('sessions')
        .insert({
          fecha: today,
          descripcion: `Entrenamiento ${today}`,
          activa: true
        })
        .select()
        .single();

      if (sessionError) {
        console.error('Error creando sesión:', sessionError);
        return res.status(500).json({ error: 'Error al crear la sesión' });
      }
      session = newSession;
    }

    // Generar código QR único
    const qrData = {
      sessionId: session.id,
      timestamp: Date.now(),
      expiresAt: Date.now() + (parseInt(process.env.QR_EXPIRY_MINUTES || '5') * 60 * 1000)
    };

    const qrCode = jwt.sign(qrData, process.env.JWT_SECRET!);
    
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
        session_id: session.id,
        codigo: qrCode,
        expira_en: new Date(qrData.expiresAt).toISOString(),
        usado: false
      })
      .select()
      .single();

    if (qrError) {
      console.error('Error guardando QR:', qrError);
    }

    res.json({
      success: true,
      qrCode,
      qrImageUrl,
      sessionId: session.id,
      expiresAt: qrData.expiresAt,
      expiresIn: parseInt(process.env.QR_EXPIRY_MINUTES || '5')
    });
    return;

  } catch (error) {
    console.error('Error generando QR:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
    return;
  }
});

// Escanear código QR para marcir asistencia
router.post('/qr/scan', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    
    // Verificar que es deportista
    const { data: user } = await supabase
      .from('users')
      .select('rol')
      .eq('id', userId)
      .single();

    if (!user || user.rol !== 'deportista') {
      return res.status(403).json({ error: 'Solo los deportistas pueden marcar asistencia' });
    }

    const { qrCode } = req.body;

    if (!qrCode) {
      return res.status(400).json({ error: 'Código QR requerido' });
    }

    // Verificar y decodificar QR
    let qrData;
    try {
      qrData = jwt.verify(qrCode, process.env.JWT_SECRET!) as any;
    } catch (error) {
      return res.status(400).json({ error: 'Código QR inválido' });
    }

    // Verificar si el QR ha expirado
    if (Date.now() > qrData.expiresAt) {
      return res.status(400).json({ error: 'El código QR ha expirado' });
    }

    // Verificar si el QR ya fue usado
    const { data: qrRecord } = await supabase
      .from('qr_codes')
      .select('usado')
      .eq('codigo', qrCode)
      .single();

    if (qrRecord?.usado) {
      return res.status(400).json({ error: 'Este código QR ya fue utilizado' });
    }

    // Verificar si ya marcó asistencia hoy
    const { data: existingAttendance } = await supabase
      .from('attendance')
      .select('id')
      .eq('user_id', userId)
      .eq('session_id', qrData.sessionId)
      .single();

    if (existingAttendance) {
      return res.status(400).json({ error: 'Ya marcaste asistencia hoy' });
    }

    // Marcar asistencia
    const { data: attendance, error: attendanceError } = await supabase
      .from('attendance')
      .insert({
        user_id: userId,
        session_id: qrData.sessionId,
        metodo: 'qr',
        fecha_hora: new Date().toISOString()
      })
      .select()
      .single();

    if (attendanceError) {
      console.error('Error marcando asistencia:', attendanceError);
      return res.status(500).json({ error: 'Error al marcar asistencia' });
    }

    // Marcar QR como usado
    await supabase
      .from('qr_codes')
      .update({ usado: true })
      .eq('codigo', qrCode);

    res.json({
      success: true,
      message: 'Asistencia marcada correctamente',
      attendance
    });
    return;

  } catch (error) {
    console.error('Error escaneando QR:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
    return;
  }
});

// Obtener asistencias del usuario
router.get('/user/:userId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    
    const { data: attendance, error } = await supabase
      .from('attendance')
      .select(`
        *,
        sessions (
          fecha,
          descripcion
        )
      `)
      .eq('user_id', userId)
      .order('fecha_hora', { ascending: false });

    if (error) {
      console.error('Error obteniendo asistencias:', error);
      return res.status(500).json({ error: 'Error al obtener asistencias' });
    }

    res.json({ success: true, attendance });
    return;

  } catch (error) {
    console.error('Error en endpoint de asistencias:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
    return;
  }
});

// Obtener estadísticas de asistencias (solo admin)
router.get('/stats', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    
    // Verificar que es admin
    const { data: user } = await supabase
      .from('users')
      .select('rol')
      .eq('id', userId)
      .single();

    if (!user || user.rol !== 'admin') {
      return res.status(403).json({ error: 'Solo los administradores pueden ver estadísticas' });
    }

    const today = new Date().toISOString().split('T')[0];
    
    // Asistencias de hoy
    const { count: todayAttendance } = await supabase
      .from('attendance')
      .select('*', { count: 'exact' })
      .gte('fecha_hora', `${today}T00:00:00`)
      .lt('fecha_hora', `${today}T23:59:59`);

    // Total usuarios activos
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact' })
      .eq('rol', 'deportista')
      .eq('activo', true);

    res.json({
      success: true,
      stats: {
        todayAttendance: todayAttendance || 0,
        totalUsers: totalUsers || 0
      }
    });
    return;

  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
    return;
  }
});

export default router;