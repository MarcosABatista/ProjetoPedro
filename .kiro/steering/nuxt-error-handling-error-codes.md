---
inclusion: auto
name: nuxt-error-codes
description: Referência de códigos de erro Nuxt v4 (NUXT_Bxxxx build / NUXT_Exxxx runtime). Diagnóstico rápido — código, causa e fix. Consultar ao encontrar erro NUXT_ no build ou runtime.
---
# Nuxt v4 — Códigos de Erro

Prefixo `NUXT_`. `Bxxxx` = build/config. `Exxxx` = runtime (E1xxx contexto, E2xxx navegação/middleware, E3xxx data fetching, E4xxx components/pages, E5xxx manifest, E6xxx head, E7xxx state/payload, E8xxx features).

## Build / Config (B*)

| Código | Causa | Fix |
|--------|-------|-----|
| B5001 | Sem `compatibilityDate` no config. Nuxt usa a data p/ decidir defaults e manter estabilidade entre versões. | Adicionar `compatibilityDate: 'YYYY-MM-DD'` (data de hoje) em `nuxt.config`. |
| B5003 | Keys custom sob `runtimeConfig.app` — namespace reservado do Nuxt (`baseURL`, `cdnURL`), risco de colisão. | Mover p/ `runtimeConfig.public` (client) ou namespace top-level custom (server-only). |
| B5004 | Arquivo `vite.config`/`webpack.config`/`nitro.config`/`postcss.config` standalone ao lado do `nuxt.config` (ignorado; sobra de migração). | Mover config p/ a key correspondente no `nuxt.config` (`vite`/`webpack`/`nitro`/`postcss`) e deletar o arquivo externo. |

## Runtime — Contexto (E1*)

| Código | Causa | Fix |
|--------|-------|-----|
| E1001 | Composable que precisa da instância Nuxt (`useNuxtApp`, `useRoute`, `useFetch`…) chamado fora de plugin/hook/middleware/`setup()`. Comum: em callback async (`setTimeout`, `.then()`, após `await`) que perdeu o contexto. | Chamar sincronamente no topo de `setup()`/plugin/middleware e reusar o resultado. Async no server: envolver com `nuxtApp.runWithContext()`. |
| E1006 | `onPrehydrate()` rodou sem transformação do build pipeline (precisa de processamento em compile-time, só server). Ocorre quando chamado de dependência não transpilada. | Adicionar a lib ao `build.transpile` no `nuxt.config.ts`. |
| E1007 | Macro compile-time (ex: `definePageMeta()`) executada em runtime. É apagada pelo build, não roda dinamicamente. Comum: chamada dentro de composable ou componente não-page. | Chamar só no top-level do `<script setup>` de uma **page**. Não usar em composables/condicionais/componentes não-page. |

## Runtime — Navegação / Middleware (E2*)

| Código | Causa | Fix |
|--------|-------|-----|
| E2001 | `navigateTo()` recebeu URL externa sem `{ external: true }`. Opt-in explícito exigido. | `navigateTo('https://example.com', { external: true })`. |
| E2002 | `navigateTo()` com protocolo perigoso (`javascript:`, `data:`, `vbscript:`) — bloqueado p/ prevenir XSS. Quase sempre input de usuário não sanitizado. | Validar/sanitizar URLs de usuário; permitir só `http:`, `https:` ou caminhos relativos. |
| E2003 | `abortNavigation()` chamado fora de route middleware. Só cancela navegação dentro de handler de middleware. | Mover a chamada p/ o corpo de um `defineNuxtRouteMiddleware()`. |
| E2004 | Route middleware referenciado (via `definePageMeta({ middleware:[...] })`) mas nome não existe. Typo ou arquivo renomeado/deletado. | Garantir que o nome casa com arquivo em `middleware/`. Nome derivado do filename: `middleware/auth.ts` → `auth`. |
| E2005 | `useRoute()` chamado dentro de route middleware (direto ou via composable). Rota alvo ainda não resolvida → valores inesperados. | Usar os args `to`/`from` do `defineNuxtRouteMiddleware((to, from) => {})`. |
| E2007 | `setPageLayout()` chamado do `setup()` de um componente durante SSR. No server o layout deve ser decidido antes de renderizar. | Definir layout via route middleware ou estático: `definePageMeta({ layout: '...' })`. |

