---
inclusion: fileMatch
fileMatchPattern: ["app/**/*.vue", "app/components/**/*.vue", "app/pages/**/*.vue", "app/layouts/**/*.vue"]
name: nuxtui-content
description: Componentes Nuxt UI v4 para documentação, blog e changelog (navigation, TOC, surround, search, blog posts, changelog versions). Usar ao construir páginas de docs, blog ou changelog, muitos integrados ao @nuxt/content.
---
# Nuxt UI — Content, Blog & Changelog

Componentes de conteúdo: `ContentNavigation`, `ContentToc`, `ContentSurround`, `ContentSearch`, `ContentSearchButton`, `BlogPost`, `BlogPosts`, `ChangelogVersion`, `ChangelogVersions`.

> `Content*` só disponíveis com o módulo `@nuxt/content` instalado.

## ContentNavigation
Navegação em accordion para links de páginas. Props: `navigation` (`ContentNavigationItem[]` de `queryCollectionNavigation`), `type` (`single`|`multiple`, default `multiple`), `color` (default `primary`), `variant` (`pill`|`link`, default `pill`), `highlight` (borda no link ativo), `highlightColor`, `trailingIcon` (`i-lucide-chevron-down`), `defaultOpen`, `collapsible`, `level`, `disabled`. Slots: `link`, `link-leading`, `link-title`, `link-trailing`. Emit `update:modelValue`.
```vue
<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'
const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')
</script>
<template>
  <UPageAside><UContentNavigation :navigation="navigation" highlight /></UPageAside>
</template>
```

## ContentToc
Table of Contents sticky com highlight do anchor ativo. Props: `links` (`page?.body?.toc?.links`), `title` (default "On this page"), `color`, `highlight`, `highlightColor`, `highlightVariant` (`straight`|`circuit`, default `straight`, `4.6+`), `trailingIcon`, `open`/`defaultOpen`. Slots: `leading`, `default`, `trailing`, `content`, `link`, `top`, `bottom`. Emits: `update:open`, `move`.
```vue
<template v-if="page?.body?.toc?.links?.length" #right>
  <UContentToc :links="page.body.toc.links" highlight />
</template>
```

## ContentSurround
Par de links prev/next entre páginas. Props: `surround` (de `queryCollectionItemSurroundings`), `prevIcon` (`i-lucide-arrow-left`), `nextIcon` (`i-lucide-arrow-right`). Slots: `link`, `link-leading`, `link-title`, `link-description`.
```vue
<script setup lang="ts">
const route = useRoute()
const { data: surround } = await useAsyncData(`${route.path}-surround`, () =>
  queryCollectionItemSurroundings('docs', route.path, { fields: ['description'] }))
</script>
<template><UContentSurround :surround="surround as any" /></template>
```

