---
inclusion: fileMatch
fileMatchPattern: ["app/**/*.vue", "app/components/**/*.vue", "app/pages/**/*.vue", "app/layouts/**/*.vue"]
name: nuxtui-dashboard
description: Componentes de dashboard Nuxt UI v4 (DashboardGroup, DashboardSidebar, DashboardPanel, DashboardNavbar, DashboardToolbar, DashboardSearch e botões auxiliares). Consultar ao montar layout de dashboard/admin com sidebar redimensionável, painéis e command palette.
---
# Nuxt UI v4 — Dashboard

Layout de dashboard/admin: sidebar redimensionável+colapsável, painéis, navbar, toolbar, busca. Estado (tamanho/colapso) persistido via `DashboardGroup`.

## Arquitetura
`DashboardGroup` (raiz, provê contexto + persistência) → contém `DashboardSidebar` + `DashboardPanel`(s). Cada painel usa `#header` com `DashboardNavbar` (+ `DashboardToolbar` opcional). `DashboardSearch` = command palette. Botões auxiliares (`DashboardSidebarToggle`, `DashboardSidebarCollapse`, `DashboardResizeHandle`) em geral são automáticos.

## Composição típica
```vue [layouts/dashboard.vue]
<template>
  <UDashboardGroup>
    <UDashboardSidebar collapsible resizable>
      <template #header="{ collapsed }">
        <Logo v-if="!collapsed" class="h-5 w-auto" />
      </template>
      <template #default="{ collapsed }">
        <UDashboardSearchButton :collapsed="collapsed" />
        <UNavigationMenu :collapsed="collapsed" :items="items" orientation="vertical" />
      </template>
    </UDashboardSidebar>
    <UDashboardSearch :groups="groups" />
    <slot />
  </UDashboardGroup>
</template>
```
```vue [pages/index.vue]
<script setup>definePageMeta({ layout: 'dashboard' })</script>
<template>
  <UDashboardPanel id="home" resizable>
    <template #header>
      <UDashboardNavbar title="Home">
        <template #leading><UDashboardSidebarCollapse /></template>
      </UDashboardNavbar>
      <UDashboardToolbar><UNavigationMenu :items="tabs" highlight /></UDashboardToolbar>
    </template>
    <template #body><Placeholder class="h-full" /></template>
  </UDashboardPanel>
</template>
```

## DashboardGroup (`UDashboardGroup`)
Layout raiz fixo (`fixed inset-0`). Provê contexto + persistência de tamanho.
Props: `storage` (`'cookie'` default | `'local'`), `storageKey` (default `'dashboard'`), `storageOptions`, `persistent` (default true), `unit` (`'%'` default | `'rem'` | `'px'`), `as`. Slot: `default`.

## DashboardSidebar (`UDashboardSidebar`)
Sidebar de dashboard: drag-to-resize + persistência + integração com Group/Panel/Navbar. (Para sidebar avulsa simples → `USidebar`.)
Props chave:
- `resizable` (bool), `collapsible` (bool — colapsa ao arrastar até a borda; requerido p/ SidebarCollapse funcionar)
- `minSize` (10), `maxSize` (20), `defaultSize` (15), `collapsedSize` (0) — em % (ou unit do Group)
- `side` (`'left'` default | `'right'`)
- `mode` (`'slideover'` default — menu mobile), `menu`
- `toggle` (bool|ButtonProps), `toggleSide` (`'left'` default | `'right'`)
- `v-model:open` (mobile), `v-model:collapsed` (desktop)
Slots: `header`, `default` (ambos recebem `{ collapsed }`), `footer`, `toggle`, `content`, `resize-handle`.
Atenção: sem root único quando `resizable` — envolver em `<div class="flex flex-1">` se usar transitions.

## DashboardPanel (`UDashboardPanel`)
Painel redimensionável. Múltiplos painéis lado a lado no default slot do Group. Definir `id` único ao usar vários painéis em páginas diferentes.
Props: `id`, `resizable`, `minSize` (15), `maxSize` (100), `defaultSize` (0). Slots: `default` (sem body scrollável), `header`, `body`, `footer`, `resize-handle`.
Header normalmente contém `DashboardNavbar`. Sem root único com `resizable` — envolver se precisar.

