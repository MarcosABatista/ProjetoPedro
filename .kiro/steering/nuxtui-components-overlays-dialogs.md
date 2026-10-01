---
inclusion: fileMatch
fileMatchPattern: ["app/**/*.vue", "app/components/**/*.vue", "app/pages/**/*.vue", "app/layouts/**/*.vue"]
name: Nuxt UI Overlays — Dialogs
description: Use ao construir Modal, Slideover ou Drawer no Nuxt UI v4 — janelas de diálogo, painéis deslizantes, gavetas, controle de estado open e uso programático via useOverlay.
---
# Nuxt UI — Overlays (Modal, Slideover, Drawer)

Três overlays com API quase idêntica (herdam do Dialog/Reka UI). Padrão: trigger no slot default + conteúdo em `#content` OU `#header`/`#body`/`#footer`.

Requisito: envolver o app com `<UApp>` (provê `OverlayProvider`) para uso programático.

## Modal — `UModal`
Diálogo centralizado. `A dialog window that can be used to display a message or request user input.`

```vue
<template>
  <UModal title="Título" description="Descrição opcional">
    <UButton label="Abrir" color="neutral" variant="subtle" />
    <template #body><Placeholder class="h-48" /></template>
    <template #footer="{ close }">
      <UButton label="Cancelar" color="neutral" variant="outline" @click="close" />
      <UButton label="Salvar" />
    </template>
  </UModal>
</template>
```

Props chave: `title`, `description`, `close` (boolean | ButtonProps, `false` esconde), `closeIcon` (`i-lucide-x`), `overlay` (true), `transition` (true), `fullscreen` (false), `scrollable` (4.2+), `dismissible` (true — fechar ao clicar fora/esc), `modal` (true — bloqueia interação externa; `false` desabilita overlay), `portal` (true), `unmountOnHide` (4.10+, true), `open`/`defaultOpen`, `ui`.
Slots: `default`, `content`, `header`, `title`, `description`, `actions`, `close`, `body`, `footer`.
Emits: `update:open`, `close:prevent` (disparado quando `dismissible: false` e tenta fechar), `enter`/`leave`/`after:enter`/`after:leave`.

## Slideover — `USlideover`
Diálogo que desliza de uma borda. `A dialog that slides in from any side of the screen.`

```vue
<template>
  <USlideover side="right" title="Perfil">
    <UButton label="Abrir" color="neutral" variant="subtle" />
    <template #body><Placeholder class="h-full" /></template>
    <template #footer="{ close }">
      <UButton label="Fechar" variant="outline" @click="close" />
    </template>
  </USlideover>
</template>
```

Props extras/diferentes do Modal: `side` (`right` default | `left` | `top` | `bottom`), `inset` (4.3+, afasta das bordas). Demais props/slots/emits idênticos ao Modal (`close` default true).

## Drawer — `UDrawer`
Gaveta com handle arrastável (Vaul). `A drawer that smoothly slides in and out of the screen.`

```vue
<template>
  <UDrawer direction="bottom" title="Config">
    <UButton label="Abrir" trailing-icon="i-lucide-chevron-up" />
    <template #body><Placeholder class="h-48" /></template>
  </UDrawer>
</template>
```

Props chave: `direction` (`bottom` default | `top` | `left` | `right`), `inset`, `handle` (true), `handleOnly`, `overlay` (true), `modal` (true), `dismissible` (true), `nested` (para gavetas aninhadas), `close` (4.10+, default false), `closeIcon` (4.10+), `shouldScaleBackground` + `setBackgroundColorOnScale`, `snapPoints`, `activeSnapPoint`, `closeThreshold`, `open`/`defaultOpen`.
Slots iguais aos demais. Emits: `update:open`, `close`, `close:prevent`, `drag`, `release`, `update:activeSnapPoint`, `animationEnd`.
Nota `shouldScaleBackground`: adicionar `data-vaul-drawer-wrapper` num elemento pai (via `app.rootAttrs` no `nuxt.config.ts`).

## Controlar estado aberto (todos)
```vue
<script setup lang="ts">
const open = ref(false)
defineShortcuts({ o: () => open.value = !open.value })
</script>
<template>
  <UModal v-model:open="open"> ... </UModal>
</template>
```
`v-model:open` ou `default-open`. Permite mover/remover o trigger.

## Uso programático — `useOverlay` (Modal/Slideover)
Componente filho emite `close` para resolver o `result`:
```vue
<!-- ModalExample.vue -->
<script setup lang="ts">
defineProps<{ count: number }>()
const emit = defineEmits<{ close: [boolean] }>()
</script>
<template>
  <UModal :close="{ onClick: () => emit('close', false) }" title="...">
    <template #footer>
      <UButton label="Dismiss" @click="emit('close', false)" />
      <UButton label="OK" @click="emit('close', true)" />
    </template>
  </UModal>
</template>
```
```vue
<script setup lang="ts">
import { LazyModalExample } from '#components'
const overlay = useOverlay()
const modal = overlay.create(LazyModalExample)
async function open() {
  const instance = modal.open({ count: 0 })
  const result = await instance.result   // valor do emit('close', ...)
  modal.patch({ count: 1 })              // atualiza props da instância aberta
}
</script>
```
O evento `close` deve ser emitido para a promise `result` resolver.

## Responsivo (Modal desktop + Drawer mobile)
Usar `useMediaQuery` + `createReusableTemplate` do `@vueuse/core` para reaproveitar o conteúdo do form e renderizar `<UModal v-if="isDesktop">` ou `<UDrawer v-else>`.

## Aninhados
Modal/Slideover: aninhar diretamente `<UModal>` dentro do `#footer`. Drawer: usar prop `nested`.

## a11y
Baseados em Reka UI Dialog — foco preso, `esc` fecha (se `dismissible`), `title`/`description` viram `aria-labelledby`/`aria-describedby`. `modal: false` torna conteúdo externo interativo e visível a leitores de tela.

## Referência

- [Modal](https://ui.nuxt.com/docs/components/modal)
- [Slideover](https://ui.nuxt.com/docs/components/slideover)
- [Drawer](https://ui.nuxt.com/docs/components/drawer)
- [Todos os componentes](https://ui.nuxt.com/docs/components)
