---
inclusion: fileMatch
fileMatchPattern: ["app/pages/**/*.vue", "app/layouts/**/*.vue", "app/app.config.ts"]
name: nuxt-transitions-overview
description: Nuxt v4 page/layout transitions via Vue <Transition> plus experimental native View Transitions API and view-transition types. Use when adding animated page/layout navigation or configuring transition CSS/JS hooks.
---

# Nuxt v4 — Transitions

Built on Vue `<Transition>`. Gotcha: animated pages/layouts MUST have a **single root element** (fragments won't animate and may error).

## Page Transitions

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  app: { pageTransition: { name: 'page', mode: 'out-in' } },
})
```

```vue [app/app.vue]
<template><NuxtPage /></template>
<style>
.page-enter-active, .page-leave-active { transition: all 0.4s; }
.page-enter-from, .page-leave-to { opacity: 0; filter: blur(1rem); }
</style>
```

Per-page override:

```vue [pages/about.vue]
<script setup lang="ts">
definePageMeta({ pageTransition: { name: 'rotate' } })
</script>
```

Note: if the layout also changes, `pageTransition` won't run — use `layoutTransition`.

## Layout Transitions

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  app: { layoutTransition: { name: 'layout', mode: 'out-in' } },
})
```

CSS classes: `.layout-enter-active` / `.layout-leave-active` etc. Per-page via `definePageMeta({ layoutTransition: { name: 'slide-in' } })`.

## Global settings

Both accept Vue `TransitionProps` (JSON-serializable). Renaming `name` requires renaming CSS classes.

## Disable

Per-route: `definePageMeta({ pageTransition: false, layoutTransition: false })`. Globally under `app`.

## JavaScript hooks

For GSAP etc.:

```vue
<script setup lang="ts">
definePageMeta({
  pageTransition: {
    name: 'custom-flip', mode: 'out-in',
    onBeforeEnter: (el) => {},
    onEnter: (el, done) => {},
    onAfterEnter: (el) => {},
  },
})
</script>
```

## Dynamic transitions

Use inline middleware to set `to.meta.pageTransition.name` conditionally:

```vue [pages/[id].vue]
<script setup lang="ts">
definePageMeta({
  pageTransition: { name: 'slide-right', mode: 'out-in' },
  middleware (to, from) {
    if (to.meta.pageTransition && typeof to.meta.pageTransition !== 'boolean') {
      to.meta.pageTransition.name = +to.params.id! > +from.params.id! ? 'slide-left' : 'slide-right'
    }
  },
})
</script>
```

## NuxtPage transition prop

`<NuxtPage :transition="{ name: 'bounce', mode: 'out-in' }" />` activates globally and CANNOT be overridden by `definePageMeta`.

## View Transitions API (experimental)

Native browser transitions across unrelated elements. Enable:

```ts [nuxt.config.ts]
export default defineNuxtConfig({ experimental: { viewTransition: true } })
```

Values: `false | true | 'always'`. `true` respects `prefers-reduced-motion: reduce`; `'always'` ignores it. Default global via `app.viewTransition`; per-page via `definePageMeta({ viewTransition: false })`.

### View Transition Types (v4.4)

Apply different CSS animations by navigation type. Target with `:active-view-transition-type()`.

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  app: { viewTransition: { enabled: true, types: ['slide'] } },
})
```

Per-page (supports arrays AND functions for `types`/`toTypes`/`fromTypes`; functions only in `definePageMeta`, config only takes `string[]`):

```vue [pages/[id].vue]
<script setup lang="ts">
definePageMeta({
  viewTransition: {
    enabled: true,
    toTypes: (to, from) =>
      Number(to.params.id) > Number(from.params.id) ? ['slide-left'] : ['slide-right'],
  },
})
</script>
```

```css
html:active-view-transition-type(slide-left) {
  &::view-transition-old(root) { animation: slide-out-left 0.3s ease-in-out; }
  &::view-transition-new(root) { animation: slide-in-right 0.3s ease-in-out; }
}
```

Hook `page:view-transition:start` exposes the `ViewTransition` (readable/modifiable `types`). To disable Vue transitions when native is supported, add `middleware/disable-vue-transitions.global.ts` setting `to.meta.pageTransition/layoutTransition = false` when `document.startViewTransition` exists.

Known issue: View Transitions freeze DOM updates; reconsider if you data-fetch in page setup.

## Referência

- [Transitions](https://nuxt.com/docs/4.x/getting-started/transitions) — doc oficial Nuxt v4
