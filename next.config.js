/** @type {import('next').NextConfig} */
const nextConfig = {
  // 生产环境配置 - 启用完整功能
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  images: {
    domains: ['localhost', '172.16.104.203', '34.80.213.213'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  // 启用API路由
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ]
  },
  // 生产环境优化
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
}

module.exports = nextConfig
