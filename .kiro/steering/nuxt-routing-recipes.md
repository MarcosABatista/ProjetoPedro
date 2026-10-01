---
inclusion: fileMatch
fileMatchPattern: ["app/router.options.ts", "nuxt.config.ts", "app/composables/**/*.ts"]
name: nuxt-routing-recipes
description: Use when adding custom routes/router options, building a custom useFetch/$fetch for an external API, shipping mostly-static sites, or integrating Vite plugins in Nuxt v4.
---
# Nuxt Routing Recipes: Custom Routing, Custom useFetch, Mostly-Static Sites, Vite Plugins

## Custom Routing

Routing derives from `app/pages/` structure (Vue Router under the hood). Extend it several ways.

### Router config (`router.options.ts`)
Override/extend scanned routes. Return `null`/`undefined` to fall back to defaults.

```ts [app/router.options.ts]
import type { RouterConfig } from '@nuxt/schema'

export default {
  routes: _routes => [
    { name: 'home', path: '/', component: () => import('~/pages/home.vue') },
  ],
} satisfies RouterConfig
```

Note: routes returned here are NOT augmented with `definePageMeta` metadata — use the `pages:extend` hook (build-time) for that.

### `pages:extend` hook
Add/remove routes:

```ts [nuxt.config.ts]
import type { NuxtPage } from '@nuxt/schema'

export default defineNuxtConfig({
  hooks: {
    'pages:extend' (pages) {
      pages.push({ name: 'profile', path: '/profile', file: '~/extra-pages/profile.vue' })
    },
  },
})
```

### Nuxt module / Kit
Use `extendPages(cb)` and `extendRouteRules(route, rule, options)` from Nuxt Kit for a whole feature's routes.

### Router options
Recommended in `router.options.ts`. Add more files via `pages:routerOptions` hook (later items override earlier). Only JSON-serializable options work in `nuxt.config`: `linkActiveClass`, `linkExactActiveClass`, `end`, `sensitive`, `strict`, `hashMode`, `scrollBehaviorType`.

```ts [nuxt.config.ts]
export default defineNuxtConfig({ router: { options: {} } })
```

With `future.compatibilityVersion: 5`, routing is case-sensitive by default (matches Nitro); set `router.options.sensitive: false` to opt out.

**Hash mode (SPA only)** — URL never sent to server, no SSR:

```ts [nuxt.config.ts]
export default defineNuxtConfig({ ssr: false, router: { options: { hashMode: true } } })
```

**Smooth hash scroll**: `router.options.scrollBehaviorType: 'smooth'`.

**Custom history**:
```ts [router.options.ts]
import { createMemoryHistory } from 'vue-router'
export default {
  history: base => import.meta.client ? createMemoryHistory(base) : null,
} satisfies RouterConfig
```

## Custom useFetch

`$fetch` (and `useFetch`) is intentionally **not globally configurable** for consistency. Create per-API fetchers instead.

### API client with auth (`createUseFetch`)

```ts [app/composables/useAPI.ts]
export const useAPI = createUseFetch({
  baseURL: 'https://api.nuxt.com',
  onRequest ({ options }) {
    const { session } = useUserSession()
    if (session.value?.token) {
      options.headers.set('Authorization', `Bearer ${session.value.token}`)
    }
  },
  async onResponseError ({ response }) {
    if (response.status === 401) {
      await navigateTo('/login')
    }
  },
})
```

```vue [app/pages/dashboard.vue]
<script setup lang="ts">
const { data: profile } = await useAPI('/me')
const { data: orders } = await useAPI('/orders')
</script>
```

### Custom `$fetch` instance (lower-level, plugin)

