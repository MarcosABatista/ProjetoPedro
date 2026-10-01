---
inclusion: fileMatch
fileMatchPattern: ["app/**/*.vue", "app/components/**/*.vue", "app/pages/**/*.vue", "app/layouts/**/*.vue"]
name: nuxtui-layout
description: Componentes estruturais Nuxt UI v4 (App, Container, Main, Header, Footer, FooterColumns, Sidebar, Banner). Consultar ao montar shell/scaffolding de layout, header/footer de site, ou sidebar de navegação.
---
# Nuxt UI v4 — Layout

Componentes de estrutura de página. Compõem tipicamente em `app.vue` ou layout.

## Composição típica (app.vue)
```vue [app.vue]
<template>
  <UApp>
    <UBanner icon="i-lucide-construction" title="Novo release!" />
    <UHeader>
      <template #title><Logo class="h-6 w-auto" /></template>
      <UNavigationMenu :items="items" />
      <template #right><UColorModeButton /></template>
    </UHeader>
    <UMain>
      <NuxtLayout><NuxtPage /></NuxtLayout>
    </UMain>
    <UFooter />
  </UApp>
</template>
```

## App (`UApp`)
Wrapper raiz obrigatório. Provê config global (Reka ConfigProvider), toasts, tooltips, modals/slideovers programáticos.
Props: `tooltip` (TooltipProviderProps), `toaster` (ToasterProps|null), `locale`, `portal` (default `'body'`), `dir` (`'ltr'|'rtl'`, default ltr), `scrollBody`, `nonce`. Slot: `default`.

## Container (`UContainer`)
Centraliza e limita largura do conteúdo. Max-width via CSS var `--ui-container`.
```vue
<UContainer><slot /></UContainer>
```
Props: `as` (default `div`), `ui.base`.

## Main (`UMain`)
`<main>` que preenche altura restante do viewport. Usa `--ui-header-height` para posicionar abaixo do Header.
Props: `as` (default `main`), `ui.base`. Default base: `min-h-[calc(100vh-var(--ui-header-height))]`.

## Header (`UHeader`)
`<header>` responsivo com menu mobile. Altura via `--ui-header-height`.
Props chave:
- `title` (default `'Nuxt UI'`), `to` (default `/`)
- `mode` (`'modal'` default) — modo do menu mobile
- `menu` — props do componente de menu
- `toggle` (bool|ButtonProps) — botão hambúrguer mobile; `toggleSide` (`'left'|'right'`, default right)
- `autoClose` (default true) — fecha ao trocar rota
- `v-model:open`
Slots: `title`, `left`, `default` (centro), `right`, `toggle`, `top`, `bottom`, `body` (menu mobile), `content` (menu inteiro).
Padrão: links centrais via `UNavigationMenu`; no `#body` repetir com `orientation="vertical"` para mobile.
```vue
<UHeader>
  <template #title><Logo class="h-6 w-auto" /></template>
  <UNavigationMenu :items="items" />
  <template #right>
    <UColorModeButton />
    <UButton icon="i-simple-icons-github" color="neutral" variant="ghost" to="https://github.com/nuxt/ui" target="_blank" />
  </template>
  <template #body>
    <UNavigationMenu :items="items" orientation="vertical" class="-mx-2.5" />
  </template>
</UHeader>
```

## Footer (`UFooter`)
`<footer>` responsivo. Slots: `left`, `default` (centro), `right`, `top`, `bottom`. Use `#top` para `UFooterColumns`.
```vue
<UFooter>
  <template #left><p class="text-muted text-sm">© {{ new Date().getFullYear() }}</p></template>
  <UNavigationMenu :items="items" variant="link" />
  <template #right>
    <UButton icon="i-simple-icons-github" color="neutral" variant="ghost" to="..." target="_blank" />
  </template>
</UFooter>
```

