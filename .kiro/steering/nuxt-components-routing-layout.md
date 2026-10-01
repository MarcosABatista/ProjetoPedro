---
inclusion: fileMatch
fileMatchPattern: ["app/**/*.vue", "app/app.vue", "app/layouts/**/*.vue"]
name: nuxt-components-routing-layout
description: Use when working with Nuxt routing/layout components — NuxtPage, NuxtLayout, NuxtLink, NuxtLoadingIndicator, NuxtRouteAnnouncer, NuxtAnnouncer.
---
# Nuxt v4 Routing & Layout Components

## `<NuxtPage>`
Required to render pages from `app/pages/`. Wrapper around Vue Router `<RouterView>` (use it, NOT `<RouterView>`, else `useRoute()` may return wrong paths). Wraps content in `<Transition>` → `<KeepAlive>` → `<Suspense>`. Transition/KeepAlive OFF by default.

Gotcha: due to `<Suspense>`, new page mounts BEFORE old one unmounts (opposite of typical Vue). If enabling `<Transition>` in a page, page needs a single root element.

Props:
- `name: string` — named view (`name@view.vue` convention).
- `route: RouteLocationNormalized`.
- `pageKey: string | (route) => string` — controls re-render.
- `transition: boolean | TransitionProps`.
- `keepalive: boolean | KeepAliveProps`.

```vue [app/app.vue]
<template>
  <!-- rendered once, never re-renders -->
  <NuxtPage page-key="static" />
  <!-- re-render per route -->
  <NuxtPage :page-key="route => route.fullPath" />
</template>
```
Warning: do NOT use `$route` in `pageKey` (breaks `<Suspense>` rendering). Alternatively set key via `definePageMeta({ key: route => route.fullPath })`.

Custom props pass through to page: `<NuxtPage :foobar="123" />` → read via `defineProps<{ foobar: number }>()` or `useAttrs().foobar`.

Page ref: access via `pageRef` → `page.value.pageRef.foo()`; child must `defineExpose({ foo })`.

## `<NuxtLayout>`
Activates layouts on `app.vue`/`error.vue`. Renders content via `<slot />` wrapped in `<Transition>`.

Props:
- `name: string | false` (default `default`) — matches file in `app/layouts/`, kebab-cased (`errorLayout.vue` → `error-layout`). `false` disables layout. Reactive/computed supported.
- `fallback: string` (default `null`) — layout rendered if `name` invalid.

Extra props become attrs → read via `useAttrs()`/`$attrs`. With object-syntax `definePageMeta({ layout: { name: 'admin', props: { sidebar: true } } })`, props go straight to layout `defineProps`.

Recommendation: `<NuxtLayout>` should NOT be the page's root element (needed for layout transitions to work). Layout ref via `layout.value.layoutRef`.

```vue [app/app.vue]
<template>
  <NuxtLayout :name="layout">
    <NuxtPage />
  </NuxtLayout>
</template>
```

## `<NuxtLink>`
Drop-in replacement for Vue Router `<RouterLink>` AND HTML `<a>`. Auto-detects internal vs external, applies optimizations (prefetch, rel attrs).

Internal: `<NuxtLink to="/about">` → `<a href="/about">` with smart prefetch. Dynamic params: `:to="{ name: 'posts-id', params: { id: 123 } }"`. Object `to` auto-encodes query keys/values (no manual `encodeURI`).

External / static files: use `external` prop to bypass Vue Router (avoids 404 on `/public` files or cross-app URLs).
```vue
<NuxtLink to="/report.pdf" external>Download</NuxtLink>
```
Absolute URLs auto-render as `<a>` with `rel="noopener noreferrer"`.

`rel`/`noRel`: default `rel="noopener noreferrer"` on external/target links. Override with `rel` prop, or `no-rel` to strip. `noRel` + `rel` together → `rel` ignored.

Prefetch: smart prefetch enabled by default (JS of visible links, only when browser idle, skipped offline/2g). Disable per-link: `no-prefetch` or `:prefetch="false"`.

