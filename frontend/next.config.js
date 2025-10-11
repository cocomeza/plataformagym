/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Configuración de imágenes
  images: {
    domains: ['images.unsplash.com', 'i.postimg.cc'],
    unoptimized: true, // Para Netlify
  },
  
  // Configuración de webpack para alias
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname),
    };
    return config;
  },
  
  // Configuración para Netlify - sin static export para que funcionen las API routes
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
}

module.exports = nextConfig