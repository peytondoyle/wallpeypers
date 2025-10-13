/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'up3jqjm12xqtzx6s.public.blob.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: 'pub-a0f86dca503044cda0278eb6bafbe7d9.r2.dev',
      },
    ],
  },
};

module.exports = nextConfig;