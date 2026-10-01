---
inclusion: fileMatch
fileMatchPattern: ["app/**/*.vue", "app/composables/**/*.ts", "app/plugins/**/*.ts"]
name: Nuxt State & App Context Composables
description: Use ao gerenciar estado compartilhado SSR (useState), acessar contexto Nuxt (useNuxtApp), configs (useRuntimeConfig/useAppConfig), cookies (useCookie), e hooks de hidratação/runtime.
---
# Nuxt v4 — State & App Context Composables

## useState
Estado reativo compartilhado SSR-friendly. Serializado p/ JSON → NÃO armazenar classes/funções/symbols.
```ts
function useState<T>(key: string, init?: () => T | Ref<T>): Ref<T>
function useState<T>(init?: () => T | Ref<T>): Ref<T>   // key auto por file+line
```
```ts
const count = useState('counter', () => Math.round(Math.random() * 100))
const big = useState('s', () => shallowRef({ deep: 'not reactive' })) // perf p/ objetos grandes
```
Gotchas: nome reservado (não criar função própria `useState`). Erro `Cannot stringify arbitrary non-POJOs` → payload não-serializável; usar `definePayloadPlugin` + reducer/reviver custom. Para state global SSR use `useState`, não `useHydration`.

## useNuxtApp / tryUseNuxtApp
Contexto runtime compartilhado (client+server, NÃO em rotas Nitro). Lança exceção se contexto indisponível — usar `tryUseNuxtApp()` (v3.10) que retorna `null`.
```ts
const nuxtApp = useNuxtApp()
```
Métodos:
- `provide(name, value)` — estende contexto; expõe como `$name`. Ex: `nuxtApp.provide('hello', n => \`Hello ${n}!\`)` → `nuxtApp.$hello('x')`.
- `hook(name, cb)` — engancha no lifecycle runtime (ex.: `page:start`, `vue:error`, `link:prefetch`). Usado em plugins.
- `callHook(name, ...args)` — retorna Promise.
Propriedades:
- `vueApp` — instância Vue global (`.component()`, `.directive()`, `.use()`).
- `ssrContext` (server-only): `url`, `event` (h3), `payload`.
- `payload`: `serverRendered`, `data` (cache de useFetch/useAsyncData por key), `state` (`payload.state.<key>` de useState). Suporta `ref`/`reactive`/`shallowRef`/`NuxtError`. Reducer/reviver custom via `definePayloadPlugin`+`definePayloadReducer`/`definePayloadReviver` (v3.4).
- `isHydrating` (boolean) — checar se hidratando no client.
- `runWithContext(fn)` — restaura contexto Nuxt após `await` em cenários complexos (middleware/plugin com try/catch). Corrige "Nuxt instance unavailable".
```ts
export default defineNuxtRouteMiddleware(async () => {
  const nuxtApp = useNuxtApp()
  let user
  try { user = await fetchUser() } catch { user = null }
  if (!user) return nuxtApp.runWithContext(() => navigateTo('/auth'))
})
```

## useRuntimeConfig
Acessa config de runtime. Definir em `nuxt.config` (`runtimeConfig`). No server passar `event`.
```ts
// nuxt.config.ts
runtimeConfig: {
  apiSecret: '123',                          // server-only
  public: { apiBase: process.env.NUXT_PUBLIC_API_BASE || '/api' }, // client+server
}
```
```vue
<script setup lang="ts">const config = useRuntimeConfig()</script>
```
```ts
// server/api/foo.ts
export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event)
  return $fetch('/test', { baseURL: config.public.apiBase, headers: { Authorization: `Bearer ${config.apiSecret}` } })
})
```
Override por env `NUXT_`-prefixadas: `NUXT_PUBLIC_API_BASE`, `NUXT_API_SECRET`. `.env` só em dev/build; produção usa env da plataforma. Namespace reservado `app`: `app.baseURL` (env `NUXT_APP_BASE_URL`, default `/`), `app.cdnURL` (env `NUXT_APP_CDN_URL`). Não adicionar chaves em `app`.

