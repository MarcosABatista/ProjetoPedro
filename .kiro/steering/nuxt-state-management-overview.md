---
inclusion: fileMatch
fileMatchPattern: ["app/composables/**/*.ts", "app/**/*.vue", "app/stores/**/*.ts"]
name: nuxt-state-management-overview
description: Nuxt v4 shared state — useState SSR-friendly ref, composable-wrapped global state patterns, async init with callOnce, and Pinia integration. Use when sharing reactive state across components or setting up a store.
---

# Nuxt v4 — State Management

`useState(key, init)` is an SSR-friendly `ref` replacement: value preserved across SSR→hydration, shared by unique key.

Gotcha: value is serialized to JSON — no classes, functions, or symbols.

## Best practice

Never define `const state = ref()` (or `export const myState = ref({})`) at module top level — it leaks across requests on the server. Wrap in a composable:

```ts [composables/states.ts]
export const useColor = () => useState<string>('color', () => 'pink')
```

```vue [app/app.vue]
<script setup lang="ts">
const color = useColor() // same as useState('color')
</script>
```

## Basic usage

```vue [app/app.vue]
<script setup lang="ts">
const counter = useState('counter', () => Math.round(Math.random() * 1000))
</script>
<template>
  <div>Counter: {{ counter }}<button @click="counter++">+</button></div>
</template>
```

Invalidate globally with `clearNuxtState`. (Under compat 5, `clearNuxtState` resets to the `init` value; pass `{ reset: false }` to set `undefined`.)

## Async initialization

Use `callOnce` in `app.vue` (runs once, server-side friendly — analogous to Nuxt 2 `nuxtServerInit`):

```vue [app/app.vue]
<script setup lang="ts">
const websiteConfig = useState('config')
await callOnce(async () => {
  websiteConfig.value = await $fetch('https://my-cms.com/api/website-config')
})
</script>
```

## Pinia

Install: `pnpm nuxt module add pinia`.

```ts [app/stores/website.ts]
export const useWebsiteStore = defineStore('websiteStore', {
  state: () => ({ name: '', description: '' }),
  actions: {
    async fetch () {
      const infos = await $fetch('https://api.nuxt.com/modules/pinia')
      this.name = infos.name
      this.description = infos.description
    },
  },
})
```

```vue [app/app.vue]
<script setup lang="ts">
const website = useWebsiteStore()
await callOnce(website.fetch)
</script>
```

## Advanced (typed shared state)

Compose `useState` in auto-imported composables for global type-safe state (e.g. locale). Use `import.meta.server` / `import.meta.client` to branch init logic (e.g. read `accept-language` header on server via `useRequestHeaders()`, `navigator.language` on client).

## Third-party

Not opinionated. Options: Pinia (official Vue recommendation), Harlem (immutable), XState (state machines).

## Referência

- [State Management](https://nuxt.com/docs/4.x/getting-started/state-management) — doc oficial Nuxt v4
