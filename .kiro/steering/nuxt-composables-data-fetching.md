---
inclusion: fileMatch
fileMatchPattern: ["app/**/*.vue", "app/composables/**/*.ts", "app/pages/**/*.vue"]
name: Nuxt Data Fetching Composables
description: Use ao buscar dados em pages/components/plugins com useFetch, useAsyncData, variantes lazy, cache (useNuxtData) e wrappers customizados. SSR-friendly, sem refetch na hidratação.
---
# Nuxt v4 — Data Fetching Composables

SSR-friendly. Adicionam resposta ao payload Nuxt → sem refetch no client ao hidratar. Chamar direto no setup/plugin/middleware (Nuxt context). `data`/`status`/`error`/`pending` são refs (usar `.value`); `refresh`/`execute`/`clear` são funções.

## useAsyncData
Dados assíncronos genéricos (não só HTTP). `handler` deve ser side-effect free e retornar valor truthy.
```ts
function useAsyncData<ResT, DataE = unknown, DataT = ResT>(
  key: MaybeRefOrGetter<string>,        // opcional; auto-gerado por file+line se omitido
  handler: (nuxtApp, { signal }) => Promise<ResT>,
  options?: AsyncDataOptions<ResT, DataT>
): AsyncData<DataT, DataE> & Promise<...>
```
Options: `server=true`, `lazy=false`, `immediate=true`, `deep=false`, `dedupe='cancel'|'defer'`, `default: () => DataT`, `transform: (input)=>DataT`, `pick: string[]`, `watch: MultiWatchSources`, `getCachedData(key,nuxtApp,ctx)`, `timeout`(ms, v4.2), `enabled`(v4.5), `serialize=true`(v4.6).
Retorno `AsyncData`: `data: Ref<DataT|undefined>`, `error`, `status: Ref<'idle'|'pending'|'success'|'error'>`, `pending: Ref<boolean>`, `refresh(opts?)`, `execute` (alias refresh), `clear()`.
```vue
<script setup lang="ts">
const { data, status, error, refresh, clear } = await useAsyncData(
  'mountains',
  (_app, { signal }) => $fetch('/api/mountains', { signal }),
  { watch: [page], default: () => [] }
)
</script>
```
Reactive key: passar `computed`/`ref`/getter → refetch automático ao mudar. `watch: [refs]` → auto-refresh. `signal` torna handler abortável (cancelado em `dedupe:'cancel'`, `clear()`, ou timeout). Pode passar `refresh({ signal })` manual.

Gotchas:
- Não precisa `await` — no server Nuxt sempre espera antes de renderizar. `await` só bloqueia navegação client até `data` pronto; sem await, tratar loading via `status`.
- `server:false` → data só resolve após hidratação (fica `undefined` no `<script setup>` mesmo com await).
- Mesma key compartilha refs. Opções que DEVEM ser consistentes entre calls com mesma key: `handler`, `deep`, `transform`, `pick`, `getCachedData`, `default`. Podem diferir: `server`, `lazy`, `immediate`, `dedupe`, `watch`, `enabled`, `serialize`.
- Nomes reservados (transform do compilador): não criar função própria chamada `useAsyncData`.
- `lazy:false` usa `<Suspense>` (bloqueia rota). Preferir `lazy:true` + loading state.
- `getCachedData` default só cacheia com `experimental.payloadExtraction` ativo.

