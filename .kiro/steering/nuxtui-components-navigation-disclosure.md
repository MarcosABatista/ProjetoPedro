---
inclusion: fileMatch
fileMatchPattern: ["app/**/*.vue", "app/components/**/*.vue", "app/pages/**/*.vue", "app/layouts/**/*.vue"]
name: Nuxt UI Navigation — Accordion, Collapsible, Stepper, Tree
description: Use ao construir Accordion, Collapsible, Stepper ou Tree no Nuxt UI v4 — painéis colapsáveis, conteúdo expansível, progresso multi-etapa e árvores hierárquicas.
---
# Nuxt UI — Disclosure & Steps (Accordion, Collapsible, Stepper, Tree)

## Collapsible — `UCollapsible`
Elemento colapsável simples. `A collapsible element to toggle visibility of its content.`
```vue
<script setup lang="ts">
const open = ref(false)
</script>
<template>
  <UCollapsible v-model:open="open" class="flex flex-col gap-2 w-48">
    <UButton label="Abrir" trailing-icon="i-lucide-chevron-down" block
      :ui="{ trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform' }" />
    <template #content><Placeholder class="h-48" /></template>
  </UCollapsible>
</template>
```
Props: `open`/`defaultOpen`, `disabled`, `unmountOnHide` (true), `as`, `ui`. Slots: `default` (trigger), `content`. Emits: `update:open`.

## Accordion — `UAccordion`
Conjunto empilhado de painéis colapsáveis. `A stacked set of collapsible panels.`
```vue
<script setup lang="ts">
import type { AccordionItem } from '@nuxt/ui'
const items = ref<AccordionItem[]>([
  { label: 'Icons', icon: 'i-lucide-smile', content: 'Texto...' },
  { label: 'Colors', icon: 'i-lucide-swatch-book', content: '...', disabled: true }
])
</script>
<template><UAccordion :items="items" /></template>
```
Item: `label`, `icon`, `trailingIcon`, `content`, `value`, `disabled`, `slot`, `class`, `ui`.
Props: `items`, `type` (`single` default | `multiple`), `collapsible` (true — só em single, permite fechar o ativo), `trailingIcon` (`i-lucide-chevron-down`), `disabled`, `unmountOnHide` (true), `valueKey` (`value`), `labelKey` (`label`). `v-model` = value ativo (default = índice como string; em `multiple` passar array). Slots: `default`, `leading`, `trailing`, `content` (`{ item }` — do zero), `body` (`{ item }` — com estilos), `#{slot}`, `#{slot}-body`. Emits: `update:modelValue`.
Drag&drop: `useSortable` (@vueuse/integrations) + `shallowRef` nos items. Markdown: `<MDC :value="item.content" unwrap="p" />` no `#body`.

## Stepper — `UStepper`
Etapas de um processo multi-step. `A set of steps that are used to indicate progress through a multi-step process.`
```vue
<script setup lang="ts">
import type { StepperItem } from '@nuxt/ui'
const items = ref<StepperItem[]>([
  { title: 'Endereço', description: '...', icon: 'i-lucide-house' },
  { title: 'Envio', description: '...', icon: 'i-lucide-truck' },
  { title: 'Checkout', description: '...' }
])
const stepper = useTemplateRef('stepper')
</script>
<template>
  <UStepper ref="stepper" :items="items" class="w-full">
    <template #content="{ item }"><Placeholder>{{ item.title }}</Placeholder></template>
  </UStepper>
  <UButton :disabled="!stepper?.hasPrev" @click="stepper?.prev()">Prev</UButton>
  <UButton :disabled="!stepper?.hasNext" @click="stepper?.next()">Next</UButton>
</template>
```
Item: `title`, `description`, `content`, `icon`, `value`, `disabled`, `slot`, `class`, `ui`.
Props: `items`, `color`, `size` (xs–xl), `orientation` (`horizontal` default | `vertical`), `linear` (true — etapas em ordem), `disabled` (força navegação por controles), `valueKey`, `defaultValue`. `v-model` = value/índice ativo. Slots: `indicator`, `wrapper`, `title`, `description`, `content` (`{ item }`), `#{slot}`. Emits: `next`, `prev`, `update:modelValue`. Expose (template ref): `next()`, `prev()`, `hasNext`, `hasPrev`.

## Tree — `UTree`
Visualização em árvore de dados hierárquicos. `A tree view component to display and interact with hierarchical data structures.`
```vue
<script setup lang="ts">
import type { TreeItem } from '@nuxt/ui'
const items = ref<TreeItem[]>([
  { label: 'app/', defaultExpanded: true, children: [
    { label: 'useAuth.ts', icon: 'i-vscode-icons-file-type-typescript' }
  ] },
  { label: 'app.vue', icon: 'i-vscode-icons-file-type-vue' }
])
</script>
<template><UTree :items="items" /></template>
```
Item: `icon`, `label`, `trailingIcon`, `defaultExpanded`, `disabled`, `slot`, `children`, `onToggle`, `onSelect`, `class`, `ui`. Cada item precisa de identificador único — usa `label` por padrão; prefira `get-key` (`:get-key="i => i.id"`) ou `labelKey`.
Props: `items`, `color`, `size`, `multiple`, `nested` (4.1+, true — false achata p/ drag&drop/virtualização), `virtualize` (4.1+, bool | `{ estimateSize, overscan }` — achata), `getKey`, `labelKey`, `trailingIcon` (`i-lucide-chevron-down`), `expandedIcon`/`collapsedIcon` (`folder-open`/`folder`), `disabled`, `propagateSelect` (pai seleciona descendentes, requer `multiple`), `bubbleSelect` (filhos atualizam pai), `selectionBehavior`. `v-model` = selecionados; `v-model:expanded` = ids expandidos. Slots: `item-wrapper`, `item`, `item-leading` (`{ selected, indeterminate, handleSelect }` p/ checkbox), `item-label`, `item-trailing`, `#{slot}*`. Emits: `update:modelValue`, `update:expanded`. Prevenir seleção/expansão: `item.onSelect`/`onToggle` ou eventos `@select`/`@toggle` com `e.preventDefault()`.

## a11y
Baseados em Reka UI (Accordion/Collapsible/Stepper/Tree): estado `data-[state=open]`, navegação por teclado (setas na árvore/stepper), foco e ARIA gerenciados. Checkbox em Tree via `#item-leading` com estado `indeterminate`.

## Referência

- [Accordion](https://ui.nuxt.com/docs/components/accordion)
- [Collapsible](https://ui.nuxt.com/docs/components/collapsible)
- [Stepper](https://ui.nuxt.com/docs/components/stepper)
- [Tree](https://ui.nuxt.com/docs/components/tree)
- [Todos os componentes](https://ui.nuxt.com/docs/components)
