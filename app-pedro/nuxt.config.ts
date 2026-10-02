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

  // Visual agressivo é sempre escuro — fixa o color mode em dark
  colorMode: {
    preference: 'dark',
    fallback: 'dark'
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

  // Fontes impactantes: Oswald (títulos) + Inter (corpo), servidas localmente
  fonts: {
    families: [
      { name: 'Oswald', provider: 'google', weights: [500, 600, 700] },
      { name: 'Inter', provider: 'google', weights: [400, 500, 600, 700] }
    ]
  }
})
