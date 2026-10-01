---
inclusion: fileMatch
fileMatchPattern: ["nuxt.config.ts", "app/assets/**/*.css"]
name: Nuxt UI Fonts
description: Use ao declarar/otimizar fontes web em Nuxt UI (integração @nuxt/fonts, plug-and-play via CSS @theme).
---
# Nuxt UI — Fonts

Integra `@nuxt/fonts` (registrado automaticamente, sem setup). Declare a fonte no CSS via `@theme` — carregada e otimizada automaticamente:

```css [app/assets/css/main.css]
@import "tailwindcss";
@import "@nuxt/ui";

@theme {
  --font-sans: 'Public Sans', sans-serif;
}
```

Desabilitar:

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  ui: { fonts: false }
})
```

## Referência

- https://ui.nuxt.com/docs/getting-started/integrations/fonts
