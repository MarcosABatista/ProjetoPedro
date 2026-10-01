---
inclusion: fileMatch
fileMatchPattern: ["app/**/*.vue", "app/composables/**/*.ts"]
name: Nuxt UI Composables (Toast, Overlay, Shortcuts, ScrollShadow, Tour)
description: Use ao usar composables de UI do Nuxt UI — useToast (notificações), useOverlay (modais/slideovers programáticos), defineShortcuts/extractShortcuts (atalhos), useScrollShadow, useTour.
---
# Nuxt UI — Composables de UI

Todos auto-importados (Nuxt). No Vue puro, importar de `@nuxt/ui/composables` se `autoImport: false`.

## useToast

Notificações Toast. Requer `<UApp>` (usa Toaster/ToastProvider). Máx 5 toasts (config `toaster.max` no `App`); ao exceder, remove o mais antigo. Estado via `useState` (reativo global). Delay de 200ms na remoção (animação de saída).

```vue
<script setup lang="ts">
const toast = useToast()
function showToast() {
  toast.add({
    title: 'New message',
    description: 'You have a new message.',
    color: 'success',
    actions: [{ icon: 'i-lucide-reply', label: 'Reply', color: 'neutral', variant: 'outline', onClick: () => {} }]
  })
}
</script>
```

API: `add(toast): Toast`, `update(id, toast)`, `remove(id)`, `clear()`, `toasts: Ref<Toast[]>`.
Props de `add`: `id` (reusar id faz merge), `open`, `title`, `description`, `icon`, `avatar`, `color` (default `primary`), `orientation`, `close` (`false` esconde), `closeIcon`, `actions` (Button), `progress` (`false` esconde), `duration` (ms, default `5000`, `0` = manual), `onClick`, `onOpenChange`, `type` (a11y announce: `background` p/ não-user-action), `as`.

## useOverlay

Controle programático de Modal/Slideover. `createSharedComposable` (estado global compartilhado). Await `open()` para obter valor de volta (componente deve emitir evento `close`).

```vue
<script setup lang="ts">
import { LazyModalExample } from '#components'
const overlay = useOverlay()
const modal = overlay.create(LazyModalExample, { props: { title: 'Welcome' } })

async function open() {
  const result = await modal.open({ title: 'Hello' })  // props sobrescrevem
}
</script>
```

`useOverlay()`: `create(component, options?)` → instância. Options: `defaultOpen`, `props`, `destroyOnClose` (remove da memória ao fechar, default `false`). Métodos globais por `id` (symbol): `open`, `close(id, value?)`, `closeAll`, `patch(id, props)`, `unmount`, `isOpen`, `overlays`.

Instância (de `create()`): `open(props?)` → Promise que resolve com o valor do evento `close` (também exposto como `.result`); `close(value?)`; `patch(props)`.

Padrão confirm dialog: componente emite `close: [value: boolean]`; composable retorna `modal.open()` (Promise<boolean>).

**Caveat provide/inject:** overlays são montados fora do contexto da página (pelo `UApp`), só acessam injects do componente que contém `UApp`. Passe valores via `props` em vez de `provide()`.

## defineShortcuts

Atalhos de teclado. `meta` vira `ctrl` fora do macOS. Usa VueUse `useEventListener`. Keys case-insensitive. Retorna função que remove o listener.

```vue
<script setup lang="ts">
defineShortcuts({
  '?': () => openHelpModal(),
  'meta_k': () => openCommandPalette(),  // combinação: _
  'g-d': () => navigateToDashboard()     // sequência: -
})
</script>
```

`defineShortcuts(config: MaybeRef<ShortcutsConfig>, options?)`. Valor `false`/`null`/`undefined` pula o atalho (condicional). Options: `chainDelay` (default 800ms), `layoutIndependent` (usa `e.code` = posição física, p/ layouts Árabe/Hebraico; default `false` = `e.key`).

