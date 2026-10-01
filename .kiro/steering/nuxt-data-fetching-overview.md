---
inclusion: fileMatch
fileMatchPattern: ["app/pages/**/*.vue", "app/components/**/*.vue", "app/composables/**/*.ts"]
name: nuxt-data-fetching-overview
description: Nuxt v4 data fetching — $fetch, useFetch, useAsyncData, lazy/server/pick/transform/watch options, keys & shared state, computed URLs, header/cookie forwarding, and payload serialization. Use when fetching data in pages/components or building API-backed features.
---

# Nuxt v4 — Data Fetching

Three tools: `$fetch` (raw request), `useFetch` (SSR-safe wrapper, fetches once), `useAsyncData` (fine-grained control). `useFetch`/`useAsyncData` prevent double-fetch (server + hydration) by forwarding server data to the client payload.

Rule: use `$fetch` for client-side event handlers (form submit, button); use `useFetch`/`useAsyncData` for initial component data.

```vue [app/app.vue]
<script setup lang="ts">
const { data } = await useFetch('/api/data')
async function submit () {
  await $fetch('/api/submit', { method: 'POST', body: { /* ... */ } })
}
</script>
```

## await vs no-await

`await` does NOT change server-rendered HTML (Nuxt always waits via `<Suspense>`/`onServerPrefetch`). It changes client behavior:

- **with await**: blocks client-side navigation until resolved; `data` populated after. Default.
- **without await** / `lazy`: navigation immediate; you handle loading via `status`.

Prefer explicit `lazy` (or `useLazyFetch`/`useLazyAsyncData`) over just skipping `await`. Gotcha: `await`-ing a `lazy` call resolves immediately on client nav without waiting — drop `lazy` if you want nav to wait.

## useFetch

```vue
<script setup lang="ts">
const { data: count } = await useFetch('/api/count')
</script>
```

## useAsyncData

Wraps arbitrary async logic. First arg = unique cache key (string); omit to auto-generate (based on call location — always set your own key in custom composables to avoid collisions).

```vue
<script setup lang="ts">
const { data, error } = await useAsyncData(`user:${id}`, () => myGetFunction('users', { id }))
</script>
```

Combine multiple `$fetch` with the abort `signal`:

```ts
const { data } = await useAsyncData('cart', async (_nuxtApp, { signal }) => {
  const [coupons, offers] = await Promise.all([
    $fetch('/cart/coupons', { signal }),
    $fetch('/cart/offers', { signal }),
  ])
  return { coupons, offers }
})
```

Gotcha: don't trigger side effects (e.g. Pinia actions) in `useAsyncData` — use `callOnce`.

## Return values

`data`, `error`, `status` (`'idle'|'pending'|'success'|'error'`), `refresh`/`execute`, `clear`. `data`/`error`/`status` are refs (`.value` in `<script setup>`). `data`/`error` default to `undefined`. `data` is a `shallowRef` (opt into deep with `{ deep: true }`).

## Options

- **lazy**: don't block navigation; handle `status` manually. Or `useLazyFetch`/`useLazyAsyncData`.
- **server: false**: client-only; not fetched before hydration. Good with `lazy` for non-SEO data.
- **pick: ['a','b']** / **transform: fn**: shrink payload transferred server→client (data is still fetched fully).
- **immediate: false**: don't fetch on invoke; call `execute`/`refresh` to start.
- **watch: [ref]**: refetch when watched refs change. `watch: false` opts out of auto-watching reactive options.

```vue
<script setup lang="ts">
const { status, data: posts } = useFetch('/api/posts', { lazy: true })
</script>
<template>
  <div v-if="status === 'pending'">Loading…</div>
  <div v-else><div v-for="post in posts">…</div></div>
</template>
```

## Keys & shared state

Same key across components → shared `data`/`error`/`status`. These options MUST match per key: `handler`, `deep`, `transform`, `pick`, `getCachedData`, `default`. These may differ: `server`, `lazy`, `immediate`, `dedupe`, `watch`. Use distinct keys for independent instances. Read cached data with `useNuxtData`.

Reactive keys (computed/ref/getter) auto-refetch on change:

```ts
const userId = ref('123')
const { data } = useAsyncData(computed(() => `user-${userId.value}`), () => fetchUser(userId.value))
```

## Computed URL

Watching a ref does NOT change a URL built at invoke time. Use reactive `query` or a getter URL:

```vue
<script setup lang="ts">
const id = ref(null)
const { data, status } = useLazyFetch(() => `/api/users/${id.value}`, { immediate: false })
</script>
```

## Refresh / clear

`refresh()`/`execute()` (execute is the semantic alias for non-immediate). `clear()` resets data to default/undefined. Global: `clearNuxtData`, `refreshNuxtData`.

## Headers & cookies

On the server, `useFetch` with a relative URL proxies client headers/cookies via `useRequestFetch` (except unsafe ones like `host`). For manual `$fetch`, forward with `useRequestHeaders(['cookie'])`. Never blindly proxy headers to external APIs — skip `host`, `accept`, `content-*`, `x-forwarded-*`, `cf-*`.

To pass cookies back client-side on SSR response, use `$fetch.raw` + `appendResponseHeader(event, 'set-cookie', cookie)`.

## Serialization

Payload from `useAsyncData` (and `useState`, Nuxt payload) serialized with `devalue` — supports Date, Map, Set, RegExp, ref, reactive, NuxtError, etc. Data from `server/` routes fetched via `$fetch`/`useFetch` is serialized with `JSON.stringify` (a returned `Date` becomes a string). Customize with a `toJSON()` method on the returned object, or use superjson with `transform`.

## Recipes

- **SSE via POST**: `$fetch('/x', { method: 'POST', responseType: 'stream' })` then read via `response.pipeThrough(new TextDecoderStream()).getReader()`. (GET SSE: use `EventSource`/VueUse `useEventSource`.)
- **Parallel**: `Promise.all([...])` inside one `useAsyncData`.

## Options API

Wrap component in `defineNuxtComponent` with `asyncData()` + `fetchKey`.

## Referência

- [Data Fetching](https://nuxt.com/docs/4.x/getting-started/data-fetching) — doc oficial Nuxt v4
