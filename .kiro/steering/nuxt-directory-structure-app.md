---
inclusion: fileMatch
fileMatchPattern: ["app/**"]
name: nuxt-dir-app
description: Estrutura do app/ Nuxt v4 — app.vue, pages, layouts, components, composables, utils, middleware, plugins, assets, error.vue, app.config.ts. Convenções de auto-import, roteamento file-based, hidratação lazy.
---
# Nuxt v4 — Diretório `app/`

Raiz do projeto = pasta com `nuxt.config.ts`. `app/` = diretório principal da app Vue. Subpastas e arquivos abaixo.

## Visão geral `app/`
- `assets/` — assets processados pelo build (Vite/webpack): CSS/SASS, fontes, imagens não-públicas.
- `components/` — componentes Vue (auto-import).
- `composables/` — composables Vue (auto-import).
- `layouts/` — wrappers de página reutilizáveis.
- `middleware/` — código rodado antes de navegar para rota.
- `pages/` — roteamento file-based.
- `plugins/` — plugins Vue/Nuxt, rodados na criação da app.
- `utils/` — funções utilitárias (auto-import).
- `app.config.ts` — config reativa (cliente-exposta).
- `app.vue` — componente raiz.
- `error.vue` — página de erro.

## `app.vue`
Componente principal. Opcional se existe `app/pages/` (Nuxt injeta default). JS/CSS aqui = global.
```vue [app/app.vue]
<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
```
Sem `pages/` → sem dependência `vue-router` (útil p/ landing).

## `pages/` — roteamento file-based
Opcional (sem ela, `vue-router` não é incluído). Forçar: `pages: true` no config ou ter `router.options.ts`. Extensões: `.vue .js .jsx .mjs .ts .tsx`.
`pages/index.vue` → `/`. Página **deve ter único elemento raiz** (comentário HTML conta como elemento) senão transição client-side falha.

- **Rota dinâmica**: `[id].vue` → `route.params.id`. Opcional: `[[slug]].vue` casa `/` e `/x`. Misturáveis: `users-[group]/[id].vue`.
- **Catch-all**: `[...slug].vue` → `route.params.slug` = array.
- **Nested**: `parent.vue` + `parent/child.vue`; pai usa `<NuxtPage>` p/ renderizar filho.
- **Named views** (v4.5): `child@sidebar.vue` renderiza em `<NuxtPage name="sidebar" />`. `definePageMeta` só lido do arquivo default.
- **Route groups**: pasta `(marketing)/` não afeta URL. Acessível via `route.meta.groups` (v4.3).

Acesso: `const route = useRoute()` (nunca use `useRoute()` em middleware).

### `definePageMeta` (compiler macro)
Não referencia dados reativos/componente; só imports e funções puras.
```vue
<script setup lang="ts">
definePageMeta({ title: 'Home', layout: 'custom', middleware: ['auth'] })
</script>
```
Chaves especiais: `alias`, `keepalive`, `key`, `layout` (false p/ desabilitar), `layoutTransition`/`pageTransition`, `middleware`, `name`, `path`, `props`.
Tipar custom: augment `interface PageMeta` em `declare module '#app'`.

### Navegação
- `<NuxtLink to="/">` (auto-import).
- Programática: `await navigateTo({ path:'/search', query:{...} })` — sempre `await`/return.
- `.client.vue` → página só cliente. `.server.vue` → server component (não vai ao bundle client). Ambos: single root element.

## `layouts/`
Habilitar com `<NuxtLayout>` em `app.vue`. Default: `layouts/default.vue`. Conteúdo da página vai no `<slot />`. Layout **deve ter único elemento raiz** (não pode ser `<slot/>`).
Nome normalizado kebab-case; nested remove segmentos duplicados (`layouts/desktop/default.vue` → `desktop-default`).
- Usar: `definePageMeta({ layout: 'custom' })`, ou `<NuxtLayout :name="layout">`, ou route rules `appLayout` (v4.3): `routeRules: { '/admin': { appLayout:'admin' }, '/landing': { appLayout:false } }`.
- Dinâmico: `setPageLayout('custom')`.
- Props p/ layout (+4.4): `layout: { name:'panel', props:{ sidebar:true } }` ou `setPageLayout('panel', { sidebar:true })`. Tipadas via `defineProps` do layout.
- Se só 1 layout → prefira `app.vue`.

