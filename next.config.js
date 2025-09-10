/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [],
  },
  // Suppress hydration warnings for browser extension attributes
  reactStrictMode: true,
  // Add compiler options to suppress hydration warnings
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production',
  },
}

module.exports = nextConfig
