/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configurações essenciais
  reactStrictMode: true,
  swcMinify: true,
  
  // Configurações de build
  output: 'standalone',
  
  // Configurações de imagem
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.telegram.org',
        port: '',
        pathname: '/file/**',
      },
    ],
    unoptimized: false,
  },

  // Configurações de headers de segurança
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },

  // Configurações de redirecionamento
  async redirects() {
    return [
      {
        source: '/',
        destination: '/login',
        permanent: false,
      },
    ]
  },

  // Configurações experimentais
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
    ],
  },

  // Configurações de webpack
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Configurações personalizadas do webpack
    if (!dev && !isServer) {
      config.optimization.splitChunks.chunks = 'all'
    }
    
    return config
  },

  // Variables de ambiente públicas
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Transpilação de pacotes
  transpilePackages: [],
}

module.exports = nextConfig 