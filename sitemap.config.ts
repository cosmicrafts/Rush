export default {
  siteUrl: 'https://rush.cosmicrafts.com',
  autoLastmod: true,
  exclude: [
    '/admin/**',
    '/api/**',
    '/_nuxt/**',
    '/__nuxt/**'
  ],
  defaults: {
    changefreq: 'daily',
    priority: 1,
    lastmod: new Date()
  }
}
