---
inclusion: fileMatch
fileMatchPattern: ["app/middleware/**/*.ts", "app/pages/**/*.vue", "app/**/*.vue"]
name: Nuxt Navigation & Routing Utils
description: Use ao navegar programaticamente (navigateTo), definir/abortar middleware de rota (defineNuxtRouteMiddleware, addRouteMiddleware, abortNavigation), metadata de página (definePageMeta), route rules, guards e layout dinâmico.
---
# Nuxt v4 — Navigation & Routing Utils

## navigateTo
Navegação programática (server+client). SEMPRE `await` ou `return`. NÃO usar em rotas Nitro (usar `sendRedirect` do h3).
```ts
function navigateTo(
  to: RouteLocationRaw | undefined | null,   // default '/'
  options?: {
    replace?: boolean         // default false (push)
    redirectCode?: number     // default 302; 301 p/ permanente (server-side)
    external?: boolean         // default false; true p/ URL externa (senão lança erro)
    open?: { target?: string; windowFeatures?: {...} }  // window.open, só client
  }
): Promise<void | NavigationFailure | false> | ...
```
```ts
await navigateTo('/search')
await navigateTo({ path: '/search', query: { page: 1, sort: 'asc' } })
await navigateTo({ name: 'product', params: { id: 1 } })
await navigateTo('https://nuxt.com', { external: true })
await navigateTo('https://nuxt.com', { open: { target: '_blank', windowFeatures: { width: 500, height: 500 } } })
```
Em middleware: DEVE dar `return navigateTo(...)` (sem return não funciona). `navigateTo` não interrompe o resto do `<script setup>` (habilitar `experimental.navigateToEarlyReturn` p/ early return).

## defineNuxtRouteMiddleware
Cria route middleware (arquivo em `app/middleware/`). Recebe `(to, from)`. Retorna: nada (continua), `navigateTo(...)` (redireciona), `abortNavigation(...)` (bloqueia), `false` (aborta).
```ts
export default defineNuxtRouteMiddleware((to, from) => {
  const auth = useState('auth')
  if (!auth.value.authenticated) return navigateTo('/login')
})
```
Named (`auth.ts`), global (`auth.global.ts` roda em toda navegação). NÃO usar `useRoute()` dentro — usar `to`/`from`.

## addRouteMiddleware
Adiciona middleware dinamicamente (em plugin).
```ts
function addRouteMiddleware(name: string, middleware: RouteMiddleware, options?: { global?: boolean }): void
function addRouteMiddleware(middleware: RouteMiddleware): void  // função anônima = global
```
```ts
export default defineNuxtPlugin(() => {
  addRouteMiddleware('named', (to, from) => {})              // named; sobrescreve de app/middleware/
  addRouteMiddleware((to, from) => {})                       // anônima → global
  addRouteMiddleware('g', (to, from) => {}, { global: true }) // named + global
})
```

## abortNavigation
Só dentro de route middleware. Impede a navegação; lança erro se passado.
```ts
function abortNavigation(err?: Error | string): false
```
```ts
export default defineNuxtRouteMiddleware((to) => {
  const user = useState('user')
  if (!user.value.isAuthorized) return abortNavigation('Insufficient permissions.')
})
```

## definePageMeta
Macro de compilador p/ metadata de página (em `app/pages/*`).
```ts
function definePageMeta(meta: PageMeta): void
interface PageMeta {
  name?: string
  path?: string          // regex custom, ex.: '/:postId(\\d+)-:postSlug'
  props?: RouteRecordRaw['props']  // route params como props
  alias?: string | string[]
  groups?: string[]      // v4.3, route groups (auto)
  layout?: false | LayoutKey | Ref<...> | { name?: LayoutKey | false; props?: Record<string, unknown> }
  middleware?: MiddlewareKey | NavigationGuard | Array<...>
  key?: false | string | ((route) => string)
  keepalive?: boolean | KeepAliveProps
  pageTransition?: boolean | TransitionProps
  layoutTransition?: boolean | TransitionProps
  viewTransition?: boolean | 'always' | ViewTransitionPageOptions  // experimental
  redirect?: RouteRecordRedirectOption
  validate?: (route) => boolean | Promise<boolean> | Partial<NuxtError> | Promise<...>
  scrollToTop?: boolean | ((to, from) => boolean)
  [key: string]: unknown  // metadata custom (augmentar tipo p/ type-safety)
}
```
```vue
<script setup lang="ts">
definePageMeta({
  layout: 'admin',                          // ou false p/ desativar; ou { name, props } tipado
  middleware: ['auth', fn],                 // string | função | array
  key: route => route.fullPath,
  keepalive: { exclude: ['modal'] },
  validate: route => /^\d+$/.test(route.params.id as string),  // false → 404
  path: '/:postId(\\d+)-:postSlug',          // resolve conflitos de rota
})
</script>
```

## defineRouteRules (experimental)
Route rules a nível de página (requer `experimental.inlineRouteRules`). Traduzido p/ `routeRules` do config.
```vue
<script setup lang="ts">
defineRouteRules({ prerender: true })   // → routeRules: { '/': { prerender: true } }
</script>
```
Notas: `pages/foo/bar.vue` → `/foo/bar`; `[id].vue` → `/foo/*`. Paths não conversíveis (regex, partial `/prefix-:id`, repeatable `/:slug+`) → não aplicados, warn no build; definir em `nitro.routeRules`. Com `path`/`alias` custom, definir `routeRules` direto no config.

## setPageLayout
Muda o layout da página atual em runtime (middleware/plugin/setup). Deve ser chamado antes do render (ex.: em middleware) p/ evitar flash.
```ts
function setPageLayout(layout: LayoutKey | false): void
```
```ts
export default defineNuxtRouteMiddleware((to) => {
  setPageLayout(to.meta.someFlag ? 'admin' : 'default')
})
```

## onBeforeRouteLeave / onBeforeRouteUpdate
Re-exports de vue-router p/ guards no setup do componente.
- `onBeforeRouteLeave((to, from) => ...)` — antes de sair da rota que renderiza o componente (ex.: confirmar mudanças não salvas).
- `onBeforeRouteUpdate((to, from) => ...)` — quando a rota muda mas o mesmo componente é reusado (ex.: `/users/1` → `/users/2`).
```vue
<script setup lang="ts">
onBeforeRouteLeave((to, from) => {
  if (hasUnsavedChanges.value && !confirm('Sair sem salvar?')) return false
})
onBeforeRouteUpdate(async (to) => { await refetch(to.params.id) })
</script>
```

## Referência

- [navigateTo](https://nuxt.com/docs/4.x/api/utils/navigate-to)
- [abortNavigation](https://nuxt.com/docs/4.x/api/utils/abort-navigation)
- [addRouteMiddleware](https://nuxt.com/docs/4.x/api/utils/add-route-middleware)
- [defineNuxtRouteMiddleware](https://nuxt.com/docs/4.x/api/utils/define-nuxt-route-middleware)
- [definePageMeta](https://nuxt.com/docs/4.x/api/utils/define-page-meta)
- [defineRouteRules](https://nuxt.com/docs/4.x/api/utils/define-route-rules)
- [onBeforeRouteLeave](https://nuxt.com/docs/4.x/api/utils/on-before-route-leave)
- [onBeforeRouteUpdate](https://nuxt.com/docs/4.x/api/utils/on-before-route-update)
- [setPageLayout](https://nuxt.com/docs/4.x/api/utils/set-page-layout)
