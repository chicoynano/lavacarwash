import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
   experimental: {
    serverActions: {
        bodySizeLimit: '2mb', // Optional: Adjust body size limit if needed
        allowedOrigins: [], // Optional: Specify allowed origins if necessary
    },
  },
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
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