```ts [app/plugins/api.ts]
export default defineNuxtPlugin((nuxtApp) => {
  const { session } = useUserSession()
  const api = $fetch.create({
    baseURL: 'https://api.nuxt.com',
    onRequest ({ options }) {
      if (session.value?.token) {
        options.headers.set('Authorization', `Bearer ${session.value?.token}`)
      }
    },
    async onResponseError ({ response }) {
      if (response.status === 401) {
        await nuxtApp.runWithContext(() => navigateTo('/login'))
      }
    },
  })
  return { provide: { api } }
})
```

Wrap with `useAsyncData` to avoid double fetching during SSR:

```vue [app/app.vue]
<script setup>
const { $api } = useNuxtApp()
const { data: modules } = await useAsyncData('modules', () => $api('/modules'))
</script>
```

## Mostly-Static Sites

Ship near-zero JS for content/marketing pages while keeping islands of interactivity. Combine: prerender + `noScripts` + server components + lazy hydration.

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  routeRules: {
    '/': { prerender: true, noScripts: true },
    '/blog/**': { prerender: true, noScripts: true },
    '/contact': { prerender: true }, // keeps scripts for a widget
  },
})
```

`noScripts` routes render to HTML at build time and omit Nuxt entry scripts, import map, payload, JS hints (CSS kept). **A `noScripts` page does not hydrate** — no `@click`, no `<NuxtLink>` prefetch (links work as plain `<a>`), no client navigation.

Navigation to/from `noScripts` routes is a full document load (Nuxt handles both directions). Both page types emit [speculation rules](https://developer.mozilla.org/en-US/docs/Web/API/Speculation_Rules_API) so browsers prefetch/prerender targets (scoped to page routes, not server routes like `/logout`). With `experimental.viewTransition: true`, full-page navigations animate via cross-document view transitions.

**Server components** for server-rendered widgets (markdown, highlighting, CMS) keep heavy deps off the client — work fine on `noScripts` routes:

```vue [app/pages/blog/[slug].vue]
<template>
  <article>
    <h1>{{ post.title }}</h1>
    <HighlightedMarkdown :markdown="post.body" />
  </article>
</template>
```

Warning: fully interactive island widgets (`nuxt-client`, interactive island slots) do **not** work under `noScripts` (teleport relocation needs an inline script). Keep scripts and use lazy hydration instead.

**Lazy hydration** on scripted routes:

```vue [app/pages/index.vue]
<template>
  <LazyTestimonials hydrate-never />
  <LazyNewsletterSignup hydrate-on-visible />
  <LazyCookieBanner hydrate-on-idle />
</template>
```

`hydrate-never` server-renders HTML but never runs its JS (prop changes still trigger hydration).

## Using Vite Plugins

Add Vite plugins directly when a module isn't needed:

```ts [nuxt.config.ts]
import yaml from '@rollup/plugin-yaml'

export default defineNuxtConfig({
  vite: { plugins: [yaml()] },
})
```

Then import supported files directly (e.g. `import config from '~/data/hello.yaml'`).

In a **Nuxt module**, use `addVitePlugin`:

```ts [modules/my-module.ts]
import { addVitePlugin, defineNuxtModule } from '@nuxt/kit'
import yaml from '@rollup/plugin-yaml'

export default defineNuxtModule({
  setup () { addVitePlugin(yaml()) },
})
```

Nuxt 5+ environment-specific plugins use `applyToEnvironment(env => env.name === 'client')`. To read resolved Vite config, use the plugin's own `config`/`configResolved` hooks rather than Nuxt's `vite:extend*` hooks.

## Referência

- [Custom Routing](https://nuxt.com/docs/4.x/guide/recipes/custom-routing) — doc oficial Nuxt v4
- [Custom useFetch](https://nuxt.com/docs/4.x/guide/recipes/custom-usefetch) — doc oficial Nuxt v4
- [Mostly Static Sites](https://nuxt.com/docs/4.x/guide/recipes/mostly-static-sites) — doc oficial Nuxt v4
- [Vite Plugins](https://nuxt.com/docs/4.x/guide/recipes/vite-plugin) — doc oficial Nuxt v4
