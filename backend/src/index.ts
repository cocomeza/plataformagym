import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import authRoutes from './routes/auth';
import attendanceRoutes from './routes/attendance';
import paymentRoutes from './routes/payments';
import adminRoutes from './routes/admin';
import userRoutes from './routes/users';

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware de seguridad
app.use(helmet());

// Configuración de CORS
app.use(cors({
  origin: [
    process.env.CORS_ORIGIN || 'http://localhost:3000',
    'https://*.vercel.app', // Permitir cualquier subdominio de Vercel
    'https://*.onrender.com' // Permitir cualquier subdominio de Render
  ],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // límite de requests por IP
  message: {
    error: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.'
  }
});

app.use(limiter);

// Middleware para parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Ruta de bienvenida
app.get('/', (req, res) => {
  res.status(200).json({
    message: '🏋️ Bienvenido a la API del Gimnasio',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      attendance: '/api/attendance',
      payments: '/api/payments',
      admin: '/api/admin',
      users: '/api/users'
    },
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'API del Gimnasio funcionando correctamente',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);

// Middleware de manejo de errores
app.use(notFound);
app.use(errorHandler);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🏋️ Servidor del gimnasio ejecutándose en puerto ${PORT}`);
  console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

export default app;
