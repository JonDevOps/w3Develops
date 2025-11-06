import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  experimental: {
    allowedDevOrigins: [
      'https://6000-firebase-studio-1762091182014.cluster-rhptpnrfenhe4qarq36djxjqmg.cloudworkstations.dev',
    ],
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/account',
        permanent: false,
        has: [
          {
            type: 'cookie',
            key: 'idToken',
          },
        ],
      },
      {
        source: '/account',
        destination: '/login',
        permanent: false,
        missing: [
          {
            type: 'cookie',
            key: 'idToken',
          },
        ],
      },
    ]
  },
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