## Runtime — Data Fetching (E3*)

| Código | Causa | Fix |
|--------|-------|-----|
| E3001 | URL do `useFetch()` começa com `//` (protocol-relative → host externo). Rejeitado p/ evitar vazar requests p/ outra origem. | Usar URL absoluta com protocolo explícito ou caminho relativo: `useFetch('/api/data')`. |
| E3008 | `useAsyncData()` sem key válida. 1º arg deve ser string não-vazia (cache/dedupe entre componentes). | `useAsyncData('users', () => $fetch('/api/users'))`. |
| E3009 | `useAsyncData()` sem função handler (função que faz o fetch e retorna dados). | `useAsyncData('users', () => $fetch('/api/users'))`. |

## Runtime — Components / Pages (E4*)

| Código | Causa | Fix |
|--------|-------|-----|
| E4012 | Nuxt não conseguiu parsear a resposta de um server component (island) — endpoint retornou algo diferente do payload esperado (página de erro, HTML malformado). | Corrigir erros no server component; conferir que o endpoint do island retorna resposta válida. Inspecionar a network response do island. |
| E4016 | Rota casa página nested mas o componente pai não renderiza `<NuxtPage />` (ex: `parent.vue` sem outlet p/ `parent/child.vue`). | Adicionar `<NuxtPage />` ao componente pai. Se não era intencional, reestruturar `pages/` p/ a página não ter rotas filhas. |

## Runtime — Manifest (E5*)

| Código | Causa | Fix |
|--------|-------|-----|
| E5001 | Código depende do app manifest com `experimental.appManifest` desabilitado (manifest habilita route rules matching e detecção de payload prerenderizado no client). | Habilitar: `experimental: { appManifest: true }` no `nuxt.config`. |

## Runtime — Head (E6*)

| Código | Causa | Fix |
|--------|-------|-----|
| E6001 | Composable de head (`useHead()`…) chamado sem instância Unhead ativa — fora de contexto Nuxt válido (ex: callback async detached). | Chamar sincronamente em `setup()`/plugin/middleware. Após `await`: `const nuxtApp = useNuxtApp(); nuxtApp.runWithContext(() => useHead({...}))`. |

## Runtime — State / Payload (E7*)

| Código | Causa | Fix |
|--------|-------|-----|
| E7001 | URL de payload requisitada com hostname completo. Payloads sempre servidos da mesma origem. | Passar caminho relativo: `loadPayload('/some-page')`. |
| E7007 | `useState()` recebeu valor inicial que não é função. Initializer deve ser função (roda 1x no server, resultado serializado no payload). | `useState('counter', () => 0)`. |
| E7008 | `callOnce()` recebeu `fn` que não é função. | `await callOnce('setup', () => { /* runs once */ })`. |
| E7009 | `useState()` com key que não é string. Key identifica o state compartilhado e no payload. | `useState('counter', () => 0)` (key = string não-vazia). |
| E7010 | `callOnce()` com key que não é string (usada p/ rastrear se já rodou). | `await callOnce('setup', () => {})` (key = string não-vazia). |

## Runtime — Features (E8*)

| Código | Causa | Fix |
|--------|-------|-----|
| E8007 | Rota depende de JS client-side mas `features.noScripts: 'production'` (default quando noScripts ativo) tira scripts só em produção — quebra silenciosa pós-deploy (lazy hydration, `nuxt-client` em server components). Warning emitido em dev. | Remover a dependência client-side da rota, OU escopar via route rule `'/static/**': { noScripts: true }` (aplica em dev também), OU `features.noScripts: 'all'` p/ tornar o comportamento visível em dev. |

## Referência

- [Errors (códigos NUXT_)](https://nuxt.com/docs/4.x/errors) — doc oficial Nuxt v4; referência de diagnóstico dos códigos de erro `NUXT_*`
