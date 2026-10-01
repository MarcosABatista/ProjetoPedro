---
inclusion: fileMatch
fileMatchPattern: ["nuxt.config.ts"]
name: Nuxt Configuration Reference (nuxt.config)
description: Use ao editar nuxt.config.ts — opções mais usadas (app, appConfig, css, modules, runtimeConfig, nitro, vite, routeRules, experimental, typescript, components, imports, dir, devServer, hooks) com exemplos.
---
# Nuxt v4 — nuxt.config.ts Reference

Arquivo raiz com `export default defineNuxtConfig({ ... })`. Abaixo as opções mais usadas. Chaves de topo relevantes também: `ssr`, `srcDir`, `rootDir`, `pages`, `router`, `spaLoadingTemplate`, `sourcemap`.

## app
Configuração do app + head padrão.
```ts
app: {
  baseURL: '/',               // base path; runtime via NUXT_APP_BASE_URL (rel. './' não em config → usar env no generate)
  buildAssetsDir: '/_nuxt/',  // build-time
  cdnURL: '',                 // absoluto, produção; runtime via NUXT_APP_CDN_URL
  head: {
    title: 'My App',
    htmlAttrs: { lang: 'pt-BR' },
    meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }],
    link: [{ rel: 'icon', href: '/favicon.ico' }],
  },
  pageTransition: { name: 'page', mode: 'out-in' },
  layoutTransition: { name: 'layout', mode: 'out-in' },
  keepalive: false,
}
```

## appConfig
Valores reativos determinados em build (bundleados, NÃO sobrescrevíveis por env). Preferir `app.config.ts` na raiz do app. Ler via `useAppConfig()`, atualizar via `updateAppConfig()`. Usar p/ público não-sensível (tema, títulos). Segredos/env → `runtimeConfig`.
```ts
appConfig: { theme: { primary: 'blue' } }
```

## runtimeConfig
Config dinâmica/env. Top-level = **privado server-only**; `public` e `app` expostos ao client. Env `NUXT_`-prefixadas sobrescrevem em runtime. Ler via `useRuntimeConfig()`.
```ts
runtimeConfig: {
  apiSecret: '',                    // NUXT_API_SECRET (server-only)
  public: { apiBase: '/api' },      // NUXT_PUBLIC_API_BASE (client+server)
}
```

## modules
Módulos Nuxt. String, ou `[nome, opções]`, ou função inline.
```ts
modules: [
  '@nuxt/image',
  '@pinia/nuxt',
  ['@nuxtjs/google-fonts', { families: { Inter: true } }],
]
```
Opções de módulo também podem ficar em chave própria de topo (ex.: `image: {...}`, `pinia: {...}`).

## css
CSS/SCSS globais.
```ts
css: ['~/assets/css/main.css', '~/assets/scss/theme.scss']
```

## components
Auto-import de componentes.
```ts
components: [
  { path: '~/components', pathPrefix: false },  // ou:
]
// ou boolean
components: true
```

## imports
Auto-import de composables/utils.
```ts
imports: {
  dirs: ['composables', 'utils', 'stores'],  // dirs extras auto-importados
  autoImport: true,                            // default true
}
```

## dir
Nomes de diretórios (Nuxt 4 usa `app/` por padrão).
```ts
dir: {
  pages: 'pages',
  layouts: 'layouts',
  middleware: 'middleware',
  plugins: 'plugins',
  public: 'public',
}
```

## routeRules (hybrid rendering)
Regras por padrão de rota (rendering híbrido, headers, redirect, cache). Casadas por prefixo.
```ts
routeRules: {
  '/': { prerender: true },                          // SSG
  '/blog/**': { swr: 3600 },                          // stale-while-revalidate 1h
  '/admin/**': { ssr: false },                        // SPA (client-only)
  '/api/**': { cors: true, headers: { 'x-foo': 'bar' } },
  '/old': { redirect: '/new' },
  '/legacy': { redirect: { to: '/new', statusCode: 301 } },
  '/products/**': { isr: true },                      // incremental static regeneration
}
```
Chaves: `prerender`, `ssr`, `swr`, `isr`, `cache`, `redirect`, `headers`, `cors`, `proxy`, `appLayout`.

## nitro
Config do server engine (Nitro).
```ts
nitro: {
  preset: 'node-server',       // ou 'vercel', 'cloudflare-pages', etc.
  routeRules: { /* equivalente a routeRules top-level */ },
  runtimeConfig: {},
  storage: { redis: { driver: 'redis' } },
  devProxy: { '/api': 'http://localhost:4000' },
  prerender: { crawlLinks: true, routes: ['/sitemap.xml'] },
  compressPublicAssets: true,
}
```

## vite
Config repassada ao Vite.
```ts
vite: {
  server: { hmr: { protocol: 'ws' } },
  css: { preprocessorOptions: { scss: { additionalData: '@use "~/assets/_vars.scss" as *;' } } },
  plugins: [],
  define: { __APP_VERSION__: JSON.stringify('1.0.0') },
  optimizeDeps: { include: ['lodash-es'] },
}
```

## typescript
```ts
typescript: {
  strict: true,           // default true
  typeCheck: true,        // checagem no build/dev (requer vue-tsc)
  shim: false,
}
```

## devServer
```ts
devServer: {
  port: 3000,
  host: '0.0.0.0',
  https: { key: './localhost-key.pem', cert: './localhost.pem' },
}
```

## router
```ts
router: {
  options: {
    hashMode: false,           // hash history (SPA; URL não vai ao server; sem SSR)
    scrollBehaviorType: 'auto', // 'auto' | 'smooth'
  },
}
```
Mais controle → arquivo `app/router.options.ts`. Só opções JSON-serializáveis no config.

## experimental
Flags experimentais comuns.
```ts
experimental: {
  payloadExtraction: true,      // habilita getCachedData default de useAsyncData
  inlineRouteRules: false,      // habilita defineRouteRules por página
  viewTransition: false,        // View Transitions API
  asyncContext: false,          // AsyncLocalStorage nativo (Node/Bun)
  typedPages: true,             // rotas tipadas
  navigateToEarlyReturn: false, // navigateTo retorna cedo do setup
  renderJsonPayloads: true,
}
```

## hooks
Hooks de build/runtime do Nuxt (inline no config).
```ts
hooks: {
  'pages:extend' (pages) { pages.push({ name: 'custom', path: '/custom', file: '~/extra/custom.vue' }) },
  'build:before' () {},
  'nitro:config' (nitroConfig) {},
}
```

Gotchas gerais: `app.config.ts` (build, reativo, sem env) ≠ `runtimeConfig` (env-overridable, segredos server-only). `routeRules` top-level e `nitro.routeRules` se fundem. Paths relativos `./` não suportados em `app.baseURL` (Nitro) — usar env no generate ou `nitro.runtimeConfig.app.baseURL`.

## Referência

- [Nuxt Configuration (nuxt.config)](https://nuxt.com/docs/4.x/api/nuxt-config)
