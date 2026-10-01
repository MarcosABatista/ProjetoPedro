---
inclusion: fileMatch
fileMatchPattern: ["app/**/*.vue", "app/components/**/*.vue", "app/pages/**/*.vue", "app/layouts/**/*.vue"]
name: Nuxt UI Overlays — Popover, Menus e Command Palette
description: Use ao construir Popover, Tooltip, ContextMenu, DropdownMenu ou CommandPalette no Nuxt UI v4 — flutuantes ancorados a um trigger, menus de ações e busca fuzzy.
---
# Nuxt UI — Overlays (Popover, Tooltip, ContextMenu, DropdownMenu, CommandPalette)

## Popover — `UPopover`
Diálogo não-modal flutuante ao redor do trigger. `A non-modal dialog that floats around a trigger element.`
```vue
<template>
  <UPopover mode="click" :content="{ side: 'bottom', align: 'center', sideOffset: 8 }">
    <UButton label="Abrir" color="neutral" variant="subtle" />
    <template #content><Placeholder class="size-48 m-4" /></template>
  </UPopover>
</template>
```
Props: `mode` (`click` default | `hover` — usa HoverCard), `enableTouch` (toque no hover mode), `openDelay`/`closeDelay` (hover), `content` (align/side/sideOffset), `arrow` (bool | props), `modal` (false), `dismissible` (true), `reference` (elemento/virtual p/ ancorar — ex.: seguir cursor), `portal`, `open`/`defaultOpen`.
Slots: `default`, `content` (recebe `{ close }` só em mode `click`), `anchor` (ancora custom, só mode `click`). Emits: `update:open`, `close:prevent`.

## Tooltip — `UTooltip`
Popup ao passar o mouse. `A popup that reveals information when hovering over an element.`
Requer `<UApp>` (provê `TooltipProvider`).
```vue
<template>
  <UTooltip text="Abrir no GitHub" :kbds="['meta', 'G']" :delay-duration="0" arrow>
    <UButton label="Abrir" color="neutral" variant="subtle" />
  </UTooltip>
</template>
```
Props: `text`, `kbds` (string[] | KbdProps[]), `delayDuration` (700), `content` (side/align/sideOffset), `arrow`, `disabled`, `reference` (seguir cursor), `open`/`defaultOpen`, `disableHoverableContent`, `disableClosingTrigger`, `ignoreNonKeyboardFocus`. Slots: `default`, `content`. Emits: `update:open`. Configurável global via `App` prop `tooltip`.

## ContextMenu — `UContextMenu`
Menu no clique-direito. `A menu to display actions when right-clicking on an element.`
```vue
<script setup lang="ts">
import type { ContextMenuItem } from '@nuxt/ui'
const items = ref<ContextMenuItem[][]>([
  [{ label: 'Editar', icon: 'i-lucide-pencil' }],
  [{ label: 'Excluir', color: 'error', icon: 'i-lucide-trash' }]
])
</script>
<template>
  <UContextMenu :items="items" :ui="{ content: 'w-48' }">
    <div class="...">Clique direito aqui</div>
  </UContextMenu>
</template>
```
Props: `items` (T[] ou T[][] p/ grupos separados), `size` (xs–xl), `modal` (true), `disabled`, `checkedIcon`, `loadingIcon`, `externalIcon`, `labelKey` (`label`), `content`, `portal`, `pressOpenDelay` (700, touch). Emits: `update:open`.

## DropdownMenu — `UDropdownMenu`
Menu no clique num elemento. `A menu to display actions when clicking on an element.`
```vue
<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
const items = ref<DropdownMenuItem[][]>([
  [{ label: 'Perfil', icon: 'i-lucide-user' }, { label: 'Config', icon: 'i-lucide-cog', kbds: [','] }],
  [{ label: 'Sair', icon: 'i-lucide-log-out', color: 'error', kbds: ['shift','meta','q'] }]
])
</script>
<template>
  <UDropdownMenu :items="items" :content="{ align: 'start' }" :ui="{ content: 'w-48' }">
    <UButton icon="i-lucide-menu" color="neutral" variant="outline" />
  </UDropdownMenu>
</template>
```
Props: como ContextMenu + `arrow`, `filter` (4.6+, bool | InputProps), `filterFields` (default `[labelKey]`), `ignoreFilter` (busca custom), `searchTerm`, `open`/`defaultOpen`. `size` NÃO é propagado ao Button (setar manualmente). Emits: `update:open`, `update:searchTerm`.

