---
inclusion: fileMatch
fileMatchPattern: ["app/**/*.vue", "server/**/*.ts", "app/error.vue"]
name: Nuxt Error Handling Utils
description: Use ao criar/lançar erros com metadata (createError), exibir página de erro full-screen (showError) e limpar erros com redirect (clearError). Em pages, components, plugins e API routes.
---
# Nuxt v4 — Error Handling Utils

Erros ficam em estado via `useError()` (reativo, SSR-friendly). Relacionado: composable `useError()` p/ ler o erro global.

## createError
Cria objeto de erro com metadata; usável em Vue e Nitro; feito para ser **lançado** (`throw`).
```ts
function createError(err: string | Partial<{
  cause: unknown
  data: any
  message: string
  name: string
  stack: string
  status: number       // default 500
  statusText: string
  fatal: boolean
}>): NuxtError
```
String → vira `message`, `status=500`. Objeto → define props.
No app Vue:
- Lançado no server → página de erro full-screen (limpar com `clearError`).
- Lançado no client → erro não-fatal p/ tratar; `fatal: true` força página full-screen.
```vue
<script setup lang="ts">
const route = useRoute()
const { data } = await useFetch(`/api/movies/${route.params.slug}`)
if (!data.value) throw createError({ status: 404, statusText: 'Page Not Found' })
</script>
```
Preservar erro original com `cause`:
```ts
try { await fetchMovie(id) }
catch (cause) { throw createError({ status: 500, message: 'Could not load movie', cause }) }
```
Cause chain exposta na página de erro só em dev (`{ name, message, stack, cause }`); em produção nunca incluída.
Em API routes:
```ts
export default eventHandler(() => { throw createError({ status: 404, statusText: 'Page Not Found' }) })
```
Gotcha API routes: `statusText` curto é acessível no client; `message` NÃO propaga p/ client. Usar `data` p/ enviar dados → no `useFetch` fica em `error.value.data.data`. Nunca colocar input dinâmico do usuário em `message` (segurança).

## showError
Mostra página de erro full-screen de forma rápida. Chamar no Nuxt context.
```ts
function showError(error: string | Error | Partial<{ cause, data, message, name, stack, status, statusText }>): void
```
```ts
showError('😱 Oh no, an error has been thrown.')
showError({ status: 404, statusText: 'Page Not Found' })
```
Seta estado via `useError()`. Chama hook `app:error`. Diferença p/ `createError`: `showError` é imperativo (chamar), `createError` é p/ `throw`.

## clearError
Limpa todos os erros tratados e opcionalmente redireciona.
```ts
function clearError(options?: { redirect?: string }): Promise<void>
```
```ts
clearError()                              // só limpa
clearError({ redirect: '/homepage' })     // limpa + navega p/ página segura
```
Reseta o estado de `useError()` e chama hook `app:error:cleared`. Uso típico: botão "voltar ao início" na `error.vue`.

## Padrão completo (error.vue)
```vue
<script setup lang="ts">
const props = defineProps<{ error: NuxtError }>()
const handleError = () => clearError({ redirect: '/' })
</script>
<template>
  <div>
    <h1>{{ error.statusCode }}</h1>
    <p>{{ error.message }}</p>
    <button @click="handleError">Go Home</button>
  </div>
</template>
```

## Referência

- [createError](https://nuxt.com/docs/4.x/api/utils/create-error)
- [showError](https://nuxt.com/docs/4.x/api/utils/show-error)
- [clearError](https://nuxt.com/docs/4.x/api/utils/clear-error)
