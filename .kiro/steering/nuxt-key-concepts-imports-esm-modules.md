---
inclusion: auto
name: nuxt-key-concepts-imports-esm-modules
description: Use when relying on auto-imports, debugging "Nuxt instance is unavailable", fixing ESM/CJS interop errors, or adding/disabling Nuxt modules in v4.
---
# Nuxt Auto-imports, ES Modules & Modules

## Auto-imports

Nuxt auto-imports components, composables, utils and Vue APIs — no explicit import needed. Preserves typings and only bundles what is used.

```vue [app/app.vue]
<script setup lang="ts">
const count = ref(1)        // ref auto-imported
const double = computed(() => count.value * 2)
const { data, refresh, status } = await useFetch('/api/hello')
</script>
```

Auto-imported directories:
- `app/components/` – Vue components
- `app/composables/` – composables
- `app/utils/` – helpers/utilities
- `server/utils/` – auto-imported in `server/` dir

### Context rule (critical)
Vue/Nuxt composables rely on the correct *context*. With few exceptions you **cannot use them outside** a Nuxt plugin, route middleware, or Vue setup function. You must call them **synchronously** — no `await` before the call, except inside `<script setup>`, `defineNuxtComponent` setup, `defineNuxtPlugin`, or `defineNuxtRouteMiddleware` (where the sync context is preserved across `await`).

Error `Nuxt instance is unavailable` = composable called in the wrong lifecycle place.

```ts [composables/example.ts]
// ❌ breaks: runs at module eval, outside context
const config = useRuntimeConfig()
export const useMyComposable = () => { /* ... */ }

// ✅ works: called inside the composable body
export const useMyComposable = () => {
  const config = useRuntimeConfig()
}
```

For a non-SFC component needing Nuxt context, wrap with `defineNuxtComponent` instead of `defineComponent`. See the `asyncContext` experimental feature to use composables in async functions.

### Explicit imports & disabling
Use the `#imports` alias to make imports explicit:

```vue
<script setup lang="ts">
import { computed, ref } from '#imports'
</script>
```

- Disable all auto-imports: `imports.autoImport: false` (`#imports` still works).
- Keep framework fns (`ref`, `computed`) but disable scanning your own code: `imports.scan: false` (breaks layer override — requires explicit imports per layer).
- Disable component auto-import from `~/components`: `components.dirs: []`.

Gotcha: auto-imported `ref`/`computed` won't be unwrapped in a `<template>` unless top-level.

### Third-party auto-import

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  imports: {
    presets: [{ from: 'vue-i18n', imports: ['useI18n'] }],
  },
})
```

## ES Modules

Nuxt uses native ESM. Nitro outputs `.output/server/index.mjs` (Node treats `.mjs` as native ESM).

Node import resolution: `.mjs` = ESM, `.cjs` = CJS, `.js` = CJS unless `package.json` has `"type": "module"`. Node uses `exports`/`main` (not the bundler-only `module` field).

### Common errors & fixes
`SyntaxError: Unexpected token 'export'` or `Named export 'x' not found ... is a CommonJS module` = upstream library ESM-compat issue.

Tell Nuxt to transpile:

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  build: { transpile: ['sample-library'] },
})
```

Or alias to the CJS build:

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  alias: { 'sample-library': 'sample-library/dist/sample-library.cjs.js' },
})
```

### Default export interop
Interop default can fail, yielding `{ default: {...} }`. Handle manually:

```ts
import { default as pkg } from 'cjs-pkg'          // static
import('cjs-pkg').then(m => m.default || m)        // dynamic
```

Prefer [mlly](https://github.com/unjs/mlly) `interopDefault` to preserve named exports.

### Library author fixes / ESM migration
- Rename ESM files to `.mjs` (recommended), CJS to `.cjs`.
- Or go ESM-only: `"type": "module"`.
- Replace `require` with `import`; `__dirname`/`require.resolve` are unavailable in ESM:

```js
import { fileURLToPath } from 'node:url'
const newDir = fileURLToPath(new URL('./new-dir', import.meta.url))
```

- Prefer named exports; use conditional `exports` field. Avoid Node built-ins for browser/edge compat.

## Modules

Nuxt modules are build-time-only async functions extending core. Distributed as npm packages.

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  modules: [
    '@nuxtjs/example',                    // package name (recommended)
    './modules/example',                  // local module
    ['./modules/example', { token: '123' }], // inline options
    async (inlineOptions, nuxt) => {},    // inline definition
  ],
})
```

`buildModules` (Nuxt 2) is deprecated — use `modules`.

Disable a module (e.g. inherited from layers) via its config key (v4.3+):

```ts [nuxt.config.ts]
export default defineNuxtConfig({ image: false })
```

## Referência

- [Auto-imports](https://nuxt.com/docs/4.x/guide/concepts/auto-imports) — doc oficial Nuxt v4
- [ES Modules](https://nuxt.com/docs/4.x/guide/concepts/esm) — doc oficial Nuxt v4
- [Modules](https://nuxt.com/docs/4.x/guide/concepts/modules) — doc oficial Nuxt v4
