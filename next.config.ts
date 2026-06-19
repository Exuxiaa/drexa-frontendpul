import type { NextConfig } from "next";

const apiBaseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080").replace(/\/$/, "");

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Pin the workspace root to this folder. Otherwise Next walks up the tree
  // looking for a lockfile and can pick a stray one in a parent dir (e.g. an
  // accidental Tubes/package-lock.json), which makes Turbopack panic with
  // "Resource path ... needs to be on project filesystem drexa-frontend".
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "coin-images.coingecko.com",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiBaseUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
