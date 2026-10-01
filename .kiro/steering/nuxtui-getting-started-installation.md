---
inclusion: auto
name: Nuxt UI Getting Started & Installation
description: Use ao instalar/configurar Nuxt UI v4 num projeto Nuxt ou Vue (Vite/Inertia). Cobre pacote, plugin, CSS, App component e todas as options do módulo/plugin.
---
# Nuxt UI v4 — Introdução e Instalação

Nuxt UI é biblioteca de 125+ componentes Vue acessíveis, construída em Reka UI (comportamento/a11y), Tailwind CSS v4 (estilo) e Tailwind Variants (variantes). Funciona com Nuxt e Vue puro (Vite, Inertia, SSR). v4 unifica Nuxt UI + Nuxt UI Pro num único pacote open-source gratuito. Requer **Nuxt 4.1+**.

## Instalação — Nuxt

```bash
pnpm add @nuxt/ui tailwindcss
```

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  modules: ['@nuxt/ui'],
  css: ['~/assets/css/main.css']
})
```

```css [app/assets/css/main.css]
@import "tailwindcss";
@import "@nuxt/ui";
```

```vue [app.vue]
<template>
  <UApp>
    <NuxtPage />
  </UApp>
</template>
```

`@nuxt/icon`, `@nuxt/fonts` e `@nuxtjs/color-mode` são registrados automaticamente (não adicionar aos `modules`). `UApp` é obrigatório para Toast, Tooltip e overlays programáticos.

## Instalação — Vue (Vite)

```bash
pnpm add @nuxt/ui tailwindcss
```

```ts [vite.config.ts]
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import ui from '@nuxt/ui/vite'

export default defineConfig({
  plugins: [vue(), ui()]
})
```

```ts [src/main.ts]
import './assets/css/main.css'
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import ui from '@nuxt/ui/vue-plugin'
import App from './App.vue'

const app = createApp(App)
app.use(createRouter({ routes: [], history: createWebHistory() }))
app.use(ui)
app.mount('#app')
```

```css [src/assets/css/main.css]
@import "tailwindcss";
@import "@nuxt/ui";
```

```vue [src/App.vue]
<template>
  <UApp><RouterView /></UApp>
</template>
```

Adicione `class="isolate"` no container root (`<div id="app" class="isolate">`) para escopar estilos e evitar problemas de stacking context com overlays.

O plugin gera `auto-imports.d.ts` e `components.d.ts` (rodam só quando o Vite executa). Adicione-os ao `tsconfig` `include` e ao `.gitignore`. Para Inertia (Laravel/AdonisJS), use `ui({ router: 'inertia' })` e o `Link` do Inertia.

## Options (chave `ui` no `nuxt.config.ts` / objeto passado ao `ui()` no Vite)

- `prefix` — prefixo dos componentes. Default `U` (ex: `prefix: 'Nuxt'` → `<NuxtButton>`).
- `fonts` (Nuxt) — habilita/desabilita `@nuxt/fonts`. Default `true`.
- `colorMode` — habilita/desabilita integração de color mode. Default `true`.
- `theme.colors` — aliases de cor dinâmicos. Default `['primary','secondary','success','info','warning','error']`. Cada alias gera todos os `--ui-color-*`. Reduza à lista usada; mantenha `error` se usar forms.
- `theme.transitions` — adiciona `transition-colors` em estados hover/active. Default `true`.
- `theme.unstyled` `4.9+` — remove todas as classes de tema (inclui estruturais: posição, flex/grid). Default `false`. Componentes de layout (Modal, Drawer, Calendar) precisam re-fornecer layout.
- `theme.defaultVariants` — sobrescreve `color`/`size` default. Default `{ color: 'primary', size: 'md' }`. Só substitui defaults exatamente `primary`/`md`.
- `theme.prefix` `4.2+` — casar prefixo do import Tailwind (`@import "tailwindcss" prefix(tw)`). No Nuxt com fonts, pode exigir `fonts.processCSSVariables: true`.
- `prose` — habilita componentes Prose (typography). Default `false`.
- `content` (Nuxt) — força import de componentes prose/content sem `@nuxt/content`. Default `false`.
- `experimental.componentDetection` `4.1+` (Nuxt) / `4.11+` (Vue) — tree-shaking do CSS por componente usado. `boolean | string[]`. Default `false`. Passe array (`['Modal','DropdownMenu']`) para incluir componentes dinâmicos (`<component :is>`). Reinicie o dev server ao adicionar componente novo.

### Options exclusivas do Vue (Vite plugin)

- `ui` — config de tema (equivalente à chave `ui` do `app.config.ts` no Nuxt): `ui({ ui: { colors: { primary: 'green', neutral: 'slate' } } })`.
- `dts` — gera declaration files de auto-imports. Default `true`.
- `icon` — props default do componente `Icon` (`size`, `mode`, `customize`) e `clientBundle` (bundling em build-time).
- `autoImport` — desabilita/customiza `unplugin-auto-import`. `false` → importar de `@nuxt/ui/composables`.
- `components` — desabilita/customiza `unplugin-vue-components`. `false` → `import Button from '@nuxt/ui/components/Button.vue'`.
- `router` `4.3+` — `true` (vue-router, default), `false` (links viram `<a>`), `'inertia'` (Inertia `Link`). Função custom via plugin p/ Hybridly.
- `scanPackages` `4.3+` — pacotes npm extras a escanear (`['@my-org/ui-components']`).
- `root` `4.9+` — override do dir onde gera `.nuxt-ui` (útil em electron-vite).

### VSCode (Tailwind IntelliSense)

```json [.vscode/settings.json]
{
  "files.associations": { "*.css": "tailwindcss" },
  "editor.quickSuggestions": { "strings": "on" },
  "tailwindCSS.classAttributes": ["class", "ui"],
  "tailwindCSS.classFunctions": ["defineAppConfig"]
}
```

## Templates oficiais

Nuxt: `npm create nuxt@latest -- -t ui` (também `ui/landing`, `ui/docs`, `ui/saas`, `ui/dashboard`, `ui/chat`, `ui/portfolio`, `ui/changelog`, `ui/editor`, `ui/calendar`).
Vue: `npm create nuxt@latest -- --no-modules -t ui-vue` (também `ui-vue/dashboard`, `ui-vue/chat`).

## Referência

- https://ui.nuxt.com/docs/getting-started
- https://ui.nuxt.com/docs/getting-started/installation/nuxt
- https://ui.nuxt.com/docs/getting-started/installation/vue
