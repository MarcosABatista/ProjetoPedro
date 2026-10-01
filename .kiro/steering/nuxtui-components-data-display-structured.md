---
inclusion: fileMatch
fileMatchPattern: ["app/**/*.vue", "app/components/**/*.vue", "app/pages/**/*.vue", "app/layouts/**/*.vue"]
name: Nuxt UI Data Display — Table e Timeline
description: Use ao construir Table (tabelas de dados com TanStack) ou Timeline (sequência de eventos) no Nuxt UI v4 — colunas, ordenação, seleção, células custom e linha do tempo.
---
# Nuxt UI — Data Display (Table, Timeline)

## Table — `UTable`
Tabela de dados sobre TanStack Table. `A responsive table element to display data in rows and columns.`
```vue
<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
type Person = { id: number, name: string, position: string }
const data = ref<Person[]>([{ id: 1, name: 'Ana', position: 'Dev' }])
const columns: TableColumn<Person>[] = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'name', header: 'Nome' },
  { id: 'action' }
]
</script>
<template>
  <UTable :data="data" :columns="columns" class="flex-1">
    <template #name-cell="{ row }">
      <div class="flex items-center gap-3">
        <UAvatar :src="`...${row.original.id}`" size="lg" />
        <p class="font-medium">{{ row.original.name }}</p>
      </div>
    </template>
    <template #action-cell="{ row }">
      <UDropdownMenu :items="actions(row.original)">
        <UButton icon="i-lucide-ellipsis-vertical" color="neutral" variant="ghost" />
      </UDropdownMenu>
    </template>
  </UTable>
</template>
```
Props: `data` (T[]), `columns` (`TableColumn<T>[]` = TanStack ColumnDef: `accessorKey`, `id`, `header`, `cell`, `meta`...), `caption`, `meta` (acessível via `table.options.meta`), `empty` (texto vazio), `sticky` (bool | `'header'` | `'footer'`), `loading` + `loadingColor` + `loadingAnimation` (`carousel` | ...), `virtualize` (bool | opções TanStack Virtual — sem row pinning), `ui`.
State v-models (habilitam features TanStack): `v-model:column-visibility`, `v-model:column-pinning`, `v-model:column-sizing`, `v-model:row-selection`, `v-model:row-pinning`, `v-model:sorting`, `v-model:column-filters`, `v-model:global-filter`, `v-model:expanded`, `v-model:grouping`, `v-model:pagination`. Passe também props booleanas TanStack (`enable-row-selection`, `sorting-options`, etc.).
Slots dinâmicos: `#{column}-header` (`{ column }`), `#{column}-cell` (`{ row, cell, getValue }`), `#expanded` (`{ row }`), `#empty`, `#loading`, `#caption`, `#body-top`, `#body-bottom`, `#footer`. Expose (template ref): `tableApi` (instância TanStack — `tableApi.getRowModel()`, sorting/selection APIs, etc.).
Sort no header: renderizar `UButton` no `#{col}-header` chamando `column.toggleSorting()`. Ordenação/seleção/paginação/agrupamento seguem a API do TanStack Table.

## Timeline — `UTimeline`
Sequência de eventos com data/título/ícone. `A component that displays a sequence of events with dates, titles, icons or avatars.`
```vue
<script setup lang="ts">
import type { TimelineItem } from '@nuxt/ui'
const items = ref<TimelineItem[]>([
  { date: 'Mar 15', title: 'Kickoff', description: '...', icon: 'i-lucide-rocket', value: 'kickoff' },
  { date: 'Mar 22', title: 'Design', description: '...', icon: 'i-lucide-palette', value: 'design' }
])
const active = ref('kickoff')
</script>
<template>
  <UTimeline v-model="active" :items="items" :default-value="1" class="w-96" @select="(_e, item) => active = item.value" />
</template>
```
Item: `date`, `title`, `description`, `icon`, `avatar`, `value`, `slot`, `class`, `ui`.
Props: `items`, `color` (cor dos itens ativos/completos), `size` (3xs–3xl), `orientation` (`vertical` default | `horizontal`), `reverse`, `valueKey` (`value`), `defaultValue`, `modelValue`. `v-model` = item ativo (marca itens anteriores como `completed`; default = índice). Estado: `data-[state=completed]`/`data-[state=active]`.
Slots: `indicator`, `wrapper`, `date` (`{ item }`), `title` (`{ item }`), `description`, `#{slot}-indicator/-date/-title/-description`. Emits: `select` (`(event, item)` — torna itens clicáveis), `update:modelValue`.
Layout alternado: prop `ui` com `even:flex-row-reverse`. Datas relativas: `useTimeAgo` do @vueuse/core no slot `#date`.

## a11y
Table: renderiza `<table>` semântica (thead/tbody/tfoot), `caption` para descrição. Timeline: use `select` com cuidado — itens clicáveis devem ter foco/teclado; indicadores com ícone/avatar mantêm contraste.

## Referência

- [Table](https://ui.nuxt.com/docs/components/table)
- [Timeline](https://ui.nuxt.com/docs/components/timeline)
- [Todos os componentes](https://ui.nuxt.com/docs/components)
