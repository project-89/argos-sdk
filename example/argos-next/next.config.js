/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@project89/argos-sdk'],
  webpack: (config, { webpack }) => {
    // Add fallbacks for node modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      encoding: false,
      stream: false,
      util: false,
      fs: false,
      buffer: require.resolve('buffer/'),
    };

    // Add global object polyfill
    config.plugins.push(
      new webpack.ProvidePlugin({
        global: ['globalThis'],
      })
    );

    return config;
  },
};

module.exports = nextConfig;
