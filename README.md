# 🏋️‍♂️ Plataforma de Gestión de Gimnasio

Una aplicación web completa para la gestión de gimnasios que permite controlar asistencias, usuarios, pagos y notificaciones de manera eficiente y moderna.

## 📋 Tabla de Contenidos

- [🎯 Descripción del Proyecto](#-descripción-del-proyecto)
- [🚀 Tecnologías Utilizadas](#-tecnologías-utilizadas)
- [🏗️ Arquitectura del Proyecto](#️-arquitectura-del-proyecto)
- [✨ Funcionalidades](#-funcionalidades)
- [🛠️ Instalación y Configuración](#️-instalación-y-configuración)
- [📱 Guía de Uso](#-guía-de-uso)
- [🔧 Estructura del Código](#-estructura-del-código)
- [🚀 Despliegue](#-despliegue)
- [🤝 Contribuir](#-contribuir)
- [📝 Licencia](#-licencia)

## 🎯 Descripción del Proyecto

Esta plataforma está diseñada para modernizar la gestión de gimnasios, reemplazando los sistemas tradicionales de control de acceso con una solución digital completa. Permite a los administradores gestionar usuarios, controlar asistencias mediante códigos temporales, manejar pagos y comunicarse efectivamente con los miembros del gimnasio.

### ¿Por qué este proyecto?

- **Problema:** Los gimnasios tradicionales usan sistemas obsoletos (tarjetas físicas, listas en papel)
- **Solución:** Sistema digital moderno, seguro y escalable
- **Beneficios:** Control preciso, mejor experiencia de usuario, gestión eficiente

## 🚀 Tecnologías Utilizadas

### Frontend
- **Next.js 14** - Framework de React para aplicaciones web modernas
  - *¿Por qué Next.js?* Proporciona renderizado del lado del servidor (SSR), optimización automática y excelente experiencia de desarrollo
- **React 18** - Biblioteca de JavaScript para construir interfaces de usuario
  - *¿Por qué React?* Componentes reutilizables, estado eficiente y ecosistema robusto
- **TypeScript** - Superset de JavaScript con tipado estático
  - *¿Por qué TypeScript?* Previene errores, mejora la productividad y facilita el mantenimiento del código
- **Tailwind CSS** - Framework de CSS utilitario
  - *¿Por qué Tailwind?* Desarrollo rápido de interfaces, consistencia visual y fácil personalización

### Backend
- **Next.js API Routes** - API endpoints integrados en Next.js
  - *¿Por qué API Routes?* Simplicidad, integración perfecta con el frontend y menos configuración
- **JWT (JSON Web Tokens)** - Para autenticación segura
  - *¿Por qué JWT?* Tokens sin estado, escalabilidad y seguridad estándar de la industria

### Herramientas de Desarrollo
- **ESLint** - Linter para mantener código limpio
- **Prettier** - Formateador de código automático
- **PostCSS** - Procesador de CSS para optimizaciones

## 🏗️ Arquitectura del Proyecto

```
plataforma-para-gym/
├── frontend/                 # Aplicación Next.js principal
│   ├── app/                 # App Router de Next.js 14
│   │   ├── admin/           # Panel de administración
│   │   ├── dashboard/       # Dashboard de usuarios
│   │   ├── api/             # API endpoints
│   │   │   ├── auth/        # Autenticación
│   │   │   ├── admin/       # Funciones de admin
│   │   │   ├── attendance/  # Control de asistencias
│   │   │   └── notifications/ # Sistema de notificaciones
│   │   ├── login/           # Página de login
│   │   └── register/        # Página de registro
│   ├── components/          # Componentes reutilizables
│   ├── lib/                 # Utilidades y configuraciones
│   └── styles/              # Estilos globales
├── backend/                 # Backend separado (si se necesita)
└── docs/                   # Documentación
```

## ✨ Funcionalidades

### 🔐 Sistema de Autenticación
- **Registro de usuarios** con validación de datos
- **Login seguro** con JWT tokens
- **Roles diferenciados:** Admin y Deportista
- **Protección de rutas** basada en roles

### 👨‍💼 Panel de Administración
- **Dashboard con estadísticas** en tiempo real
- **Gestión de usuarios:** Ver, activar/desactivar miembros
- **Generación de códigos de asistencia** (4 dígitos, válidos por 30 segundos)
- **Control de asistencias** manual y por códigos
- **Sistema de notificaciones** para comunicarse con usuarios
- **Vista de pagos** y estado de membresías

### 🏋️‍♂️ Dashboard de Usuarios
- **Estado de asistencia** del día actual
- **Historial de asistencias** recientes
- **Estado de pagos** y membresía
- **Marcado de asistencia** mediante códigos temporales
- **Sistema de notificaciones** personalizadas
- **Interfaz responsive** para móviles y desktop

### 🔔 Sistema de Notificaciones
- **Tipos de notificaciones:**
  - Recordatorios de pago
  - Recordatorios de asistencia
  - Anuncios del gimnasio
  - Promociones y ofertas
- **Prioridades:** Alta, Media, Baja
- **Interfaz visual** con colores por prioridad
- **Marcado automático** como leídas

### 🔢 Control de Asistencias
- **Códigos temporales** de 4 dígitos generados por el admin
- **Expiración en 30 segundos** para máxima seguridad
- **Solo admins pueden generar** códigos de asistencia
- **Validación automática** de formato y expiración
- **Historial completo** de asistencias por usuario
- **Prevención de doble asistencia** en el mismo día

## 🛠️ Instalación y Configuración

### Prerrequisitos
- Node.js 18+ 
- npm o yarn
- Git

### Pasos de Instalación

1. **Clonar el repositorio:**
```bash
git clone https://github.com/tu-usuario/plataforma-para-gym.git
cd plataforma-para-gym
```

2. **Instalar dependencias:**
```bash
cd frontend
npm install
```

3. **Configurar variables de entorno:**
```bash
cp .env.local.example .env.local
```

Editar `.env.local` con tus configuraciones:
```env
JWT_SECRET=tu_secreto_jwt_muy_seguro
NEXT_PUBLIC_API_URL=http://localhost:3000
NODE_ENV=development
```

4. **Ejecutar en modo desarrollo:**
```bash
npm run dev
```

5. **Abrir en el navegador:**
```
http://localhost:3000
```

### Scripts Disponibles
- `npm run dev` - Servidor de desarrollo
- `npm run build` - Construir para producción
- `npm run start` - Servidor de producción
- `npm run lint` - Verificar código con ESLint

## 📱 Guía de Uso

### Para Administradores

1. **Acceder al panel admin:** `/admin`
2. **Generar código de asistencia:**
   - Ir a la pestaña "Dashboard"
   - Hacer clic en "Generar Código Asistencia"
   - Compartir el código de 4 dígitos con los usuarios
3. **Gestionar usuarios:**
   - Pestaña "Usuarios"
   - Ver estado de cada miembro
   - Activar/desactivar usuarios según necesidad
4. **Enviar notificaciones:**
   - Pestaña "Notificaciones"
   - Crear mensajes personalizados
   - Seleccionar tipo y prioridad

### Para Usuarios (Deportistas)

1. **Acceder al dashboard:** `/dashboard`
2. **Marcar asistencia:**
   - Hacer clic en "Marcar Asistencia"
   - Ingresar el código de 4 dígitos del admin
   - Confirmar para registrar la asistencia
3. **Ver notificaciones:** Las notificaciones aparecen automáticamente en el dashboard
4. **Consultar historial:** Ver asistencias y pagos en las secciones correspondientes

## 🔧 Estructura del Código

### Componentes Principales

#### `app/dashboard/page.tsx`
- Dashboard principal para usuarios
- Manejo de estado para asistencias, pagos y notificaciones
- Lógica de marcado de asistencia

#### `app/admin/page.tsx`
- Panel de administración completo
- Gestión de usuarios y códigos de asistencia
- Sistema de notificaciones

#### `lib/auth-context.tsx`
- Contexto de autenticación global
- Manejo de tokens JWT
- Protección de rutas

#### `app/api/`
- Endpoints de API organizados por funcionalidad
- Validación de datos y autenticación
- Respuestas estructuradas

### Patrones de Diseño Utilizados

1. **Context API:** Para estado global de autenticación
2. **Custom Hooks:** Para lógica reutilizable
3. **Component Composition:** Para interfaces modulares
4. **API Routes:** Para backend integrado
5. **TypeScript Interfaces:** Para tipado fuerte

## 🚀 Despliegue

### Opciones de Despliegue

#### Netlify (Recomendado)
1. Conectar repositorio de GitHub
2. Configurar variables de entorno
3. Deploy automático en cada push

#### Vercel
1. Importar proyecto desde GitHub
2. Configurar variables de entorno
3. Deploy con un clic

#### Otros proveedores
- Railway
- Render
- DigitalOcean App Platform

### Variables de Entorno de Producción
```env
JWT_SECRET=secreto_muy_seguro_produccion
NEXT_PUBLIC_API_URL=https://tu-dominio.netlify.app
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
CI=true
```

## 🔮 Mejoras Futuras

### Funcionalidades Pendientes
- [ ] **Base de datos real** (PostgreSQL/MongoDB)
- [ ] **Sistema de pagos** integrado (Stripe/MercadoPago)
- [ ] **Notificaciones push** en tiempo real
- [ ] **App móvil** (PWA o React Native)
- [ ] **Sistema de reservas** para clases
- [ ] **Reportes avanzados** con gráficos
- [ ] **Gestión de empleados** y roles
- [ ] **Sistema de recompensas** y puntos
- [ ] **Chat en tiempo real** con administración
- [ ] **Integración con wearables** (Fitbit, Apple Watch)

### Mejoras Técnicas
- [ ] **Testing automatizado** (Jest, Cypress)
- [ ] **CI/CD pipeline** completo
- [ ] **Optimización de rendimiento**
- [ ] **Internacionalización** (i18n)
- [ ] **Modo offline** con Service Workers
- [ ] **Analytics** y métricas de uso
- [ ] **Backup automático** de datos
- [ ] **Monitoreo** y logging avanzado

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Para contribuir:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Estándares de Código
- Usar TypeScript para todo el código
- Seguir las convenciones de naming de React
- Escribir comentarios para funciones complejas
- Mantener componentes pequeños y reutilizables
- Usar ESLint y Prettier para formateo

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

Si tienes preguntas o necesitas ayuda:

- 📧 Email: tu-email@ejemplo.com
- 🐛 Issues: [GitHub Issues](https://github.com/tu-usuario/plataforma-para-gym/issues)
- 📖 Wiki: [Documentación completa](https://github.com/tu-usuario/plataforma-para-gym/wiki)

---

**Desarrollado con ❤️ para modernizar la gestión de gimnasios**

*Última actualización: Diciembre 2024*