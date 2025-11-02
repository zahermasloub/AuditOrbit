// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compiler: {
    styledComponents: true,
  },
  experimental: {
    optimizeCss: true,
  },
  async redirects() {
    return [
      // إعادة توجيه الصفحات المكررة
      {
        source: '/admin/reports',
        destination: '/reports',
        permanent: true,
      },
      {
        source: '/manager/reports',
        destination: '/reports',
        permanent: true,
      },
      {
        source: '/admin/engagements',
        destination: '/engagements',
        permanent: true,
      },
      {
        source: '/manager/engagements',
        destination: '/engagements',
        permanent: true,
      },
    ];
  },
  images: {
    domains: ['localhost'],
  },
  env: {
    APP_VERSION: '2.0.0',
    RESTRUCTURE_PHASE: 'UI/UX',
  },
}

module.exports = nextConfig