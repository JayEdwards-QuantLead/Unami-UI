const { withSentryConfig } = require('@sentry/nextjs')
const withTM = require('next-transpile-modules')([
  'react-markdown',
  '@solana/wallet-adapter-base',
  '@solana/wallet-adapter-phantom',
  '@solana/wallet-adapter-sollet',
])
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

let config = withTM({
  swcMinify: true,
  experimental: { emotion: true },
  webpack: (config, { isServer }) => {
    config.experiments = { asyncWebAssembly: true, layers: true }
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    })
    if (!isServer) {
      config.module.rules.push({
        test: /DriftStakeVoterPlugin\/idl\/drift\.ts$/,
        loader: 'null-loader',
      })
      config.resolve.fallback.fs = false
    }
    return config
  },
  pageExtensions: ['mdx', 'md', 'jsx', 'tsx', 'api.ts'],
  reactStrictMode: true,
  productionBrowserSourceMaps: true,
  env: {
    MAIN_VIEW_SHOW_MAX_TOP_TOKENS_NUM: process.env.MAIN_VIEW_SHOW_MAX_TOP_TOKENS_NUM,
    DISABLE_NFTS: process.env.DISABLE_NFTS,
    REALM: process.env.REALM,
    MAINNET_RPC: process.env.MAINNET_RPC,
    DEVNET_RPC: process.env.DEVNET_RPC,
    DEFAULT_GOVERNANCE_PROGRAM_ID: process.env.DEFAULT_GOVERNANCE_PROGRAM_ID,
  },
  rewrites: async () => [
    {
      source: '/openSerumApi/:path*',
      destination: 'https://openserum.io/api/serum/:path*',
    },
  ],
})

config = withBundleAnalyzer(config)
if (process.env.SENTRY_AUTH_TOKEN) {
  config = withSentryConfig(config, { silent: true })
}

module.exports = config
