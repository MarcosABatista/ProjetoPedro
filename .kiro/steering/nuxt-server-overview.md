---
inclusion: fileMatch
fileMatchPattern: ["server/**/*.ts"]
name: nuxt-server-overview
description: Nuxt v4 server engine (Nitro/h3) — server/ API endpoints & middleware via defineEventHandler, auto-import/HMR, universal deployment presets, and routeRules hybrid rendering. Use when building API routes, server middleware, or configuring per-route rendering.
---

# Nuxt v4 — Server

Nuxt's server is **Nitro** (UnJS), built on **h3**. Gives full server-side control, universal deployment (15+ zero-config presets), and hybrid rendering.

## Endpoints & Middleware

Define in `server/`. Auto-import + HMR out of the box. Return `text`, `json`, `html`, or a `stream` directly.

```ts [server/api/test.ts]
export default defineEventHandler(async (event) => {
  // ... return data
})
```

- `server/api/*` — API endpoints.
- `server/routes/*` — server routes (non-`/api` prefix).
- `server/middleware/*` — runs on every server request (distinct from Vue route middleware).
- `server/plugins/*` — Nitro plugins (hooks like `render:html`).
- `server/utils/*` — auto-imported server utilities.

Note: Vue route middleware does NOT run for `/api/*` — use server middleware for those.

## Universal deployment

Deploy anywhere (bare metal → edge) with millisecond start. Presets include Cloudflare Workers, Netlify Functions, Vercel; runtimes Deno and Bun.

## Hybrid rendering — routeRules

Customize how each route renders/behaves:

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  routeRules: {
    '/': { prerender: true },                       // SSG at build for SEO
    '/api/*': { cache: { maxAge: 60 * 60 } },       // cached 1h
    '/old-page': { redirect: { to: '/new-page', statusCode: 302 } },
    '/**': { isr: true },                           // incremental static regen
    '/admin/**': { ssr: false },                    // client-only
  },
})
```

Nuxt-specific rules: `ssr`, `appMiddleware`, `noScripts`. Rules affecting client: `appMiddleware`, `redirect`, `prerender`. Nitro handles both SSR and prerendering.

## Lições aprendidas (SSE via POST)

### Cancelamento em SSE via POST — não usar `req.destroyed`/`req.aborted`

Em handler SSE que lê o corpo do POST com `readBody`/`readValidatedBody`, o Node marca `event.node.req.destroyed = true` assim que o stream de entrada é consumido — **mesmo sem o cliente ter cancelado**. Usar `req.destroyed` (ou `req.aborted`) como sinal de cancelamento é falso positivo: aborta a operação inteira logo no início.

Detectar desconexão real pela **response**: escutar `close` e checar `writableEnded`. Só é cancelamento se a response fechou **antes** de terminarmos de escrever.

```ts
let clienteDesconectou = false
event.node.res.on('close', () => {
  // conclusão normal encerra a response primeiro (writableEnded === true);
  // desconexão real fecha antes de terminarmos de escrever (writableEnded === false).
  if (!event.node.res.writableEnded) clienteDesconectou = true
})
const abortado = () => clienteDesconectou
```

Regra: em handlers SSE/stream que também leem o body, detectar cancelamento pela response (`res.on('close')` + `!res.writableEnded`), nunca por `req.destroyed`/`req.aborted`.

## Banco de dados

Lições específicas de introspeção do catálogo de cada motor foram movidas para steerings dedicados por banco:

- **PostgreSQL** — ver [nuxt-server-db-postgresql](nuxt-server-db-postgresql.md) (catálogos `pg_*`, keyset por OID, parâmetros de função).
- Outros motores (SQL Server, MariaDB/MySQL, Firebird, Oracle) — steering dedicado por motor quando existir (`nuxt-server-db-mssql`, `nuxt-server-db-mariadb`, `nuxt-server-db-firebirdsql`, `nuxt-server-db-oracle`).

Política de conexão read-only obrigatória: ver [db-read-only](db-read-only.md).

## Referência

- [Server](https://nuxt.com/docs/4.x/getting-started/server) — doc oficial Nuxt v4
