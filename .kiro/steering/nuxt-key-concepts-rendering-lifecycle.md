---
inclusion: auto
name: nuxt-key-concepts-rendering-lifecycle
description: Use when choosing rendering modes, configuring route rules, reasoning about SSR/hydration lifecycle, Nitro server engine, or building server/island components in Nuxt v4.
---
# Nuxt Rendering, Lifecycle, Server Engine & Server Components

## Rendering Modes

Nuxt defaults to **universal rendering** (SSR + hydration). Switch modes via `ssr` and `routeRules`.

- **Universal**: runs Vue on server, returns full HTML, then hydrates. Best for content sites, blogs, e-commerce, SEO.
- **Client-side (SPA)**: `ssr: false`. Best for back-office/SaaS apps that don't need indexing.
- **Hybrid**: per-route rules.
- **Edge (ESR)**: deploy target via Nitro (`NITRO_PRESET=vercel-edge`/`netlify-edge`, or Cloudflare Pages zero-config).

```ts [nuxt.config.ts]
export default defineNuxtConfig({ ssr: false })
```

What runs where in universal mode: top-level `<script setup>` runs on server AND client (hydration). Event handler bodies (`@click`) run only in the browser.

```vue [app/app.vue]
<script setup lang="ts">
const counter = ref(0)           // server + client
const handleClick = () => { counter.value++ } // client only
</script>
<template>
  <p>Count: {{ counter }}</p>
  <button @click="handleClick">Increment</button>
</template>
```

Gotcha: importing a library with browser-API side effects must be client-only; bundlers do not treeshake side-effectful modules.

### SPA static deploy

With `ssr: false` add `~/spa-loading-template.html`. `nuxt generate` / `nuxt build --prerender` emit `index.html`, `200.html`, `404.html` into `.output/public/`. To emit only fallbacks, clear routes:

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  hooks: { 'prerender:routes' ({ routes }) { routes.clear() } },
})
```

- **200.html**: served for unmatched paths, client router takes over.
- **404.html**: served with 404 status, still loads app (empty shell by default).

Prerender `error.vue` into `404.html`:

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  experimental: { prerenderErrorPages: true }, // or [404, 500]
})
```

Request-specific data must skip build-time fetch (single file served for all missing paths): use `import.meta.prerender` (`true` only during generation) and wrap request-specific markup in `<ClientOnly>`.

```vue [error.vue]
const { data } = await useAsyncData('x', () => $fetch('/api/x', { query: { path: route.path } }),
  { server: !import.meta.prerender })
```

