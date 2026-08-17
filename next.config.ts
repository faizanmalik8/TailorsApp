import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
});

const nextConfig: NextConfig = {
  allowedDevOrigins: ['10.41.153.182', '192.168.1.12'],
};

export default withSerwist(nextConfig);
