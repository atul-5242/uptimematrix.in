/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use default/standalone output so middleware and API routes work
  // output: 'export', // removed because static export does not support middleware or API routes
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
};

module.exports = nextConfig;
