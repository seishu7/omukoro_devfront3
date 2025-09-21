//import type { NextConfig } from "next";

//const nextConfig: NextConfig = {
 // output: 'standalone',
//};

//export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  env: {
    NEXT_PUBLIC_API_ENDPOINT: process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_ENDPOINT || 'https://aps-omu-02.azurewebsites.net',
  },
  // 環境変数をビルド時に確実に読み込む
  // experimental: {
  //  esmExternals: 'loose',
  //},
};

export default nextConfig;
