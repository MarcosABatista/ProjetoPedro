---
inclusion: fileMatch
fileMatchPattern: ["app/plugins/**/*.ts", "app/**/*.vue"]
name: Nuxt Component, Plugin & Lifecycle Utils
description: Use ao criar plugins (defineNuxtPlugin) e componentes Options API (defineNuxtComponent), lazy hydration, pré-carregar/prefetch componentes e rotas, reagir ao app pronto (onNuxtReady), recarregar app, prerender rotas e definir status HTTP.
---
# Nuxt v4 — Component, Plugin & Lifecycle Utils

## defineNuxtPlugin
Cria plugin Nuxt (arquivo em `app/plugins/`). Duas formas: função ou objeto.
```ts
type Plugin<T> = (nuxt: NuxtApp) => void | { provide?: T } | Promise<void | { provide?: T }>
interface ObjectPlugin<T> {
  name?: string
  enforce?: 'pre' | 'default' | 'post'
  dependsOn?: string[]     // nomes de plugins dep.
  order?: number           // avançado; sobrescreve enforce
  parallel?: boolean       // roda em paralelo com outros parallel
  setup?: Plugin<T>
  hooks?: Partial<RuntimeNuxtHooks>
  env?: { islands?: boolean }  // false p/ não rodar em server-only/island components
}
```
```ts
// função + provide → nuxtApp.$hello
export default defineNuxtPlugin((nuxtApp) => ({ provide: { hello: (n: string) => `Hello ${n}!` } }))
// objeto avançado
export default defineNuxtPlugin({
  name: 'my-plugin', enforce: 'pre', dependsOn: ['other'],
  async setup (nuxtApp) { const cfg = await $fetch('/api/config'); return { provide: { config: cfg } } },
  hooks: { 'app:created' () {} },
})
```
Nome de arquivo `*.client.ts`/`*.server.ts` restringe ao ambiente; ordem por prefixo numérico (`01.foo.ts`) ou `enforce`/`order`.

## defineNuxtComponent
Wrapper de `defineComponent` p/ Options API com suporte a `asyncData` e `head`. Usar só se NÃO puder usar `<script setup>` (que é preferível).
```ts
export default defineNuxtComponent({
  async asyncData () { return { count: (await $fetch('/api/count')).count } },
  head () { return { title: 'X' } },
  setup (props) { /* ... */ },
})
```

## defineLazyHydrationComponent
Macro p/ componente com estratégia de lazy hydration (adia hidratação → reduz custo inicial). Não usar variáveis externas (macro precisa reconhecer args inline). Emite `@hydrated`.
```ts
function defineLazyHydrationComponent(
  strategy: 'visible' | 'idle' | 'interaction' | 'mediaQuery' | 'if' | 'time' | 'never',
  source: () => Promise<Component>
): Component
```
```vue
<script setup lang="ts">
const LazyComp = defineLazyHydrationComponent('visible', () => import('./MyComponent.vue'))
</script>
<template>
  <LazyComp :hydrate-on-visible="{ rootMargin: '100px' }" @hydrated="onHydrated" />
</template>
```
Props por estratégia:
- `visible` → `:hydrate-on-visible="{ rootMargin }"` (IntersectionObserver, opcional)
- `idle` → `:hydrate-on-idle="2000"` (timeout ms opcional)
- `interaction` → `hydrate-on-interaction="mouseover"` (default: pointerenter/click/focus)
- `mediaQuery` → `hydrate-on-media-query="(min-width: 768px)"`
- `time` → `:hydrate-after="1000"` (ms)
- `if` → `:hydrate-when="isReady"` (boolean ref)
- `never` → sem hidratação

## prefetchComponents / preloadComponents
Carregam componentes globais registrados antes de renderizar. `prefetch` = baixa em idle (baixa prioridade); `preload` = baixa imediato (alta prioridade). Só client.
```ts
await prefetchComponents('MyComponent')
await prefetchComponents(['CompA', 'CompB'])
await preloadComponents('MyComponent')
```

## preloadRouteComponents
Pré-carrega os componentes de uma rota antes de navegar (client) → navegação mais rápida. `navigateTo` já faz por baixo.
```ts
await preloadRouteComponents('/dashboard')
await preloadRouteComponents({ name: 'user', params: { id: 1 } })
```

## onNuxtReady
Callback após o app Nuxt terminar de inicializar (client-only). Ideal p/ código não-crítico/analytics sem bloquear hidratação.
```ts
onNuxtReady(() => { /* código não-crítico, ex.: init lib de analytics */ })
onNuxtReady(async () => { const lib = await import('heavy-lib'); lib.init() })
```

## reloadNuxtApp
Força reload completo (hard reload) da página/app.
```ts
function reloadNuxtApp(options?: { path?: string; ttl?: number; force?: boolean; persistState?: boolean }): void
```
- `path` — caminho p/ recarregar (default: atual)
- `ttl` — ms p/ evitar loop de reload (default 10000)
- `force` — ignora o guard de ttl
- `persistState` — serializa e restaura o payload atual
```ts
reloadNuxtApp({ path: '/dashboard', persistState: true })
```

## prerenderRoutes
No prerender (build-time / SSG), sinaliza rotas adicionais p/ o crawler gerar. Sem efeito em runtime dinâmico.
```ts
function prerenderRoutes(routes: string | string[]): void
```
```ts
// dentro de setup/plugin durante prerender
prerenderRoutes(['/sitemap.xml', '/posts/1', '/posts/2'])
```

## setResponseStatus
Define o status HTTP (e statusText opcional) da resposta SSR. Sem efeito no client.
```ts
function setResponseStatus(event: H3Event, code?: number, message?: string): void
function setResponseStatus(code: number, message?: string): void  // usa event do contexto
```
```vue
<script setup lang="ts">
const event = useRequestEvent()
if (!found) setResponseStatus(event, 404, 'Not Found')
// ou: setResponseStatus(404)
</script>
```
Uso típico: páginas de erro/404 customizadas p/ enviar o código correto no SSR.

## Referência

- [defineNuxtComponent](https://nuxt.com/docs/4.x/api/utils/define-nuxt-component)
- [defineNuxtPlugin](https://nuxt.com/docs/4.x/api/utils/define-nuxt-plugin)
- [defineLazyHydrationComponent](https://nuxt.com/docs/4.x/api/utils/define-lazy-hydration-component)
- [prefetchComponents](https://nuxt.com/docs/4.x/api/utils/prefetch-components)
- [preloadComponents](https://nuxt.com/docs/4.x/api/utils/preload-components)
- [preloadRouteComponents](https://nuxt.com/docs/4.x/api/utils/preload-route-components)
- [onNuxtReady](https://nuxt.com/docs/4.x/api/utils/on-nuxt-ready)
- [reloadNuxtApp](https://nuxt.com/docs/4.x/api/utils/reload-nuxt-app)
- [prerenderRoutes](https://nuxt.com/docs/4.x/api/utils/prerender-routes)
- [setResponseStatus](https://nuxt.com/docs/4.x/api/utils/set-response-status)
