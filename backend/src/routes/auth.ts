import { Router } from 'express';

const router = Router();

// Rutas de autenticación
router.post('/login', (req, res) => {
  res.json({ message: 'Login endpoint - Implementar lógica de autenticación' });
});

router.post('/register', (req, res) => {
  res.json({ message: 'Register endpoint - Implementar lógica de registro' });
});

router.post('/logout', (req, res) => {
  res.json({ message: 'Logout endpoint - Implementar lógica de logout' });
});

router.get('/me', (req, res) => {
  res.json({ message: 'Get user info endpoint - Implementar lógica de usuario actual' });
});

export default router;
