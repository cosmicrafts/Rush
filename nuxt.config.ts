// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  modules: ['@nuxt/ui', '@nuxt/image', '@nuxt/scripts', '@nuxt/eslint', '@pinia/nuxt', '@nuxtjs/robots', '@nuxtjs/sitemap'],
  css: ['./assets/css/main.css'],

  // Site configuration (best practice for sitemap and robots)
  site: {
    url: 'https://rush.cosmicrafts.com',
    name: 'Cosmicrafts Rush'
  },

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
          content: 'Play the best Web3 racing game on Somnia network! Bet on AI spaceships, watch chaos unfold, and earn real crypto rewards instantly. Free to play blockchain racing with play-to-earn mechanics.',
        },
        { name: 'keywords', content: 'web3 racing game, blockchain racing game, crypto betting game, play-to-earn racing, somnia network, web3 betting platform, onchain gaming, AI racing game, crypto betting platform, web3 games, blockchain games, NFT racing game, spaceship racing, crypto rewards, instant payouts, zed run alternative, best web3 games 2025, virtual horse racing game, web3 betting game free, crypto betting app, blockchain gaming, AI chaos, instant payouts, crypto gaming, on-chain betting, racing, bet, web3, blockchain, somnia, dora, hackathon, provably fair racing, cosmicrafts, NFT spaceship racing, P2E, bet on AI, instant crypto payouts gaming, best blockchain racing game 2025, win crypto with spaceship betting, EVM racing game, web3 gambling, web3 bet, blockchain gambling, space horses, space horses racing, space horses betting, space horses web3, space horses blockchain, space horses provably fair, space horses play-to-earn, space horses P2E, space horses EVM, space horses web3 gambling, space horses web3 bet, space horses blockchain gambling, ai racing game, nft spaceship racing, instant crypto payouts, zed run competitor, nft horse racing, crypto horse racing, virtual horse race betting, provably fair betting, top NFT racing game, win real crypto, race to earn, spaceship betting, crypto arcade game, cosmicrafts rush vs zed run, cosmicrafts rush vs pegaxy, cosmicrafts rush vs revv racing, cosmicrafts rush vs photo finish live, is cosmicrafts rush legit, cosmicrafts rush scam, cosmicrafts rush safe, provably fair spaceship racing, EVM randomness racing, open source racing game, auditable smart contracts' },
        { name: 'author', content: 'Cosmicrafts' },
        { name: 'robots', content: 'index, follow' },
        { name: 'googlebot', content: 'index, follow' },
        
        // Open Graph tags
        { property: 'og:title', content: 'Cosmicrafts Rush - On-chain spaceship racing with AI chaos & instant payouts' },
        { property: 'og:description', content: 'Bet on AI spaceships, watch chaos unfold, and claim your winnings on-chain! Experience the thrill of blockchain gaming with instant payouts.' },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: 'https://rush.cosmicrafts.com' },
        { property: 'og:image', content: 'https://rush.cosmicrafts.com/cosmicrush.webp' },
        { property: 'og:site_name', content: 'Cosmicrafts Rush' },
        
        // Twitter Card tags
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Cosmicrafts Rush - On-chain spaceship racing with AI chaos & instant payouts' },
        { name: 'twitter:description', content: 'Bet on AI spaceships, watch chaos unfold, and claim your winnings on-chain!' },
        { name: 'twitter:image', content: 'https://rush.cosmicrafts.com/cosmicrush.webp' },
        
        // Canonical URL
        { name: 'canonical', content: 'https://rush.cosmicrafts.com' },
        
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
        { rel: 'canonical', href: 'https://rush.cosmicrafts.com' },
      ],
      script: [
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'Cosmicrafts Rush',
            description: 'On-chain spaceship racing with AI chaos & instant payouts',
            url: 'https://rush.cosmicrafts.com',
            applicationCategory: 'Game',
            operatingSystem: 'Web Browser',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD'
            },
            publisher: {
              '@type': 'Organization',
              name: 'Cosmicrafts'
            }
          })
        }
      ]
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
