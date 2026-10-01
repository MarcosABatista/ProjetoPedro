---
inclusion: fileMatch
fileMatchPattern: ["app/**/*.vue", "app/components/**/*.vue", "app/pages/**/*.vue", "app/layouts/**/*.vue"]
name: nuxtui-overview
description: Catálogo completo dos 125+ componentes Nuxt UI v4 agrupados por categoria. Consultar para descobrir qual componente usar antes de implementar UI.
---
# Nuxt UI v4 — Catálogo de Componentes

125+ componentes Vue com Tailwind CSS + Reka UI. Prefixo global `U` (ex: `UButton`, `UCard`). Auto-import no Nuxt; no Vue puro importar de `@nuxt/ui`.

## Setup base
Envolver app em `<UApp>` (`app.vue`) — provê config global, toasts, tooltips, modals/slideovers programáticos.
```vue [app.vue]
<template>
  <UApp>
    <NuxtPage />
  </UApp>
</template>
```

## Layout (estrutura)
`App`, `Container`, `Error`, `Footer`, `Header`, `Main`, `Sidebar`, `Splitter`, `Theme`. Ver steering `nuxtui-components-layout`.

## Element (blocos básicos)
`Alert`, `Avatar`, `AvatarGroup`, `Badge`, `Banner`, `Button`, `Calendar`, `Card`, `Chip`, `Collapsible`, `FieldGroup`, `Icon`, `Kbd`, `Progress`, `ProgressGroup`, `Separator`, `Skeleton`.

## Form
`Checkbox`, `CheckboxGroup`, `ColorPicker`, `FileUpload`, `Form`, `FormField`, `Input`, `InputDate`, `InputMenu`, `InputNumber`, `InputRating`, `InputTags`, `InputTime`, `Listbox`, `PinInput`, `RadioGroup`, `Select`, `SelectMenu`, `Slider`, `Switch`, `Textarea`.

## Data
`Accordion`, `Carousel`, `Empty`, `Marquee`, `ScrollArea`, `Table`, `Timeline`, `Tree`, `User`.

## Navigation
`Breadcrumb`, `CommandPalette`, `FooterColumns`, `Link`, `NavigationMenu`, `Pagination`, `Stepper`, `Tabs`.

## Overlay (flutuantes)
`ContextMenu`, `Drawer`, `DropdownMenu`, `Modal`, `Popover`, `Slideover`, `Toast`, `Tooltip`. Modais/slideovers podem ser abertos programaticamente via `useOverlay()`.

## Page (marketing/landing)
`AuthForm`, `BlogPost`, `BlogPosts`, `ChangelogVersion`, `ChangelogVersions`, `Page`, `PageAnchors`, `PageAside`, `PageBody`, `PageCard`, `PageColumns`, `PageCTA`, `PageFeature`, `PageGrid`, `PageHeader`, `PageHero`, `PageLinks`, `PageList`, `PageLogos`, `PageSection`, `PricingPlan`, `PricingPlans`, `PricingTable`. Ver steering `nuxtui-components-page`.

## Dashboard
`DashboardGroup`, `DashboardNavbar`, `DashboardPanel`, `DashboardResizeHandle`, `DashboardSearch`, `DashboardSearchButton`, `DashboardSidebar`, `DashboardSidebarCollapse`, `DashboardSidebarToggle`, `DashboardToolbar`. Ver steering `nuxtui-components-dashboard`.

## AI Chat (Vercel AI SDK)
`ChatMessage`, `ChatMessages`, `ChatPalette`, `ChatPrompt`, `ChatPromptSubmit`, `ChatReasoning`, `ChatShimmer`, `ChatTool`.

## Editor (4.3+, TipTap)
`Editor`, `EditorDragHandle`, `EditorEmojiMenu`, `EditorMentionMenu`, `EditorSuggestionMenu`, `EditorToolbar`.

## Content (@nuxt/content)
`ContentNavigation`, `ContentSearch`, `ContentSearchButton`, `ContentSurround`, `ContentToc`.

## Color Mode
`ColorModeAvatar`, `ColorModeButton`, `ColorModeImage`, `ColorModeSelect`, `ColorModeSwitch`.

## i18n
`LocaleSelect`.

## Convenções gerais
- Props de aparência comuns: `color`, `variant`, `size`, `icon`, `trailing`.
- Prop `ui` em todo componente para override de classes por slot (theme).
- Props de link (`to`, `href`) seguem o componente `Link` (wrapper de `NuxtLink`).
- Ícones no formato `i-lucide-*` (coleção padrão), qualquer coleção Iconify suportada.

## Referência

- [Catálogo de componentes](https://ui.nuxt.com/docs/components)
