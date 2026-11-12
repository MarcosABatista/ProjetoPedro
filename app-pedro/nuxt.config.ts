// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui'
  ],

  devtools: {
    enabled: true
  },

  app: {
    // GitHub Pages de projeto serve em /<repo>/. O baseURL só é aplicado no
    // build de produção (via NUXT_APP_BASE_URL no workflow), mantendo o dev
    // local em "/". Fallback '/ProjetoPedro/' garante o caminho certo no deploy.
    baseURL: process.env.NUXT_APP_BASE_URL || '/',
    head: {
      htmlAttrs: { lang: 'pt-br' }
    }
  },

  css: ['~/assets/css/main.css'],

  // O laudo é claro por natureza: modo de cor travado em light
  colorMode: {
    preference: 'light',
    fallback: 'light'
  },

  routeRules: {
    '/': { prerender: true }
  },

  compatibilityDate: '2026-06-30',

  // Preset do Nitro para GitHub Pages: gera .nojekyll e o fallback 404.html (SPA)
  nitro: {
    preset: 'github_pages'
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  // Fontes do laudo: Funnel Display (títulos), Funnel Sans (corpo), Geist Mono (só medidas).
  // Baixadas no build e servidas pelo próprio site (@nuxt/fonts).
  fonts: {
    families: [
      { name: 'Funnel Display', provider: 'google', weights: [500, 600, 700, 800] },
      { name: 'Funnel Sans', provider: 'google', weights: [400, 500, 600, 700] },
      { name: 'Geist Mono', provider: 'google', weights: [300, 400, 500, 600, 700] }
    ]
  }
})
