---
inclusion: fileMatch
fileMatchPattern: ["app/assets/**", "public/**"]
name: nuxt-assets-overview
description: Nuxt v4 asset handling — public/ (served as-is) vs app/assets/ (build-processed), static vs dynamic src resolution, and Vite runtime-dynamic image imports. Use when referencing images/fonts/static files or building asset paths at runtime.
---

# Nuxt v4 — Assets

Two directories:

- `public/` — served at server root as-is, referenced by URL `/`. Filenames preserved.
- `app/assets/` — processed by Vite (hashing, minification). Referenced via `~/assets/`. NOT served at a static URL.

```vue
<template>
  <img src="/img/nuxt.png">          <!-- public/img/nuxt.png -->
  <img src="~/assets/img/nuxt.png">  <!-- bundled + hashed -->
</template>
```

## Static vs Dynamic src

**Static literal `src`**: build tool rewrites it. Public paths get `app.baseURL` applied at runtime; `~/assets` paths become hashed imports. Works even when baseURL is only known at deploy time (`NUXT_APP_BASE_URL`).

**Bound `:src` built at runtime**: opaque to the build tool — used verbatim, NO rewriting, NO baseURL prefix.

```vue
<template>
  <!-- Does NOT work: Vite never sees this as an import -->
  <img :src="`~/assets/img/${name}.png`">
</template>
```

### Runtime-dynamic public assets

Put non-processed files in `public/`; prefix baseURL yourself if deployed on a subpath:

```vue [app/app.vue]
<script setup lang="ts">
const props = defineProps<{ name: string }>()
const imageUrl = computed(() => `/img/${props.name}.png`)
// If on subpath: joinURL(useRuntimeConfig().app.baseURL, `img/${props.name}.png`)
</script>
<template><img :src="imageUrl" :alt="props.name"></template>
```

### Runtime-dynamic bundled assets (Vite)

Known set — explicit imports:

```ts
const logos = {
  light: () => import('./assets/img/logo-light.png?url'),
  dark: () => import('./assets/img/logo-dark.png?url'),
}
const logoUrl = (await logos[theme]()).default
```

Variable dynamic import (only filename dynamic; keep dir + extension literal):

```ts
async function getImageUrl (name: string) {
  const image = await import(`./assets/img/${name}.png?url`)
  return image.default
}
```

`import.meta.glob` for a mapped set:

```ts
const images = import.meta.glob<string>('./assets/img/*.{png,jpg,svg}', {
  query: '?url', import: 'default',
})
async function getImageUrl (name: string) {
  const load = images[`./assets/img/${name}.png`]
  if (!load) throw new Error(`Unknown image: ${name}`)
  return await load()
}
```

Add `eager: true` if URLs must be synchronous (loads all matches up front, larger initial JS).

Gotcha: `await` a lazy import before using its URL in SSR markup — Vite's `new URL(..., import.meta.url)` pattern does not work with SSR.

## Referência

- [Assets](https://nuxt.com/docs/4.x/getting-started/assets) — doc oficial Nuxt v4
