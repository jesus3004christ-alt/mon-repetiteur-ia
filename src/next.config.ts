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
    // Exclude async_hooks from client-side bundle
    if (!isServer) {
        config.resolve.fallback = {
            ...config.resolve.fallback,
            async_hooks: false,
        };
    }

    return config;
  },
};

export default nextConfig;
