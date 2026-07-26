import type { NextConfig } from 'next';

const remoteOrigin = process.env.NEXT_PUBLIC_NEXT_OBSERVABILITY_ORIGIN ?? 'http://127.0.0.1:4001';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@pilot/contracts', '@pilot/design-tokens'],
  async headers() {
    return [{ source: '/_next/static/:path*', headers: [{ key: 'Access-Control-Allow-Origin', value: '*' }] }];
  },
  async rewrites() {
    return [{ source: '/api/:path*', destination: 'http://127.0.0.1:8787/api/:path*' }];
  },
  webpack(config, { isServer }) {
    if (!isServer) {
      config.output.publicPath = `${remoteOrigin}/_next/`;
      config.output.uniqueName = 'next_observability';
      config.optimization.runtimeChunk = false;
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { webpack } = require('next/dist/compiled/webpack/webpack');
      config.plugins.push(new webpack.container.ModuleFederationPlugin({
        name: 'next_observability', filename: 'static/chunks/remoteEntry.js',
        exposes: { './ObservabilityRemote': './components/federated-hello.tsx' },
      }));
    }
    return config;
  },
};

export default nextConfig;
