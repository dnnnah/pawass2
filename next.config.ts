import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  devIndicators: false,
  allowedDevOrigins: ['127.0.0.1'],
  experimental: { serverActions: { bodySizeLimit: '12mb' } },
  async headers() {
    return [{
      source: '/service-worker.js',
      headers: [
        { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
        { key: 'Service-Worker-Allowed', value: '/' },
      ],
    }];
  },
};
export default nextConfig;
