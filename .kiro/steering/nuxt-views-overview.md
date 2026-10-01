---
inclusion: fileMatch
fileMatchPattern: ["app/app.vue", "app/pages/**/*.vue", "app/layouts/**/*.vue", "app/components/**/*.vue"]
name: nuxt-views-overview
description: Nuxt v4 UI component layers — app.vue entrypoint, auto-imported components/, pages/ with NuxtPage, layouts/ with NuxtLayout and slots. Use when building the app shell, page structure, or shared layout chrome.
---

# Nuxt v4 — Views

Component layers, from outermost to page content: `app.vue` → layouts → pages → components.

## app.vue

Entrypoint, rendered for every route. If no `app.vue`, Nuxt uses a default that renders `<NuxtPage />`.

```vue [app/app.vue]
<template>
  <div>
    <h1>Welcome to the homepage</h1>
  </div>
</template>
```

Nuxt creates the Vue app internally (no `main.js`).

## Components

Files in `app/components/` are auto-imported app-wide (no explicit import), tree-shaken. Name = path-based PascalCase (`components/App/Alert.vue` → `<AppAlert>`).

```vue [app/components/AppAlert.vue]
<template>
  <span><slot /></span>
</template>
```

```vue [app/app.vue]
<template>
  <AppAlert>This is an auto-imported component.</AppAlert>
</template>
```

## Pages

Each file in `app/pages/` maps to a route. Requires `<NuxtPage />` in `app.vue` (or remove `app.vue` to use the default entry).

```vue [app/pages/index.vue]
<template>
  <h1>Welcome to the homepage</h1>
</template>
```

```vue [app/pages/about.vue]
<template>
  <p>Displayed at /about</p>
</template>
```

## Layouts

Wrappers around pages with shared chrome (header/footer). Use `<slot />` for page content. `app/layouts/default.vue` is used by default. Set custom layout via page metadata.

Single layout? Prefer `app.vue` + `<NuxtPage />` instead of a layout.

```vue [app/app.vue]
<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
```

```vue [app/layouts/default.vue]
<template>
  <div>
    <AppHeader />
    <slot />
    <AppFooter />
  </div>
</template>
```

## Advanced: extend HTML template

Mutate rendered HTML with a Nitro plugin hooking `render:html`:

```ts [server/plugins/extend-html.ts]
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('render:html', (html, { event }) => {
    html.head.push(`<meta name="description" content="My custom description" />`)
  })
  nitroApp.hooks.hook('render:response', (response, { event }) => {})
})
```

For `<head>`-only changes, use SEO/meta composables instead.

## Referência

- [Views](https://nuxt.com/docs/4.x/getting-started/views) — doc oficial Nuxt v4
