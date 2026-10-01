---
inclusion: fileMatch
fileMatchPattern: ["app/**/*.vue", "app/components/**/*.vue", "app/pages/**/*.vue", "app/layouts/**/*.vue"]
name: nuxtui-page-marketing
description: Componentes de marketing/landing Nuxt UI v4 (PageHero, PageSection, PageFeature, PageCTA, PageLogos). Consultar ao montar landing pages, seções hero, features, call-to-action e faixas de logos.
---
# Nuxt UI v4 — Page (Marketing / Landing)

Seções pré-construídas para landing pages. Estrutura de docs/conteúdo → `nuxtui-components-page-core`.

## Composição típica (landing)
```vue
<template>
  <UPageHero title="..." description="..." :links="links" />
  <UPageLogos title="Trusted by..." :items="logos" marquee />
  <UPageSection title="..." description="..." :features="features" />
  <UPageCTA title="..." description="..." :links="links" variant="soft" />
</template>
```

## PageHero (`UPageHero`)
Hero full-width envolvendo conteúdo num Container. Ilustração no slot default.
Props: `title`, `description`, `headline`, `links` (ButtonProps[], default `size=xl`), `orientation` (`'vertical'` default | `'horizontal'`), `reverse`.
Slots: `top`, `header`, `headline`, `title`, `description`, `body`, `footer`, `links`, `default`, `bottom`.
```vue
<UPageHero title="Ultimate Vue UI library" description="..." headline="New release" orientation="horizontal" :links="links">
  <img src="/blocks/image4.png" alt="App screenshot" class="rounded-lg shadow-2xl ring ring-default" />
</UPageHero>
```

## PageSection (`UPageSection`)
Seção full-width envolvendo Container. Usada após PageHero. Renderiza lista de PageFeature via prop `features`.
Props: `title`, `description`, `headline`, `icon`, `links` (ButtonProps[], default `size=lg`), `features` (PageFeatureProps[]), `orientation` (`'vertical'` default | `'horizontal'`), `reverse`.
Slots: `top`, `header`, `leading`, `headline`, `title`, `description`, `body`, `features`, `footer`, `links`, `default`, `bottom`.
```vue
<UPageSection title="Beautiful Vue UI components" description="..." headline="Features" :features="features" :links="links" />
```
Horizontal com ilustração:
```vue
<UPageSection title="..." description="..." icon="i-lucide-rocket" orientation="horizontal" :features="features" :links="links">
  <img src="..." class="w-full rounded-lg" loading="lazy" />
</UPageSection>
```

## PageFeature (`UPageFeature`)
Item de feature (usado pelo PageSection via `features`, ou avulso).
Props: `title`, `description`, `icon`, `orientation` (`'horizontal'` default | `'vertical'`), props de link (`to`, `target`), `onClick`. Slots: `leading`, `title`, `description`, `default`.
```vue
<UPageFeature title="Theme" description="Customize Nuxt UI..." icon="i-lucide-swatch-book" to="..." />
```
Como prop de PageSection:
```ts
const features = ref<PageFeatureProps[]>([
  { title: 'Icons', description: '...', icon: 'i-lucide-smile', to: '/docs/...' }
])
```

## PageCTA (`UPageCTA`)
Seção call-to-action. Usar dentro de PageSection ou avulso. Ilustração no slot default.
Props: `title`, `description`, `links` (ButtonProps[], default `size=lg`), `variant` (`'outline'` default | `solid` | `soft` | `subtle` | `naked`), `orientation` (`'vertical'` default | `'horizontal'`), `reverse`.
Slots: `top`, `header`, `title`, `description`, `body`, `footer`, `links`, `default`, `bottom`.
Dica: `px-0` + `rounded-none` p/ CTA sangrar até a borda no mobile.
```vue
<UPageCTA title="Trusted by our community" description="..." variant="soft" :links="links" />
```
Horizontal:
```vue
<UPageCTA title="..." description="..." orientation="horizontal" :links="links">
  <img src="..." class="w-full rounded-lg" loading="lazy" />
</UPageCTA>
```

## PageLogos (`UPageLogos`)
Faixa de logos/imagens. Items = nome de ícone (`i-simple-icons-*`) ou `{ src, alt }` (vira UAvatar). Slot default p/ controle total.
Props: `title`, `items` (PageLogosItem[]), `marquee` (bool|MarqueeProps — efeito rolagem). Slot: `default`.
```vue
<UPageLogos title="Trusted by the best front-end teams" marquee :items="[
  'i-simple-icons-github', 'i-simple-icons-discord', 'i-simple-icons-x'
]" />
```
Com slot:
```vue
<UPageLogos title="...">
  <UIcon name="i-simple-icons-github" class="size-10 shrink-0" />
</UPageLogos>
```

## Referência

- [PageHero](https://ui.nuxt.com/docs/components/page-hero)
- [PageSection](https://ui.nuxt.com/docs/components/page-section)
- [PageFeature](https://ui.nuxt.com/docs/components/page-feature)
- [PageCTA](https://ui.nuxt.com/docs/components/page-cta)
- [PageLogos](https://ui.nuxt.com/docs/components/page-logos)
- [Todos os componentes](https://ui.nuxt.com/docs/components)