## useFetch
Wrapper de `useAsyncData` + `$fetch`. Auto-gera key, type hints de URL de server routes, infere tipo de resposta.
```ts
function useFetch<ResT, ErrorT = NuxtError, DataT = ResT>(
  url: string | Request | Ref<...> | (() => string | Request),
  options?: UseFetchOptions<ResT, DataT>
): AsyncData<DataT, ErrorT> & Promise<...>
```
Options (estende ofetch + AsyncDataOptions): `key`, `method='GET'`, `query`/`params` (objetos stringificados), `body`, `headers`, `baseURL`, `cache`, `server`, `lazy`, `immediate`, `default`, `transform`, `pick`, `watch|false`, `deep`, `dedupe`, `timeout`, `enabled`, `serialize`, `$fetch` (custom), interceptors `onRequest`/`onRequestError`/`onResponse`/`onResponseError`.
```vue
<script setup lang="ts">
const { data, status, error, refresh } = await useFetch('/api/modules', {
  query: { param1, param2: 'value2' },   // /api/modules?param1=...&param2=value2
  pick: ['title'],
})
// reactive URL
const id = computed(() => route.params.id)
const { data: post } = await useFetch(() => `/api/posts/${id.value}`)
</script>
```
Gotchas:
- Key auto-gerada é única por call site → mesma URL em componentes diferentes NÃO compartilha estado. Passar mesma `key` explícita p/ compartilhar (1 request).
- Opções reativas (`ref`/`computed`/getter) disparam refetch; `watch:false` desativa.
- Não importar `useFetch` de `@vueuse/core` (conflito → data vem string não parseada).
- Nome reservado; p/ variante custom usar `createUseFetch`.

## useLazyAsyncData / useLazyFetch
Idênticos a useAsyncData/useFetch com `lazy:true` (navegação imediata, fetch em background). Tratar `status === 'pending'`/`'error'` no template.
```vue
<script setup lang="ts">
const { status, data: posts } = await useLazyFetch('/api/posts')
</script>
<template>
  <div v-if="status === 'pending'">Loading…</div>
  <div v-else-if="status === 'error'">Error</div>
  <div v-else>{{ posts }}</div>
</template>
```

## useNuxtData
Acessa valor cacheado atual de useAsyncData/useFetch/lazy* que usaram key explícita.
```ts
function useNuxtData<DataT = any>(key: string): { data: Ref<DataT | undefined> }
```
Uso: placeholder enquanto refetch, ou optimistic updates.
```vue
<script setup lang="ts">
const { data: posts } = useNuxtData('posts')          // reusa cache do parent
// optimistic update:
await $fetch('/api/addTodo', { method: 'post', body: { todo },
  onRequest () { previous = todos.value; todos.value = [...todos.value, todo] },
  onResponseError () { todos.value = previous },       // rollback
  async onResponse () { await refreshNuxtData('todos') }
})
</script>
```

## useRequestFetch
Retorna fetch que encaminha contexto + headers da request no SSR (browser envia sozinho no client). `useFetch` já usa por baixo. NÃO encaminha `host`, `accept`, `connection`, `transfer-encoding`, `keep-alive`, `upgrade`, `expect`.
```vue
<script setup lang="ts">
const requestFetch = useRequestFetch()
const { data } = await useAsyncData(() => requestFetch('/api/cookies')) // headers forward
</script>
```

## createUseAsyncData / createUseFetch
Fábricas para composables customizados totalmente tipados com defaults (ex.: `baseURL`, auth headers). Definir em plugin/composable e reusar.
```ts
// app/composables/useApiFetch.ts
export const useApiFetch = createUseFetch({ baseURL: '/api', credentials: 'include' })
export const useApiData = createUseAsyncData({ /* defaults AsyncData */ })
```
Preferir a interceptors repetidos quando muitos calls compartilham config. Ver recipe "custom useFetch".

## Referência

- [useFetch](https://nuxt.com/docs/4.x/api/composables/use-fetch)
- [useAsyncData](https://nuxt.com/docs/4.x/api/composables/use-async-data)
- [useLazyFetch](https://nuxt.com/docs/4.x/api/composables/use-lazy-fetch)
- [useLazyAsyncData](https://nuxt.com/docs/4.x/api/composables/use-lazy-async-data)
- [useNuxtData](https://nuxt.com/docs/4.x/api/composables/use-nuxt-data)
- [useRequestFetch](https://nuxt.com/docs/4.x/api/composables/use-request-fetch)
- [createUseFetch](https://nuxt.com/docs/4.x/api/composables/create-use-fetch)
- [createUseAsyncData](https://nuxt.com/docs/4.x/api/composables/create-use-async-data)
