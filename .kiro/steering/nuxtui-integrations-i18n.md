---
inclusion: fileMatch
fileMatchPattern: ["nuxt.config.ts", "app/**/*.vue"]
name: Nuxt UI i18n
description: Use ao internacionalizar componentes Nuxt UI (50+ locales, LTR/RTL). Prop locale do UApp, locale custom/extend, troca dinâmica via Nuxt I18n / Vue I18n, direção.
---
# Nuxt UI — Internacionalização (i18n)

50+ locales, LTR/RTL. Configurado pela prop `locale` do `UApp`. Cada locale tem `code` (ex: `en`, `en-GB`, `fr`) que define formato de data/hora em Calendar, InputDate, InputTime, e `dir` (LTR/RTL) aplicado a todos os componentes.

## Locale (de `@nuxt/ui/locale`)

```vue [app.vue / App.vue]
<script setup lang="ts">
import { fr } from '@nuxt/ui/locale'
</script>

<template>
  <UApp :locale="fr">
    <NuxtPage />  <!-- ou <RouterView /> no Vue -->
  </UApp>
</template>
```

## Locale custom (`defineLocale`)

```vue
<script setup lang="ts">
import type { Messages } from '@nuxt/ui'
// Vue: import { defineLocale } from '@nuxt/ui/composables'  (auto-import no Nuxt)

const locale = defineLocale<Messages>({
  name: 'My custom locale',
  code: 'en',       // iso code: 'hi', 'de-AT'...
  dir: 'ltr',
  messages: { /* pares */ }
})
</script>
```

## Estender locale (`extendLocale`)

```vue
<script setup lang="ts">
import { en } from '@nuxt/ui/locale'
// Vue: import { extendLocale } from '@nuxt/ui/composables'

const locale = extendLocale(en, {
  code: 'en-AU',
  messages: { commandPalette: { placeholder: 'Search a component...' } }
})
</script>
```

## Troca dinâmica

### Nuxt — `@nuxtjs/i18n`

```bash
pnpm add @nuxtjs/i18n
```

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  modules: ['@nuxt/ui', '@nuxtjs/i18n'],
  i18n: {
    locales: [
      { code: 'de', name: 'Deutsch' },
      { code: 'en', name: 'English' },
      { code: 'fr', name: 'Français' }
    ]
  }
})
```

```vue [app.vue]
<script setup lang="ts">
import * as locales from '@nuxt/ui/locale'
const { locale } = useI18n()
</script>

<template>
  <UApp :locale="locales[locale]"><NuxtPage /></UApp>
</template>
```

**Localização automática de links `4.7+`**: com `@nuxtjs/i18n` instalado, `ULink`/componentes com `to` localizam links internos automaticamente (via `$localePath`), sem `localePath()`/`localeRoute()`. Links externos/absolutos são pulados.

### Vue — `vue-i18n`

```bash
pnpm add vue-i18n@11
```

```ts [src/main.ts]
import { createI18n } from 'vue-i18n'
import ui from '@nuxt/ui/vue-plugin'

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  availableLocales: ['en', 'de'],
  messages: { en: { /* */ }, de: { /* */ } }
})

app.use(i18n)
app.use(ui)
```

```vue [App.vue]
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import * as locales from '@nuxt/ui/locale'
const { locale } = useI18n()
</script>

<template>
  <UApp :locale="locales[locale]"><RouterView /></UApp>
</template>
```

## Direção dinâmica (`lang`/`dir` no `<html>`)

```vue
<script setup lang="ts">
import * as locales from '@nuxt/ui/locale'
// Nuxt: useI18n/useHead auto-import; Vue: import { useHead } from '@unhead/vue', useI18n de 'vue-i18n'
const { locale } = useI18n()
const lang = computed(() => locales[locale.value].code)
const dir = computed(() => locales[locale.value].dir)
useHead({ htmlAttrs: { lang, dir } })
</script>
```

## Referência

- https://ui.nuxt.com/docs/getting-started/integrations/i18n/nuxt
- https://ui.nuxt.com/docs/getting-started/integrations/i18n/vue
