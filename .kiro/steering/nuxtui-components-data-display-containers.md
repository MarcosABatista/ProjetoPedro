---
inclusion: fileMatch
fileMatchPattern: ["app/**/*.vue", "app/components/**/*.vue", "app/pages/**/*.vue", "app/layouts/**/*.vue"]
name: Nuxt UI Data Display — Carousel, Marquee, ScrollArea, Splitter
description: Use ao construir Carousel (slides Embla), Marquee (scroll infinito), ScrollArea (scroll virtualizado) ou Splitter (painéis redimensionáveis) no Nuxt UI v4.
---
# Nuxt UI — Data Display (Carousel, Marquee, ScrollArea, Splitter)

## Carousel — `UCarousel`
Slides navegáveis (Embla). `A carousel with motion and swipe built using Embla.`
```vue
<script setup lang="ts">
const items = ['/1.png', '/2.png', '/3.png']
</script>
<template>
  <UCarousel v-slot="{ item }" arrows dots :items="items" class="w-full max-w-xs mx-auto">
    <img :src="item" width="320" height="320" class="rounded-lg" loading="lazy">
  </UCarousel>
</template>
```
Props: `items` (renderizados via slot default `v-slot="{ item }"`), `arrows` (false — botões prev/next), `prev`/`next` (ButtonProps), `prevIcon`/`nextIcon`, `dots` (indicadores), `orientation` (`horizontal` | `vertical`), `loop`, `autoplay` (bool | `{ delay }`), `autoScroll`, `autoHeight`, `fade`, `wheelGestures`, `classNames`, `ui` + opções Embla por breakpoint (`sm`, `md`, ...). Slots: `default` (`{ item, index }`), `prev`, `next`. Emits: `select` (índice ativo). Expose (template ref): `emblaApi` — `emblaApi.scrollNext()`, `scrollTo(i)`, `selectedScrollSnap()`, etc.

## Marquee — `UMarquee`
Scroll infinito de conteúdo. `A component to create infinite scrolling content.`
```vue
<template>
  <UMarquee pause-on-hover>
    <UIcon name="i-simple-icons-github" class="size-10 shrink-0" />
    <UIcon name="i-simple-icons-discord" class="size-10 shrink-0" />
  </UMarquee>
</template>
```
Props: `pauseOnHover` (false), `reverse` (false), `orientation` (`horizontal` default | `vertical`), `repeat` (4 — quantas vezes repete o conteúdo), `overlay` (true — gradientes nas bordas; `false` remove), `as`, `ui`. Slot: `default`. Sem emits.
Animação desabilita automaticamente com `prefers-reduced-motion` (conteúdo estático). Configurável via CSS vars no `ui.root`: `[--gap:...]` e `[--duration:20s]`.

## ScrollArea — `UScrollArea`
Container de scroll flexível com virtualização. `A flexible scroll container with virtualization support.`
```vue
<script setup lang="ts">
const items = Array.from({ length: 1000 }, (_, i) => ({ id: i, title: `Item ${i}` }))
const scrollArea = useTemplateRef('scrollArea')
</script>
<template>
  <UScrollArea ref="scrollArea" v-slot="{ item, index }" :items="items" virtualize class="h-96 w-full">
    <UPageCard v-bind="item" class="rounded-none" />
  </UScrollArea>
</template>
```
Props: `items` (opcional — sem ele, usar slot default com conteúdo direto), `orientation` (`vertical` default | `horizontal`), `virtualize` (4.x, bool | `{ gap, lanes, estimateSize, overscan, paddingStart, paddingEnd, skipMeasurement, getScrollElement, scrollMargin }`), `shadow` (4.9+, bool | `{ size }` — fade nas bordas), `as`, `ui`. Slot: `default` (`{ item, index }`). Emits: `scroll` (`isScrolling`). Expose: `$el`, `virtualizer` (TanStack Virtual — `virtualizer.scrollToIndex(i, { align, behavior })`).
`lanes` → layout masonry (Pinterest). `skipMeasurement: true` p/ listas de altura uniforme. Infinite scroll: `useInfiniteScroll` no `scrollArea.$el`.

## Splitter — `USplitter`
Painéis redimensionáveis com handles arrastáveis. `A set of resizable panels separated by draggable handles.`
```vue
<script setup lang="ts">
import type { SplitterItem } from '@nuxt/ui'
const items: SplitterItem[] = [
  { slot: 'left', minSize: 15, defaultSize: 25 },
  { slot: 'main', minSize: 30, defaultSize: 75 }
]
</script>
<template>
  <div class="w-full h-96">
    <USplitter id="s1" :items="items">
      <template #left>Left</template>
      <template #main>Main</template>
    </USplitter>
  </div>
</template>
```
Preenche a altura do container (defina altura no pai). Item: `defaultSize`, `minSize`, `maxSize`, `collapsible`, `collapsedSize`, `sizeUnit` (`%` default | `px`), `order`, `id`, `slot` (fallback `panel-{index}`), `class`, `ui`.
Props: `items`, `orientation` (`horizontal` default | `vertical`), `id` (obrigatório em SSR — ids automáticos divergem entre server/client), `disabled`, `autoSaveId` (persiste layout no localStorage), `keyboardResizeBy`, `storage`, `hitAreaMargins`, `ui`. Slot `#{slot}` de cada painel expõe `{ collapsed, collapse, expand }`. Slot `resize-handle` p/ conteúdo no handle. Emits: `layout`, `collapse` (index), `expand` (index), `resize` (index, size, prevSize), `dragging`.
SSR: definir `id` e dar `defaultSize` a todos os itens ou a nenhum (evita salto na hidratação).

## a11y
Carousel/Splitter (Reka UI): navegação por teclado (setas), roles ARIA, handles focáveis. ScrollArea: `focus-visible` no root. Marquee respeita `prefers-reduced-motion`.

## Referência

- [Carousel](https://ui.nuxt.com/docs/components/carousel)
- [Marquee](https://ui.nuxt.com/docs/components/marquee)
- [ScrollArea](https://ui.nuxt.com/docs/components/scroll-area)
- [Splitter](https://ui.nuxt.com/docs/components/splitter)
- [Todos os componentes](https://ui.nuxt.com/docs/components)
