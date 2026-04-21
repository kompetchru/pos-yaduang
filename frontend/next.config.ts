import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "http://26.250.186.155:3001",
    "http://192.168.56.1:3001",
    "http://172.20.10.8:3001",
  ],
};

export default nextConfig;
