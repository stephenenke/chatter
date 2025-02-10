import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Explicitly set the source directory structure
  distDir: '.next'
};

export default nextConfig;