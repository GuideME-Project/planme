import { resolve } from "node:path";
import type { NextConfig } from "next";

const devAllowedOrigin =
  process.env.NODE_ENV === "development"
    ? process.env.PLANME_DEV_ALLOWED_ORIGIN?.trim()
    : undefined;

const nextConfig: NextConfig = {
  // Docker image runs the traced standalone server; the monorepo root is traced so @planme/core is included.
  output: "standalone",
  outputFileTracingRoot: resolve(import.meta.dirname, "../.."),
  transpilePackages: ["@planme/core"],
  allowedDevOrigins: devAllowedOrigin
    ? [devAllowedOrigin.replace(/:\d+$/, "")]
    : undefined,
  experimental: {
    serverActions: {
      // Cloudflare's 8443 origin port reaches the app as Host `www.planme.kr:8443`, so the public origin is allowed explicitly.
      // Hardcoded because standalone builds bake this config in, and PLANME_WEB_ORIGIN only exists at runtime.
      allowedOrigins: ["www.planme.kr", ...(devAllowedOrigin ? [devAllowedOrigin] : [])],
    },
  },
};

export default nextConfig;
