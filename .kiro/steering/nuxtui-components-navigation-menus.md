---
inclusion: fileMatch
fileMatchPattern: ["app/**/*.vue", "app/components/**/*.vue", "app/pages/**/*.vue", "app/layouts/**/*.vue"]
name: Nuxt UI Navigation — Breadcrumb, NavigationMenu, Tabs, Pagination
description: Use ao construir Breadcrumb, NavigationMenu, Tabs ou Pagination no Nuxt UI v4 — navegação por hierarquia, menus de links, painéis em abas e paginação.
---
# Nuxt UI — Navigation (Breadcrumb, NavigationMenu, Tabs, Pagination)

Todos dirigidos por prop `items` (array de objetos). Itens aceitam props do `ULink` (`to`, `target`...).

## Breadcrumb — `UBreadcrumb`
Hierarquia de links. `A hierarchy of links to navigate through a website.`
```vue
<script setup lang="ts">
import type { BreadcrumbItem } from '@nuxt/ui'
const items = ref<BreadcrumbItem[]>([
  { label: 'Docs', icon: 'i-lucide-book-open', to: '/docs' },
  { label: 'Components', to: '/docs/components' },
  { label: 'Breadcrumb' }  // sem `to` renderiza <span> (item ativo)
])
</script>
<template><UBreadcrumb :items="items" /></template>
```
Item: `label`, `icon`, `avatar`, `slot`, `class`, `ui`. Props: `items`, `separatorIcon` (`i-lucide-chevron-right`), `color` (4.8+, cor do item ativo), `labelKey` (`label`). Slots: `item*`, `separator`. Sem emits (navegação por links). Renderiza `<nav>`.

## NavigationMenu — `UNavigationMenu`
Menu de navegação horizontal/vertical com submenus. `A list of links and menus to navigate through your application.`
```vue
<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
const items = ref<NavigationMenuItem[]>([
  { label: 'Guia', icon: 'i-lucide-book-open', to: '/docs', children: [
    { label: 'Intro', description: 'Componentes...', icon: 'i-lucide-house', to: '/x' }
  ] },
  { label: 'GitHub', icon: 'i-simple-icons-github', badge: '6k', to: 'https://...', target: '_blank' },
  { label: 'Help', disabled: true }
])
</script>
<template><UNavigationMenu :items="items" class="w-full justify-center" /></template>
```
Item: `label`, `icon`, `avatar`, `badge`, `chip`, `tooltip`, `popover`, `trailingIcon`, `type` (`label` | `trigger` | `link`), `defaultOpen`/`open`, `value`, `disabled`, `slot`, `onSelect`, `children` (submenu: `label`, `description`, `icon`, `onSelect`). Aceita `items` como array de arrays (grupos).
Props: `items`, `orientation` (`horizontal` default | `vertical` — usa Accordion nos grupos, controlável via `collapsible`/`type`), `color`, `variant` (`pill` | `link`), `highlight` + `highlightColor`, `trailingIcon`, `arrow`, `content` (config do dropdown), `labelKey`, `unmountOnHide`, `disabled`. Slots por item: `#item`, `#item-leading/-label/-trailing`, `#{slot}*`. Emits: `update:open`.

## Tabs — `UTabs`
Painéis exibidos um por vez. `A set of tab panels that are displayed one at a time.`
```vue
<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui'
const items = ref<TabsItem[]>([
  { label: 'Conta', icon: 'i-lucide-user', slot: 'account', content: '...' },
  { label: 'Senha', icon: 'i-lucide-lock', slot: 'password' }
])
</script>
<template>
  <UTabs :items="items" class="w-full">
    <template #account>...</template>
    <template #password>...</template>
  </UTabs>
</template>
```
Item: `label`, `icon`, `avatar`, `badge`, `content`, `value`, `disabled`, `slot`, `class`, `ui`.
Props: `items`, `color`, `variant` (`pill` default | `link`), `size` (xs–xl), `orientation` (`horizontal` default | `vertical`), `content` (bool — `false` só triggers, sem painéis), `unmountOnHide`, `valueKey`/`labelKey`, `defaultValue` (`'0'`), `activationMode` (`automatic` | `manual`). `v-model` seleciona o `value` (default = índice como string). Slots: `default`, `leading`, `trailing`, `content` (`{ item }`), `list-leading`, `list-trailing`, `#{slot}`. Emits: `update:modelValue`. Route query: bind `v-model` a `route.query.tab` via `computed`.

## Pagination — `UPagination`
Botões/links de páginas. `A list of buttons or links to navigate through pages.`
```vue
<script setup lang="ts">
const page = ref(1)
</script>
<template>
  <UPagination v-model:page="page" :total="100" :items-per-page="10" :sibling-count="1" show-edges />
</template>
```
Props: `total` (0), `itemsPerPage` (10), `siblingCount` (2), `showEdges` (false — sempre mostra primeira/última + reticências), `showControls` (true — first/prev/next/last), `color` (`neutral`, inativos), `variant` (`outline`), `activeColor` (`primary`), `activeVariant` (`solid`), `size`, `disabled`, `page`/`defaultPage`, `to` (função `(page:number) => RouteLocation` transforma botões em links), ícones `firstIcon`/`prevIcon`/`nextIcon`/`lastIcon`/`ellipsisIcon`. `v-model:page` controla a página atual. Slots: `first`, `prev`, `next`, `last`, `ellipsis`, `item`. Emits: `update:page`.

## a11y
Baseados em Reka UI (NavigationMenu/Tabs/Pagination): roles ARIA, navegação por teclado (setas entre tabs/itens), foco gerenciado. Breadcrumb renderiza `<nav>` semântico com item ativo distinto.

## Referência

- [Breadcrumb](https://ui.nuxt.com/docs/components/breadcrumb)
- [NavigationMenu](https://ui.nuxt.com/docs/components/navigation-menu)
- [Tabs](https://ui.nuxt.com/docs/components/tabs)
- [Pagination](https://ui.nuxt.com/docs/components/pagination)
- [Todos os componentes](https://ui.nuxt.com/docs/components)
