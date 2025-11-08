const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer({
  reactStrictMode: true,
  // appDir is now stable in Next.js 16 - no longer experimental
  turbopack: {}, // Explicitly enable Turbopack (default in Next.js 16)
  // Point to demo app directory
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  env: {
    NEXT_PUBLIC_APP_DIR: 'src/demo/app',
  },
})
