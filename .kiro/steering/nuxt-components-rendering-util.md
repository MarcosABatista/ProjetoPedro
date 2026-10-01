---
inclusion: fileMatch
fileMatchPattern: ["app/**/*.vue"]
name: nuxt-components-rendering-util
description: Use for Nuxt rendering/utility components — ClientOnly, DevOnly, NuxtClientFallback, NuxtIsland, NuxtErrorBoundary, Teleport, NuxtTime, NuxtWelcome.
---
# Nuxt v4 Rendering & Utility Components

## `<ClientOnly>`
Renders default slot only client-side. Default slot content is tree-shaken from server build (CSS in it may not be inlined into initial HTML).
Props: `fallbackTag`/`placeholderTag` (server-side tag), `fallback`/`placeholder` (server-side content).
```vue
<ClientOnly fallback-tag="span" fallback="Loading comments...">
  <Comment />
  <template #fallback><p>Loading comments...</p></template>
</ClientOnly>
```
Children mount only after client mount → access DOM via watched template ref:
```vue
<script setup lang="ts">
const el = useTemplateRef('el')
watch(el, () => console.log('mounted'), { once: true })
</script>
<template><ClientOnly><NuxtWelcome ref="el" /></ClientOnly></template>
```

## `<DevOnly>`
Renders content only in development; excluded from production builds. `#fallback` slot = production replacement (test with `nuxt preview`).
```vue
<DevOnly>
  <LazyDebugBar />
  <template #fallback><div /></template>
</DevOnly>
```

## `<NuxtClientFallback>` (experimental)
Renders content on client if any child errors during SSR. Enable `experimental.clientFallback` in `nuxt.config`.
Props: `fallbackTag`/`placeholderTag` (default `div`), `fallback`/`placeholder` (string), `keepFallback` (bool, default `false` — keep server fallback if SSR render failed).
Event: `@ssr-error` (server only). Slot `#fallback` = server-side content if slot fails.
```vue
<NuxtClientFallback fallback-tag="span" @ssr-error="logError">
  <Comments />
  <BrokeInSSR />
  <template #fallback><p>Hello</p></template>
</NuxtClientFallback>
```
XSS warning: `fallback`/`placeholder` props render raw HTML — never pass untrusted input; use `#fallback` slot for escaped dynamic content.

## `<NuxtIsland>`
Renders a non-interactive server component with NO client JS. Content is static; changing props refetches/re-renders. Server-only components use it under the hood. Islands scanned from `~/components/islands/` by default → `<NuxtIsland name="MyIsland" />`.
Props:
- `name: string` (required).
- `lazy: boolean` (default false) — non-blocking.
- `props: Record<string, any>`.
- `source: string` — remote source (needs `experimental.componentIslands: 'local+remote'`).
- `dangerouslyLoadClientComponents: boolean` (default false).
Ref: `refresh(): Promise<void>`. Event: `error`. Slot `#fallback` (shown before load if lazy / on fetch fail). Declared slots are interactive (provided by parent).
Security: remote `source` = fully trusting that server's HTML (like `v-html`). Props/context sent as GET query params (visible in logs/CDN/Referer).
Limitations: `useId` counter restarts per island → id collisions. Workaround via server plugin setting `vueApp.config.idPrefix` from `ssrContext.islandContext.id`. Identical islands share render → duplicate ids (no workaround). `useId` breaks in `nuxt-client` interactive components inside islands (hydration mismatch).

## `<NuxtErrorBoundary>`
Handles client-side errors in its default slot (uses Vue `onErrorCaptured`).
Event `@error`. Slot `#error="{ error, clearError }"`.
```vue
<NuxtErrorBoundary @error="logSomeError">
  <template #error="{ error, clearError }">
    <p>Error: {{ error }}</p>
    <button @click="clearError">Clear</button>
  </template>
</NuxtErrorBoundary>
```
Script access via ref: `const eb = useTemplateRef('eb')` → `eb.value?.error`, `eb.value?.clearError()`.

## `<Teleport>`
Vue built-in. `to` = CSS selector or DOM node. Nuxt SSR supports teleport to `#teleports` only; other targets need `<ClientOnly>` wrapper.
```vue
<Teleport to="#teleports"><div class="modal">...</div></Teleport>
<!-- other targets: -->
<ClientOnly><Teleport to="#some-selector">...</Teleport></ClientOnly>
```

## `<NuxtTime>` (v3.17+)
Locale-friendly date/time with proper `<time>` semantics, no hydration mismatch (server-client consistent).
Props:
- `datetime: Date | number | string` (required) — Date, timestamp, or ISO string.
- `locale: string` — BCP 47 tag (default browser/server locale).
- Any `Intl.DateTimeFormat` option: `year`, `month`, `day`, `hour`, `minute`, `second`, `weekday`, `timeZoneName`, etc.
- `relative: boolean` (default false) — relative formatting via `Intl.RelativeTimeFormat` (e.g. "5 minutes ago").
- When relative: accepts `Intl.RelativeTimeFormat` opts. Note `style` is reserved → use `relativeStyle`. Also `numeric="auto"`.
```vue
<NuxtTime :datetime="Date.now()" year="numeric" month="long" day="numeric" />
<NuxtTime :datetime="Date.now() - 5*60*1000" relative numeric="auto" relative-style="long" />
```

## `<NuxtWelcome>`
Starter-template greeting component (links to docs/source/social). From `@nuxt/ui-templates`.
```vue
<template><NuxtWelcome /></template>
```

## Referência

- [ClientOnly](https://nuxt.com/docs/4.x/api/components/client-only)
- [DevOnly](https://nuxt.com/docs/4.x/api/components/dev-only)
- [NuxtClientFallback](https://nuxt.com/docs/4.x/api/components/nuxt-client-fallback)
- [NuxtIsland](https://nuxt.com/docs/4.x/api/components/nuxt-island)
- [NuxtErrorBoundary](https://nuxt.com/docs/4.x/api/components/nuxt-error-boundary)
- [Teleports](https://nuxt.com/docs/4.x/api/components/teleports)
- [NuxtTime](https://nuxt.com/docs/4.x/api/components/nuxt-time)
- [NuxtWelcome](https://nuxt.com/docs/4.x/api/components/nuxt-welcome)
