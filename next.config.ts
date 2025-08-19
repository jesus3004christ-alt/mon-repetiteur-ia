import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Ne pas résoudre les modules Node.js côté client
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false, // Ajouté
        tls: false, // Ajouté
        net: false, // Ajouté
        async_hooks: false,
      };
    }

    return config;
  },
};

export default nextConfig;