## ContentSearch
CommandPalette pronto para docs, estende [CommandPalette](https://ui.nuxt.com/docs/components/command-palette). Suporta Fuse.js client-side (`files`) ou FTS5 server-side (`search`, `4.8+`). Abre com Cmd/Ctrl+K, `ContentSearchButton`, ou `useContentSearch().open`.
Props: `navigation` (agrupa por seção), `files` (de `queryCollectionSearchSections` → filtragem Fuse), `fuse` (`{ resultLimit: 12, fuseOptions: { threshold: 0.1 } }`), `search` (fn async de `useSearchCollection` — FTS5), `searchStatus`, `searchDelay` (default 100ms), `shortcut` (default `meta_k`), `links` (grupo de acesso rápido no topo), `colorMode` (default true — comandos light/dark), `placeholder`, `close`, `fullscreen`, `autofocus`. Emit `update:searchTerm` (v-model:search-term).
Envolver em `<ClientOnly>` + usar `LazyUContentSearch`.
```vue
<ClientOnly>
  <LazyUContentSearch :navigation="navigation" :files="files" :fuse="{ resultLimit: 20 }" />
</ClientOnly>
```
`search` (FTS5, requer @nuxt/content v3.14+): não precisa de `files`; chama a fn a cada tecla, resultados mapeados/agrupados com snippets destacados.

## ContentSearchButton
Botão pré-estilizado para abrir o ContentSearch. Estende [Button](https://ui.nuxt.com/docs/components/button). Props: `icon` (`search`), `label`, `color` (default `neutral`), `variant` (default `outline` quando expandido, `ghost` quando `collapsed`), `collapsed` (default true — esconde label/kbds), `tooltip`, `kbds` (default `['meta','K']`). Slots: `leading`, `default`, `trailing`.
```vue
<UContentSearchButton :collapsed="false" />
```

## BlogPost
`<article>` para um post. Props: `title`, `description`, `date` (string|Date, formatada por locale), `badge` (string|BadgeProps), `authors` (`UserProps[]` — >1 usa AvatarGroup), `image` (usa `<NuxtImg>` se @nuxt/image), `orientation` (`vertical`|`horizontal`, default vertical), `variant` (`outline`|`soft`|`subtle`|`ghost`|`naked`, default outline), `to`/`target` (NuxtLink). Slots: `date`, `badge`, `title`, `description`, `authors`, `header`, `body`, `footer`.
```vue
<UBlogPost title="Nuxt Icon v1" description="..." image="/cover.png" date="2024-11-25" :authors="authors" to="/blog/nuxt-icon" />
```

## BlogPosts
Grid responsivo de BlogPost. Props: `posts` (`BlogPostProps[]`) ou default slot, `orientation` (default `horizontal`). Nota: com `posts` prop, a orientação dos posts é invertida automaticamente.
```vue
<UBlogPosts>
  <UBlogPost v-for="(post, i) in posts" :key="i" v-bind="post" :to="post.path" />
</UBlogPosts>
```

## ChangelogVersion
`<article>` de uma versão de changelog. Props: `title`, `description`, `date` (string|Date), `badge` (string|BadgeProps), `authors` (`UserProps[]`), `image`, `to`/`target`, `indicator` (dot à esquerda, default true; false → data sobre o título). Slots: `header`, `badge`, `date`, `title`, `description`, `image`, `body` (conteúdo custom, ex. `<MDC>`), `footer`, `authors`, `actions`, `indicator`.

## ChangelogVersions
Timeline de ChangelogVersion com barra indicadora. Props: `versions` (`ChangelogVersionProps[]`) ou default slot, `indicator` (bool|UseScrollOptions — bar à esquerda que segue o scroll da página; passar `{ container }` p/ scroll custom, `4.4+`), `indicatorMotion` (bool|SpringOptions, default `{ damping:30, restDelta:0.001 }`). Encaminha os slots de ChangelogVersion (ex. `#body="{ version }"`).
```vue
<UChangelogVersions>
  <UChangelogVersion v-for="(v, i) in versions" :key="i" v-bind="v" :to="v.path" />
</UChangelogVersions>
```
`authors` (BlogPost/ChangelogVersion): objetos `{ name?, description?, avatar?, chip?, size?, orientation? }` + props de Link (`to`, `target`).

## Referência

- [ContentNavigation](https://ui.nuxt.com/docs/components/content-navigation)
- [ContentSearch](https://ui.nuxt.com/docs/components/content-search)
- [ContentToc](https://ui.nuxt.com/docs/components/content-toc)
- [ContentSurround](https://ui.nuxt.com/docs/components/content-surround)
- [BlogPost](https://ui.nuxt.com/docs/components/blog-post)
- [BlogPosts](https://ui.nuxt.com/docs/components/blog-posts)
- [ChangelogVersion](https://ui.nuxt.com/docs/components/changelog-version)
- [ChangelogVersions](https://ui.nuxt.com/docs/components/changelog-versions)
- [Todos os componentes](https://ui.nuxt.com/docs/components)
