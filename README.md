# 🏋️ Plataforma de Gestión de Gimnasio

Una aplicación web completa para la gestión de gimnasios en Argentina, desarrollada con React, TypeScript, Node.js y Supabase.

## 🚀 Características Principales

### Para Deportistas
- ✅ Registro e inicio de sesión
- ✅ Marcación de asistencia por QR
- ✅ Visualización del estado de pagos
- ✅ Perfil personal

### Para Administradores
- ✅ Dashboard con estadísticas
- ✅ Gestión de asistencias (QR y manual)
- ✅ Control de pagos y morosos
- ✅ Reportes exportables
- ✅ Gestión de usuarios

## 🛠️ Tecnologías Utilizadas

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Base de Datos**: Supabase (PostgreSQL)
- **Autenticación**: JWT + bcrypt
- **Hosting**: Vercel (Frontend) + Render (Backend)

## 📋 Estructura del Proyecto

```
gym-platform/
├── frontend/          # Aplicación React
├── backend/           # API Node.js
├── docs/             # Documentación
└── README.md
```

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18+
- npm o yarn
- Cuenta de Supabase

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone <tu-repositorio>
cd gym-platform
```

2. **Instalar dependencias**
```bash
npm run install:all
```

3. **Configurar variables de entorno**
```bash
# Backend
cp backend/.env.example backend/.env
# Editar backend/.env con tus credenciales de Supabase

# Frontend
cp frontend/.env.example frontend/.env
# Editar frontend/.env con la URL de tu API
```

4. **Configurar Supabase**
- Crear proyecto en Supabase
- Ejecutar las migraciones SQL (ver docs/supabase-setup.md)
- Configurar políticas de seguridad

5. **Ejecutar en desarrollo**
```bash
npm run dev
```

## 📊 Base de Datos

### Tablas Principales
- `users` - Usuarios del sistema
- `sessions` - Sesiones de entrenamiento
- `attendance` - Registro de asistencias
- `payments` - Historial de pagos

## 🔐 Seguridad

- Contraseñas encriptadas con bcrypt
- Autenticación JWT con refresh tokens
- Validación de datos en frontend y backend
- Políticas de seguridad en Supabase

## 📱 Funcionalidades

### Sistema de Asistencia
- **QR Dinámico**: Código QR único por sesión que expira en minutos
- **Marcación Manual**: Para administradores y recepcionistas

### Gestión de Pagos
- Registro de pagos en efectivo y transferencia
- Control de morosos
- Estados: pagado/pendiente

### Panel de Administración
- Dashboard con métricas
- Filtros por fecha y estado
- Exportación a CSV/Excel

## 🚀 Deployment

### Frontend (Vercel)
```bash
cd frontend
vercel --prod
```

### Backend (Render)
- Conectar repositorio en Render
- Configurar variables de entorno
- Deploy automático

## 📝 Licencia

MIT License - ver LICENSE para más detalles

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama para feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abrir Pull Request

## 📞 Soporte

Para soporte técnico o consultas, contactar a: [tu-email@ejemplo.com]

---

Desarrollado con ❤️ para gimnasios argentinos
