// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  modules: ['@nuxt/ui', '@nuxt/image', '@nuxt/scripts', '@nuxt/eslint', '@pinia/nuxt', '@nuxtjs/robots', '@nuxtjs/sitemap'],
  
  // Nuxt Image configuration
  image: {
    // Use ipx provider but disable processing for production compatibility
    provider: 'ipx',
    // Disable format optimization to serve original images
    format: [],
    // Quality settings
    quality: 85,
    // Default modifiers
    modifiers: {
      quality: 85,
    },
    // Preload critical images
    preload: true,
    // Enable lazy loading by default
    loading: 'lazy',
    // Enable responsive images
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536,
    },
  },
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
    // Add caching headers for static assets
    routeRules: {
      '/**/*.webp': {
        headers: {
          'Cache-Control': 'public, max-age=604800, immutable',
          'Vary': 'Accept-Encoding'
        }
      },
      '/**/*.svg': {
        headers: {
          'Cache-Control': 'public, max-age=604800, immutable',
          'Vary': 'Accept-Encoding'
        }
      },
      '/favicon.svg': {
        headers: {
          'Cache-Control': 'public, max-age=604800, immutable'
        }
      }
    }
  },

  // Disable source maps to prevent preload warnings and improve performance
  sourcemap: false,

  app: {
    head: {
      title: 'Cosmicrafts Rush - AI spaceship racing with instant payouts',
      htmlAttrs: {
        lang: 'en',
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: 'Bet on AI spaceships, watch chaos unfold, and earn SPIRAL rewards instantly. Free to play spaceship racing with instant payouts.',
        },
        { name: 'keywords', content: 'spaceship racing game, ai racing game, free browser racing game, spaceship betting game, cosmicrafts rush, race to earn, nft spaceship racing, instant payouts' },
        { name: 'author', content: 'Cosmicrafts' },
        { name: 'robots', content: 'index, follow' },
        { name: 'googlebot', content: 'index, follow' },
        
        // Open Graph tags
        { property: 'og:title', content: 'Cosmicrafts Rush - AI spaceship racing with instant payouts' },
        { property: 'og:description', content: 'Bet on AI spaceships, watch chaos unfold, and claim your winnings instantly!' },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: 'https://rush.cosmicrafts.com' },
        { property: 'og:image', content: 'https://rush.cosmicrafts.com/rush.svg' },
        { property: 'og:site_name', content: 'Cosmicrafts Rush' },
        
        // Twitter Card tags
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Cosmicrafts Rush - AI spaceship racing with instant payouts' },
        { name: 'twitter:description', content: 'Bet on AI spaceships, watch chaos unfold, and claim your winnings instantly!' },
        { name: 'twitter:image', content: 'https://rush.cosmicrafts.com/rush.svg' },
        
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
            "connect-src 'self' https://id.worldofunreal.com https://rush.cosmicrafts.com https://nftropoly.com wss: https:",
            "worker-src 'self' blob:",
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
            description: 'AI spaceship racing with instant payouts',
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
      // Ledger SPIRAL (Ionic-Swap). '' = mismo origen (/api/ via nginx).
      ledgerUrl: process.env.NUXT_PUBLIC_LEDGER_URL || '',
    },
  },
})
