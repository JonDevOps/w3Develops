/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
  },
  output: 'standalone',
  // The `allowedDevOrigins` setting is still experimental and may change in the future.
  allowedDevOrigins: [
    'https://6000-firebase-studio-1762091182014.cluster-rhptpnrfenhe4qarq36djxjqmg.cloudworkstations.dev',
  ],
};

export default nextConfig;
