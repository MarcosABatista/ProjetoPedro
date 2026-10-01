---
inclusion: fileMatch
fileMatchPattern: ["app/error.vue", "app/**/*.vue", "server/**/*.ts"]
name: nuxt-error-handling-overview
description: Nuxt v4 error handling — Vue/startup/Nitro/chunk errors, error.vue full-screen page, createError/showError/clearError/useError utils, and NuxtErrorBoundary for local errors. Use when handling runtime errors, building error pages, or catching component errors.
---

# Nuxt v4 — Error Handling

Error sources: Vue render lifecycle (SSR & CSR), server/client startup, Nitro server lifecycle, JS chunk downloads.

## Vue errors

Hook `onErrorCaptured` (component) or the `vue:error` Nuxt hook (top-level). Global handler via `vueApp.config.errorHandler`.

```ts [plugins/error-handler.ts]
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.config.errorHandler = (error, instance, info) => { /* report */ }
  nuxtApp.hook('vue:error', (error, instance, info) => { /* report */ })
})
```

## Startup errors

`app:error` hook fires for errors during: plugins, `app:created`/`app:beforeMount`, SSR render, client mount, `app:mounted`.

## Chunk errors

Chunk load failures (network / new deploy invalidating hashed URLs) trigger a hard reload on navigation by default. Change via `experimental.emitRouteChunkError` (`false` to disable, `'manual'` to handle yourself).

## error.vue

Fatal errors (any unhandled server error, or client error with `fatal: true`) render `~/error.vue` (alongside `app.vue`) — or JSON if `Accept: application/json`.

```vue [error.vue]
<script setup lang="ts">
import type { NuxtError } from '#app'
const props = defineProps({ error: Object as () => NuxtError })
const handleError = () => clearError({ redirect: '/' })
</script>
<template>
  <div>
    <h2>{{ error?.status }}</h2>
    <button @click="handleError">Clear errors</button>
  </div>
</template>
```

Notes: rendering the error page is a full separate page load (middleware re-runs; use `useError` to detect). If a plugin threw, don't use `$route`/`useRouter` before clearing. In v4, `error.data` is parsed automatically (no manual `JSON.parse`).

## Error utils

- **useError()**: returns the global handled error ref (`{ url, status, statusText, message, description, data }`).
- **createError(err)**: create error with metadata; meant to be thrown. On server → full-screen error page; on client → non-fatal unless `fatal: true`. `cause` preserved in dev only.

```vue [pages/movies/[slug].vue]
<script setup lang="ts">
const route = useRoute()
const { data } = await useFetch(`/api/movies/${route.params.slug}`)
if (!data.value) {
  throw createError({ status: 404, statusText: 'Page Not Found' })
}
</script>
```

`statusText` = short HTTP-compliant text (`[\t\u0020-\u007E]` only). Use `message` for detailed/multi-line/non-ASCII.

- **showError(err)**: triggers full-screen error page anytime client-side or in server middleware/plugins/setup. Prefer `throw createError()`.
- **clearError({ redirect })**: clears the handled error, optional redirect.

## NuxtErrorBoundary (local)

Handle client-side errors without replacing the whole site. `#error` slot receives `error` prop; navigation auto-clears.

```vue [app/pages/index.vue]
<template>
  <NuxtErrorBoundary @error="someErrorLogger">
    <!-- default slot content -->
    <template #error="{ error, clearError }">
      {{ error }}
      <button @click="clearError">Clear</button>
    </template>
  </NuxtErrorBoundary>
</template>
```

Server-side Nitro errors can't have a custom handler yet — render an error page instead.

## Referência

- [Error Handling](https://nuxt.com/docs/4.x/getting-started/error-handling) — doc oficial Nuxt v4
