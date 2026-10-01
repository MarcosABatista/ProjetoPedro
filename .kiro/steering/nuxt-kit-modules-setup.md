---
inclusion: auto
name: nuxt-kit-modules-setup
description: Use when authoring Nuxt modules with @nuxt/kit — defineNuxtModule, dependencies, compatibility checks, auto-imports, components, path resolving, nuxt context, programmatic usage.
---
# Nuxt v4 Kit — Modules & Setup

All utils from `@nuxt/kit`. Inside `defineNuxtModule({ setup(options, nuxt) })`, `nuxt` is provided (no need for `useNuxt()`).

## defineNuxtModule
Defines a module: merges defaults with user options, installs hooks, calls setup.
```ts
import { defineNuxtModule, createResolver } from '@nuxt/kit'
export default defineNuxtModule({
  meta: { name: 'my-module', configKey: 'myModule', compatibility: { nuxt: '>=3.0.0' } },
  defaults: { enabled: true },
  setup (options, nuxt) {
    if (options.enabled) { /* ... */ }
  },
})
```
Definition props: `meta` (name, version, configKey, compatibility), `defaults` (obj or `(nuxt) => obj`), `schema`, `hooks` (Partial<NuxtHooks>), `moduleDependencies`, `onInstall(nuxt)`, `onUpgrade(nuxt, options, previousVersion)`, `setup(resolvedOptions, nuxt)`.

`configKey`: users configure under that key in `nuxt.config`. Setting `myModule: false` disables the module (setup skipped) while still generating option types — handy to disable modules from layers.

Type safety with `.with()`: makes defaulted options non-optional in `resolvedOptions`:
```ts
export default defineNuxtModule<ModuleOptions>().with({
  meta: { name: '@nuxtjs/my-api', configKey: 'myApi' },
  defaults: { baseURL: 'https://api.example.com', timeout: 5000 },
  setup (resolvedOptions, nuxt) { /* baseURL/timeout guaranteed defined */ },
})
```

Lifecycle hooks require BOTH `meta.name` and `meta.version`. `onInstall` runs once on first add; `onUpgrade` runs once per version bump (semver). They run before `setup`; a throw is logged but doesn't stop the build. State tracked in project `.nuxtrc`.

## Module dependencies (preferred over installModule)
Declare via `moduleDependencies` (object or `(nuxt) => object`). Ensures order, version compat, config.
```ts
moduleDependencies: {
  '@nuxtjs/tailwindcss': {
    version: '>=6.0.0',
    overrides: { exposeConfig: true },   // force over user settings
    defaults: { config: { darkMode: 'class' } }, // respects user settings
  },
  '@nuxtjs/fontaine': {
    optional: true,   // not installed, but options applied if present
    defaults: { fonts: [{ family: 'Roboto', fallbacks: ['Impact'] }] },
  },
},
```
`installModule(moduleToInstall, inlineOptions?, nuxt?)` — DEPRECATED (use `moduleDependencies`). Was: `await installModule('@nuxtjs/fontaine', { fonts: [...] })`.

## Compatibility checks
- `checkNuxtCompatibility(constraints, nuxt?): Promise<issues[]>` — returns message array if unmet.
- `assertNuxtCompatibility(constraints, nuxt?): Promise<true>` — throws on mismatch.
- `hasNuxtCompatibility(constraints, nuxt?): Promise<boolean>`.
Constraints: `{ nuxt: '>=3.0.0', bridge?: Record<'vite'|'webpack'|'rspack', string|false> }`.
- `isNuxtMajorVersion(major, nuxt?): boolean` (preferred).
- `isNuxt3(nuxt?)`, `isNuxt2(nuxt?)` — deprecated, prefer `isNuxtMajorVersion`.
- `getNuxtVersion(nuxt?): string`.

## Context
- `useNuxt(): Nuxt` — get instance from context; throws if unavailable.
- `tryUseNuxt(): Nuxt | null` — returns null if unavailable.
Nuxt instance: `options` (NuxtOptions), `hooks`, `hook(name, cb)`, `callHook(name, ...args)`, `addHooks(configHooks)`.
```ts
const nuxt = useNuxt()
if (nuxt.options.builder === '@nuxt/webpack-builder') {
  nuxt.options.build.transpile.push('xstate')
}
```

