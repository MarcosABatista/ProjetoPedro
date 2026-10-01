---
inclusion: fileMatch
fileMatchPattern: ["nuxt.config.ts", "app/**/*.vue"]
name: Nuxt UI Icons
description: Use ao usar ícones em Nuxt UI (200k+ Iconify). Componente UIcon, prop icon, instalação de coleções, client bundle, coleções locais custom.
---
# Nuxt UI — Icons

Acesso a 200.000+ ícones Iconify. Nuxt via `@nuxt/icon` (auto-registrado), Vue via `@iconify/vue` (sem setup).

## Uso

```vue
<template>
  <UIcon name="i-lucide-lightbulb" class="size-5" />
  <UButton icon="i-lucide-sun" variant="subtle">Button</UButton>
</template>
```

Qualquer nome de [iconify.design](https://iconify.design) (browse em icones.js.org, ou MCP tool `search-icons`).

**Vue apenas:** coleções com `-` exigem `:` entre coleção e nome (`@iconify/vue` não normaliza como `@nuxt/icon`). Ex: `i-simple-icons:github` (não `i-simple-icons-github`).

## Coleções (Iconify dataset)

Instale a data localmente para servir offline/SSR e embutir no bundle:

```bash
pnpm i @iconify-json/{collection_name}   # ex: @iconify-json/lucide, @iconify-json/uil
```

Ícones do próprio Nuxt UI (coleção `lucide`) são embutidos automaticamente quando a coleção está instalada. Coleções não instaladas carregam da Iconify API em runtime.

### Client bundle

**Nuxt** — `nuxt.config.ts` chave `icon`:

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  modules: ['@nuxt/ui'],
  icon: {
    clientBundle: {
      icons: ['lucide:heart', 'simple-icons:github']  // listar explicitamente
    }
  }
})
```

**Vue** — `vite.config.ts` opção `icon` do plugin `ui()`:

```ts [vite.config.ts]
ui({
  icon: {
    clientBundle: { icons: ['lucide:heart', 'simple-icons:github'] }
  }
})
```

Formas aceitas: `i-{collection}-{name}` ou `{collection}:{name}`.

`clientBundle.scan: true` — escaneia o source e agrupa todos os ícones usados automaticamente. Só lê `.vue/.jsx/.tsx/.md/.mdc/.mdx/.yml/.yaml` e apenas strings literais (nomes em `.ts`/`.js` ou dinâmicos `i-lucide-${name}` são ignorados). Para incluir `.ts`/`.js`, use `scan: { globInclude: ['**/*.{vue,jsx,tsx,md,mdc,mdx,yml,yaml,ts,js}'] }` (substitui a lista default). Nomes só existentes em runtime (vindos de API) não podem ser agrupados. Vue: `icon.clientBundle: false` desativa bundling.

## Coleções locais custom (Nuxt)

SVGs em pasta (ex: `./app/assets/icons/add.svg`), declare em `icon.customCollections`:

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  modules: ['@nuxt/ui'],
  icon: {
    customCollections: [{ prefix: 'custom', dir: './app/assets/icons' }]
  }
})
```

Uso: `<UIcon name="i-custom-add" />`.

## Theme

Ícones default dos componentes podem ser trocados no `app.config.ts` (Nuxt) ou `vite.config.ts` (Vue). Ícones sobrescritos carregam on-demand; para embuti-los, adicione-os em `{collection}:{name}` ao `clientBundle.icons`.

## Referência

- https://ui.nuxt.com/docs/getting-started/integrations/icons/nuxt
- https://ui.nuxt.com/docs/getting-started/integrations/icons/vue
