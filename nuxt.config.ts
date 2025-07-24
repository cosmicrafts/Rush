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
  fonts: {
    families: [
      {
        name: 'Inter',
        provider: 'google',
      }
    ]
  },
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
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap' }
      ]
    }
  },
  runtimeConfig: {
    public: {
      somniaRpcUrl: 'https://dream-rpc.somnia.network/',
      contractAddress: '0x28c91484b55b6991d8f5e4fe2ff313024532537e'
    }
  }
})