# 🚀 Configurar Git LFS para Imágenes Grandes

## 📋 Pasos para Configurar Git LFS:

### **1. Instalar Git LFS:**
```bash
# Windows (con Chocolatey)
choco install git-lfs

# O descargar desde: https://git-lfs.github.io/
```

### **2. Configurar en el Repositorio:**
```bash
# Inicializar Git LFS
git lfs install

# Configurar para imágenes
git lfs track "*.jpg"
git lfs track "*.jpeg"
git lfs track "*.png"
git lfs track "*.gif"
git lfs track "*.webp"

# Agregar .gitattributes
git add .gitattributes
git commit -m "feat: Configurar Git LFS para imágenes"

# Push inicial
git push origin main
```

### **3. Subir Imágenes:**
```bash
# Agregar imágenes
git add frontend/public/images/*.jpg
git commit -m "feat: Agregar imágenes del gimnasio"
git push origin main
```

## ⚠️ Importante:
- Git LFS tiene límites en GitHub (1GB para repos gratuitos)
- Es mejor optimizar las imágenes primero
- Si las imágenes son < 100MB, no necesitas Git LFS
