---
inclusion: fileMatch
fileMatchPattern: ["app/**/*.vue", "app/composables/**/*.ts"]
name: Nuxt Data & State Utils
description: Use ao fazer HTTP ($fetch), invalidar/limpar caches de data fetching (refreshNuxtData, clearNuxtData), limpar state (clearNuxtState), refrescar cookies (refreshCookie), executar código uma vez (callOnce) e atualizar app config (updateAppConfig).
---
# Nuxt v4 — Data & State Utils

## $fetch
Helper HTTP global (ofetch). No SSR, chamar API routes internas executa a função direto (emula request, economiza 1 chamada).
```ts
const res = await $fetch('/api/item', { method: 'POST', body: { hello: 'world' }, query: {...}, headers: {...} })
```
Gotcha crítico: `$fetch` puro em componente durante SSR → busca DUAS vezes (server + client na hidratação), pois não transfere estado. Envolver com `useAsyncData`/`useFetch` p/ dados de render:
```ts
const { data } = await useAsyncData('item', () => $fetch('/api/item')) // fetch só server + transfere
```
Usar `$fetch` direto só em handlers client-only (ex.: onClick submit). Headers/cookies: no browser são enviados; no SSR NÃO encaminha cookies do usuário (risco SSRF) — usar `useRequestFetch()` p/ forward manual. TLS self-signed em dev: `NODE_TLS_REJECT_UNAUTHORIZED=0`.

## refreshNuxtData
Refetch de todas ou específicas instâncias asyncData (useAsyncData/useFetch e variantes lazy). Retorna Promise.
```ts
function refreshNuxtData(keys?: string | string[]): Promise<void>
```
```ts
await refreshNuxtData()                 // todas
await refreshNuxtData(['count', 'user']) // só essas keys
```
Se tiver acesso à instância asyncData, preferir seu `refresh()`/`execute()`. Componente em `<KeepAlive>` desativado ainda refetcha até unmount.

## clearNuxtData
Limpa cache de dados, error state e status de useAsyncData/useFetch por key. Útil p/ invalidar antes de refetch.
```ts
function clearNuxtData(keys?: string | string[] | ((key: string) => boolean)): void
```
```ts
clearNuxtData('users')
clearNuxtData(['a', 'b'])
clearNuxtData(key => key.startsWith('post-'))
// sem args: limpa tudo
```

## clearNuxtState
Invalida state criado por `useState` por key.
```ts
function clearNuxtState(keys?: string | string[] | ((key: string) => boolean)): void
```
```ts
clearNuxtState('counter')   // reseta p/ undefined (ou re-init na próxima leitura)
clearNuxtState()            // tudo
```

## refreshCookie
Atualiza manualmente o valor de `useCookie` quando o cookie mudou externamente (ex.: `document.cookie` ou resposta de API) e `watch` está desativado.
```ts
function refreshCookie(name: string): void
```
```ts
const token = useCookie('token', { watch: false })
await $fetch('/api/login', { method: 'POST' }) // servidor setou cookie via Set-Cookie
refreshCookie('token')                          // sincroniza o ref
```

## callOnce (v3.9+)
Executa fn uma vez: no SSR (não na hidratação) e não repete em navegação client (modo default `render`). Adiciona ao payload. Não retorna valor — p/ data fetching use useAsyncData/useFetch.
```ts
function callOnce(key?: string, fn?: () => any | Promise<any>, options?: { mode?: 'render' | 'navigation' }): Promise<void>
function callOnce(fn?: () => any | Promise<any>, options?: { mode?: ... }): Promise<void>
```
`mode`: `'render'` (default, uma vez na vida do app) | `'navigation'` (v3.15, uma vez no render inicial + uma vez por navegação client).
```ts
const config = useState('config')
await callOnce(async () => { config.value = await $fetch('/api/config') })
await callOnce(async () => { /* store action */ }, { mode: 'navigation' }) // ex.: com Pinia
```
Chamar direto em setup/plugin/middleware (precisa adicionar ao payload).

## updateAppConfig
Atualiza a app config em runtime (merge profundo com a config existente).
```ts
function updateAppConfig(config: Partial<AppConfig>): void
```
```ts
const appConfig = useAppConfig() // { foo: 'bar' }
updateAppConfig({ foo: 'baz', nested: { a: 1 } }) // deep merge
// appConfig.foo === 'baz'
```
Diferente de `runtimeConfig`: app config é bundleada (não sobrescrevível por env), reativa, p/ valores públicos não-sensíveis.

## Referência

- [$fetch](https://nuxt.com/docs/4.x/api/utils/dollarfetch)
- [refreshNuxtData](https://nuxt.com/docs/4.x/api/utils/refresh-nuxt-data)
- [refreshCookie](https://nuxt.com/docs/4.x/api/utils/refresh-cookie)
- [clearNuxtData](https://nuxt.com/docs/4.x/api/utils/clear-nuxt-data)
- [clearNuxtState](https://nuxt.com/docs/4.x/api/utils/clear-nuxt-state)
- [callOnce](https://nuxt.com/docs/4.x/api/utils/call-once)
- [updateAppConfig](https://nuxt.com/docs/4.x/api/utils/update-app-config)
