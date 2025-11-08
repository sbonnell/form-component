const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer({
  reactStrictMode: true,
  experimental: {
    appDir: true,
  },
  // Point to demo app directory
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  env: {
    NEXT_PUBLIC_APP_DIR: 'src/demo/app',
  },
})
