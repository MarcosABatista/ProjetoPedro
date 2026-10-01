---
inclusion: auto
name: nuxt-kit-build-runtime
description: Use when a Nuxt module needs to touch build/runtime — builder (Vite/webpack) config, Nitro server, templates, plugins, layouts, pages/routes, head, app/runtime config, layers, logging.
---
# Nuxt v4 Kit — Build & Runtime

All utils from `@nuxt/kit`, used inside module `setup(options, nuxt)`. Path helpers via `createResolver(import.meta.url)`.

## Builder (Vite/webpack)
- `extendViteConfig(cb, opts?)` — DEPRECATED; prefer a Vite plugin with `config`/`applyToEnvironment`. Opts: `dev`, `build`, `server`(dep. N5+), `client`(dep. N5+), `prepend`.
- `extendWebpackConfig(cb, opts?)` — same opts.
- `addVitePlugin(pluginOrGetter, opts?)` — append Vite plugin. Getter may be async (lazy-load). N5+: `server:false`/`client:false` don't call `config`/`configResolved` — use `applyToEnvironment(env)` + `configEnvironment(name, config)` for env-specific.
```ts
addVitePlugin(() => ({ name: 'my-client', applyToEnvironment: e => e.name === 'client', configEnvironment(n, c){ /*...*/ } }))
addVitePlugin(() => import('my-vite-plugin').then(r => r.default()))
```
- `addWebpackPlugin(pluginOrGetter, opts?)`.
- `addBuildPlugin(factory, opts?)` — builder-agnostic; `factory = { vite?, webpack?, rspack? }` (each a fn returning plugin(s)).
- `setBuildOutput(key, provider)` — builder↔Nitro contract. keys: `serverEntry`, `clientManifest`, `clientPrecomputed`, `ssrStyles`, `entryChunkName`, `entryIds`. Provider = (async) fn returning module body string.

## Nitro (server engine)
- `addServerHandler({ handler, route?, middleware?, lazy?, method? })` — server route/middleware. Empty `route` → middleware.
```ts
addServerHandler({ route: '/robots.txt', handler: resolve('./runtime/robots.get') })
```
- `addDevServerHandler({ handler, route? })` — dev-only handler (excluded from prod).
- `useNitro(): Nitro` — only after `ready` hook; config changes NOT applied.
- `tryUseNitro(): Nitro | undefined` — returns undefined when no server (SPA/`server.builder` without Nitro). Prefer for anything server-only.
- `addServerPlugin(path)` — Nitro runtime plugin. Plugin must `defineNitroPlugin` imported from `nitropack/runtime` (same for `useRuntimeConfig`).
- `addPrerenderRoutes(routes: string | string[])`.
- `addServerImports(imports)` / `addServerImportsDir(dirs, { prepend? })` — Nitro auto-imports (server equivalent of `addImports`). For `shared/` utils, import from same source file with identical signature in both `addImports` and `addServerImports`.
- `addServerScanDir(dirs, { prepend? })` — scan dir like `~~/server`; only `api`, `routes`, `middleware`, `utils` subdirs scanned.

## Templates (virtual FS, build-time codegen)
- `addTemplate(template): ResolvedNuxtTemplate` — props: `src` | `getContents(data)`, `filename`, `dst`, `options`, `write` (also write to disk in `buildDir`), `dependsOn`. Import via `#build/<filename>`.
  `dependsOn`: `[]` = never recompile on file changes; `['pages'|'plugins']` known keys; or `(change, ctx) => boolean`. Undeclared → regenerated on every change (dev).
```ts
addTemplate({ filename: 'meta.config.mjs', getContents: () => 'export default ' + JSON.stringify(cfg) })
// runtime: import cfg from '#build/meta.config.mjs'
```
- `addTypeTemplate(template, context?)` — writes + registers as types. `context: { nuxt?, nitro? }` (default Nuxt only; `nitro:true` adds to server context).
- `addServerTemplate({ filename, getContents })` — virtual file for Nitro build (e.g. `#my-module/test.mjs`).
- `updateTemplates({ filter? })` — regenerate matching templates (all if no filter). Typically inside `builder:watch` hook.

## Plugins (Vue app-level)
- `addPlugin(plugin | src, { append? }): NuxtPlugin` — plugin props: `src` (req), `mode ('all'|'server'|'client')` (or `.client`/`.server` in `src`), `order` (advanced; user plugins=0, pre≈-20, post≈20; prefer `append`).
```ts
addPlugin({ src: resolve('runtime/plugin.js'), mode: 'client' })
```
- `addPluginTemplate(pluginOptions, { append? })` — build-time generated plugin. props: `src` | `getContents`, `filename`, `dst`, `mode`, `options`, `write`, `order`. Prefer `getContents` for dynamic gen.

