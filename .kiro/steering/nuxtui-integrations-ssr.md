---
inclusion: fileMatch
fileMatchPattern: ["nuxt.config.ts", "app/**/*.vue"]
name: Nuxt UI SSR (Vue)
description: Use ao habilitar SSR de Nuxt UI em Vue puro/Inertia — injeção de variáveis de cor via @unhead, detecção de color scheme sem flash, ícones offline. No Nuxt funciona out-of-the-box.
---
# Nuxt UI — SSR

No Nuxt, SSR funciona out-of-the-box. Em **Vue puro / Inertia**, atenção a três pontos.

## Injeção de variáveis de cor

Nuxt UI injeta no `<head>` as color variables usadas pelos componentes. Em Vue SSR você injeta manualmente com `@unhead`:

```ts [ssr.ts]
import { createHead, renderSSRHead } from '@unhead/vue/server'

const head = createHead()
const payload = await renderSSRHead(head)
app.head.push(payload.headTags)
```

Em Inertia (Laravel/AdonisJS), dentro de `createServer` → `createInertiaApp`: crie `head` com `createHead()`, use `.use(head).use(ui)` no `createSSRApp`, e após resolver o app faça `app.head.push((await renderSSRHead(head)).headTags)`.

## Detecção de color scheme (evitar flash)

Detecte o esquema antes de inicializar a app. Adicione ao `<head>` do documento:

```html [index.html]
<script>
const theme = localStorage.getItem('vueuse-color-scheme') || 'auto'
if (theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
  document.documentElement.classList.add('dark')
} else {
  document.documentElement.classList.remove('dark')
}
</script>
```

O mesmo script vale no `app.blade.php` (Laravel) e `inertia_layout.edge` (AdonisJS).

## Ícones

Nuxt UI embute os ícones que usa no build → renderizam no SSR e funcionam offline, sem request à Iconify API, desde que a coleção esteja instalada localmente (`@iconify-json/{collection}`). Ver integração Icons.

## Referência

- https://ui.nuxt.com/docs/getting-started/integrations/ssr
