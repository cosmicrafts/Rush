// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  modules: ['@nuxt/ui', '@nuxt/image', '@nuxt/scripts', '@nuxt/eslint', '@pinia/nuxt'],
  css: ['./assets/css/main.css'],

  // Enable compression for production builds
  nitro: {
    compressPublicAssets: true,
    minify: true,
  },

  // Disable source maps to prevent preload warnings and improve performance
  sourcemap: false,

  app: {
    head: {
      title: 'Cosmicrafts Rush - On-chain spaceship racing with AI chaos & instant payouts',
      htmlAttrs: {
        lang: 'en',
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: 'Bet on AI spaceships, watch chaos unfold, and claim your winnings on-chain!',
        },
        {
          'http-equiv': 'Content-Security-Policy',
          content: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' https://fonts.gstatic.com",
            "img-src 'self' data: https: blob:",
            "connect-src 'self' https://dream-rpc.somnia.network https://api.coingecko.com wss:",
            "frame-src 'self'",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'",
            "upgrade-insecure-requests"
          ].join('; ')
        },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap',
          media: 'print',
          onload: "this.media='all'",
        },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.svg' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon.svg' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon.svg' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/favicon.svg' },
      ],
    },
  },
  runtimeConfig: {
    public: {
      // Contract Addresses (from environment variables)
      spaceshipRaceAddress: process.env.SPACESHIP_RACE_ADDRESS || '',
      spiralTokenAddress: process.env.SPIRAL_TOKEN_ADDRESS || '',
      achievementNFTAddress: process.env.ACHIEVEMENT_NFT_ADDRESS || '',
      shipConfigurationAddress: process.env.SHIP_CONFIGURATION_ADDRESS || '',
      chaosManagerAddress: process.env.CHAOS_MANAGER_ADDRESS || '',

      // Network Configuration
      somniaRpcUrl: process.env.SOMNIA_RPC_URL || 'https://dream-rpc.somnia.network/',
      somniaChainId: process.env.SOMNIA_CHAIN_ID || '0xc478',
      somniaChainName: process.env.SOMNIA_CHAIN_NAME || 'Somnia Testnet',
    },
  },
})
