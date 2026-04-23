/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['pdf-parse'],
  images: {
    remotePatterns: [],
  },
}

module.exports = nextConfig
