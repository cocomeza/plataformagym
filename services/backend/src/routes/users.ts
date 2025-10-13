import { Router } from 'express';

const router = Router();

// Rutas de usuarios
router.get('/', (req, res) => {
  res.json({ message: 'Get users endpoint - Implementar lista de usuarios' });
});

router.get('/:id', (req, res) => {
  res.json({ message: 'Get user by ID endpoint - Implementar usuario por ID' });
});

router.put('/:id', (req, res) => {
  res.json({ message: 'Update user endpoint - Implementar actualización de usuario' });
});

router.delete('/:id', (req, res) => {
  res.json({ message: 'Delete user endpoint - Implementar eliminación de usuario' });
});

export default router;
