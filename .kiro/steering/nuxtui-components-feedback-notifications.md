---
inclusion: fileMatch
fileMatchPattern: ["app/**/*.vue", "app/components/**/*.vue", "app/pages/**/*.vue", "app/layouts/**/*.vue"]
name: Nuxt UI Feedback — Alert, Banner, Toast
description: Use ao exibir mensagens de feedback no Nuxt UI v4 — Alert (callout inline), Banner (faixa de topo dismissível) e Toast (notificações via useToast).
---
# Nuxt UI — Feedback (Alert, Banner, Toast)

## Alert — `UAlert`
Callout de destaque inline. `A callout to draw user's attention.`
```vue
<template>
  <UAlert
    title="Atenção!"
    description="Você pode alterar a cor primária no app config."
    icon="i-lucide-rocket"
    color="warning"
    variant="soft"
    :actions="[{ label: 'Ação', color: 'neutral', variant: 'subtle' }]"
  />
</template>
```
Props: `title`, `description`, `icon`, `avatar`, `color` (`primary` default), `variant` (`solid` default | `outline` | `soft` | `subtle`), `orientation` (`vertical` default | `horizontal` — actions ao lado do close), `actions` (ButtonProps[]), `close` (bool | ButtonProps), `closeIcon`, `as`, `ui`. Slots: `leading`, `title`, `description`, `actions`, `close`. Emits: `update:open`.

## Banner — `UBanner`
Faixa no topo da aplicação. `Display a banner at the top of your website to inform users about important information.`
```vue [app.vue]
<template>
  <UApp>
    <UBanner id="v4-release" icon="i-lucide-construction" title="Nuxt UI v4 lançado!" to="/blog" />
    <UHeader /> <UMain><NuxtPage /></UMain>
  </UApp>
</template>
```
Props: `id` (persiste dismiss no localStorage — sem id reaparece a cada reload), `icon`, `title`, `actions` (ButtonProps[]), `to`/`target` (vira link, herda NuxtLink), `color` (`primary`), `close` (bool | ButtonProps — default false), `closeIcon`, `as`, `ui`. Slots: `leading`, `title`, `actions`, `close`. Usar em `app.vue` ou layout.

## Toast — `UToast` via `useToast`
Notificação breve. `A succinct message to provide information or feedback to the user.`
Requer `<UApp>` (provê `Toaster`/`ToastProvider`). Não renderiza `<UToast>` diretamente — usa a composable.
```vue
<script setup lang="ts">
const toast = useToast()
function notify() {
  toast.add({
    title: 'Evento adicionado',
    description: 'Agendado para amanhã.',
    icon: 'i-lucide-calendar-days',
    color: 'success',
    duration: 5000,          // ms; 0 = manual até fechar
    actions: [{ label: 'Desfazer', color: 'neutral', variant: 'outline', onClick: (e) => e?.stopPropagation() }]
  })
}
</script>
<template><UButton label="Notificar" @click="notify" /></template>
```
Campos de `toast.add({...})`: `id`, `title`, `description`, `icon`, `avatar`, `color`, `close` (bool | ButtonProps), `closeIcon` (`i-lucide-x`), `actions` (ButtonProps[]), `duration` (5000; `0` = persistente), `progress` (bool | `{ color }` — barra que herda a cor; `false` esconde), `orientation`, `onClick`. API: `toast.add(toast)`, `toast.update(id, patch)`, `toast.remove(id)`, `toast.clear()`, `toast.toasts` (lista reativa). Configuração global via prop `toaster` do `<UApp>` (posição, `duration`, `max`).

## a11y
Toast baseado em Reka UI ToastProvider (roles `status`/`alert`, foco e leitura por leitores de tela, hotkeys). Alert/Banner: use `color`/`variant` com contraste adequado; ações são `UButton` acessíveis. Banner com `to` renderiza link semântico.

## Referência

- [Alert](https://ui.nuxt.com/docs/components/alert)
- [Banner](https://ui.nuxt.com/docs/components/banner)
- [Toast](https://ui.nuxt.com/docs/components/toast)
- [Todos os componentes](https://ui.nuxt.com/docs/components)
