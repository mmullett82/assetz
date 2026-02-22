import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Enforce strict React mode
  reactStrictMode: true,

  // PWA: service worker is in public/sw.js and registered client-side.
  // For production, consider next-pwa or @ducanh2912/next-pwa for
  // advanced caching strategies and auto-precaching.

  // Allow images from the backend (update host when Grant's deployment URL is known)
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/**',
      },
    ],
  },
}

export default nextConfig
