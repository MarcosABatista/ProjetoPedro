---
inclusion: fileMatch
fileMatchPattern: ["nuxt.config.ts", "app/**/*.vue", "app/app.config.ts"]
name: Nuxt UI Color Mode
description: Use ao implementar alternância light/dark com Nuxt UI (Nuxt via @nuxtjs/color-mode, Vue via VueUse useDark). Componentes ColorMode* e composable useColorMode.
---
# Nuxt UI — Color Mode

Registrado automaticamente. Componentes: `ColorModeAvatar`, `ColorModeImage` (imagens diferentes light/dark), `ColorModeButton`, `ColorModeSwitch`, `ColorModeSelect` (alternar modo).

## Nuxt (`@nuxtjs/color-mode`)

Módulo registrado automaticamente — sem setup extra. Componente custom com `useColorMode`:

```vue [ColorModeButton.vue]
<script setup lang="ts">
const colorMode = useColorMode()
const isDark = computed({
  get() { return colorMode.value === 'dark' },
  set(_isDark) { colorMode.preference = _isDark ? 'dark' : 'light' }
})
</script>

<template>
  <ClientOnly v-if="!colorMode?.forced">
    <UButton
      :icon="isDark ? 'i-lucide-moon' : 'i-lucide-sun'"
      color="neutral" variant="ghost"
      :aria-label="`Switch to ${isDark ? 'light' : 'dark'} mode`"
      @click="isDark = !isDark"
    />
    <template #fallback><div class="size-8" /></template>
  </ClientOnly>
</template>
```

Desabilitar:

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  modules: ['@nuxt/ui'],
  ui: { colorMode: false }
})
```

## Vue (VueUse `useDark`)

`useDark` registrado como plugin Vue automaticamente. Componente custom:

```vue [ColorModeButton.vue]
<script setup lang="ts">
import { computed } from 'vue'
import { useColorMode } from '@vueuse/core'

const colorMode = useColorMode()
const isDark = computed({
  get() { return colorMode.value === 'dark' },
  set(_isDark: boolean) { colorMode.value = _isDark ? 'dark' : 'light' }
})
</script>

<template>
  <UButton
    :icon="isDark ? 'i-lucide-moon' : 'i-lucide-sun'"
    color="neutral" variant="ghost"
    :aria-label="`Switch to ${isDark ? 'light' : 'dark'} mode`"
    @click="isDark = !isDark"
  />
</template>
```

Desabilitar: `ui({ colorMode: false })` no `vite.config.ts`.

## Referência

- https://ui.nuxt.com/docs/getting-started/integrations/color-mode/nuxt
- https://ui.nuxt.com/docs/getting-started/integrations/color-mode/vue