## Auto-imports (powered by unimport)
For utils/composables/Vue APIs (NOT pages/components/plugins). For Nitro server context use `addServerImports`.
- `addImports(NuxtImport | NuxtImport[])`: `{ name, from, as?, priority?, disabled?, type?, typeFrom?, meta? }`.
```ts
addImports({ name: 'useFoo', as: 'useFoo', from: '@storyblok/vue' })
```
- `addImportsDir(dirs, { prepend? })` — auto-import every file in dir(s).
```ts
addImportsDir(createResolver(import.meta.url).resolve('./runtime/composables'))
```
- `addImportsSources(sources)`: `{ package }` or `{ from, imports: [...] }`.
```ts
addImportsSources([{ package: '@vueuse/core' }, { from: 'h3', imports: ['defineEventHandler', 'readBody'] }])
```

## Components
- `addComponentsDir(dir, { prepend? })` — scan dir; imported only when used (not global unless `global: true`).
  `dir` props: `path` (req, supports `~`/`@`/npm path), `pattern`, `ignore`, `prefix`, `pathPrefix`, `prefetch`, `preload`, `isAsync`, `extendComponent(component)`, `global`, `island`, `watch`, `extensions`, `transpile ('auto'|boolean)`.
```ts
addComponentsDir({ path: resolve('./runtime/components'), prefix: 'U', pathPrefix: false })
```
- `addComponent(options)` — register single auto-imported component.
  props: `name` (req), `filePath` (req), `declarationPath`, `pascalName`, `kebabName`, `export` (default `'default'`), `shortPath`, `chunkName`, `prefetch`, `preload`, `global`, `island`, `mode ('client'|'server'|'all')`, `priority`.
```ts
addComponent({ name: 'NuxtImg', filePath: resolver.resolve('./runtime/components/NuxtImg.vue') })
// named export from npm package:
addComponent({ name: 'MyComp', export: 'MyComponent', filePath: 'my-npm-package' })
```

## Resolving paths
- `resolvePath(path, options?): Promise<string>` — respects alias + extensions. Options: `cwd` (default rootDir), `alias`, `extensions`, `virtual` (Nuxt VFS), `fallbackToOriginal`. Does NOT search nested deps — to resolve YOUR module's dep use `createResolver(import.meta.url).resolvePath()` (hoist-independent).
- `resolveAlias(path, alias?): string` — reads `nuxt.options.alias` by default.
- `findPath(paths, options?, pathType?): Promise<string|null>` — first existing file/dir.
- `createResolver(basePath: string | URL): { resolve(path), resolvePath(path, options?) }` — resolver relative to base (typically `import.meta.url`).
```ts
const resolver = createResolver(import.meta.url)
addPlugin(resolver.resolve('./runtime/plugin'))
```

## Programmatic usage (CLI/test tooling)
- `loadNuxt(loadOptions?): Promise<Nuxt>` — uses c12; opts include `dev` (bool), `ready` (default true; else call `nuxt.ready()`), + c12 opts (`cwd`, `overrides`).
- `buildNuxt(nuxt): Promise<any>` — runs the builder (vite/webpack).
- `loadNuxtConfig(options): Promise<NuxtOptions>`.
- `writeTypes(nuxt?)` — generates `tsconfig.json` in buildDir.

Example — extract Vite config:
```js
const nuxt = await loadNuxt({ cwd: process.cwd(), dev: false, overrides: { ssr: false } })
nuxt.hook('vite:extend', (config) => { /* use config */ })
await buildNuxt(nuxt)
```

## Referência

- [Kit — Modules](https://nuxt.com/docs/4.x/api/kit/modules)
- [Kit — Compatibility](https://nuxt.com/docs/4.x/api/kit/compatibility)
- [Kit — Auto-imports](https://nuxt.com/docs/4.x/api/kit/autoimports)
- [Kit — Components](https://nuxt.com/docs/4.x/api/kit/components)
- [Kit — Context](https://nuxt.com/docs/4.x/api/kit/context)
- [Kit — Resolving](https://nuxt.com/docs/4.x/api/kit/resolving)
- [Kit — Programmatic](https://nuxt.com/docs/4.x/api/kit/programmatic)
- [Kit — Examples](https://nuxt.com/docs/4.x/api/kit/examples)
