import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.192.130", "192.168.192.85"],
<<<<<<< HEAD
  output: 'standalone',
  distDir: '.next',
  images: {
    unoptimized: true,
  },
=======
>>>>>>> origin/my-local-branch
};

export default nextConfig;
