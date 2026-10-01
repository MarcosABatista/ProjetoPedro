---
inclusion: fileMatch
fileMatchPattern: ["nuxt.config.ts", "content/**", "app/**/*.vue"]
name: Nuxt UI Content (Nuxt Content)
description: Use ao integrar Nuxt UI com @nuxt/content — instalação, @source do Tailwind p/ markdown, componentes Content* de docs e util mapContentNavigation.
---
# Nuxt UI — Content

Integra `@nuxt/content` para typography e styling consistentes em markdown.

## Instalação

```bash
pnpm add @nuxt/content
```

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  modules: ['@nuxt/ui', '@nuxt/content'],
  css: ['~/assets/css/main.css']
})
```

**Importante:** registrar `@nuxt/content` **depois** de `@nuxt/ui` nos `modules`, senão os prose components não ficam disponíveis.

## Configuração (`@source`)

Tailwind não detecta classes em arquivos markdown por padrão. Inclua o dir de conteúdo com `@source`:

```css [app/assets/css/main.css]
@import "tailwindcss";
@import "@nuxt/ui";

@source "../../../content/**/*";
```

Garante scan de markdown, classes utilitárias (`text-primary`) e classes dinâmicas em MDC/Vue components. Globs mais específicos: `@source "../../../content/docs/**/*.md"` ou `@source "../../../content/**/*.{md,yml}"`.

## Componentes de docs

- `ContentSearch` — command palette de busca full-text (substitui Algolia DocSearch).
- `ContentNavigation` — árvore de navegação.
- `ContentToc` — table of contents sticky.
- `ContentSurround` — navegação prev/next.

Prose components: ver Typography.

## Util `mapContentNavigation`

Reshape do resultado de `queryCollectionNavigation` para o formato esperado pelos componentes. `mapContentNavigation(navigation, options?)` — `options.labelAttribute` (campo do label, default `title`), `options.deep` (níveis incluídos, default `undefined` = todos).

```vue [app.vue]
<script setup lang="ts">
import { mapContentNavigation } from '@nuxt/ui/utils/content'
import { findPageBreadcrumb } from '@nuxt/content/utils'

const route = useRoute()
const { data: navigation } = await useAsyncData('navigation', () => queryCollectionNavigation('content'))
const { data: page } = await useAsyncData(route.path, () => queryCollection('content').path(route.path).first())

const breadcrumb = computed(() => mapContentNavigation(
  findPageBreadcrumb(navigation.value, page.value?.path, { indexAsChild: true }),
  { deep: 0 }
).map(({ icon, ...link }) => link))
</script>

<template>
  <UPage>
    <UPageHeader v-bind="page">
      <template #headline><UBreadcrumb :items="breadcrumb" /></template>
    </UPageHeader>
  </UPage>
</template>
```

## Referência

- https://ui.nuxt.com/docs/getting-started/integrations/content
