import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 2678400,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.r2.dev",
        port: "",
      },
      {
        protocol: "https",
        hostname: "**.r2.cloudflarestorage.com",
        port: "",
      },
    ],
  },
};

export default nextConfig;