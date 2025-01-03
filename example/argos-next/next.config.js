/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@project89/argos-sdk'],
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      util: require.resolve('util/'),
      buffer: require.resolve('buffer/'),
      punycode: require.resolve('punycode/'),
    };
    return config;
  },
};

module.exports = nextConfig;
