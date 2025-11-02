// next.config.js - إضافة إعادة التوجيه
/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      // إعادة توجيه صفحات التقارير القديمة
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
        source: '/auditor/reports',
        destination: '/reports',
        permanent: true,
      },
      // إعادة توجيه صفحات المشاريع القديمة
      {
        source: '/admin/engagements',
        destination: '/engagements',
        permanent: true,
      },
      {
        source: '/manager/engagements',
        destination: '/engagements',
        permanent: true,
      }
    ];
  },
  env: {
    APP_VERSION: '2.0.0',
  },
}

module.exports = nextConfig;