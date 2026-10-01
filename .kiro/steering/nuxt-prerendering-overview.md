---
inclusion: fileMatch
fileMatchPattern: ["nuxt.config.ts"]
name: nuxt-prerendering-overview
description: Nuxt v4 prerendering — nuxt generate crawler, selective prerender via nitro.prerender/routeRules/defineRouteRules, payload extraction modes, and runtime prerenderRoutes/hooks. Use when statically generating pages, configuring which routes prerender, or tuning payload output.
---

# Nuxt v4 — Prerendering

Render select pages at build time; serve prebuilt HTML instead of on-the-fly.

## Crawl-based prerendering

`nuxt generate` (= `nuxt build` with `nitro.static: true`, or `nuxt build --prerender`). Nitro crawler:

1. Renders `/`, non-dynamic `~/pages`, and `nitro.prerender.routes`.
2. Saves HTML + `_payload.json` to `.output/public/`.
3. Follows `<a href>` links, repeating until none left.

```bash
pnpm nuxt generate
npx serve .output/public   # preview
```

Also emits `200.html` / `404.html` SPA fallbacks. Pages not linked from a discoverable page are NOT auto-prerendered.

## Selective prerendering

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  nitro: {
    prerender: {
      routes: ['/user/1', '/user/2', '/sitemap.xml', '/robots.txt'],
      ignore: ['/dynamic'],
      crawlLinks: true, // follow links from listed routes
    },
  },
})
```

`nitro.prerender: true` ≈ `crawlLinks: true`.

Via routeRules:

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  routeRules: {
    '/rss.xml': { prerender: true },
    '/this-DOES-NOT-get-prerendered': { prerender: false },
    '/blog/**': { prerender: true }, // if linked
  },
})
```

Page-level shorthand `defineRouteRules({ prerender: true })` needs `experimental.inlineRouteRules: true`.

## Payload extraction

Nuxt serializes `useAsyncData`/`useFetch`/`useState` into a payload; can also write `_payload.json` per route. Prerendered routes generate it at build; ISR/SWR routes generate on first render.

`experimental.payloadExtraction`:
- `'client'` — inlined in HTML for first render, extracted for client nav. No extra first-load request. (Default under compat 5.)
- `true` — separate `_payload.json` for both (smaller HTML, CDN-cacheable, +1 request first load). Default.
- `false` — always inlined, no files. Forced when `ssr: false`.

Consequences: static sites reuse build-time data on client nav (stale until rebuild); custom types need payload reducers/revivers (devalue).

## Runtime config

- `prerenderRoutes(['/x'])` — register extra routes at runtime within Nuxt context.
- `prerender:routes` Nuxt hook — add routes before prerendering (e.g. from a CMS).
- `prerender:generate` Nitro hook — per-route handling (e.g. `route.skip = true`).

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  hooks: {
    async 'prerender:routes' (ctx) {
      const { pages } = await fetch('https://api.cms.com/pages').then(r => r.json())
      for (const page of pages) ctx.routes.add(`/${page.name}`)
    },
  },
})
```

## Referência

- [Prerendering](https://nuxt.com/docs/4.x/getting-started/prerendering) — doc oficial Nuxt v4