### Item de menu (Context/Dropdown) — propriedades
`label`, `icon`, `avatar`, `kbds`, `type` (`link` | `label` | `separator` | `checkbox`), `color`, `checked` + `onUpdateChecked`, `disabled`, `slot` (custom), `onSelect(e)`, `children` (submenu — array ou array de arrays), `class`, `ui`. Aceita props do `ULink` (`to`, `target`...).
Checkbox: use `computed` p/ reatividade do `checked`. Cores destacam item (ex.: `color: 'error'`).
Slots por item: `#item`, `#item-leading`, `#item-label`, `#item-trailing` (todos) e `#{slot}`, `#{slot}-leading/-label/-trailing` (específico). Switch em item: `slot` + `#{slot}-trailing` com `<USwitch>`.
Atalhos: `defineShortcuts(extractShortcuts(items))` extrai `kbds` recursivamente.

## CommandPalette — `UCommandPalette`
Busca full-text (Fuse.js). `A command palette with full-text search powered by Fuse.js for efficient fuzzy matching.`
```vue
<script setup lang="ts">
import type { CommandPaletteGroup } from '@nuxt/ui'
const value = ref({})
const groups = ref<CommandPaletteGroup[]>([
  { id: 'users', label: 'Users', items: [
    { label: 'Benjamin', suffix: 'benjamincanac', avatar: { src: '...', loading: 'lazy' } }
  ] }
])
</script>
<template>
  <UCommandPalette v-model="value" :groups="groups" class="flex-1 h-80" />
</template>
```
Group: `id` (obrigatório — sem id o grupo é ignorado), `label`, `slot`, `items`, `ignoreFilter`, `postFilter(term, items)`, `highlightedIcon`.
Item: `prefix`, `label`, `suffix`, `icon`, `avatar`, `chip`, `kbds`, `active`, `loading`, `disabled`, `slot`, `children` (submenu — reseta busca, mostra botão back), `onSelect(e)`, + props de `ULink`.
Props: `multiple` (v-model deve ser array), `placeholder`, `size` (4.4+), `icon` (`i-lucide-search`), `selectedIcon`, `trailingIcon`, `loading`/`loadingIcon`, `close` (bool | ButtonProps), `back` (true), `input` (bool | InputProps), `fuse` (opções useFuse: `fuseOptions.keys` default `['label','description','suffix']`, `resultLimit` 12), `virtualize` (4.1+, achata grupos), `valueKey`, `by`, `preserveGroupOrder`, `searchDelay`, `autofocus` (true).
`v-model:search-term` controla o termo. Emits: `update:modelValue`, `update:searchTerm`, `update:open`, `highlight`. Slots: `empty`, `footer`, `back`, `close`, `item*`, `group-label`. Usável dentro de Modal/Drawer/Popover via `#content`.

## a11y
Todos baseados em Reka UI (Popover/HoverCard/Tooltip/ContextMenu/DropdownMenu/Listbox): navegação por teclado, roles ARIA e foco gerenciados. `modal: true` isola conteúdo externo de leitores de tela.

## Referência

- [Popover](https://ui.nuxt.com/docs/components/popover)
- [Tooltip](https://ui.nuxt.com/docs/components/tooltip)
- [ContextMenu](https://ui.nuxt.com/docs/components/context-menu)
- [DropdownMenu](https://ui.nuxt.com/docs/components/dropdown-menu)
- [CommandPalette](https://ui.nuxt.com/docs/components/command-palette)
- [Todos os componentes](https://ui.nuxt.com/docs/components)
