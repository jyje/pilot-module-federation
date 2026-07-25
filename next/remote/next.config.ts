import type { NextConfig } from 'next';

const REMOTE_ORIGIN = process.env.NEXT_PUBLIC_NEXT_REMOTE_ORIGIN ?? 'http://127.0.0.1:3001';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@pilot/contracts', '@pilot/fixtures', '@pilot/design-tokens'],
  async headers() {
    return [
      {
        source: '/_next/static/:path*',
        headers: [{ key: 'Access-Control-Allow-Origin', value: '*' }],
      },
      {
        source: '/_next/static/chunks/remoteEntry.js',
        headers: [{ key: 'Cache-Control', value: 'no-store' }],
      },
    ];
  },
  webpack(config, { isServer }) {
    if (!isServer) {
      // Federation containers need a runtime prelude, a unique chunk-loading
      // global, and an absolute publicPath — see spikes/next-raw-federation
      // for why each of these is required on Next specifically.
      config.output.publicPath = `${REMOTE_ORIGIN}/_next/`;
      config.output.uniqueName = 'next_remote';
      config.optimization.runtimeChunk = false;
      // Reaches Next's own bundled webpack (no ESM-importable types) rather than
      // an extra `webpack` devDependency that could drift from Next's internal version.
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { webpack } = require('next/dist/compiled/webpack/webpack');
      config.plugins.push(
        new webpack.container.ModuleFederationPlugin({
          name: 'next_remote',
          filename: 'static/chunks/remoteEntry.js',
          exposes: {
            './FederatedMonitor': './components/federated-monitor.tsx',
          },
        }),
      );
    }
    return config;
  },
};

export default nextConfig;