## Layout
- `addLayout(layout | src, name)` — register template as layout under `name`. layout props: `src` | `getContents`, `filename`, `dst`, `options`, `write`. For virtual `.vue`, pass `write: true` (vite plugin-vue can't handle virtual `.vue`).
```ts
addLayout({ write: true, filename: 'my-layout.vue', getContents: () => `<template><header/><slot/></template>` }, 'custom')
```

## Pages / Routes
- `extendPages(cb: (pages: NuxtPage[]) => void)` — mutate pages array in place (don't copy). NuxtPage: `name`, `path`, `file`, `meta`, `alias`, `redirect`, `children`.
```ts
extendPages(pages => pages.unshift({ name: 'preview', path: '/preview', file: resolve('runtime/preview.vue') }))
```
  Augment types: `declare module '@nuxt/schema' { interface NuxtPageMeta { requiresAuth?: boolean } }`.
- `extendRouteRules(route, rule: NitroRouteConfig, { override? })` — redirect/proxy/cache/headers.
```ts
extendRouteRules('/preview', { redirect: { to: '/preview-new', statusCode: 302 } })
extendRouteRules('/preview-new', { cache: { maxAge: 604800 } })
```
- `addRouteMiddleware(input | input[], { override?, prepend? })` — middleware props: `name` (req), `path` (req), `global`.
```ts
addRouteMiddleware({ name: 'auth', path: resolve('runtime/auth'), global: true }, { prepend: true })
```

## Head
- `setGlobalHead(head: AppHeadMetaObject)` — deep-merged (your values win). props: `charset`, `viewport`, `meta[]`, `link[]`, `style[]`, `script[]`, `noscript[]`, `title`, `titleTemplate`, `bodyAttrs`, `htmlAttrs`.
```ts
setGlobalHead({ meta: [{ name: 'theme-color', content: '#fff' }], htmlAttrs: { lang: 'en' } })
```

## App config
- `updateAppConfig(appConfig)` — merged into `nuxt.options.appConfig` via defu (defaults, user-overridable).

## Runtime config
- `useRuntimeConfig(): Record<string, unknown>` — resolved runtime config at build-time.
- `updateRuntimeConfig(config)` — merges; triggers Nitro HMR reload if already initialized.

## Layers
- `getLayerDirectories(nuxt?): LayerDirectories[]` — resolved dirs per layer (avoids private `_layers`). Cached (WeakMap); paths have trailing slash.
  LayerDirectories: `root`, `server`, `modules`, `shared`, `public`, `app` (srcDir), `appLayouts`, `appMiddleware`, `appPages`, `appPlugins`.
  Ordering: index 0 = user/project layer (highest priority); earlier overrides later; base layers last. Reverse to apply low→high priority.

## Logging
- `useLogger(tag?, options?): NuxtLogger` — consola-based. options: `level`, `reporters`, `defaults`, `formatOptions`.
```ts
const logger = useLogger('my-module', { level: options.quiet ? 0 : 3 })
logger.info('...')
```
- `useTerminal(): NuxtTerminal` — interactive host primitives (falls back to logging when not interactive). Props/methods: `interactive`, `withTerminal(work)`, `prompt(msg, opts?)`, `startTask(label)` → `task.update(label)`/`task.stop(msg?, outcome?)`, `notify(notification)` → `notice.dismiss()`/`notice.dismissed`.
```ts
const t = useTerminal()
if (await t.prompt('Install my-module?', { type: 'confirm' })) {
  const task = t.startTask('Installing...'); await install(); task.stop('Installed')
}
```

## Referência

- [Kit — Builder](https://nuxt.com/docs/4.x/api/kit/builder)
- [Kit — Nitro](https://nuxt.com/docs/4.x/api/kit/nitro)
- [Kit — Runtime Config](https://nuxt.com/docs/4.x/api/kit/runtime-config)
- [Kit — Templates](https://nuxt.com/docs/4.x/api/kit/templates)
- [Kit — Plugins](https://nuxt.com/docs/4.x/api/kit/plugins)
- [Kit — Layout](https://nuxt.com/docs/4.x/api/kit/layout)
- [Kit — Pages](https://nuxt.com/docs/4.x/api/kit/pages)
- [Kit — Head](https://nuxt.com/docs/4.x/api/kit/head)
- [Kit — App Config](https://nuxt.com/docs/4.x/api/kit/app-config)
- [Kit — Layers](https://nuxt.com/docs/4.x/api/kit/layers)
- [Kit — Logging](https://nuxt.com/docs/4.x/api/kit/logging)
