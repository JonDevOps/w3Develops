/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.freecodecamp.org',
      },
    ],
  },
};

export default nextConfig;
