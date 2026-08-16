import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  reactStrictMode: true,
  transpilePackages: ["@cube-practice/scramble", "@cube-practice/timer-domain"],
};

export default nextConfig;