Modificadores: `meta`/`command`, `ctrl`, `shift`, `alt`/`option`. Especiais: `escape`, `enter`, `arrowleft/right/up/down`, `tab`, `backspace`, `delete`, `space`.

Config por atalho: função ou `{ handler, usingInput }`. `usingInput`: `false` (só sem input focado), `true` (mesmo com input focado), `string` (só quando o input de tal `name` está focado).

```vue
<script setup lang="ts">
defineShortcuts({
  enter: { usingInput: 'queryInput', handler: () => performSearch() },
  escape: { usingInput: true, handler: () => clearSearch() }
})
</script>
```

## extractShortcuts

Extrai atalhos de menu items (DropdownMenu, ContextMenu, CommandPalette) que têm `kbds`. Recursivo em `children`/`items`.

```vue
<script setup lang="ts">
const items = [
  { label: 'Save', kbds: ['meta', 'S'], onSelect() { save() } },
  { label: 'Copy', kbds: ['meta', 'C'], onSelect() { copy() } }
]
defineShortcuts(extractShortcuts(items))
</script>
```

`extractShortcuts(items, separator?: '_' | '-')`. Default `'_'` (combinação); `'-'` para sequências (`['G','D']` → `g-d`). Retorna `ShortcutsConfig`.

## useScrollShadow

Fade shadow nas bordas de elemento scrollável (indica mais conteúdo). Usa CSS `mask-image` (funciona em qualquer fundo). Detecta overflow automaticamente.

```vue
<script setup lang="ts">
const el = useTemplateRef('el')
const { style } = useScrollShadow(el, { orientation: 'horizontal', size: 48 })
</script>

<template>
  <div ref="el" :style="style" class="overflow-y-auto">...</div>
</template>
```

`useScrollShadow(element, options?)`. Options: `size` (px), `orientation` (`vertical`/`horizontal`). Retorna: `style` (bind em `:style`, `maskImage` quando ativo), `isOverflowing`, `arrivedState` ({top,bottom,left,right}).

## useTour

Tour guiado com um único Popover que re-ancora entre steps. Composable é dono do estado; você controla o conteúdo.

```vue
<script setup lang="ts">
const card = useTemplateRef('card')
const tour = useTour([
  { target: '#cta', title: 'Get started' },
  { target: () => card.value, title: 'Profile', side: 'right' },
  { target: null, title: 'All set' }  // null = centro do viewport
])
</script>

<template>
  <UButton @click="tour.start()">Start tour</UButton>
  <UPopover :open="tour.open.value" :reference="tour.reference.value" :dismissible="false">
    <template #content>
      <p>{{ tour.current.value?.title }} — {{ tour.index.value + 1 }} / {{ tour.total.value }}</p>
      <UButton :disabled="!tour.hasPrev.value" @click="tour.prev()">Back</UButton>
      <UButton @click="tour.next()">{{ tour.hasNext.value ? 'Next' : 'Finish' }}</UButton>
    </template>
  </UPopover>
</template>
```

`useTour(steps: MaybeRefOrGetter<TourStep[]>, options?)`. `target`: CSS selector, elemento, virtual element (`getBoundingClientRect`), ref/getter, ou `null` (centro). Campos extras (`title`, `body`, `side`...) passam via `current`. Options: `initial` (index inicial), `loop`, `scrollIntoView`.

Return: `open`, `index`, `current`, `reference` (p/ `<UPopover :reference>`), `total`, `hasNext`, `hasPrev`; métodos `start(index?)`, `next()`, `prev()`, `goTo(index)`, `finish()`.

## Referência

- https://ui.nuxt.com/docs/composables/use-toast
- https://ui.nuxt.com/docs/composables/use-overlay
- https://ui.nuxt.com/docs/composables/define-shortcuts
- https://ui.nuxt.com/docs/composables/extract-shortcuts
- https://ui.nuxt.com/docs/composables/use-scroll-shadow
- https://ui.nuxt.com/docs/composables/use-tour
