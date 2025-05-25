/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'up3jqjm12xqtzx6s.public.blob.vercel-storage.com',
      },
    ],
  },
};

module.exports = nextConfig;