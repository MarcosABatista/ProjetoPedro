---
inclusion: fileMatch
fileMatchPattern: ["app/**/*.vue", "app/composables/**/*.ts"]
name: Nuxt Routing Composables
description: Use ao ler a rota atual (useRoute — params/query/meta) ou manipular navegação/histórico e rotas via a instância do router (useRouter). Wrappers de vue-router com garantias Nuxt.
---
# Nuxt v4 — Routing Composables

## useRoute
Retorna a rota atual (wrapper do `vue-router`). Diferença Nuxt: rota atualiza **só após** o conteúdo da página mudar na navegação (vue-router atualiza imediatamente → evita dessincronização). No template: `$route`.
```vue
<script setup lang="ts">
const route = useRoute()
const { data } = await useFetch(`/api/mountains/${route.params.slug}`) // pages/[slug].vue
// query: /test?example=true → route.query.example
</script>
```
Propriedades (computed refs):
- `params` — parâmetros dinâmicos da rota
- `query` — query params (`?a=b`)
- `fullPath` — URL encoded (path+query+hash)
- `hash` — hash decodificado (`#...`)
- `path` — pathname encoded
- `matched` — rotas casadas normalizadas
- `meta` — dados custom do record (ver definePageMeta)
- `name` — nome único do record
- `redirectedFrom` — location tentada antes do redirect

Pitfalls:
- SEMPRE usar `useRoute` do Nuxt (`#app`/auto-import), NUNCA `import { useRoute } from 'vue-router'` (bypassa impl Nuxt → sync issues).
- NÃO usar `useRoute` em middleware (não há "rota atual") — só em setup de componente ou plugin. Vale p/ qualquer composable que use useRoute internamente.
- `route.fullPath` no template pode causar hydration mismatch: browser não envia fragmento (`#foo`) na request → client inclui, server não.

## useRouter
Retorna a instância do router. No template: `$router`. Com diretório `app/pages/`, idêntico ao `vue-router`; sem ele, retorna router universal (nem todas features garantidas).
```vue
<script setup lang="ts">
const router = useRouter()
</script>
```
Manipulação de rotas:
- `addRoute(record, parentName?)` — adiciona rota (array; útil em plugins). `parentName` p/ rota filha.
- `removeRoute(name)` — remove por nome
- `getRoutes()` — lista todos os records
- `hasRoute(name)` — existe?
- `resolve(location)` — versão normalizada + `href` (com base)
```ts
router.addRoute({ name: 'home', path: '/home', component: Home })
router.removeRoute('home'); router.getRoutes(); router.hasRoute('home'); router.resolve({ name: 'home' })
```
History API:
- `back()` (= `go(-1)`), `forward()` (= `go(1)`), `go(n)`
- `push(location)` / `replace(location)` — **preferir `navigateTo`** (util) a push/replace direto
```ts
router.back(); router.forward(); router.go(3)
router.push({ path: '/home' }); router.replace({ hash: '#bio' })
```
Navigation guards: `beforeEach`, `beforeResolve`, `afterEach` — mas **preferir route middleware** (`defineNuxtRouteMiddleware`) p/ melhor DX.
Promise/erro: `isReady()` (Promise resolve após navegação inicial), `onError(handler)` (erros não capturados na navegação).

Gotcha: `addRoute()` só registra (não navega); `push()`/`navigateTo()` dispara navegação imediata. Use addRoute em plugins, navigateTo em pages/components.

## Referência

- [useRoute](https://nuxt.com/docs/4.x/api/composables/use-route)
- [useRouter](https://nuxt.com/docs/4.x/api/composables/use-router)