## `components/` — auto-import
Nome = path + filename com segmentos duplicados removidos: `base/foo/Button.vue` → `<BaseFooButton>`. Agrupar sem afetar nome: `(foo)/`. `pathPrefix:false` → nome só por filename.
- **Dinâmico**: `resolveComponent('MyButton')` (string literal estática) ou `import { X } from '#components'`.
- **Global**: pasta `components/global/` ou sufixo `.global.vue` (chunk separado — não abusar).
- **Lazy**: prefixo `Lazy` → `<LazyMountainsList v-if="show" />`.
- **Client-only**: `.client.vue` (renderiza só após mount; use `await nextTick()` em `onMounted`).
- **Server/Islands**: `.server.vue` (não vai ao bundle client; single root). Par `.client`+`.server` = duas metades.
- Custom dirs / npm: config `components: [{ path, pathPrefix, prefix, extensions, pattern, ignore }]` (nested primeiro, `~/components` por último). Módulos: `addComponent`/`addComponentsDir`.

### Hidratação lazy (delayed)
Só 1 estratégia por componente lazy. Mudança de prop hidrata imediatamente. Só em SFCs, prop no template (não `v-bind` spread), não com import direto de `#components`.
Estratégias: `hydrate-on-visible`, `hydrate-on-idle`, `hydrate-on-interaction="mouseover"` (default pointerenter/click/focus), `hydrate-on-media-query="(max-width:768px)"`, `:hydrate-after="2000"`, `:hydrate-when="isReady"`, `hydrate-never`. Evento `@hydrated`.
Não usar em conteúdo above-the-fold crítico.

## `composables/` — auto-import
Named ou default export. Nome = camelCase do filename. Só top-level scanned (nested não; re-exporte em `index.ts` ou config `imports.dirs`).
```ts [app/composables/useFoo.ts]
export const useFoo = () => useState('foo', () => 'bar')
```
Tipos em `.nuxt/imports.d.ts` (rode `nuxt prepare`/`dev`/`build`). Sem reatividade extra — use Composition API.

## `utils/` — auto-import
Igual `composables/` (scan idêntico). Distinção semântica: utils = funções não-composable. Só Vue app (`server/utils` é separado). Tipos: `app/types/` (app), `server/types/` (server), `shared/types/` (ambos).

## `middleware/` — route middleware
3 tipos: anônimo (inline em `definePageMeta`), nomeado (`middleware/auth.ts`, lazy), global (`.global.ts`, toda navegação). Nome kebab-case. Só top-level/index scanned. Diferente de server middleware (Nitro).
```ts [middleware/my.ts]
export default defineNuxtRouteMiddleware((to, from) => {
  if (to.path !== '/') return navigateTo('/')
})
```
Retornos: nada = segue; `navigateTo('/')` (302, ou `{ redirectCode:301 }`); `abortNavigation()`/`abortNavigation(error)`. Sem `next()`.
**Ordem**: global (alfabética por filename; prefixe `01.`,`02.`) → inline → nomeados. SSR: middleware inicial roda no server E de novo no client (skip via `import.meta.server`/`client`/`isHydrating`). Sempre use params `to`/`from`, nunca `useRoute()`. Dinâmico: `addRouteMiddleware(name, fn, { global:true })` em plugin. Build-time: hook `pages:extend`.

