---
inclusion: auto
name: nuxt-deployment-overview
description: Nuxt v4 deployment — Node.js server preset (.output/server/index.mjs, env vars, PM2, cluster), static hosting (SSG vs SPA, 200/404 fallbacks), Nitro presets, and CDN/Cloudflare gotchas. Use when deploying, configuring hosting, or setting the Nitro preset.
---

# Nuxt v4 — Deployment

Deploy as Node.js server, static hosting, or serverless/edge.

## Node.js server (default preset)

`nuxt build` → runnable Node server entry:

```bash
NODE_ENV=production node .output/server/index.mjs
```

Set `NODE_ENV=production` (some deps, e.g. Vue Router, only strip dev warnings when set). Listens on port 3000 by default.

Runtime env vars: `NITRO_PORT`/`PORT` (3000), `NITRO_HOST`/`HOST` (`0.0.0.0`), `NITRO_SSL_CERT` + `NITRO_SSL_KEY` (HTTPS mode — testing only; prefer a reverse proxy).

Subpath deploy: set `app.baseURL` or `NUXT_APP_BASE_URL`.

### PM2

```js [ecosystem.config.cjs]
module.exports = {
  apps: [{
    name: 'NuxtAppName', port: '3000',
    exec_mode: 'cluster', instances: 'max',
    script: './.output/server/index.mjs',
    env: { NODE_ENV: 'production' },
  }],
}
```

### Cluster mode

`NITRO_PRESET=node_cluster` — multi-process via Node cluster (round-robin).

## Static hosting

Two ways:
- **SSG** (`ssr: true`, default for `nuxt generate`): prerenders routes at build; emits `/200.html` + `/404.html` SPA fallbacks.
- **Static SPA** (`ssr: false`): empty `<div id="__nuxt">` shell; loses SEO — wrap non-SSR parts in `<ClientOnly>`.

Prerendered routes also emit `_payload.json` (build-time data reused on client nav).

### Fallback pages

- `200.html` — SPA fallback for unmatched routes (client routing).
- `404.html` — not-found fallback (keeps 404 status).

`nuxt generate` / `nuxt build --prerender` create these automatically. With `nuxt build` + route rules, add explicitly:

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  routeRules: { '/200.html': { prerender: true } },
})
```

Both fallbacks are empty by default; `experimental.prerenderErrorPages` server-renders `error.vue` into `404.html`. Check your host's fallback/rewrite settings (providers differ on 200 vs 404).

### Client-only

```ts [nuxt.config.ts]
export default defineNuxtConfig({ ssr: false })
```

## Presets

```ts [nuxt.config.ts]
export default defineNuxtConfig({ nitro: { preset: 'node-server' } })
```

Or `NITRO_PRESET=node-server nuxt build`. See Nitro docs for all presets/providers.

## CDN / Cloudflare gotchas

Disable to avoid hydration/re-render issues:
1. Speed > Content Optimization > "Rocket Loader™"
2. Security > "Email Address Obfuscation"

## Referência

- [Deployment](https://nuxt.com/docs/4.x/getting-started/deployment) — doc oficial Nuxt v4
