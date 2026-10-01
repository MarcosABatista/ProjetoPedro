---
inclusion: fileMatch
fileMatchPattern: ["content/**", "app/**/*.vue", "app/**/*.md"]
name: Nuxt UI Typography Overview
description: Use ao renderizar markdown/conteúdo estilizado com Nuxt UI — habilitar prose, renderizadores (ContentRenderer, MDC, Markdown/Comark, MarkdownDocument), MDC syntax e tema prose.
---
# Nuxt UI — Typography (Overview)

Prose components estilizam markdown com o design system. Elementos markdown mapeiam para prose components: `# Heading` → `<ProseH1>`, `**bold**` → `<ProseStrong>`, `` `code` `` → `<ProseCode>`, etc.

## Habilitar prose

**Nuxt:** auto-habilitado com `@nuxtjs/mdc`, `@nuxt/content` ou `@comark/nuxt`. Senão:

```ts [nuxt.config.ts]
export default defineNuxtConfig({ modules: ['@nuxt/ui'], ui: { prose: true } })
```

**Vue:** `ui({ prose: true })` no `vite.config.ts`.

## Renderizadores

### ContentRenderer (Nuxt + `@nuxt/content`)

```vue [pages/[...slug].vue]
<script setup lang="ts">
const route = useRoute()
const { data: page } = await useAsyncData(route.path, () => queryCollection('docs').path(route.path).first())
</script>

<template>
  <ContentRenderer :value="page" />
</template>
```

### MDC (Nuxt, `@nuxtjs/mdc`/`@nuxt/content`)

Renderiza strings markdown: `<MDC :value="value" />`. `@nuxtjs/mdc` sendo depreciado em favor de [Comark](https://comark.dev) (conteúdo compatível, sem mudanças).

### Markdown (Comark) — streaming

Renderização incremental de tokens (ideal p/ respostas AI). Prop `:streaming` p/ conteúdo incremental. Plugin `shiki` p/ highlight.

```vue
<script setup lang="ts">
// Nuxt: import shiki from '@comark/nuxt/plugins/shiki'
// Vue:  import { Markdown } from '@comark/vue'; import shiki from '@comark/vue/plugins/shiki'
const markdown = ref('# Hello\n\nThis is **streaming** markdown.')
</script>

<template>
  <Markdown :value="markdown" :plugins="[shiki()]" />
</template>
```

Dark mode do shiki (adicionar ao CSS):

```css [main.css]
html.dark .shiki span {
  color: var(--shiki-dark) !important;
  background-color: var(--shiki-dark-bg) !important;
  font-style: var(--shiki-dark-font-style) !important;
  font-weight: var(--shiki-dark-font-weight) !important;
  text-decoration: var(--shiki-dark-text-decoration) !important;
}
```

### MarkdownDocument

Renderiza um `MarkdownDocument` pré-parseado sem enviar parser/plugins ao browser (parse no server/build/API): `<MarkdownDocument :value="tree" />` (Nuxt auto-import; Vue de `@comark/vue`).

## Prose components diretos

Uso direto em templates Vue para controle máximo:

```vue
<template>
  <ProseTable>
    <ProseThead><ProseTr><ProseTh>Prop</ProseTh><ProseTh>Default</ProseTh></ProseTr></ProseThead>
    <ProseTbody>
      <ProseTr><ProseTd><ProseCode>color</ProseCode></ProseTd><ProseTd><ProseCode>neutral</ProseCode></ProseTd></ProseTr>
    </ProseTbody>
  </ProseTable>
</template>
```

## MDC Syntax

Permite usar componentes Vue dentro do markdown (suportado por Nuxt Content, Nuxt MDC, Comark). Ex: `::callout{icon="i-lucide-rocket" color="primary"}`, `::tabs` / `:::tabs-item{label="..."}`, `::code-group` com blocos de código.

## Theme

Sobrescrever styling de qualquer prose component:

```ts [app/app.config.ts]
export default defineAppConfig({
  ui: {
    prose: {
      h1: { slots: { base: 'scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl' } },
      p: { base: 'leading-7 [&:not(:first-child)]:mt-6' }
    }
  }
})
```

Vue: dentro de `ui({ ui: { prose: { ... } } })` no `vite.config.ts`.

## Referência

- https://ui.nuxt.com/docs/typography
