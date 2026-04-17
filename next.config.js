/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse'],
  },
  images: {
    remotePatterns: [],
  },
}

module.exports = nextConfig
