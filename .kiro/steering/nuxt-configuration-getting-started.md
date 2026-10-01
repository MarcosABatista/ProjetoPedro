---
inclusion: fileMatch
fileMatchPattern: ["nuxt.config.ts", ".nuxtrc", "package.json"]
name: nuxt-configuration-getting-started
description: Nuxt v4 project bootstrap and configuration — nuxt.config.ts, runtimeConfig vs app.config, env overrides, v4 directory structure and v3->v4/v5 upgrade gotchas. Use when scaffolding a project, editing config, or resolving migration/compat issues.
---

# Nuxt v4 — Getting Started & Configuration

Nuxt v4: type-safe full-stack Vue 3 framework. SSR by default, file-based routing, auto-imports, Nitro server engine, Vite bundler, zero-config TypeScript. No vendor lock-in.

## Install & Run

Prereqs: Node.js 22.x+ (even LTS). Create + dev:

```bash
pnpm create nuxt@latest <project-name>
cd <project-name>
pnpm dev -o   # -o opens browser at http://localhost:3000
```

Windows: use `127.0.0.1` not `localhost` for faster DNS.

## v4 Directory Structure

`srcDir` defaults to `app/`. `~` alias points to `app/`.

```
.nuxt/  .output/
app/            # srcDir
  assets/ components/ composables/ layouts/ middleware/ pages/ plugins/ utils/
  app.config.ts app.vue error.vue
content/ layers/ modules/ public/    # resolved from rootDir
shared/         # shared app<->server; auto-imports shared/utils/ + shared/types/
  types/ utils/
server/         # serverDir = <rootDir>/server
  api/ middleware/ plugins/ routes/ utils/
nuxt.config.ts
```

`server/` lives OUTSIDE `app/` (different runtime context / globals). `shared/` is for code used by both Vue app and Nitro.

## nuxt.config.ts

`defineNuxtConfig` is globally available (no import). Prefer `.ts`.

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  // config
})
```

Single source of truth: Nitro, PostCSS, Vite, webpack are configured via their keys here (`nitro`, `postcss`, `vite`, `webpack`), NOT separate config files.

### Environment Overrides

Fully-typed per-environment overrides via `$` keys. Select with `nuxt build --envName staging`.

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  $production: { routeRules: { '/**': { isr: true } } },
  $development: {},
  $env: { staging: {} },
})
```

### runtimeConfig vs app.config

`runtimeConfig`: private/public tokens overridable by env vars after build. Server-only by default; `public` keys exposed client-side.

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  runtimeConfig: {
    apiSecret: '123',          // server-only
    public: { apiBase: '/api' }, // client + server
  },
})
```

```ini [.env]
NUXT_API_SECRET=api_secret_token   # overrides runtimeConfig.apiSecret
NUXT_PUBLIC_API_BASE=/api          # overrides runtimeConfig.public.apiBase
```

Read with `useRuntimeConfig()`.

`app.config.ts` (in `app/`): public, build-time-only values (theme, title). NOT env-overridable. Non-primitive types + HMR supported. Read with `useAppConfig()`.

```ts [app/app.config.ts]
export default defineAppConfig({
  title: 'Hello Nuxt',
  theme: { dark: true, colors: { primary: '#ff0000' } },
})
```

Rule of thumb: secrets/env-dependent → `runtimeConfig`; static public site config → `app.config`.

### Vue options

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  vite: { vue: { customElement: true }, vueJsx: { mergeProps: true } },
  vue: { propsDestructure: true },
})
```

## Rendering modes

SSR default. Static: `nuxt generate`. SPA: `ssr: false`. Hybrid: `routeRules`.

## Upgrading

```bash
pnpm nuxt upgrade          # latest release
pnpm add nuxt@^4.0.0       # to v4
```

Codemods automate most v3->v4 migration: `pnpm dlx codemod@0.18.7 nuxt/4/migration-recipe`.

### Key v3 -> v4 changes (mostly default now)

- **Directory structure**: new `app/` srcDir (auto-detected; v3 layout still works). Force v3: `srcDir: '.'`.
- **Singleton data layer**: same key in `useAsyncData`/`useFetch` shares `data`/`error`/`status` refs. Options (`deep`, `transform`, `pick`, `getCachedData`, `default`) must be consistent per key. Data auto-cleaned when last consumer unmounts.
- **Shallow reactivity**: `data` is `shallowRef`. Opt into deep with `{ deep: true }`.
- **`data`/`error` default to `undefined`** (was `null`).
- **`pending`** now `false` until first request when `immediate: false`.
- **`dedupe: boolean` removed** → use `'cancel'` / `'defer'`.
- **Normalized component names**: Vue name matches auto-import name (`SomeFolderMyComponent`).
- **Unhead v2**: removed `vmid`/`hid`/`children`/`body` props; Capo.js sorting.
- **`window.__NUXT__` removed** → `useNuxtApp().payload`.
- **`generate` config removed** → use `nitro.prerender`.
- **tsconfig**: `noUncheckedIndexedAccess: true`; split tsconfigs (`.nuxt/tsconfig.{app,server,node,shared}.json`).
- **Shared prerender data** enabled: ensure `useAsyncData` keys uniquely identify data.

### Testing Nuxt 5 early

```ts [nuxt.config.ts]
export default defineNuxtConfig({ future: { compatibilityVersion: 5 } })
```

Opts into: Vite Environment API, case-sensitive routing, normalized page names, `clearNuxtState` resets to defaults, non-async `callHook`, comment-node client-only placeholders, `noUncheckedSideEffectImports`, Options API compiled out, `typedPages` on by default. Nuxt 5 drops bundled `jiti` (needs Node 22.19+, native TS type-stripping; add explicit `.ts` extensions to relative imports in `nuxt.config`/`modules/`/layer configs).

## Referência

- [Introduction](https://nuxt.com/docs/4.x/getting-started/introduction) — doc oficial Nuxt v4
- [Installation](https://nuxt.com/docs/4.x/getting-started/installation) — doc oficial Nuxt v4
- [Configuration](https://nuxt.com/docs/4.x/getting-started/configuration) — doc oficial Nuxt v4
- [Upgrade Guide](https://nuxt.com/docs/4.x/getting-started/upgrade) — doc oficial Nuxt v4
