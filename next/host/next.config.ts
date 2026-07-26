import type { NextConfig } from 'next';

const observabilityOrigin = process.env.NEXT_PUBLIC_NEXT_OBSERVABILITY_ORIGIN ?? 'http://127.0.0.1:4001';
const governanceOrigin = process.env.NEXT_PUBLIC_NEXT_GOVERNANCE_ORIGIN ?? 'http://127.0.0.1:4002';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@pilot/contracts', '@pilot/design-tokens'],
  async rewrites() {
    return [{ source: '/api/:path*', destination: 'http://127.0.0.1:8787/api/:path*' }];
  },
  webpack(config, { isServer }) {
    if (!isServer) {
      config.output.uniqueName = 'next_host';
      config.optimization.runtimeChunk = false;
    }
    // Use Next's bundled webpack so its Module Federation runtime matches Next.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { webpack } = require('next/dist/compiled/webpack/webpack');
    config.plugins.push(new webpack.container.ModuleFederationPlugin({
      name: isServer ? 'next_host_server' : 'next_host',
      remotes: {
        next_observability: `next_observability@${observabilityOrigin}/_next/static/chunks/remoteEntry.js`,
        next_governance: `next_governance@${governanceOrigin}/_next/static/chunks/remoteEntry.js`,
      },
    }));
    return config;
  },
};

export default nextConfig;
