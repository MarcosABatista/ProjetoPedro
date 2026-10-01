---
inclusion: fileMatch
fileMatchPattern: ["app/**/*.vue", "server/**/*.ts", "app/composables/**/*.ts"]
name: Nuxt Request & SSR Composables
description: Use no SSR para acessar o request event, headers de entrada, URL, definir headers de resposta e controlar preview mode. No browser retornam vazio/undefined.
---
# Nuxt v4 — Request & SSR Composables

Server-side. No browser retornam vazio/`undefined`. Chamar no Nuxt context.

## useRequestEvent
Retorna o request event (h3) da requisição de entrada. Browser → `undefined`.
```ts
const event = useRequestEvent()
const url = event?.path
```

## useRequestHeader
Acessa um header específico de entrada (helper de conveniência sobre useRequestHeaders). Browser → `undefined`.
```ts
function useRequestHeader(header: string): string | undefined
```
```ts
const authorization = useRequestHeader('authorization')
```

## useRequestHeaders
Acessa headers de entrada. Sem args → todos; com array → só os listados. Browser → `{}`.
```ts
const headers = useRequestHeaders()
const { cookie } = useRequestHeaders(['cookie'])
```
Uso comum: proxy de `authorization` em `$fetch`/`useFetch` isomórfico durante SSR.
```vue
<script setup lang="ts">
const { data } = await useFetch('/api/confidential', { headers: useRequestHeaders(['authorization']) })
</script>
```

## useRequestURL
Retorna a URL da request como objeto `URL` (WHATWG), acessível em server e client. Útil p/ canonical/absolute URLs.
```ts
function useRequestURL(): URL
```
```vue
<script setup lang="ts">
const url = useRequestURL()
// url.href, url.origin, url.pathname, url.searchParams.get('q')
useSeoMeta({ ogUrl: () => url.href })
</script>
```

## useResponseHeader
Define/atualiza um header da resposta HTTP durante SSR. Retorna um ref cujo valor é escrito no header. Sem efeito no client.
```ts
function useResponseHeader(name: string, value?: string): Ref<string | null>
```
```vue
<script setup lang="ts">
const header = useResponseHeader('X-My-Header')
header.value = 'my-value'
// ou direto:
useResponseHeader('Cache-Control', 'no-cache')
</script>
```

## usePreviewMode
Detecta/controla preview mode. Ao detectar, força rerender de `useAsyncData`/`useFetch` p/ conteúdo de preview.
```ts
const { enabled, state } = usePreviewMode()
```
Default: habilita se query `?preview=true`. Guarda param `token` em `state`.
Options:
- `shouldEnable: () => boolean` — check custom (envolver em composable p/ consistência)
- `getState: (currentState) => object` — anexa valores ao state (cuidado p/ não sobrescrever)
- `onEnable` / `onDisable` — callbacks custom (default chama `refreshNuxtData()`; onDisable roda após próxima navegação)
```ts
export function useMyPreviewMode () {
  const route = useRoute()
  return usePreviewMode({ shouldEnable: () => !!route.query.customPreview })
}
```
```vue
<script setup>
const { enabled, state } = usePreviewMode()
const { data } = await useFetch('/api/preview', { query: { apiKey: state.token } })
</script>
<template>
  <p v-if="enabled">Preview: {{ state.token }} <button @click="enabled = false">disable</button></p>
</template>
```
Gotcha: testar com `nuxt generate` + `nuxt preview`, NÃO `nuxt dev`. (comando `preview` não tem relação com preview mode.)

## Referência

- [useRequestEvent](https://nuxt.com/docs/4.x/api/composables/use-request-event)
- [useRequestHeader](https://nuxt.com/docs/4.x/api/composables/use-request-header)
- [useRequestHeaders](https://nuxt.com/docs/4.x/api/composables/use-request-headers)
- [useRequestURL](https://nuxt.com/docs/4.x/api/composables/use-request-url)
- [useResponseHeader](https://nuxt.com/docs/4.x/api/composables/use-response-header)
- [usePreviewMode](https://nuxt.com/docs/4.x/api/composables/use-preview-mode)
