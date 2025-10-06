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
  
  // Configuración para Netlify - usar static export solo si es necesario
  ...(process.env.NETLIFY === 'true' ? {
    output: 'export',
    trailingSlash: true,
    skipTrailingSlashRedirect: true,
  } : {
    trailingSlash: true,
    skipTrailingSlashRedirect: true,
  }),
}

module.exports = nextConfig