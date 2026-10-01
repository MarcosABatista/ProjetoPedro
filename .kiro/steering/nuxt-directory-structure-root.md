---
inclusion: fileMatch
fileMatchPattern: ["nuxt.config.ts", ".env", "tsconfig.json", "package.json", "server/**", "shared/**", "modules/**"]
name: nuxt-dir-root
description: Arquivos/pastas na raiz do projeto Nuxt v4 — nuxt.config, .nuxtrc, .nuxtignore, .env, tsconfig, package.json, .gitignore e diretórios server, shared, public, modules, layers, content, test, .nuxt, .output, node_modules.
---
# Nuxt v4 — Raiz do projeto e arquivos de config

Raiz = diretório com `nuxt.config.ts`. Abaixo: arquivos de config e diretórios fora de `app/`.

## `nuxt.config.ts`
Config principal. Extensões `.js .ts .mjs`. `defineNuxtConfig` global (ou `import { defineNuxtConfig } from 'nuxt/config'`).
```ts [nuxt.config.ts]
export default defineNuxtConfig({ /* config */ })
```
Restart completo ao mudar este arquivo, `.env`, `.nuxtignore`, `.nuxtrc`.

## `.nuxtrc`
Config flat (baseada em unjs/rc9). Avançado → use `nuxt.config`.
```bash [.nuxtrc]
ssr=false
devtools.enabled=true
modules[]=@nuxt/image
```
`nuxt.config` sobrescreve `.nuxtrc`. Nuxt adiciona seção `setups` (não editar). Global: `~/.nuxtrc` (projeto sobrescreve global; config sobrescreve ambos).

## `.nuxtignore`
Ignora arquivos do `rootDir` na fase de build. Mesma spec de `.gitignore` (glob por linha, `!` nega).
```bash [.nuxtignore]
app/layouts/*-ignore.vue
app/pages/bar.vue
!app/middleware/foo/bar.js
```
Também: `ignore`, `ignoreOptions`, `ignorePrefix` no config.

## `.env`
Variáveis build/dev-time (via c12). Carregado em dev, `nuxt build`, `nuxt generate`. Acessível em `nuxt.config`/módulos. **Adicionar ao .gitignore** (segredos).
```ini [.env]
MY_ENV_VARIABLE=hello
```
Arquivo custom: `nuxt dev --dotenv .env.local`. No código use **Runtime Config**, não env plano.
**Produção**: `.env` NÃO é lido — setar env pelo host (CLI/dashboard/shell). `runtimeConfig` só pega vars prefixadas `NUXT_` em produção. Preview local: `nuxt preview` carrega `.env` em `process.env`. Site estático: não dá p/ setar runtime config pós-prerender.

## `tsconfig.json`
Nuxt gera `.nuxt/tsconfig.{app,server,node,shared}.json`. `tsconfig.json` raiz só referencia:
```json [tsconfig.json]
{ "files": [], "references": [
  { "path": "./.nuxt/tsconfig.app.json" },
  { "path": "./.nuxt/tsconfig.server.json" },
  { "path": "./.nuxt/tsconfig.shared.json" },
  { "path": "./.nuxt/tsconfig.node.json" }
] }
```
Não editar direto; estender via `nuxt.config`: `typescript.tsConfig` (compartilhado) + `appTsConfig`/`sharedTsConfig`/`nodeTsConfig`/`serverTsConfig` (por contexto). DOM/Vue opts (`lib`,`jsx`) só no app. `types`/`paths`/`noEmit` gerenciados por contexto. `serverTsConfig` ≡ `nitro.typescript.tsConfig`.

## `package.json`
```json [package.json]
{ "name":"nuxt-app", "private":true, "type":"module",
  "scripts": { "build":"nuxt build","dev":"nuxt dev","generate":"nuxt generate","preview":"nuxt preview","postinstall":"nuxt prepare" },
  "dependencies": { "nuxt":"latest","vue":"latest","vue-router":"latest" } }
```

## `.gitignore` (mínimo recomendado)
```bash [.gitignore]
.output
.data
.nuxt
.nitro
.cache
dist
node_modules
logs
*.log
.DS_Store
.env
.env.*
!.env.example
```

## `server/` — API e handlers Nitro
Scan automático com HMR. Cada arquivo exporta default `defineEventHandler()` (alias `eventHandler`). Retorna JSON, Promise ou usa `event.node.res.end()`. **Não importar código Vue no server** (nem server-only no app).
```bash
server/
  api/hello.ts      # /api/hello  (prefixo /api)
  routes/bonjour.ts # /bonjour    (sem prefixo)
  middleware/log.ts # roda toda request
  plugins/...       # Nitro plugins (defineNitroPlugin)
  utils/...         # auto-import no server
  types/...         # auto-import só server (top-level)
```
- **HTTP method**: sufixo `.get`/`.post`/`.put`/`.delete` (`test.get.ts`). Outro método → 405. `index.[method].ts` p/ namespaces.
- **Params**: `[name].ts` → `getRouterParam(event,'name')`. Catch-all: `[...slug].ts` → `event.context.params.slug`.
- **Body**: `await readBody(event)` (GET com readBody → 405). Query: `getQuery(event)`. Prefira `getValidatedRouterParams`/`readValidatedBody`/`getValidatedQuery` com Zod/Valibot.
- **Erro**: `throw createError({ status:400, statusText:'...' })`. Uncaught → 500. Status: `setResponseStatus(event, 202)`.
- **Middleware**: só inspeciona/estende contexto ou lança erro; não retorna/responde. `event.context.auth = {...}`.
- **Runtime config**: `useRuntimeConfig(event)`. Cookies: `parseCookies(event)`. Forward: `event.$fetch(...)`. Background: `event.waitUntil(promise)`.
- **`#server` alias** (v4.3): importar de qualquer lugar dentro de `server/` (só dentro de server/).
- Avançado: `nitro:{}` no config, nested router (h3 `createRouter`+`useBase`), `sendStream`, `sendRedirect`, `fromNodeMiddleware` (legacy), storage (`nitro.storage` ou plugin + `useStorage`).
- Chamar no app: `const { data } = await useFetch('/api/hello')`.

