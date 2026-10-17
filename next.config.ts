import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        port: "",
      },
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