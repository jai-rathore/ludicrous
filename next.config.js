/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  images: {
    domains: ['lh3.googleusercontent.com'],  // For Google auth profile images
  },
  experimental: {
    typedRoutes: true,
  },
  poweredByHeader: false,
}

module.exports = nextConfig
