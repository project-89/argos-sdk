/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    externalDir: true,
  },
  webpack: (config, { isServer }) => {
    // Prevent client-side bundling of server-only modules
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        crypto: false,
        path: false,
      };
    }

    return config;
  },
};

module.exports = nextConfig;
