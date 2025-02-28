import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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

export default nextConfig;
