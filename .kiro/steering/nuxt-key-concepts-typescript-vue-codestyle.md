---
inclusion: auto
name: nuxt-key-concepts-typescript-vue-codestyle
description: Use when configuring TypeScript/type-checking, augmenting types across app/server/shared contexts, writing Vue 3 SFCs with Composition API, or setting up ESLint in Nuxt v4.
---
# Nuxt TypeScript, Vue.js Development & Code Style

## TypeScript

Nuxt is fully typed. Type-checking is **off by default** in `nuxt dev`/`nuxt build` (perf). Enable it:

```bash [Terminal]
pnpm add -D vue-tsc typescript
npx nuxt typecheck
```

Or in config (runs at build/dev time):

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  typescript: { typeCheck: true },
})
```

### Auto-generated types
Stored in `.nuxt/`, generated on dev/build or via `nuxt prepare`. Include auto-imports, API route types, aliases (`#imports`, `~/file`, `#build/file`).

Do **not** edit `.nuxt/tsconfig.json` directly — extend via `nuxt.config.ts`.

### Project references (multiple tsconfigs)
Nuxt generates per-context configs for faster builds and better IDE perf:
- `.nuxt/tsconfig.app.json` – `app/` code
- `.nuxt/tsconfig.node.json` – `nuxt.config.ts` and outside-context files
- `.nuxt/tsconfig.server.json` – server-side code
- `.nuxt/tsconfig.shared.json` – code shared between app and server

`.nuxt/tsconfig.json` still generated for backward compat (legacy, will be removed).

**Type augmentation must live in the matching context dir**, or TS won't recognize it:
- `app` context → augmentation file in `app/`
- `server` context → in `server/`
- shared → in `shared/`

### Strict checks
Strict is on by default when `typescript.typeCheck` is enabled. Temporarily disable during migration:

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  typescript: { strict: false },
})
```

## Vue.js Development

Nuxt integrates Vue 3. Adds component auto-imports, file-based routing, SSR-friendly composables.

### SFCs & Composition API
Prefer `<script setup lang="ts">` with auto-imported Reactivity APIs. Options API works but Composition API is idiomatic:

```vue [components/Counter.vue]
<script setup lang="ts">
const count = ref(0)
const increment = () => count.value++
</script>
```

- Components in `app/components/` auto-import; unused ones dropped from production.
- Routing: `app/pages/` dir maps files to routes via Vue Router.
- Write reusable auto-imported functions in `app/composables/`.
- TS opt-in per file: rename `.js`→`.ts` or add `lang="ts"`.

Vue 3 benefits Nuxt uses: faster rewritten VDOM + compile-time static/dynamic separation, smaller tree-shakable bundle (~12kb gzip minimal), Composition API, TS support.

### Vapor Mode (experimental, Vue 3.6+)
Alternative compile strategy that renders without the Virtual DOM (lower memory, better runtime perf). Nuxt runs it in **interop mode** — app root stays VDOM, opt in per component.

```ts [nuxt.config.ts]
export default defineNuxtConfig({ vue: { vapor: true } })
```

```vue [app/pages/index.vue]
<script setup vapor lang="ts">
const count = ref(0)
</script>
<template>
  <button @click="count++">count is {{ count }}</button>
</template>
```

Requires `vue: ^3.6.0-rc.2` or newer; Nuxt warns/disables on older Vue. Known limits: no full Vapor apps yet; template refs don't expose `$el`; some built-ins (`<ClientOnly>`, `<NuxtIsland>`, `<Title>`/`<Style>`/`<Noscript>`) can't read Vapor slot children (pass values directly); Options API unsupported (use `<script setup>` + `useAsyncData`); keyed `onPrehydrate` falls back to unkeyed; call Nuxt composables before the first `await` in a Vapor `<script setup>`.

## Code Style (ESLint)

Recommended: the [`@nuxt/eslint`](https://eslint.nuxt.com/packages/module) module — sets up project-aware config for the ESLint flat config format (default since ESLint v9).

```bash
npx nuxt module add eslint
```

Generates `eslint.config.mjs` at project root. Legacy `.eslintrc` needs `@nuxt/eslint-config` manual setup — prefer migrating to flat config.

## Referência

- [TypeScript](https://nuxt.com/docs/4.x/guide/concepts/typescript) — doc oficial Nuxt v4
- [Vue.js Development](https://nuxt.com/docs/4.x/guide/concepts/vuejs-development) — doc oficial Nuxt v4
- [Code Style](https://nuxt.com/docs/4.x/guide/concepts/code-style) — doc oficial Nuxt v4
