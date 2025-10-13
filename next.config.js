/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Configuración de imágenes optimizada para Vercel
  images: {
    domains: ['images.unsplash.com', 'i.postimg.cc'],
    // Removido unoptimized para mejor rendimiento en Vercel
  },
  
  // Configuración de webpack para alias
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname),
    };
    return config;
  },
  
  // Configuración optimizada para Vercel
  // Removido trailingSlash para mejor compatibilidad
}

module.exports = nextConfig