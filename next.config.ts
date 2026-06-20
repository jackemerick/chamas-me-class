import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Define o root do projeto para evitar conflito com lockfiles do monorepo
  turbopack: {
    root: path.resolve(__dirname),
  },
  // Necessario para @react-pdf/renderer (usa canvas no servidor)
  serverExternalPackages: ["@react-pdf/renderer"],

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
