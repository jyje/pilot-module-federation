import type { NextConfig } from 'next';

const REMOTE_ORIGIN = process.env.NEXT_PUBLIC_NEXT_REMOTE_ORIGIN ?? 'http://127.0.0.1:3001';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@pilot/contracts', '@pilot/fixtures', '@pilot/design-tokens'],
  webpack(config, { isServer }) {
    // Both compilations must resolve the federated import statically — Next
    // still bundles the `import()` call for its server pass even though the
    // component only ever renders client-side (React.lazy). See
    // spikes/next-raw-federation for the "Module not found" failure this
    // avoids.
    if (!isServer) {
      config.output.uniqueName = 'next_host';
      config.optimization.runtimeChunk = false;
    }
    // Reaches Next's own bundled webpack — see next/remote/next.config.ts.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { webpack } = require('next/dist/compiled/webpack/webpack');
    config.plugins.push(
      new webpack.container.ModuleFederationPlugin({
        name: isServer ? 'next_host_server' : 'next_host',
        remotes: {
          next_remote: `next_remote@${REMOTE_ORIGIN}/_next/static/chunks/remoteEntry.js`,
        },
      }),
    );
    return config;
  },
};

export default nextConfig;
