---
inclusion: fileMatch
fileMatchPattern: ["app/**/*.vue", "app/components/**/*.vue", "app/pages/**/*.vue", "app/layouts/**/*.vue"]
name: Nuxt UI Elements — Card, Separator, Empty
description: Use ao construir Card (contêiner com header/body/footer), Separator (divisor) ou Empty (estado vazio) no Nuxt UI v4.
---
# Nuxt UI — Elements (Card, Separator, Empty)

## Card — `UCard`
Contêiner com cabeçalho, corpo e rodapé. `A card to display content in a box.`
```vue
<template>
  <UCard title="Título" description="Subtítulo opcional" variant="subtle" class="w-full">
    <Placeholder class="h-32" />   <!-- default = body -->
    <template #header><Placeholder class="h-8" /></template>
    <template #footer><Placeholder class="h-8" /></template>
  </UCard>
</template>
```
Props: `title` (4.7+), `description` (4.7+), `variant` (`outline` default | `solid` | `soft` | `subtle`), `as`, `ui`. Slots: `header`, `title`, `description`, `default` (body), `footer`. Sem `#header`/`#footer` o card mostra só o body.

## Separator — `USeparator`
Divisor horizontal/vertical, opcionalmente com rótulo. `A separator to divide content.`
```vue
<template>
  <USeparator />
  <USeparator label="OU" />
  <USeparator icon="i-lucide-star" color="primary" type="dashed" />
  <USeparator orientation="vertical" class="h-6" />
</template>
```
Props: `label` (texto no meio), `icon`, `avatar`, `color` (`neutral` default), `size` (`xs` default – xl — espessura), `type` (`solid` default | `dashed` | `dotted`), `orientation` (`horizontal` default | `vertical`), `as`, `ui`. Slot: `default` (conteúdo central, substitui label/icon/avatar). Vertical requer altura definida.

## Empty — `UEmpty`
Estado vazio com ícone, título, descrição e ações. `A placeholder for empty states.`
```vue
<template>
  <UEmpty
    icon="i-lucide-inbox"
    title="Nada por aqui"
    description="Nenhum item encontrado."
    variant="outline"
    :actions="[{ label: 'Criar', icon: 'i-lucide-plus', color: 'primary' }]"
  />
</template>
```
Props: `icon` (acima do título), `avatar`, `title`, `description`, `actions` (ButtonProps[] no corpo), `loading` + `loadingIcon`, `variant` (`outline` default | `solid` | `soft` | `subtle` | `naked`), `as`, `ui`. Slots: `leading`, `title`, `description`, `actions`, `default`, `footer`. Útil para listas/buscas sem resultados.

## a11y
Card renderiza contêiner semântico com header/body/footer. Separator usa role `separator` (Reka UI) com orientação correta. Empty: título/descrição comunicam o estado; ações são `UButton` acessíveis.

## Referência

- [Card](https://ui.nuxt.com/docs/components/card)
- [Separator](https://ui.nuxt.com/docs/components/separator)
- [Empty](https://ui.nuxt.com/docs/components/empty)
- [Todos os componentes](https://ui.nuxt.com/docs/components)
