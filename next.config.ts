import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["@mantine/core", "@mantine/hooks"],
  },
  outputFileTracingIncludes: {
    "/": ["./data/jmdict.json", "./data/jlpt-map.json"],
    "/search": ["./data/jmdict.json", "./data/jlpt-map.json"],
    "/word/[id]": ["./data/jmdict.json", "./data/jlpt-map.json"],
    "/quiz": ["./data/jmdict.json", "./data/jlpt-map.json"],
    "/grammar/[id]": ["./data/grammar.json"],
    "/grammar": ["./data/grammar.json"],
  },
  serverExternalPackages: ["better-sqlite3", "kuroshiro", "kuroshiro-analyzer-kuromoji", "kuromoji", "nodejs-whisper"],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    return config;
  },
};

export default nextConfig;
