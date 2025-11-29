/** @type {import('next').NextConfig} */
const nextConfig = {
  assetPrefix: process.env.NODE_ENV === 'development' ? 'https://6000-firebase-studio-1762091182014.cluster-rhptpnrfenhe4qarq36djxjqmg.cloudworkstations.dev' : undefined,
  experimental: {
    // This is required for `allowedDevOrigins` to work.
    serverActions: {
      allowedOrigins: ['6000-firebase-studio-1762091182014.cluster-rhptpnrfenhe4qarq36djxjqmg.cloudworkstations.dev'],
    },
  },
};

export default nextConfig;