`prefetchOn` (v3.13+): `"visibility"` (default, IntersectionObserver) | `"interaction"` (hover/focus via `pointerenter`/`focus`). Object form: `:prefetch-on="{ interaction: true }"`. Avoid enabling both.

Cross-origin prefetch (Speculation Rules API):
```ts [nuxt.config.ts]
export default defineNuxtConfig({ experimental: { crossOriginPrefetch: true } })
```
Disable globally: `experimental.defaults.nuxtLink.prefetch: false`.

Key props: `to`, `href` (alias, ignored if `to` set), `custom` (full control, no `<a>` wrap; prefetch handlers NOT auto-attached — use slot `prefetch`/`shouldPrefetch`/`prefetched` v4.5+), `external`, `replace`, `activeClass`, `exactActiveClass`, `ariaCurrentValue`, `prefetch`, `prefetchOn`, `noPrefetch`, `prefetchedClass`, `target`, `rel`, `noRel`.

Custom slot (v4.5+):
```vue
<NuxtLink v-slot="{ href, navigate, prefetch, shouldPrefetch }" to="/about" custom>
  <a :href="href" @click="navigate"
     @pointerenter="shouldPrefetch('interaction') && prefetch()">About</a>
</NuxtLink>
```

Custom link component via `defineNuxtLink`:
```ts [app/components/MyNuxtLink.ts]
export default defineNuxtLink({ componentName: 'MyNuxtLink', prefetch: true })
```
`NuxtLinkOptions`: `componentName`, `externalRelAttribute` (default `"noopener noreferrer"`, `""` disables), `activeClass`, `exactActiveClass`, `trailingSlash` (`'append'|'remove'`), `prefetch`, `prefetchedClass`, `prefetchOn`. Auto-imported by file name; `componentName` only sets DevTools name.

## `<NuxtLoadingIndicator>`
Progress bar between page navigations. Add in `app.vue` or layouts. Optional. Default slot for custom HTML.
Props: `color` (`false` disables color), `errorColor`, `height` (px, default 3), `duration` (ms, default 2000), `throttle` (ms, default 200), `estimatedProgress` (fn(duration, elapsed) → 0–100). Hook via `useLoadingIndicator` composable for manual start/finish.

## `<NuxtRouteAnnouncer>` (v3.12+)
Hidden element announcing route/page title changes to screen readers. Add in `app.vue`/layouts. Automatic on navigation, message = page `<title>`.
Props: `atomic` (default `false`), `politeness` (`off`|`polite`(default)|`assertive`). Slot exposes `{ message }`. Hook via `useRouteAnnouncer`.

## `<NuxtAnnouncer>` (v4.4.2+)
Hidden element announcing arbitrary dynamic content changes (form validation, toasts, loading). Manual trigger via `useAnnouncer`.
```vue
<script setup lang="ts">
const { polite, assertive } = useAnnouncer()
polite('Message sent')       // waits for silence
assertive('Error: failed')   // interrupts immediately
</script>
```
Props: `atomic` (default `true`), `politeness` (default `polite`). Slot exposes `{ message }`.

Route vs Announcer: RouteAnnouncer = auto on navigation, source page title, atomic false. Announcer = manual via polite()/assertive(), developer message, atomic true.

## Referência

- [NuxtPage](https://nuxt.com/docs/4.x/api/components/nuxt-page)
- [NuxtLayout](https://nuxt.com/docs/4.x/api/components/nuxt-layout)
- [NuxtLink](https://nuxt.com/docs/4.x/api/components/nuxt-link)
- [NuxtLoadingIndicator](https://nuxt.com/docs/4.x/api/components/nuxt-loading-indicator)
- [NuxtRouteAnnouncer](https://nuxt.com/docs/4.x/api/components/nuxt-route-announcer)
- [NuxtAnnouncer](https://nuxt.com/docs/4.x/api/components/nuxt-announcer)
