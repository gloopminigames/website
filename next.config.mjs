/** @type {import('next').NextConfig} */
const XL = 'https://gloop-xl.vercel.app';  // zelfde adres als SITE.xlUrl in lib/site.js
const nextConfig = {
  reactStrictMode: true,
  // Gloop Plus stond heel even op Gloop zelf; nu is het de aparte site Gloop XL.
  async redirects() {
    return [
      { source: '/plus', destination: XL, permanent: false },
      { source: '/plus/little-farm-island', destination: XL + '/little-farm-island', permanent: false },
      { source: '/xl', destination: XL, permanent: false },
    ];
  },
};
export default nextConfig;
