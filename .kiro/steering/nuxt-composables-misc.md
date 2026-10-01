---
inclusion: fileMatch
fileMatchPattern: ["app/**/*.vue"]
name: Nuxt Error, Loading, A11y & Layout Composables
description: Use ao acessar o erro global (useError), controlar o indicador de loading (useLoadingIndicator), anunciar mudanças p/ leitores de tela (useAnnouncer, useRouteAnnouncer) e resolver o layout atual (useLayout).
---
# Nuxt v4 — Error, Loading, Accessibility & Layout

## useError
Retorna o erro global Nuxt sendo tratado (reativo, SSR-friendly, client+server).
```ts
interface NuxtError<DataT = unknown> {
  status: number
  statusText?: string
  message: string
  data?: DataT
  cause?: unknown
  fatal: boolean
}
const useError: () => Ref<NuxtError | undefined>
```
```vue
<script setup lang="ts">
const error = useError()
if (error.value) console.error('Nuxt error:', error.value)
</script>
```
Relacionados (utils): `createError`, `showError`, `clearError`.

## useLoadingIndicator
Estado de loading da página. Usado por `<NuxtLoadingIndicator>`. Engancha em `page:loading:start`/`page:loading:end`.
```ts
useLoadingIndicator(opts?: {
  duration?: number          // ms, default 2000
  throttle?: number          // ms, default 200
  estimatedProgress?: (duration: number, elapsed: number) => number  // 0..100
})
```
Props (readonly shallow refs): `isLoading: boolean`, `error: boolean`, `progress: number` (0–100).
Métodos:
- `start(opts?)` — isLoading=true, começa progress. `{ force: true }` mostra imediato (pula throttle).
- `set(value, opts?)` — define progress. `{ force: true }` idem.
- `finish(opts?)` — progress=100, para timers, reseta após 500ms. `{ force: true }` pula intervalo; `{ error: true }` cor de erro + `error=true`.
- `clear()` — limpa timers (usado por finish).
```vue
<script setup lang="ts">
const { progress, isLoading, start, finish } = useLoadingIndicator()
start({ force: true }) // = set(0,{force:true}): progress 0 + loading imediato
</script>
```

## useAnnouncer (v4.4.2+)
Anúncios manuais de mudanças dinâmicas in-page p/ leitores de tela (validação, toasts, loading, live content). Requer `<NuxtAnnouncer>` no app.
```ts
useAnnouncer(opts?: { politeness?: 'off' | 'polite' | 'assertive' })  // default 'polite'
```
Props: `message: Ref<string>`, `politeness: Ref<'polite'|'assertive'|'off'>`.
Métodos: `set(message, politeness='polite')`, `polite(message)` (não-urgente, espera), `assertive(message)` (urgente, interrompe).
```vue
<script setup lang="ts">
const { polite, assertive } = useAnnouncer()
async function submit () {
  try { await $fetch('/api/contact', { method: 'POST', body }); polite('Message sent') }
  catch { assertive('Error: failed to send') }
}
// watch status de useFetch, resultados de busca, etc.
</script>
```

## useRouteAnnouncer (v3.12+)
Observa mudanças no título da página e atualiza a mensagem do announcer automaticamente (mudanças de rota). Usado por `<NuxtRouteAnnouncer>`. Hook Unhead `dom:rendered`.
```ts
useRouteAnnouncer(opts?: { politeness?: 'off' | 'polite' | 'assertive' })  // default 'polite'
```
Props: `message: Ref<string>`, `politeness: Ref<string>`.
Métodos: `set(message, politeness='polite')`, `polite(message)`, `assertive(message)`.
```vue
<script setup lang="ts">
const { message, set, assertive } = useRouteAnnouncer({ politeness: 'assertive' })
</script>
```
Diferença: `useRouteAnnouncer` = automático p/ rota; `useAnnouncer` = manual p/ conteúdo in-page.

## useLayout
Computed ref (readonly) com o layout resolvido p/ a rota atual — mesma cadeia do `<NuxtLayout>`: meta `layout` da página → `appLayout` de route rules → `'default'`. Retorna `string` ou `false` (layout desativado).
```ts
function useLayout(): ComputedRef<string | false>
```
```vue
<script setup lang="ts">
const layout = useLayout()
</script>
<template>
  <CommandPalette v-if="layout !== 'minimal'" />
  <NuxtLayout><NuxtPage /></NuxtLayout>
</template>
```
Vantagem sobre `route.meta.layout`: considera layout de route rules e mantém sync na mudança de rota.

## Referência

- [useError](https://nuxt.com/docs/4.x/api/composables/use-error)
- [useLoadingIndicator](https://nuxt.com/docs/4.x/api/composables/use-loading-indicator)
- [useAnnouncer](https://nuxt.com/docs/4.x/api/composables/use-announcer)
- [useRouteAnnouncer](https://nuxt.com/docs/4.x/api/composables/use-route-announcer)
- [useLayout](https://nuxt.com/docs/4.x/api/composables/use-layout)
