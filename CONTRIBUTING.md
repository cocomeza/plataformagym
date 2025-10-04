# 🤝 Guía de Contribución

¡Gracias por tu interés en contribuir a la Plataforma de Gestión de Gimnasio! Este documento te guiará a través del proceso de contribución.

## 📋 Tabla de Contenidos

- [🎯 Cómo Contribuir](#-cómo-contribuir)
- [🛠️ Configuración del Entorno](#️-configuración-del-entorno)
- [📝 Estándares de Código](#-estándares-de-código)
- [🔄 Flujo de Trabajo](#-flujo-de-trabajo)
- [🐛 Reportar Bugs](#-reportar-bugs)
- [💡 Solicitar Funcionalidades](#-solicitar-funcionalidades)
- [📚 Documentación](#-documentación)
- [❓ Preguntas Frecuentes](#-preguntas-frecuentes)

## 🎯 Cómo Contribuir

### Tipos de Contribuciones

1. **🐛 Reportar Bugs**
   - Usa el template de bug report
   - Incluye pasos para reproducir
   - Proporciona información del sistema

2. **💡 Sugerir Funcionalidades**
   - Usa el template de feature request
   - Explica el problema que resuelve
   - Incluye mockups si es posible

3. **🔧 Mejorar Código**
   - Fork del repositorio
   - Crear rama para tu feature
   - Enviar pull request

4. **📚 Mejorar Documentación**
   - Corregir errores tipográficos
   - Agregar ejemplos
   - Mejorar explicaciones

## 🛠️ Configuración del Entorno

### Prerrequisitos

- Node.js 18+ 
- npm o yarn
- Git
- Editor de código (VS Code recomendado)

### Pasos de Configuración

1. **Fork del repositorio**
```bash
# Ve a GitHub y haz fork del repositorio
# Luego clona tu fork localmente
git clone https://github.com/TU-USUARIO/plataforma-para-gym.git
cd plataforma-para-gym
```

2. **Configurar upstream**
```bash
git remote add upstream https://github.com/USUARIO-ORIGINAL/plataforma-para-gym.git
```

3. **Instalar dependencias**
```bash
cd frontend
npm install
```

4. **Configurar variables de entorno**
```bash
cp .env.local.example .env.local
# Edita .env.local con tus configuraciones
```

5. **Ejecutar en modo desarrollo**
```bash
npm run dev
```

## 📝 Estándares de Código

### TypeScript

- **Usa TypeScript** para todo el código nuevo
- **Define interfaces** para objetos complejos
- **Evita `any`** - usa tipos específicos
- **Usa enums** para constantes relacionadas

```typescript
// ✅ Bueno
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'deportista';
}

// ❌ Malo
const user: any = {
  id: 123,
  name: 'Juan'
};
```

### React

- **Usa functional components** con hooks
- **Nombra componentes** en PascalCase
- **Usa props tipadas** con interfaces
- **Extrae lógica** a custom hooks cuando sea apropiado

```tsx
// ✅ Bueno
interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({ 
  onClick, 
  children, 
  variant = 'primary' 
}) => {
  return (
    <button 
      onClick={onClick}
      className={`btn btn-${variant}`}
    >
      {children}
    </button>
  );
};

// ❌ Malo
export function Button(props) {
  return <button onClick={props.onClick}>{props.children}</button>;
}
```

### CSS/Tailwind

- **Usa Tailwind CSS** para estilos
- **Crea componentes reutilizables** en lugar de duplicar clases
- **Usa variables CSS** para valores que se repiten
- **Mantén consistencia** en espaciado y colores

```tsx
// ✅ Bueno - Componente reutilizable
export const Card: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="bg-white rounded-lg shadow-md p-6">
    {children}
  </div>
);

// ❌ Malo - Clases repetidas
<div className="bg-white rounded-lg shadow-md p-6">...</div>
<div className="bg-white rounded-lg shadow-md p-6">...</div>
```

### Naming Conventions

- **Archivos:** kebab-case (`user-profile.tsx`)
- **Componentes:** PascalCase (`UserProfile`)
- **Funciones:** camelCase (`getUserData`)
- **Constantes:** UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Variables:** camelCase (`userName`)

### Estructura de Archivos

```
components/
├── ui/              # Componentes básicos reutilizables
│   ├── Button.tsx
│   ├── Input.tsx
│   └── Modal.tsx
├── forms/           # Formularios específicos
│   ├── LoginForm.tsx
│   └── RegisterForm.tsx
└── layout/          # Componentes de layout
    ├── Header.tsx
    └── Sidebar.tsx
```

## 🔄 Flujo de Trabajo

### 1. Crear una Rama

```bash
# Asegúrate de estar en main y actualizado
git checkout main
git pull upstream main

# Crea una nueva rama
git checkout -b feature/nombre-de-la-funcionalidad
# o
git checkout -b bugfix/descripcion-del-bug
# o  
git checkout -b docs/mejora-documentacion
```

### 2. Hacer Cambios

- **Haz commits pequeños** y frecuentes
- **Usa mensajes descriptivos** en inglés
- **Un commit por concepto** lógico

```bash
# ✅ Buenos mensajes de commit
git commit -m "feat: add user profile page"
git commit -m "fix: resolve login validation bug"
git commit -m "docs: update installation guide"
git commit -m "style: improve button hover effects"

# ❌ Malos mensajes de commit
git commit -m "fix"
git commit -m "update"
git commit -m "changes"
```

### 3. Testing

```bash
# Ejecutar linter
npm run lint

# Ejecutar build
npm run build

# Ejecutar tests (cuando estén disponibles)
npm test
```

### 4. Push y Pull Request

```bash
# Push de tu rama
git push origin feature/nombre-de-la-funcionalidad

# Crear Pull Request en GitHub
# Asegúrate de:
# - Llenar la descripción del PR
# - Referenciar issues relacionados
# - Agregar screenshots si es UI
# - Solicitar review de maintainers
```

### 5. Review Process

- **Revisa tu propio código** antes de solicitar review
- **Responde a comentarios** de manera constructiva
- **Haz los cambios sugeridos** o explica por qué no
- **Mantén el PR actualizado** con la rama main

## 🐛 Reportar Bugs

### Template de Bug Report

Usa el template en `.github/ISSUE_TEMPLATE/bug_report.md`:

1. **Descripción clara** del problema
2. **Pasos para reproducir** el bug
3. **Comportamiento esperado** vs actual
4. **Información del sistema** (OS, navegador, etc.)
5. **Capturas de pantalla** si aplica
6. **Logs de error** si están disponibles

### Severidad de Bugs

- **🔴 Crítica:** Aplicación no funciona
- **🟡 Alta:** Funcionalidad principal afectada  
- **🟢 Media:** Funcionalidad secundaria afectada
- **🔵 Baja:** Problema menor

## 💡 Solicitar Funcionalidades

### Template de Feature Request

Usa el template en `.github/ISSUE_TEMPLATE/feature_request.md`:

1. **Descripción de la funcionalidad**
2. **Problema que resuelve**
3. **Solución propuesta**
4. **Consideraciones técnicas**
5. **Impacto esperado**
6. **Criterios de aceptación**

### Proceso de Evaluación

1. **Triage inicial** - Los maintainers revisan la solicitud
2. **Discusión comunitaria** - Feedback de otros contributors
3. **Priorización** - Se asigna prioridad basada en impacto
4. **Asignación** - Se asigna a un milestone específico
5. **Desarrollo** - Un contributor implementa la funcionalidad

## 📚 Documentación

### Tipos de Documentación

- **README.md** - Introducción y setup básico
- **CONTRIBUTING.md** - Esta guía
- **ROADMAP.md** - Planes futuros
- **API.md** - Documentación de APIs
- **DEPLOYMENT.md** - Guías de despliegue

### Estándares de Documentación

- **Usa Markdown** para toda la documentación
- **Incluye ejemplos** de código cuando sea apropiado
- **Mantén actualizada** la documentación con los cambios
- **Usa emojis** para hacer la documentación más atractiva
- **Escribe en español** para mayor accesibilidad

## ❓ Preguntas Frecuentes

### ¿Cómo empiezo a contribuir?

1. **Lee la documentación** completa
2. **Explora el código** existente
3. **Busca issues** marcados como "good first issue"
4. **Empieza con algo pequeño** como documentación o bugs menores

### ¿Qué hago si tengo dudas?

- **Revisa la documentación** existente
- **Busca en issues** cerrados si alguien ya preguntó
- **Abre un issue** con la etiqueta "question"
- **Únete a discusiones** en issues abiertos

### ¿Cómo sé si mi contribución es valiosa?

- **Lee las guidelines** del proyecto
- **Revisa el roadmap** para entender prioridades
- **Participa en discusiones** antes de empezar a codificar
- **Pregunta a los maintainers** si tienes dudas

### ¿Qué pasa si mi PR es rechazado?

- **No te desanimes** - es parte del proceso
- **Lee los comentarios** cuidadosamente
- **Haz las mejoras sugeridas**
- **Pregunta si algo no está claro**
- **Reenvía el PR** con las mejoras

## 🏆 Reconocimientos

### Contributors

Gracias a todos los que han contribuido al proyecto:

- [@tu-usuario](https://github.com/tu-usuario) - Creador y maintainer principal
- [Contributors adicionales se listarán aquí]

### Cómo Reconocer Contribuciones

- **Menciones en releases** para contribuciones significativas
- **Badge de contributor** en el README
- **Menciones en documentación** para mejoras importantes
- **Invitación como collaborator** para contribuidores frecuentes

## 📞 Contacto

- **Issues:** [GitHub Issues](https://github.com/tu-usuario/plataforma-para-gym/issues)
- **Discussions:** [GitHub Discussions](https://github.com/tu-usuario/plataforma-para-gym/discussions)
- **Email:** tu-email@ejemplo.com

---

**¡Gracias por contribuir y hacer este proyecto mejor para todos! 🚀**
