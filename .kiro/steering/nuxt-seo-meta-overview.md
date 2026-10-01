---
inclusion: fileMatch
fileMatchPattern: ["app/pages/**/*.vue", "app/app.vue", "app/layouts/**/*.vue"]
name: nuxt-seo-meta-overview
description: Nuxt v4 head/SEO management via Unhead — app.head static config, useHead, useSeoMeta (typed), head components, titleTemplate/templateParams, reactivity, and definePageMeta-driven meta. Use when setting titles, meta tags, favicons, or SEO tags.
---

# Nuxt v4 — SEO and Meta

Head management powered by Unhead. Defaults provided: `viewport: width=device-width, initial-scale=1`, `charset: utf-8`.

## Static config — app.head

Set non-changing tags (default title, lang, favicon). No reactive data here.

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  app: {
    head: {
      title: 'Nuxt',
      htmlAttrs: { lang: 'en' },
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
    },
  },
})
```

Note: a static `href: '/favicon.ico'` is a literal path — NOT resolved against `cdnURL`. To respect `cdnURL`/`baseURL`, build it via `useHead` from `useRuntimeConfig().app`.

## useHead (reactive)

```vue [app/app.vue]
<script setup lang="ts">
useHead({
  title: 'My App',
  meta: [{ name: 'description', content: 'My amazing site.' }],
  bodyAttrs: { class: 'test' },
  script: [{ innerHTML: 'console.log(\'Hello world\')' }],
})
</script>
```

Also `useHeadSafe` for sanitized input.

## useSeoMeta (typed, recommended for SEO)

Flat, fully type-safe object — avoids `name` vs `property` mistakes.

```vue [app/app.vue]
<script setup lang="ts">
useSeoMeta({
  title: 'My Amazing Site',
  ogTitle: 'My Amazing Site',
  description: 'This is my amazing site.',
  ogDescription: 'This is my amazing site.',
  ogImage: 'https://example.com/image.png',
  twitterCard: 'summary_large_image',
})
</script>
```

## Components

`<Title>`, `<Base>`, `<NoScript>`, `<Style>`, `<Meta>`, `<Link>`, `<Body>`, `<Html>`, `<Head>` (capitalized). Wrap in `<Head>`/`<Html>` for intuitive deduping. Use `key` on `<Head>` to duplicate across client-server.

```vue
<template>
  <Head>
    <Title>{{ title }}</Title>
    <Meta name="description" :content="title" />
  </Head>
</template>
```

## Reactivity

All properties accept computed values, getters, or reactive objects.

```vue
<script setup lang="ts">
const description = ref('My amazing site.')
useSeoMeta({ description })
</script>
```

## Title Template

`titleTemplate`: string with `%s`, or function (function form must be in `app.vue`, not `nuxt.config`).

```vue [app/app.vue]
<script setup lang="ts">
useHead({
  titleTemplate: (titleChunk) => titleChunk ? `${titleChunk} - Site Title` : 'Site Title',
})
</script>
```

`templateParams` adds custom placeholders beyond `%s`:

```vue
<script setup lang="ts">
useHead({
  titleTemplate: (t) => t ? `${t} %separator %siteName` : '%siteName',
  templateParams: { siteName: 'Site Title', separator: '-' },
})
</script>
```

## Body tags

`tagPosition: 'bodyClose' | 'bodyOpen' | 'head'` on script/tags.

## Per-route meta with definePageMeta

`definePageMeta` title is extracted at build time (static). Read in layout via `route.meta`:

```vue [pages/some-page.vue]
<script setup lang="ts">
definePageMeta({ title: 'Some Page' })
</script>
```

```vue [layouts/default.vue]
<script setup lang="ts">
const route = useRoute()
useHead({ meta: [{ property: 'og:title', content: `App Name - ${route.meta.title}` }] })
</script>
```

## Types (MetaObject)

`title`, `titleTemplate`, `templateParams`, `base`, `link[]`, `meta[]`, `style[]`, `script[]`, `noscript[]`, `htmlAttrs`, `bodyAttrs`.

## Referência

- [SEO and Meta](https://nuxt.com/docs/4.x/getting-started/seo-meta) — doc oficial Nuxt v4
