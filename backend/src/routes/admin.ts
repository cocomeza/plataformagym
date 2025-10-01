import { Router } from 'express';

const router = Router();

// Rutas de administración
router.get('/stats', (req, res) => {
  res.json({ message: 'Get stats endpoint - Implementar estadísticas del gimnasio' });
});

router.get('/users', (req, res) => {
  res.json({ message: 'Get users endpoint - Implementar lista de usuarios' });
});

router.get('/attendance', (req, res) => {
  res.json({ message: 'Get attendance endpoint - Implementar asistencia de usuarios' });
});

router.post('/attendance/manual', (req, res) => {
  res.json({ message: 'Manual attendance endpoint - Implementar asistencia manual' });
});

export default router;
