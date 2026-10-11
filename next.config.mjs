/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Little Farm Island (Gloop Plus) is een los spel in public/plus/little-farm-island/.
  async rewrites() {
    return [{ source: '/plus/little-farm-island', destination: '/plus/little-farm-island/index.html' }];
  },
  async headers() {
    return [{ source: '/vendor/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] }];
  },
};
export default nextConfig;
