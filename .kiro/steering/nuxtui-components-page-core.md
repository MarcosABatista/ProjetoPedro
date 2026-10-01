---
inclusion: fileMatch
fileMatchPattern: ["app/**/*.vue", "app/components/**/*.vue", "app/pages/**/*.vue", "app/layouts/**/*.vue"]
name: nuxtui-page-core
description: Componentes de estrutura de página/docs Nuxt UI v4 (Page, PageHeader, PageBody, PageAside, PageAnchors, PageLinks, PageCard, PageGrid, PageColumns, PageList). Consultar ao montar páginas de conteúdo/documentação, grids de cards, ou layout com sidebar+TOC.
---
# Nuxt UI v4 — Page (Core / Docs)

Componentes para layout de páginas de conteúdo (docs, blog). Marketing/landing → `nuxtui-components-page-marketing`.

## Page (`UPage`)
Grid layout com colunas `left`/`right` opcionais. Sem slots = coluna única centralizada.
Slots: `left`, `default` (centro), `right`. Props: `as` (default `div`), `ui`.
Grid: 10 colunas; left/right = 2 cols cada, center adapta (6/8/10).
```vue [layouts/docs.vue]
<UPage>
  <template #left>
    <UPageAside><UContentNavigation :navigation="navigation" /></UPageAside>
  </template>
  <slot />
</UPage>
```
```vue [pages/[...slug].vue]
<UPage>
  <UPageHeader :title="page.title" :description="page.description" />
  <UPageBody>
    <ContentRenderer :value="page" />
    <USeparator />
    <UContentSurround :surround="surround" />
  </UPageBody>
  <template #right>
    <UContentToc :links="page.body.toc.links" />
  </template>
</UPage>
```

## PageHeader (`UPageHeader`)
Header da página (dentro do `UPage`, antes do `UPageBody`).
Props: `title`, `description`, `headline` (label acima do título), `links` (ButtonProps[], default `color=neutral variant=outline`). Slots: `headline`, `title`, `description`, `links`, `default`.
```vue
<UPageHeader title="PageHeader" description="..." headline="Components" :links="links" />
```

## PageBody (`UPageBody`)
Wrapper do conteúdo principal com spacing consistente. Dentro de `UPage`, após `UPageHeader`.
Props: `as` (default `div`), `ui.base` (`mt-8 pb-24 space-y-12`). Slot: `default`.

## PageAside (`UPageAside`)
`<aside>` sticky visível a partir do breakpoint `lg`. Posiciona abaixo do Header via `--ui-header-height`. Usar no slot `left`/`right` do `UPage`.
Slots: `top`, `default`, `bottom`. Props: `as` (default `aside`), `ui`.
```vue
<template #left>
  <UPageAside>
    <UPageAnchors :links="links" />
    <USeparator type="dashed" />
    <UContentNavigation :navigation="navigation" />
  </UPageAside>
</template>
```

## PageAnchors (`UPageAnchors`)
Lista de âncoras/links com ícone destacado. Tipicamente dentro de `UPageAside`.
Prop `links: PageAnchor[]` — `{ label, icon?, to?, target?, class?, ui? }` (herda props de Link). Slots: `link`, `link-leading`, `link-label`, `link-trailing`.
```vue
<UPageAnchors :links="[{ label: 'Docs', icon: 'i-lucide-book-open', to: '/docs' }]" />
```

## PageLinks (`UPageLinks`)
Lista de links vertical com título opcional. Tipicamente no slot `#bottom` do `UContentToc`.
Props: `title`, `links: PageLink[]` (`{ label, icon?, to?, target?, ... }`). Slots: `title`, `link`, `link-leading`, `link-label`, `link-trailing`.
```vue
<UContentToc :links="page.body.toc.links">
  <template #bottom>
    <USeparator type="dashed" />
    <UPageLinks title="Community" :links="links" />
  </template>
</UContentToc>
```

## PageCard (`UPageCard`)
Card pré-estilizado com título, descrição, link e ilustração (slot default). Combinar com PageGrid/PageColumns/PageList.
Props chave:
- `title`, `description`, `icon`
- `variant` (`'outline'` default | `solid` | `soft` | `subtle` | `ghost` | `naked`)
- `orientation` (`'vertical'` default | `'horizontal'`), `reverse`
- `highlight` + `highlightColor` — borda destacada
- `spotlight` + `spotlightColor` — efeito spotlight no hover (usar com `outline`); CSS vars `--spotlight-color`, `--spotlight-size`
- props de link (`to`, `target`), `onClick`
Slots: `header`, `body`, `leading`, `title`, `description`, `footer`, `default`.
```vue
<UPageCard title="Tailwind CSS" description="..." icon="i-simple-icons-tailwindcss" to="..." target="_blank" variant="soft" />
```
Como testimonial — `User` no `#footer`:
```vue
<UPageCard :description="testimonial.quote" class="w-60">
  <template #footer><UUser v-bind="testimonial.user" /></template>
</UPageCard>
```

## PageGrid (`UPageGrid`)
Grid responsivo 1→3 colunas (`sm:grid-cols-2 lg:grid-cols-3`) para PageCards. Bento via `col-span-*`/`row-span-*` no `class` de cada card.
Props: `as` (default `div`), `ui.base`. Slot: `default`.
```vue
<UPageGrid>
  <UPageCard v-for="(c, i) in cards" :key="i" v-bind="c" />
</UPageGrid>
```

## PageColumns (`UPageColumns`)
Layout multi-coluna estilo masonry (`columns-2 lg:columns-3`), items não quebram entre colunas. Ideal p/ testimonials.
Props: `as` (default `div`), `ui.base`. Slot: `default`.
```vue
<UPageColumns>
  <UPageCard v-for="(t, i) in testimonials" :key="i" variant="subtle" :description="t.quote">
    <template #footer><UUser v-bind="t.user" size="xl" /></template>
  </UPageCard>
</UPageColumns>
```

## PageList (`UPageList`)
Lista vertical empilhada de cards/elementos.
Props: `divide` (bool — divisor entre itens), `as` (default `div`), `ui.base`. Slot: `default`.
```vue
<UPageList divide>
  <UPageCard v-for="(u, i) in users" :key="i" variant="ghost" :to="u.to">
    <template #body><UUser :name="u.name" :description="u.description" :avatar="u.avatar" size="xl" /></template>
  </UPageCard>
</UPageList>
```

## Referência

- [Page](https://ui.nuxt.com/docs/components/page)
- [PageHeader](https://ui.nuxt.com/docs/components/page-header)
- [PageBody](https://ui.nuxt.com/docs/components/page-body)
- [PageAside](https://ui.nuxt.com/docs/components/page-aside)
- [PageAnchors](https://ui.nuxt.com/docs/components/page-anchors)
- [PageLinks](https://ui.nuxt.com/docs/components/page-links)
- [PageCard](https://ui.nuxt.com/docs/components/page-card)
- [PageGrid](https://ui.nuxt.com/docs/components/page-grid)
- [PageColumns](https://ui.nuxt.com/docs/components/page-columns)
- [PageList](https://ui.nuxt.com/docs/components/page-list)
- [Todos os componentes](https://ui.nuxt.com/docs/components)
