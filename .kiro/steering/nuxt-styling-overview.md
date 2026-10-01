---
inclusion: fileMatch
fileMatchPattern: ["app/assets/**/*.css", "app/**/*.vue", "app/app.config.ts"]
name: nuxt-styling-overview
description: Nuxt v4 styling — local/external stylesheets, css config, preprocessors (SCSS/Sass/Less), SFC scoped styles/CSS modules/v-bind, PostCSS, fonts, and UI libraries (Nuxt UI, Tailwind, UnoCSS). Use when adding CSS, configuring preprocessors, or styling components.
---

# Nuxt v4 — Styling

Local stylesheets live in `app/assets/`. Nuxt inlines stylesheets into rendered HTML.

## Importing styles

In components (static import for SSR compatibility; dynamic imports are NOT SSR-safe):

```vue [app/pages/index.vue]
<script>
import '~/assets/css/first.css'
</script>
<style>
@import url("~/assets/css/second.css");
</style>
```

Global via config (injected on all pages):

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  css: ['~/assets/css/main.css'],
})
```

npm-distributed stylesheets work the same: `css: ['animate.css']`.

## Fonts

Local font files in `public/fonts`, referenced by `url()`:

```css [assets/css/main.css]
@font-face {
  font-family: 'FarAwayGalaxy';
  src: url('/fonts/FarAwayGalaxy.woff') format('woff');
  font-display: swap;
}
```

## External stylesheets

Via `app.head.link`:

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  app: { head: { link: [{ rel: 'stylesheet', href: 'https://cdn.example/x.css' }] } },
})
```

Dynamically with `useHead({ link: [...] })`. External stylesheets are render-blocking.

## Preprocessors

Install (`sass`, `less`, or `stylus`), then import with preprocessor syntax:

```vue
<style lang="scss">
@use "~/assets/scss/main.scss";
</style>
```

Inject shared partials (color vars, etc.) via Vite preprocessorOptions:

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  vite: {
    css: {
      preprocessorOptions: {
        scss: { additionalData: '@use "~/assets/_colors.scss" as *;' },
      },
    },
  },
})
```

## SFC styling

- **Class/style bindings**: `:class="{ active: isActive }"`, `:style="{ color, fontSize: fontSize + 'px' }"`, arrays and computed objects supported.
- **Dynamic `v-bind` in CSS**: `color: v-bind(color);` (reactive).
- **Scoped**: `<style scoped>` isolates styles to the component.
- **CSS Modules**: `<style module>` + `$style.className`.
- **Preprocessor lang**: `<style lang="scss|sass|less|stylus">` — Vite built-in once installed.

## PostCSS

Built-in. Pre-configured: postcss-import, postcss-url, autoprefixer, cssnano. Add plugins:

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  postcss: { plugins: { 'postcss-nested': {}, 'postcss-custom-media': {} } },
})
```

## UI libraries / modules

Nuxt is unopinionated. Popular: **Nuxt UI** (`ui.nuxt.com`), Tailwind CSS, UnoCSS, Panda CSS, Fontaine (CLS reduction), Pinceau. `@nuxtjs/tailwindcss` auto-configures Tailwind for the v4 directory structure.

## Advanced

Transitions: Nuxt ships Vue `<Transition>` + experimental View Transitions API. To fully stop external CSS `<link>` refs when all CSS is inlined, use a `build:manifest` hook to splice entry CSS. LCP: CDN + Brotli + HTTP2/3, same-domain assets.

## Referência

- [Styling](https://nuxt.com/docs/4.x/getting-started/styling) — doc oficial Nuxt v4
