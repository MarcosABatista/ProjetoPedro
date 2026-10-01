---
inclusion: fileMatch
fileMatchPattern: ["app/**/*.vue"]
name: nuxt-components-images
description: Use when handling image optimization in Nuxt with NuxtImg or NuxtPicture (@nuxt/image module).
---
# Nuxt v4 Image Components

Both components require the Nuxt Image module:
```bash [Terminal]
npx nuxt module add image
```
Full options docs: https://image.nuxt.com

## `<NuxtImg>`
Drop-in replacement for native `<img>`. Outputs a plain `<img>` tag (no wrapper).
- Optimizes local + remote images via built-in provider.
- Rewrites `src` to provider-optimized URLs.
- Auto-resizes based on `width`/`height`.
- Generates responsive sizes via `sizes` option.
- Supports native lazy loading + all `<img>` attributes.

```html
<NuxtImg src="/nuxt-icon.png" />
<!-- renders: <img src="/nuxt-icon.png" /> -->
```
Common attrs (from @nuxt/image): `src`, `width`, `height`, `sizes` (e.g. `sizes="sm:100vw md:50vw lg:400px"`), `format` (e.g. `webp`), `quality`, `loading="lazy"`, `provider`, `preset`, `modifiers`, `placeholder`.

## `<NuxtPicture>`
Drop-in replacement for native `<picture>`. API almost identical to `<NuxtImg>`, but additionally serves modern formats (e.g. `webp`) when supported — use it when you want format negotiation via `<source>` elements.

Use `<NuxtImg>` for a single optimized image; use `<NuxtPicture>` when you need multiple format/art-direction sources.

## Referência

- [NuxtImg](https://nuxt.com/docs/4.x/api/components/nuxt-img)
- [NuxtPicture](https://nuxt.com/docs/4.x/api/components/nuxt-picture)
