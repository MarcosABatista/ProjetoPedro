---
inclusion: fileMatch
fileMatchPattern: ["app/**/*.vue", "app/composables/**/*.ts", "nuxt.config.ts"]
name: Nuxt UI Composables (defineLocale, extendLocale)
description: Use ao criar (defineLocale) ou estender (extendLocale) locales custom do Nuxt UI para o prop locale do UApp.
---
# Nuxt UI — Composables de Locale

Auto-importados (Nuxt). Vue: importar de `@nuxt/ui/composables`. Passar o resultado ao prop `locale` do `UApp`. Ver integração i18n. Referência de mensagens: [built-in locales](https://github.com/nuxt/ui/tree/v4/src/runtime/locale).

## defineLocale

Cria locale custom do zero.

```vue
<script setup lang="ts">
import type { Messages } from '@nuxt/ui'

const locale = defineLocale<Messages>({
  name: 'Español',      // nome display
  code: 'es',           // ISO code: 'en', 'fr', 'de-AT'
  dir: 'ltr',           // 'ltr' (default) | 'rtl'
  messages: {
    alert: { close: 'Cerrar' },
    modal: { close: 'Cerrar' },
    commandPalette: {
      back: 'Atrás', close: 'Cerrar', noData: 'Sin datos',
      noMatch: 'Sin resultados', placeholder: 'Escribe un comando…'
    }
    // ... demais mensagens de componentes
  }
})
</script>

<template>
  <UApp :locale="locale"><NuxtPage /></UApp>
</template>
```

`defineLocale<M>(options): Locale<M>`. Use o tipo `Messages` de `@nuxt/ui` para type-safety.

## extendLocale

Estende locale existente (deep merge das mensagens). Útil p/ variante regional (`en-AU` de `en`) ou sobrescrever labels específicos sem redefinir tudo.

```vue
<script setup lang="ts">
import { en } from '@nuxt/ui/locale'

const locale = extendLocale(en, {
  name: 'English (Australia)',
  code: 'en-AU',
  messages: {
    selectMenu: { search: 'Search…', noData: 'No results found', noMatch: 'No matching results' }
  }
})
</script>

<template>
  <UApp :locale="locale"><NuxtPage /></UApp>
</template>
```

`extendLocale<M>(locale, options): Locale<M>`. `locale`: base (de `@nuxt/ui/locale`). `options`: parciais de `name`/`code`/`dir`/`messages` (só o que quer sobrescrever; resto herdado por deep merge).

## Referência

- https://ui.nuxt.com/docs/composables/define-locale
- https://ui.nuxt.com/docs/composables/extend-locale
