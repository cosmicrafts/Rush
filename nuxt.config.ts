// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  modules: [
    '@nuxt/ui',
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxt/eslint',
    '@pinia/nuxt'
  ],
  css: [
    './assets/css/main.css'
  ],
  app: {
    head: {
      title: 'Cosmicrafts Rush - Spaceship Racing Game',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Bet on AI spaceships, watch chaos unfold, and claim your winnings on-chain!' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap' }
      ]
    }
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
      somniaChainName: process.env.SOMNIA_CHAIN_NAME || 'Somnia Testnet'
    }
  }
})