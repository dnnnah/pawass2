import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  agentRules: false,
  poweredByHeader: false,
  reactStrictMode: true,
  devIndicators: false,
  allowedDevOrigins: ['127.0.0.1'],
  experimental: {
    // Evita mezclar el CSS de portada con la cabecera que comparten otras rutas.
    cssChunking: false,
    serverActions: { bodySizeLimit: '4mb' },
  },
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
