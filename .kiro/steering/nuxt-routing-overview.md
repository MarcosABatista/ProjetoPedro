---
inclusion: fileMatch
fileMatchPattern: ["app/pages/**/*.vue", "app/middleware/**/*.ts"]
name: nuxt-routing-overview
description: Nuxt v4 file-system routing — pages/ conventions, dynamic [id] routes, NuxtLink navigation/prefetch, useRoute params, route middleware (inline/named/global) and validate. Use when adding routes, navigation, guards, or route validation.
---

# Nuxt v4 — Routing

File-system router: every `.vue` in `app/pages/` → a route (via vue-router). Code-splitting per route by default.

## Conventions

```
pages/
  index.vue        -> /
  about.vue        -> /about
  posts/[id].vue   -> /posts/:id
```

## Navigation — NuxtLink

Renders `<a>`; client-side transitions after hydration; auto-prefetches components + payload when link enters viewport.

```vue [app/pages/index.vue]
<template>
  <NuxtLink to="/about">About</NuxtLink>
  <NuxtLink to="/posts/1">Post 1</NuxtLink>
</template>
```

## Route params — useRoute

```vue [pages/posts/[id].vue]
<script setup lang="ts">
const route = useRoute()
console.log(route.params.id) // "1" at /posts/1
</script>
```

## Route Middleware

Runs in the Vue part of the app (NOT for server `/api/*` routes — use server middleware for those). Three kinds:

1. **Inline/anonymous** — defined in the page via `definePageMeta`.
2. **Named** — in `app/middleware/`, auto-loaded when referenced. Name normalized to kebab-case (`someMiddleware` → `some-middleware`).
3. **Global** — in `app/middleware/` with `.global` suffix, runs every route change.

```ts [middleware/auth.ts]
export default defineNuxtRouteMiddleware((to, from) => {
  if (!isAuthenticated()) {
    return navigateTo('/login')
  }
})
```

```vue [pages/dashboard.vue]
<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
</script>
```

## Route Validation

`validate` in `definePageMeta` receives the route; return `false` → 404, or return `{ status, statusText }`. Use anonymous middleware for complex cases.

```vue [pages/posts/[id].vue]
<script setup lang="ts">
definePageMeta({
  validate (route) {
    return typeof route.params.id === 'string' && /^\d+$/.test(route.params.id)
  },
})
</script>
```

Gotcha (v4/compat 5): route metadata like `name`/`path` set via `definePageMeta` is only on `route.*`, not `route.meta.*`. Typed pages are enabled by default under compat 5 — broken `to` props / stale route names error at type-check.

## Referência

- [Routing](https://nuxt.com/docs/4.x/getting-started/routing) — doc oficial Nuxt v4
