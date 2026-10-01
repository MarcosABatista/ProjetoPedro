---
inclusion: auto
name: nuxt-advanced-hooks-import-meta
description: Use for Nuxt lifecycle hooks (app runtime, build-time Nuxt hooks, Nitro server hooks) and import.meta environment flags for tree-shaking client/server code.
---
# Nuxt v4 Advanced — Lifecycle Hooks & import.meta

## Hooks — how to register
Runtime (app) hooks: `nuxtApp.hook('name', cb)` in a plugin. Build-time (Nuxt) hooks: `nuxt.hook('name', cb)` in a module or via `hooks` in `nuxt.config`. Nitro runtime hooks: `nitroApp.hooks.hook('name', cb)` in a Nitro plugin.

## App Hooks (Runtime)
Server & Client:
- `app:created(vueApp)` — initial vueApp created.
- `app:error(err)` — fatal error.
- `app:error:cleared({ redirect? })`.
- `vue:setup()` — Nuxt root setup init (must be sync).
- `vue:error(err, target, info)` — Vue error reached root.

Server only:
- `app:rendered(renderContext)` — SSR done.
- `app:redirected()` — before SSR redirect.

Client only:
- `app:beforeMount(vueApp)` / `app:mounted(vueApp)`.
- `app:suspense:resolve(appComponent)`.
- `app:manifest:update({ id, timestamp })` — newer app version detected.
- `app:data:refresh(keys?)` — on `refreshNuxtData`.
- `link:prefetch(to)` — `<NuxtLink>` prefetch observed.
- `page:start(pageComponent?)` / `page:finish(pageComponent?)` — Suspense pending/resolved in NuxtPage.
- `page:loading:start` / `page:loading:end` — nav begins / after `page:finish`. May fire without page `setup()` re-running if page reused (static `key`).
- `page:transition:finish(pageComponent?)` — after transition onAfterLeave.
- `page:view-transition:start(transition)` — after `document.startViewTransition` (experimental viewTransition); `transition.types` readable/mutable.
- `dev:ssr-logs(logs)` — SSR logs passed to client (if `features.devLogs`).

## Nuxt Hooks (Build Time)
Lifecycle: `kit:compatibility`, `ready(nuxt)`, `close(nuxt)`, `restart({ hard? })`.
Modules: `modules:before`, `modules:done`, `module:before(module)`, `module:done(module)`.
App/templates: `app:resolve(app)`, `app:templates(app)` (add/modify build-dir files), `app:templatesGenerated(app)`.
Build: `build:before`, `build:done`, `build:manifest(manifest)` (customize `<script>`/`<link>` in HTML), `builder:generateApp(options)`, `builder:watch(event, path)` (dev file changes), `build:error(error)`.
Pages: `pages:extend(pages)` (after FS scan), `pages:resolved(pages)` (after metadata augment), `pages:routerOptions({ files })` (later overrides earlier).
Imports: `imports:sources(presets)`, `imports:extend(imports)`, `imports:context(context)`, `imports:dirs(dirs)`.
Components: `components:dirs(dirs)` (within `app:resolve`), `components:extend(components)`.
Nitro: `nitro:config(nitroConfig)` (before init), `nitro:init(nitro)` (register Nitro hooks), `nitro:build:before(nitro)`, `nitro:build:public-assets(nitro)`, `prerender:routes(ctx)`.
Server/dev: `server:devHandler(handler)`, `listen(listenerServer, listener)`.
Types: `prepare:types(options)` (before writing tsconfig/`nuxt.d.ts`).
Schema: `schema:extend(schemas)`, `schema:resolved(schema)`, `schema:beforeWrite(schema)`, `schema:written`.
Vite: `vite:extend(ctx)`, `vite:extendConfig(config, env)` (DEPRECATED N5+ — shared config), `vite:configResolved(config, env)` (DEPRECATED N5+), `vite:serverCreated(server, env)`, `vite:compiled`.
webpack: `webpack:config(configs)`, `webpack:configResolved(configs)`, `webpack:compile(options)`, `webpack:compiled(options)`, `webpack:change(shortPath)`, `webpack:error`, `webpack:done`, `webpack:progress(states)`.

## Nitro App Hooks (Runtime, Server-Side)
- `dev:ssr-logs({ path, logs })`.
- `render:response(response, { event })` — before sending response.
- `render:html(html, { event })` — before constructing HTML.
- `render:island(islandResponse, { event, islandContext })`.
- `close()`.
- `error(error, { event? })`.
- `request(event)`, `beforeResponse(event, { body })`, `afterResponse(event, { body })`.
```ts [server/plugins/logger.ts]
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('render:html', (html, { event }) => { /* mutate html */ })
})
```

## import.meta — environment flags
ES module metadata. Runtime flags are statically injected → use for tree-shaking (dead branch removed from bundle).

Runtime (app) properties (all boolean unless noted):
- `import.meta.client` / `import.meta.browser` — true on client.
- `import.meta.server` / `import.meta.nitro` — true on server.
- `import.meta.dev` — true in dev server.
- `import.meta.envName` (string, v4.5) — current env name (incl. custom `--envName`).
- `import.meta.test` — true in test context.
- `import.meta.prerender` — true during prerender stage of build.

Builder properties (modules + `nuxt.config`):
- `import.meta.env` — equals `process.env`.
- `import.meta.url` (string) — resolvable path of current file.

```ts
if (import.meta.server) { /* server-only, stripped from client bundle */ }
if (import.meta.client) { /* client-only */ }
```
Resolve files in modules with `createResolver(import.meta.url)`:
```ts [modules/my-module/index.ts]
const resolver = createResolver(import.meta.url)
addComponent({ name: 'MyModuleComponent', filePath: resolver.resolve('./components/MyModuleComponent.vue') })
```

## Referência

- [Advanced — Hooks](https://nuxt.com/docs/4.x/api/advanced/hooks)
- [Advanced — import.meta](https://nuxt.com/docs/4.x/api/advanced/import-meta)