## `plugins/` — auto-registrados
Só top-level/index scanned. Sufixo `.server`/`.client`. Único arg: `nuxtApp`.
```ts [plugins/hello.ts]
export default defineNuxtPlugin((nuxtApp) => { /* ... */ })
```
- **Object syntax**: `{ name, enforce:'pre'|'post', async setup(nuxtApp){}, hooks:{}, env:{ islands:true } }` — estática, não definir em runtime.
- **Ordem**: prefixo numérico (`01.`,`02.`). `parallel:true` não bloqueia próximo. `dependsOn:['my-plugin']` espera outro.
- **Provide helper**: `return { provide:{ hello:(m)=>`Hello ${m}!` } }` → `$hello` em `useNuxtApp()`. Preferir composables. Ref/computed provido NÃO é unwrapped no template.
- Composables que dependem de plugin posterior ou do lifecycle Vue não funcionam.
- Tipar: augment `interface NuxtApp` em `#app` e `ComponentCustomProperties` em `vue`.
- Vue plugins/diretivas: `nuxtApp.vueApp.use(...)` / `.directive(...)` (diretiva: registrar client E server).

## `assets/`
CSS/SASS, fontes, imagens processadas pelo build. Servir estático não-processado → `public/`.

## `error.vue`
Sobrescreve página de erro. NÃO é rota, não colocar em `pages/`, não usar `definePageMeta`. Pode usar `<NuxtLayout>`. Prop única `error: NuxtError`.
```vue [error.vue]
<script setup lang="ts">
import type { NuxtError } from '#app'
const props = defineProps<{ error: NuxtError }>()
</script>
```
`NuxtError`: `status, fatal, unhandled, statusText?, data?, cause?, statusCode(legacy), statusMessage?(legacy)`. Campos custom → colocar em `data`: `throw createError({ status:404, statusText:'...', data:{...} })`.

## `app.config.ts` — config reativa
```ts [app/app.config.ts]
export default defineAppConfig({ theme: { primaryColor: '#ababab' } })
```
Acesso universal: `const appConfig = useAppConfig()`. Runtime: `updateAppConfig({...})`. **Nunca segredos** (exposto ao client). Com `srcDir` custom, colocar na raiz do novo srcDir.
Tipagem auto-inferida (app code). Em server/shared/nuxt.config keys são `unknown`. Augment `AppConfigInput` (input módulos) ou `AppConfig` (output `useAppConfig`) em `nuxt/schema`. Merge por layers via defu function merger (`array: () => [...]`) só em layers estendidas.
Limitação (Nuxt v3.3+): app.config compartilhado com Nitro — não importar componentes Vue, alguns auto-imports indisponíveis no contexto Nitro.

## Referência

- [Directory Structure](https://nuxt.com/docs/4.x/directory-structure) — doc oficial Nuxt v4
- [app/](https://nuxt.com/docs/4.x/directory-structure/app) — doc oficial Nuxt v4
- [app.config.ts](https://nuxt.com/docs/4.x/directory-structure/app/app-config) — doc oficial Nuxt v4
- [assets/](https://nuxt.com/docs/4.x/directory-structure/app/assets) — doc oficial Nuxt v4
- [components/](https://nuxt.com/docs/4.x/directory-structure/app/components) — doc oficial Nuxt v4
- [composables/](https://nuxt.com/docs/4.x/directory-structure/app/composables) — doc oficial Nuxt v4
- [error.vue](https://nuxt.com/docs/4.x/directory-structure/app/error) — doc oficial Nuxt v4
- [layouts/](https://nuxt.com/docs/4.x/directory-structure/app/layouts) — doc oficial Nuxt v4
- [middleware/](https://nuxt.com/docs/4.x/directory-structure/app/middleware) — doc oficial Nuxt v4
- [pages/](https://nuxt.com/docs/4.x/directory-structure/app/pages) — doc oficial Nuxt v4
- [plugins/](https://nuxt.com/docs/4.x/directory-structure/app/plugins) — doc oficial Nuxt v4
- [utils/](https://nuxt.com/docs/4.x/directory-structure/app/utils) — doc oficial Nuxt v4
