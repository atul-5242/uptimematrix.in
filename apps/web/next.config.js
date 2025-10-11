/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use default/standalone output so middleware and API routes work
  // output: 'export', // removed because static export does not support middleware or API routes
  experimental: {
    serverActions: true,
    instrumentationHook: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  // Disable telemetry to avoid file permission issues on Windows
  telemetry: false,
};

module.exports = nextConfig;