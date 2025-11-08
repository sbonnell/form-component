const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer({
  reactStrictMode: true,
  // appDir is now stable in Next.js 16 - no longer experimental
  turbopack: {}, // Explicitly enable Turbopack (default in Next.js 16)
  // App directory contains pages and demo folder
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
})