## FooterColumns (`UFooterColumns`)
Colunas de links dentro do slot `#top` do Footer.
Prop `columns: FooterColumn[]` — cada coluna `{ label, children: [{ label, icon, to, target, ... }] }` (children herdam props de Link).
Slots: `left`, `default`, `right`, `column-label`, `link`, `link-leading`, `link-label`, `link-trailing`.
```vue
<UFooter>
  <template #top>
    <UContainer>
      <UFooterColumns :columns="columns">
        <template #right>
          <UFormField name="email" label="Newsletter" size="lg">
            <UInput type="email" class="w-full">
              <template #trailing><UButton type="submit" size="xs" color="neutral" label="Subscribe" /></template>
            </UInput>
          </UFormField>
        </template>
      </UFooterColumns>
    </UContainer>
  </template>
</UFooter>
```

## Sidebar (`USidebar`)
Sidebar fixa autônoma que empurra o conteúdo. Desktop: inline colapsável; mobile: abre Modal/Slideover/Drawer.
Sidebar vs DashboardSidebar: use `USidebar` para painel simples (chat, settings, nav). Para drag-resize + persistência + integração com DashboardGroup, use `UDashboardSidebar`.
Props chave:
- `variant` (`'sidebar'` default | `'floating'` | `'inset'`)
- `collapsible` (`'offcanvas'` default | `'icon'` | `'none'`) — offcanvas some, icon vira só ícones, none não colapsa
- `side` (`'left'` default | `'right'`)
- `title`, `description`
- `rail` (bool) — borda fina clicável p/ toggle (só se collapsible ≠ none)
- `close` (bool|ButtonProps), `closeIcon` (default `i-lucide-x`)
- `mode` (default `'slideover'`) — modo mobile; `menu`
- `transition` (default true)
- `v-model:open` — viewport-aware: desktop=expandido/colapsado, mobile=menu aberto
Slots: `header`, `title`, `description`, `actions`, `close`, `default` (recebe `{ state: 'collapsed'|'expanded' }`), `footer`, `rail`, `content`.
CSS vars: `--sidebar-width` (16rem), `--sidebar-width-icon` (4rem) — override via `style`.
Persistir estado: usar `useLocalStorage('sidebar-open', true)` ou `useCookie` em vez de `ref`.
```vue
<USidebar v-model:open="open" collapsible="icon" rail>
  <template #header><UIcon name="i-logos-nuxt-icon" class="size-8" /></template>
  <template #default="{ state }">
    <UNavigationMenu :key="state" :items="getItems(state)" orientation="vertical" :ui="{ link: 'p-1.5 overflow-hidden' }" />
  </template>
  <template #footer>...</template>
</USidebar>
```

## Banner (`UBanner`)
Faixa no topo do site p/ avisos importantes. Colocar antes do Header.
Props chave: `title`, `icon`, `color` (default `primary`), `close` (bool|ButtonProps), `closeIcon`, `actions` (ButtonProps[], default `color=neutral size=xs`), `id` (persiste dismiss no localStorage — sem id reaparece no reload), props de link (`to`, `target`). Slots: `leading`, `title`, `actions`, `close`. Emit: `close`.
```vue
<UBanner icon="i-lucide-info" title="Mensagem importante." color="primary" close :actions="actions" id="promo-1" />
```

## Referência

- [App](https://ui.nuxt.com/docs/components/app)
- [Container](https://ui.nuxt.com/docs/components/container)
- [Main](https://ui.nuxt.com/docs/components/main)
- [Header](https://ui.nuxt.com/docs/components/header)
- [Footer](https://ui.nuxt.com/docs/components/footer)
- [FooterColumns](https://ui.nuxt.com/docs/components/footer-columns)
- [Sidebar](https://ui.nuxt.com/docs/components/sidebar)
- [Banner](https://ui.nuxt.com/docs/components/banner)
- [Todos os componentes](https://ui.nuxt.com/docs/components)