## `shared/` — código app + Nitro (v3.14+)
Usado nos dois bundles → **não pode importar código Vue nem Nitro**. Só `shared/utils/` e `shared/types/` auto-importados (top-level). Outros: alias `#shared` (`import x from '#shared/formatters/lower'`).
```ts [shared/utils/capitalize.ts]
export const capitalize = (i: string) => i[0] ? i[0].toUpperCase()+i.slice(1) : ''
```
Tipos compartilhados → `shared/types/`. `import type` é apagado em compile mas ainda prefira `shared/types/`. Só-app → `app/types/`; só-server → `server/types/`.

## `public/` — estáticos servidos na raiz
Não processados pelo build. Servidos em `/`. Ideal p/ `robots.txt`, `favicon.ico`, `og-image.png`. (Era `static/` no Nuxt 2.)
```bash
public/
  favicon.ico
  robots.txt
```

## `modules/` — módulos locais (auto-registrados)
Patterns: `modules/*/index.ts`, `modules/*.ts`. Não adicionar ao config.
```ts [modules/hello/index.ts]
import { addServerHandler, createResolver, defineNuxtModule } from 'nuxt/kit'
export default defineNuxtModule({
  meta: { name: 'hello' },
  setup () {
    const resolver = createResolver(import.meta.url)
    addServerHandler({ route: '/api/hello', handler: resolver.resolve('./runtime/api-route') })
  },
})
```
Arquivos runtime do módulo em `modules/<mod>/runtime/app/...` (p/ type-check). Ordem: módulos do config primeiro, depois `modules/` em ordem alfabética (prefixe `1.`,`2.`). Use `nuxt/kit` (não precisa `@nuxt/kit` nas deps).

## `layers/` — layers locais (auto-registro, v3.12+)
Cada subpasta = 1 layer; **deve ter `nuxt.config.ts`** (mesmo vazio). Estrutura igual a app Nuxt. Ideal p/ DDD, UI libs, presets.
Aliases auto: `#layers/[name]` (`import { useAdmin } from '#layers/admin/composables/useAdmin'`, v3.16+).
Conteúdo: `nuxt.config.ts`, `app.config.ts`, `app/components|composables|utils|pages|layouts|middleware|plugins`, `server/`, `shared/`.
**Prioridade**: mesma resource → layer de maior prioridade vence. Ordem alfabética, letras finais = maior prioridade (Z>A). Controlar: prefixo numérico (`1.base/`) ou `extends: ['~~/layers/admin','~~/layers/base']` (primeiro = maior prioridade).

## `content/` — CMS file-based (módulo @nuxt/content)
Parseia `.md .yml .csv .json`. Query MongoDB-like, MDC syntax, navegação auto. Instalar: `npx nuxt module add content`.
Render via catch-all + `<ContentRenderer>`:
```vue [app/pages/[...slug].vue]
<script setup lang="ts">
const route = useRoute()
const { data: page } = await useAsyncData(route.path, () =>
  queryCollection('content').path(route.path).first())
</script>
<template><ContentRenderer v-if="page" :value="page" /></template>
```

## `test/` — testes (não escaneado pelo Nuxt)
Você escolhe runner/layout (tipicamente `@nuxt/test-utils`). Layout comum: `test/unit/` (Node puro), `test/nuxt/` (runtime Nuxt), `test/e2e/`.

## Diretórios gerados (adicionar ao .gitignore, não editar)
- **`.nuxt/`** — build dev + VFS (recriado a cada `nuxt dev`; inspecionar via DevTools → Virtual Files).
- **`.output/`** — build de produção (recriado a cada `nuxt build`; usar p/ deploy).
- **`node_modules/`** — deps do package manager (npm/yarn/pnpm/bun/deno).

## Referência

- [nuxt.config.ts](https://nuxt.com/docs/4.x/directory-structure/nuxt-config) — doc oficial Nuxt v4
- [.env](https://nuxt.com/docs/4.x/directory-structure/env) — doc oficial Nuxt v4
- [.gitignore](https://nuxt.com/docs/4.x/directory-structure/gitignore) — doc oficial Nuxt v4
- [layers/](https://nuxt.com/docs/4.x/directory-structure/layers) — doc oficial Nuxt v4
- [modules/](https://nuxt.com/docs/4.x/directory-structure/modules) — doc oficial Nuxt v4
- [server/](https://nuxt.com/docs/4.x/directory-structure/server) — doc oficial Nuxt v4
- [shared/](https://nuxt.com/docs/4.x/directory-structure/shared) — doc oficial Nuxt v4
- [public/](https://nuxt.com/docs/4.x/directory-structure/public) — doc oficial Nuxt v4
- [test/](https://nuxt.com/docs/4.x/directory-structure/test) — doc oficial Nuxt v4
- [tsconfig.json](https://nuxt.com/docs/4.x/directory-structure/tsconfig) — doc oficial Nuxt v4
- [package.json](https://nuxt.com/docs/4.x/directory-structure/package) — doc oficial Nuxt v4