## useAppConfig
Acessa app config reativa (definida em `app.config.ts`; valores públicos determinados em build, não sobrescrevíveis por env — ao contrário de runtimeConfig).
```ts
const appConfig = useAppConfig()
```

## useCookie
Ler/escrever cookies SSR-friendly. Ref serializa/deserializa JSON automaticamente. Só no Nuxt context.
```ts
function useCookie<T = string | null | undefined>(name: string, options?: CookieOptions<T>): CookieRef<T>
```
Options: `default: () => T|Ref<T>`, `watch: true|'shallow'|false` (default `true`; se `false`/`'shallow'`, refresh manual via `refreshCookie`), `readonly=false`, `refresh=false`(v4.4 renova expiração a cada escrita explícita), `decode`/`encode`, `maxAge`(s), `expires: Date | (() => Date)`, `httpOnly`, `secure`, `sameSite: true|false|'lax'|'none'|'strict'`, `domain`, `path='/'`, `partitioned`.
```vue
<script setup lang="ts">
const counter = useCookie('counter')
counter.value ||= Math.round(Math.random() * 1000) // set p/ null p/ remover
// writable com shallow: mutações internas não persistem; reatribuir p/ salvar:
const list = useCookie('list', { default: () => [], watch: 'shallow' })
function save () { list.value &&= [...list.value] }
// sliding session:
const token = useCookie('token', { expires: () => new Date(Date.now() + 3600e3) })
</script>
```
Gotchas: `secure:true` sem HTTPS → cookie não enviado (erros de hidratação). Em API routes usar `getCookie`/`setCookie` do h3, não useCookie.

## useHydration
Avançado (plugins/módulos). Sincroniza estado server→client no ciclo de hidratação.
```ts
function useHydration<T>(key: string, get: () => T, set: (value: T) => void): void
```
`get` roda só no server (após SSR, grava em `payload[key]`); `set` roda só no client (ao criar instância Vue). Para state global normal prefira `useState`.
```ts
export default defineNuxtPlugin(() => {
  const store = new MyStore()
  useHydration('myStoreState', () => store.getState(), d => store.setState(d))
})
```

## onPrehydrate (v3.12+)
Roda callback no browser imediatamente ANTES do Nuxt hidratar. Callback é serializado/inlined no HTML → sem deps externas, sem contexto Nuxt/Vue, acessa `window`/DOM. Chamada só tem efeito no server (removida do client build). Uso avançado (evitar mismatch, ex.: color-mode).
```ts
function onPrehydrate(callback: (el: HTMLElement) => void): void
function onPrehydrate(callback: string | ((el: HTMLElement) => void), key?: string): undefined | string
```
```ts
onPrehydrate(() => console.log(window))
onPrehydrate((el) => console.log(el.outerHTML)) // root ganha data-prehydrate-id
const id = onPrehydrate((el) => {}, 'my-key')    // retorna id p/ cenários multi-root
```

## useRuntimeHook (v3.14+)
Registra hook runtime; auto-descartado quando o escopo (componente) é destruído.
```ts
function useRuntimeHook<N extends keyof RuntimeNuxtHooks>(name: N, fn: RuntimeNuxtHooks[N]): void
```
```vue
<script setup lang="ts">
useRuntimeHook('link:prefetch', (link) => console.log('Prefetching', link))
</script>
```

## Referência

- [useState](https://nuxt.com/docs/4.x/api/composables/use-state)
- [useNuxtApp](https://nuxt.com/docs/4.x/api/composables/use-nuxt-app)
- [useAppConfig](https://nuxt.com/docs/4.x/api/composables/use-app-config)
- [useRuntimeConfig](https://nuxt.com/docs/4.x/api/composables/use-runtime-config)
- [useCookie](https://nuxt.com/docs/4.x/api/composables/use-cookie)
- [useHydration](https://nuxt.com/docs/4.x/api/composables/use-hydration)
- [onPrehydrate](https://nuxt.com/docs/4.x/api/composables/on-prehydrate)
- [useRuntimeHook](https://nuxt.com/docs/4.x/api/composables/use-runtime-hook)