### Hybrid Rendering & Route Rules

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  routeRules: {
    '/': { prerender: true },
    '/products': { swr: true },
    '/products/**': { swr: 3600 },
    '/blog': { isr: 3600 },
    '/blog/**': { isr: true },
    '/admin/**': { ssr: false },
    '/api/**': { cors: true },
    '/old-page': { redirect: '/new-page' },
  },
})
```

Route rule properties:
- `redirect: string` – server-side redirect
- `ssr: boolean` – `false` = browser-only render
- `cors: boolean` – adds CORS headers
- `headers: object` – custom headers
- `swr: number | boolean` – cache on server/proxy for TTL, stale-while-revalidate
- `isr: number | boolean` – like `swr` but on CDN (Netlify/Vercel); `true` persists until next deploy
- `prerender: boolean` – build-time static asset
- `noScripts: boolean` – omit Nuxt scripts/JS hints
- `appMiddleware: string | string[] | Record<string, boolean>` – control app middleware per path

`isr`/`swr` routes also emit `_payload.json` reused on client navigation. `ssr: false` routes are excluded from server bundle at build time (build-time optimization only). Hybrid Rendering is **not** available with `nuxt generate`.

## Nuxt Lifecycle

### Server (per initial request)
1. **Server plugins** (`server/plugins/`) – run once at Nitro start (per request in serverless, not awaited).
2. **Server middleware** (`server/middleware/`) – every request. Returning a value terminates the request (avoid).
3. **App plugins** – built-in (Vue Router, `unhead`) + `app/plugins/` (no suffix or `.server`). Then `app:created` hook.
4. **Route validation** – `validate` in `definePageMeta` (return `true`, or `false`/`{ status, statusText }`).
5. **App middleware** – global (server + client), named, anonymous. Server redirects send `Location:` header (state resets unless in cookie).
6. **Page and components** – data fetched via `useFetch`/`useAsyncData`. Vue hooks `onBeforeMount`/`onMounted` do NOT run in SSR. No reactivity on server.
7. **HTML output** – merged with `unhead`; `app:rendered` then `render:html` hooks.

Gotcha: no side effects needing cleanup in `<script setup>` root (e.g. `setInterval`) — unmount hooks never fire in SSR. Move to `onMounted`.

### Client
1. **App plugins** – built-in + `app/plugins/` (no suffix or `.client`). Then `app:created`.
2. **Route validation** – same `validate`.
3. **App middleware** – split with `import.meta.client` / `import.meta.server`.
4. **Mount & hydrate** – `app.mount('#__nuxt')`; hydration matches components to DOM (excludes server components). Use `useAsyncData`/`useFetch` for SSR-consistent data to avoid hydration errors. Hooks: `app:beforeMount`, `app:mounted`.
5. **Vue lifecycle** – full Vue lifecycle runs in browser.

## Server Engine (Nitro)

Nitro powers Nuxt: cross-platform (Node, browsers, service workers), serverless, API routes, code-splitting, hybrid static+serverless, HMR dev server.

- **API layer**: `server/` endpoints + middleware via [h3](https://github.com/h3js/h3). Handlers return objects/arrays (auto JSON) or promises.
- **Direct API calls**: `$fetch` (ofetch) calls the function directly on server (no extra HTTP roundtrip), makes HTTP call in browser. Auto JSON parsing, body/params handled.
- **Typed API routes**: Nitro generates typings for routes that return a value (not `res.end()`); accessed via `$fetch()`/`useFetch()`.
- **Standalone server**: `nuxt build` outputs `.output/` independent of `node_modules`; native storage layer with multi-source drivers.

## Server Components (Islands)

Rendered on server; their JS/dependencies never ship to client. Controlled by `experimental.componentIslands` (default `'auto'`).

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  experimental: {
    componentIslands: { selectiveClient: true, remoteIsland: false },
  },
})
```

Create with `.server.vue` suffix (`app/components/HighlightedMarkdown.server.vue`), use like any component. `~/components/islands/` are islands renderable via `<NuxtIsland name="MyIsland" />`. Islands must have a **single root element**.

Under the hood islands use `<NuxtIsland>`: isolated Vue app per island, own `nuxtApp.ssrContext.islandContext`, plugins re-run unless `env: { islands: false }`.

Isolation constraints:
- Cannot share state (provide/inject, Pinia, `useState`) with page — pass via props.
- `useRoute()` reflects island's own request, not the page — pass route info as props/`context`.
- Route middleware does not run for islands.
- Props serialized as **GET query params**: must be JSON-serializable, limited by URL length, may leak in logs/CDN/`Referer`.

Treat props as untrusted. Set `defineOptions({ inheritAttrs: false })` on polymorphic-root islands. Map discriminators through an allowlist rather than passing raw component names.

### Selective hydration (`nuxt-client`)
Requires `selectiveClient: true`. Add `nuxt-client` to hydrate a component inside a static island (only its chunk ships). `selectiveClient: 'deep'` allows slots (rendered on server, non-interactive). Use only on local `.vue` SFCs — built-ins like `<NuxtLink>` skip the islands transform.

### Client navigation cost
Initial load: islands inline, no extra request. On **client navigation**, each island refetches from server (network roundtrip). Use `lazy` prop + `#fallback` slot to render non-blockingly. Islands suit full page loads or few-per-page. Slots come from the parent app and ARE interactive.

### Prerender/caching
Island responses cached during prerender; keyed on name+props+context (why they can't see the current route). Combine with `prerender` + `noScripts` for mostly-static sites (but interactive `nuxt-client` won't hydrate under `noScripts`).

## Referência

- [Rendering Modes](https://nuxt.com/docs/4.x/guide/concepts/rendering) — doc oficial Nuxt v4
- [Nuxt Lifecycle](https://nuxt.com/docs/4.x/guide/concepts/nuxt-lifecycle) — doc oficial Nuxt v4
- [Server Engine](https://nuxt.com/docs/4.x/guide/concepts/server-engine) — doc oficial Nuxt v4
- [Server Components](https://nuxt.com/docs/4.x/guide/concepts/server-components) — doc oficial Nuxt v4
