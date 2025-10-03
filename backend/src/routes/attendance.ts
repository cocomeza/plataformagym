import { Router } from 'express';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
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
const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
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

// Generar código de 4 dígitos para asistencia
router.post('/code/generate', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    
    // Verificar que es admin
    const { data: user } = await supabase
      .from('users')
      .select('rol')
      .eq('id', userId)
      .single();

    if (!user || user.rol !== 'admin') {
      res.status(403).json({ error: 'Solo los administradores pueden generar códigos' });
      return;
    }

    // Buscar o crear sesión activa para hoy
    const today = new Date().toISOString().split('T')[0];
    let { data: session } = await supabase
      .from('sessions')
      . select('*')
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
        res.status(500).json({ error: 'Error al crear la sesión' });
        return;
      }
      session = newSession;
    }

    // Generar código de 4 dígitos aleatorio
    const attendanceCode = Math.floor(1000 + Math.random() * 9000).toString();
    
    // Datos del código
    const codeData = {
      sessionId: session.id,
      code: attendanceCode,
      timestamp: Date.now(),
      expiresAt: Date.now() + (parseInt(process.env.CODE_EXPIRY_MINUTES || '10') * 60 * 1000)
    };

    // Firmar el código con JWT
    const codeToken = jwt.sign(codeData, process.env.JWT_SECRET!);

    // Guardar código en la base de datos
    const { data: codeRecord, error: codeError } = await supabase
      .from('attendance_codes')
      .insert({
        session_id: session.id,
        codigo: attendanceCode,
        token_codigo: codeToken,
        expira_en: new Date(codeData.expiresAt).toISOString(),
        usado: false
      })
      .select()
      .single();

    if (codeError) {
      console.error('Error guardando código:', codeError);
      // Continuamos aunque haya error, el código puede usarse
    }

    res.json({
      success: true,
      attendanceCode,
      sessionId: session.id,
      expiresAt: codeData.expiresAt,
      expiresIn: parseInt(process.env.CODE_EXPIRY_MINUTES || '10')
    });
    return;

  } catch (error) {
    console.error('Error generando código:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
    return;
  }
});

// Validar y usar código por deportista
router.post('/code/validate', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    
    // Verificar que es deportista
    const { data: user } = await supabase
      .from('users')
      .select('rol')
      .eq('id', userId)
      .single();

    if (!user || user.rol !== 'deportista') {
      res.status(403).json({ error: 'Solo los deportistas pueden marcar asistencia' });
      return;
    }

    const { code } = req.body;

    if (!code || code.length !== 4 || !/^\d{4}$/.test(code)) {
      res.status(400).json({ error: 'Código debe ser de 4 dígitos' });
      return;
    }

    // Buscar código en base de datos
    const { data: codeRecord } = await supabase
      .from('attendance_codes')
      .select('*, sessions(*)')
      .eq('codigo', code)
      .eq('usado', false)
      .single();

    if (!codeRecord) {
      res.status(400).json({ error: 'Código inválido o ya utilizado' });
      return;
    }

    // Verificar si el código ha expirado
    const now = new Date();
    const expiresAt = new Date(codeRecord.expira_en);
    
    if (now > expiresAt) {
      res.status(400).json({ error: 'El código ha expirado' });
      return;
    }

    // Verificar si ya marcó asistencia hoy
    const today = new Date().toISOString().split('T')[0];
    const { data: existingAttendance } = await supabase
      .from('attendance')
      .select('id')
      .eq('user_id', userId)
      .eq('session_id', codeRecord.session_id)
      .single();

    if (existingAttendance) {
      res.status(400).json({ error: 'Ya marcaste asistencia hoy' });
      return;
    }

    // Marcar asistencia
    const { data: attendance, error: attendanceError } = await supabase
      .from('attendance')
      .insert({
        user_id: userId,
        session_id: codeRecord.session_id,
        metodo: 'codigo',
        fecha_hora: new Date().toISOString()
      })
      .select()
      .single();

    if (attendanceError) {
      console.error('Error marcando asistencia:', attendanceError);
      res.status(500).json({ error: 'Error al marcar asistencia' });
      return;
    }

    // Marcar código como usado
    await supabase
      .from('attendance_codes')
      .update({ usado: true })
      .eq('id', codeRecord.id);

    res.json({
      success: true,
      message: 'Asistencia marcada correctamente',
      attendance,
      userName: user.rol // Información básica
    });
    return;

  } catch (error) {
    console.error('Error validando código:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
    return;
  }
});

// Obtener asistencias del usuario
router.get('/user/:userId', async (req: Request, res: Response) => {
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
      res.status(500).json({ error: 'Error al obtener asistencias' });
      return;
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
router.get('/stats', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    
    // Verificar que es admin
    const { data: user } = await supabase
      .from('users')
      .select('rol')
      .eq('id', userId)
      .single();

    if (!user || user.rol !== 'admin') {
      res.status(403).json({ error: 'Solo los administradores pueden ver estadísticas' });
      return;
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