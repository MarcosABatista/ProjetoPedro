---
inclusion: fileMatch
fileMatchPattern: ["app/**/*.vue", "app/components/**/*.vue", "app/pages/**/*.vue", "app/layouts/**/*.vue"]
name: NuxtUI Selection Menus
description: Use ao escolher itens de uma lista no Nuxt UI v4 — Select, SelectMenu (buscável), InputMenu (autocomplete/combobox) e Listbox (lista sempre visível).
---
# Nuxt UI — Select, SelectMenu, InputMenu, Listbox

Escolha de itens a partir de `items`. Props visuais comuns: `color`, `variant`, `size`, `icon`, `avatar`, `loading`, `disabled`, `trailing-icon` (default `i-lucide-chevron-down`), `selected-icon` (default `i-lucide-check`). `multiple` habilita seleção múltipla. `name`/`required` p/ Form.

**Formato de `items`**: array de strings/números/booleans, OU array de objetos (`label`, `value`, `icon`, `avatar`, `chip`, `description`, `disabled`, `type: 'label'|'separator'|'item'`), OU array de arrays (grupos separados). Keys customizáveis: `label-key` (default `label`), `value-key`, `description-key`.

Slots comuns (Select/SelectMenu/InputMenu/Listbox): `leading`, `item`, `item-leading`, `item-label`, `item-description`, `item-trailing`, `empty`.

## Select (`USelect`)
Nativo-like, sem busca. Renderiza `<button>`. Com objetos, `v-model` liga ao `value-key` (default `value`) — **não** ao objeto inteiro.

```vue
<script setup>
const items = ref(['Backlog','Todo','In Progress','Done'])
const value = ref('Backlog')
</script>
<template><USelect v-model="value" :items="items" class="w-48" /></template>
```
Props: `content` (align/side/sideOffset; só quando `content.position='popper'`, default), `content.position` (`popper`|`item-aligned`, 4.7+), `arrow`, `open`/`v-model:open`, `default-open`. Emits: `update:modelValue`, `update:open`, `change`, `blur`, `focus`. Expose: `triggerRef`, `viewportRef`.
- Grupos: array de objetos com `{type:'label'}` e `{type:'separator'}` intercalados.
- Ícone/avatar do selecionado: computar de `value` ou usar slot `#leading`.

## SelectMenu (`USelectMenu`)
Select + busca dentro do menu (Reka Combobox). Prefira sobre Select quando precisa filtrar/multiple. **Com objetos, `v-model` recebe o objeto inteiro** (a menos que use `value-key`).

```vue
<template>
  <USelectMenu v-model="value" :items="items" class="w-48" />
</template>
```
Props extras: `search-input` (bool | InputProps; `false` esconde; `{autofocus:false}` evita teclado virtual em touch), `create-item` (`true`|`'always'` p/ criar valores novos → escute `@create`), `filter-fields` (default `[labelKey]`), `ignore-filter` (busca própria via API), `virtualize` (bool | `{estimateSize,overscan}`, 4.1+), `clear` (4.4+), `by` (compara objetos por campo), `v-model:search-term`, `arrow`, `content`. Emits inclui `create`, `clear`, `update:searchTerm`, `update:open`. Expose: `triggerRef`, `viewportRef`.
- Fetch on-open: `useLazyFetch(..., { immediate:false })` + `@update:open="onOpen"`.
- Infinite scroll: `useInfiniteScroll(() => ref.value?.viewportRef, ...)`.
- Virtualize achata grupos numa lista única (limitação Reka).

## InputMenu (`UInputMenu`)
Como SelectMenu mas a busca é o próprio input (autocomplete). Renderiza `<input>`. `multiple` mostra tags. Mesmas props de items/filtro/fetch/virtualize/clear.

```vue
<template>
  <UInputMenu v-model="value" :items="items" placeholder="Select status" />
</template>
```
Prop chave `mode` (4.8+): `combobox` (default, seleciona item) ou `autocomplete` (texto livre — `modelValue` vira `string`; `multiple`/`by`/reset* não se aplicam; use `:content="{hideWhenEmpty:true}"`). `open-on-focus`/`open-on-click`, `delete-icon` (tags). Emits inclui `create`, `remove-tag`, `update:searchTerm`. Expose: `inputRef`, `viewportRef`.
- Rotating chevron: `:ui="{ trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform' }"`.

## Listbox (`UListbox`)
Lista sempre visível (sem trigger/popover) com busca opcional, virtualização e itens ricos. Ideal p/ painel de seleção embutido, transfer list. Items são objetos (`label`, `value`, `icon`, `avatar`, `chip`, `description`). `multiple` → `v-model` array.

```vue
<script setup>
import type { ListboxItem } from '@nuxt/ui'
const items = ref<ListboxItem[]>([{ label:'France', value:'FR', icon:'i-lucide-map-pin' }])
const value = ref()
</script>
<template><UListbox v-model="value" :items="items" filter /></template>
```
Props: `filter` (bool | InputProps — mostra input de busca), `filter-fields`, `ignore-filter`, `virtualize`, `orientation` (vertical|horizontal), `selection-behavior` (`toggle` default | `replace`), `highlight-on-hover` (default true), `v-model:search-term`, `loading`, `color`, `size`. Emits: `update:modelValue`, `update:searchTerm`, `highlight`, `change`. Slots: `loading`, `empty`, `item*`.

## Gotchas comuns
- Select vs SelectMenu com objetos: Select liga ao `value-key`; SelectMenu liga ao objeto inteiro (use `value-key` p/ ligar só um campo, `by` p/ comparar).
- `multiple`: sempre passe array ao `v-model`/`default-value`.
- Labels de grupo: use array de arrays p/ que a label seja filtrada junto do grupo na busca.
- Validação em Form: valores de objeto exigem `.refine()` no schema (ver Form).

## Referência

- [Select](https://ui.nuxt.com/docs/components/select)
- [SelectMenu](https://ui.nuxt.com/docs/components/select-menu)
- [InputMenu](https://ui.nuxt.com/docs/components/input-menu)
- [Listbox](https://ui.nuxt.com/docs/components/listbox)
- [Todos os componentes](https://ui.nuxt.com/docs/components)