## DashboardNavbar (`UDashboardNavbar`)
Navbar responsiva no `#header` do Panel. Inclui toggle mobile automático.
Props: `title`, `icon`, `toggle` (bool|ButtonProps), `toggleSide` (`'left'` default | `'right'`), `as`.
Slots: `title`, `leading`, `trailing`, `left`, `default`, `right`, `toggle`.
```vue
<UDashboardNavbar title="Inbox">
  <template #leading><UDashboardSidebarCollapse /></template>
  <template #trailing><UBadge label="4" variant="subtle" /></template>
  <template #right><UTabs :items="tabs" size="sm" :content="false" /></template>
</UDashboardNavbar>
```

## DashboardToolbar (`UDashboardToolbar`)
Toolbar sob o Navbar. Colocar no `#header` do Panel após o Navbar.
Props: `as`. Slots: `left`, `default`, `right`.
```vue
<UDashboardToolbar><UNavigationMenu :items="items" highlight class="flex-1" /></UDashboardToolbar>
```

## DashboardSearch (`UDashboardSearch`)
Command palette pronta (estende CommandPalette). No default slot do Group. Abre com Cmd/Ctrl+K ou `v-model:open`.
Props chave: `groups` (CommandPaletteGroup[]), `v-model:search-term`, `shortcut` (default `'meta_k'`), `fuse` (opções useFuse), `searchDelay` (100ms), `colorMode` (default true — adiciona comandos light/dark), `placeholder`, `size`, `virtualize`, + todas props de CommandPalette/Modal.
Emits: `update:open`, `update:searchTerm`. Ref expõe `commandPaletteRef`.
```vue
<UDashboardSearch v-model:search-term="searchTerm" :groups="groups" :fuse="{ resultLimit: 42 }" />
```

## DashboardSearchButton (`UDashboardSearchButton`)
Botão pré-estilizado que abre o DashboardSearch. Estende Button. Default `color=neutral variant=outline` (ou `ghost` colapsado).
Props chave: `collapsed` (esconde label+kbds), `kbds` (default `['meta','K']`), `tooltip`, `icon`, `label`, + props de Button. No DashboardSidebar usar o slot prop `collapsed`.
```vue
<UDashboardSearchButton :collapsed="collapsed" />
```

## DashboardSidebarToggle (`UDashboardSidebarToggle`)
Botão que abre/fecha a sidebar no mobile. Exibido automaticamente — usar só p/ customizar via slot `#toggle` do Navbar/Sidebar. Estende Button. Default `color=neutral variant=ghost`. Props: `side` (`'left'` default | `'right'`), + Button.

## DashboardSidebarCollapse (`UDashboardSidebarCollapse`)
Botão que colapsa/expande a sidebar no desktop (requer `collapsible` na sidebar). Estende Button. Default `color=neutral variant=ghost`. Props: `side`, + Button. Colocar no `#header` da Sidebar ou `#leading` do Navbar.

## DashboardResizeHandle (`UDashboardResizeHandle`)
Handle de resize usado por Sidebar/Panel. Exibido automaticamente com `resizable` — usar só p/ customizar via slot `#resize-handle` (recebe `{ onMouseDown, onTouchStart, onDoubleClick }`).
```vue
<template #resize-handle="{ onMouseDown, onTouchStart, onDoubleClick }">
  <UDashboardResizeHandle class="after:absolute after:inset-y-0 after:right-0 after:w-px hover:after:bg-(--ui-border-accented)"
    @mousedown="onMouseDown" @touchstart="onTouchStart" @dblclick="onDoubleClick" />
</template>
```

## Referência

- [DashboardGroup](https://ui.nuxt.com/docs/components/dashboard-group)
- [DashboardSidebar](https://ui.nuxt.com/docs/components/dashboard-sidebar)
- [DashboardPanel](https://ui.nuxt.com/docs/components/dashboard-panel)
- [DashboardNavbar](https://ui.nuxt.com/docs/components/dashboard-navbar)
- [DashboardToolbar](https://ui.nuxt.com/docs/components/dashboard-toolbar)
- [DashboardSearch](https://ui.nuxt.com/docs/components/dashboard-search)
- [DashboardSearchButton](https://ui.nuxt.com/docs/components/dashboard-search-button)
- [DashboardSidebarCollapse](https://ui.nuxt.com/docs/components/dashboard-sidebar-collapse)
- [DashboardSidebarToggle](https://ui.nuxt.com/docs/components/dashboard-sidebar-toggle)
- [DashboardResizeHandle](https://ui.nuxt.com/docs/components/dashboard-resize-handle)
- [Todos os componentes](https://ui.nuxt.com/docs/components)
