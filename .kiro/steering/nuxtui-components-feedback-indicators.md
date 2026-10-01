---
inclusion: fileMatch
fileMatchPattern: ["app/**/*.vue", "app/components/**/*.vue", "app/pages/**/*.vue", "app/layouts/**/*.vue"]
name: Nuxt UI Feedback — Progress, Skeleton, Badge, Chip, Kbd
description: Use ao exibir indicadores no Nuxt UI v4 — Progress/ProgressGroup (barras), Skeleton (placeholder de loading), Badge (rótulo), Chip (marcador) e Kbd (tecla).
---
# Nuxt UI — Feedback/Indicators (Progress, ProgressGroup, Skeleton, Badge, Chip, Kbd)

## Progress — `UProgress`
Barra de progressão. `An indicator showing the progress of a task.`
```vue
<script setup lang="ts">
const value = ref(50)
</script>
<template>
  <UProgress v-model="value" :max="100" status />
  <UProgress indeterminate />   <!-- sem v-model = indeterminado -->
</template>
```
Props: `modelValue` (número; ausente/`null` = indeterminado), `max` (número ou array de labels de steps), `status` (mostra valor atual), `inverted`, `size` (2xs–2xl), `color` (theme ou CSS color), `orientation` (`horizontal` default | `vertical`), `animation`, `as`, `ui`. Slots: `status`, `step-{n}`. `v-model` controla o progresso.

## ProgressGroup — `UProgressGroup`
Barra única dividida em segmentos que somam um total. `A progress bar split into multiple segments that add up to a total.`
```vue
<script setup lang="ts">
import type { ProgressGroupItem } from '@nuxt/ui'
const items = ref<ProgressGroupItem[]>([
  { label: 'Sistema', value: 24, color: 'neutral', icon: 'i-lucide-cog' },
  { label: 'Apps', value: 8, color: 'error', icon: 'i-lucide-app-window' },
  { label: 'Docs', value: 12, color: 'warning', icon: 'i-lucide-file' }
])
</script>
<template><UProgressGroup :items="items" :max="100" /></template>
```
Item: `label`, `value`, `color`, `icon`. Props: `items`, `max`, `size`, `ui`. Segmentos proporcionais ao `value` sobre o `max`.

## Skeleton — `USkeleton`
Placeholder de carregamento. `A placeholder to show while content is loading.`
```vue
<template>
  <div class="flex items-center gap-4">
    <USkeleton class="size-12 rounded-full" />
    <div class="grid gap-2">
      <USkeleton class="h-4 w-[250px]" />
      <USkeleton class="h-4 w-[200px]" />
    </div>
  </div>
</template>
```
Props: `as`, `ui`. Slot: `default`. Estilizar via `class` (dimensões, formato). Base: `animate-pulse rounded-md bg-elevated`.

## Badge — `UBadge`
Rótulo curto. `A short text to represent a status or a category.`
```vue
<template>
  <UBadge color="success" variant="subtle" size="md" icon="i-lucide-check">Ativo</UBadge>
  <UBadge label="6k" color="neutral" variant="outline" :avatar="{ src: '...' }" />
</template>
```
Props: `label` (string | number — ou usar slot default), `color` (`primary` default), `variant` (`solid` default | `outline` | `soft` | `subtle`), `size` (xs–xl), `square` (padding igual em todos os lados), `icon` (via `leading`/`trailing`), `avatar` (à esquerda), `as` (`span`), `ui`. Slots: `leading`, `default`/`label`, `trailing`.

## Chip — `UChip`
Marcador sobreposto a um elemento (notificação/status). `An indicator of a numeric value or a state.`
```vue
<template>
  <UChip :text="5" color="error" size="md" position="top-right">
    <UButton icon="i-lucide-bell" color="neutral" variant="ghost" />
  </UChip>
  <UChip color="success" inset show>
    <UAvatar src="..." />
  </UChip>
</template>
```
Props: `text` (string | number — conteúdo), `color` (`primary` default), `size` (3xs–3xl), `position` (`top-right` default | `bottom-right` | `top-left` | `bottom-left`), `inset` (manter dentro de elementos arredondados), `standalone` (renderiza relativo ao pai), `show` (controla visibilidade), `as`, `ui`. Slots: `default` (elemento base), `content`.

## Kbd — `UKbd`
Tecla do teclado. `A kbd element to display a keyboard key.`
```vue
<template>
  <UKbd value="meta" />   <!-- ⌘ no macOS, Ctrl em outros -->
  <UKbd size="md" variant="solid">K</UKbd>
</template>
```
Props: `value` (tecla — aceita especiais como `meta`, `shift`, `alt`; ou usar slot default), `color` (`neutral` default), `variant` (`outline` default | `soft` | `subtle` | `solid`), `size` (sm | md | lg), `as` (`kbd`), `ui`. Slot: `default`.

## a11y
Progress baseado em Reka UI (role `progressbar`, `aria-valuenow`). Kbd renderiza `<kbd>` semântico e normaliza teclas por plataforma. Chip/Badge são decorativos — garantir que a informação também esteja disponível textualmente quando crítica.

## Referência

- [Progress](https://ui.nuxt.com/docs/components/progress)
- [Skeleton](https://ui.nuxt.com/docs/components/skeleton)
- [Badge](https://ui.nuxt.com/docs/components/badge)
- [Chip](https://ui.nuxt.com/docs/components/chip)
- [Kbd](https://ui.nuxt.com/docs/components/kbd)
- [Todos os componentes](https://ui.nuxt.com/docs/components)
