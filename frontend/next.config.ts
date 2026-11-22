import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const nodeRuntime = process.env.HEARTHEARTART_RUNTIME === "node";
const cardSourceName = nodeRuntime ? "postgres-cards.ts" : "d1-cards.ts";
const cardSource = `./lib/${cardSourceName}`;

const nextConfig: NextConfig = {
  ...(nodeRuntime ? { output: "standalone" as const } : {}),
  serverExternalPackages: ["pg"],
  images: {
    formats: ["image/avif", "image/webp"],
  },
  turbopack: {
    resolveAlias: {
      "@/lib/card-source": cardSource,
    },
  },
  webpack: (config) => {
    const alias = config.resolve?.alias;
    const objectAlias = alias && !Array.isArray(alias) ? alias : {};
    config.resolve = config.resolve ?? {};
    config.resolve.alias = {
      ...objectAlias,
      "@/lib/card-source": path.join(root, "lib", cardSourceName),
    };
    return config;
  },
};

if (!nodeRuntime) {
  void import("@opennextjs/cloudflare").then((mod) => {
    mod.initOpenNextCloudflareForDev();
  });
}

export default nextConfig;
