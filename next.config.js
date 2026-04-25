/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: [
    'pdf-parse',
    'pdfjs-dist',
    'tesseract.js',
    '@napi-rs/canvas',
    '@napi-rs/canvas-win32-x64-msvc',
    '@napi-rs/canvas-win32-arm64-msvc',
  ],
  images: {
    remotePatterns: [],
  },
}

module.exports = nextConfig
