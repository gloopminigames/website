/** @type {import('next').NextConfig} */
// Gloop XL is een aparte site (repo gloop-xl). Gloop toont hem ook op /xl/, zodat hij in de
// Gloop-app gewoon in de app opent (een ander domein opent op iPhone in een browservenster).
// Lokaal testen: GLOOP_XL_PROXY=http://localhost:4600
const XL = (process.env.GLOOP_XL_PROXY || 'https://gloop-xl.vercel.app').replace(/\/$/, '');
const nextConfig = {
  reactStrictMode: true,
  // Nodig voor /xl/: de XL-pagina's gebruiken paden ten opzichte van /xl/.
  skipTrailingSlashRedirect: true,
  async redirects() {
    return [
      { source: '/plus', destination: '/xl/', permanent: false },
      { source: '/plus/little-farm-island', destination: '/xl/little-farm-island', permanent: false },
    ];
  },
  async rewrites() {
    return {
      beforeFiles: [
        { source: '/xl', destination: XL + '/' },   // ook /xl/ (de XL-pagina's zetten zelf hun basis op /xl/)
        { source: '/xl/:path+', destination: XL + '/:path+' },
      ],
    };
  },
};
export default nextConfig;
