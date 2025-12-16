import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   experimental: {
//     appDir: true,
//   }
// };


const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
        pathname: '/**',
      },
    ],
  },

};


export default nextConfig;
