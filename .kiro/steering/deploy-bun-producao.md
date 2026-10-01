---
inclusion: auto
name: deploy-bun-producao
description: Convenção de deploy/produção deste projeto — preset Nitro bun, start via `bun run .output/server/index.mjs`, compressão de assets (gzip/brotli) e prerender seletivo da landing. Ativar ao configurar build de produção, alterar o bloco $production do nuxt.config, ajustar compressão ou prerender.
---

# Deploy & Produção — Preset Bun

Convenção de como **este** projeto builda e roda em produção. Referência genérica de deploy Nuxt (Node preset, SSG, presets Nitro) fica em [nuxt-deployment-overview](nuxt-deployment-overview.md); este arquivo documenta as escolhas específicas do harness.

## Runtime: Bun, não Node

O projeto usa o preset **`bun`** do Nitro, definido no bloco `$production` do `nuxt.config.ts`:

```ts [nuxt.config.ts]
$production: {
  nitro: {
    preset: 'bun',
    compressPublicAssets: { gzip: true, brotli: true },
    prerender: { crawlLinks: false },
  },
  routeRules: {
    '/': { prerender: true },
  },
},
```

`$production` é override de ambiente do Nuxt — só aplica em `nuxt build` de produção (não em `nuxt dev`). Dev roda SSR normal, sem compressão nem prerender; isso é esperado (por isso um trace de performance em dev não mostra compressão).

### Comando de start (produção)

```bash
bun run .output/server/index.mjs
```

O preset `bun` gera `.output/server/index.mjs` otimizado pro runtime Bun e habilita otimizações específicas. **Não** usar `node .output/server/index.mjs` para este projeto — o start canônico é via `bun`.

> Não criar servidor HTTP custom (ex.: um `bun.server.ts` com `Bun.serve` servindo `.output` na mão). Isso ignora o servidor do Nitro (SSR + rotas `/api/**`), reimplementa compressão pior (ignora os `.gz`/`.br` pré-gerados, esquece `Vary: Accept-Encoding`) e quebra negociação de encoding. O `.output/server/index.mjs` do preset já faz tudo isso corretamente.

## Compressão de assets

`compressPublicAssets: { gzip: true, brotli: true }` faz **pré-compressão em build**: gera `.gz` e `.br` ao lado de cada arquivo em `.output/public/**` (JS, CSS, fontes e o HTML de rotas prerenderizadas). O servidor serve a variante comprimida conforme o `Accept-Encoding` do cliente, sem gastar CPU comprimindo por request.

Cobre apenas assets públicos. Respostas SSR dinâmicas (rotas não prerenderizadas) são comprimidas em runtime pelo servidor do Nitro/Bun, não por esta opção.

## Prerender seletivo — landing (rota /)

A landing (`app/pages/index.vue`) é estática: só `useHead`/`useSeoMeta` e constantes de `#shared`, sem `useFetch`/`useAsyncData`. Por isso é prerenderizada em build (`'/': { prerender: true }`) → servida como HTML estático (e comprimido, via `compressPublicAssets`) sem rodar SSR por request.

### `crawlLinks: false` é obrigatório aqui

Sem `crawlLinks: false`, o crawler do Nitro seguiria os links da `/` (ex.: o CTA aponta para a rota de geração de dicionário) e tentaria prerenderizar rotas **dinâmicas** que dependem de formulário/estado/DB — o que quebra ou gera HTML errado. Travar o escopo garante que só a `/` é prerenderizada.

Verificação no build (esperado):

```
ℹ Prerendering 1 routes
  ├─ / (55ms)
  ├─ /_payload.json (1ms)
ℹ Prerendered 2 routes
```

Se aparecer mais de uma rota (fora o `_payload.json`), o escopo vazou — revisar `crawlLinks`/`routeRules`.

### Não usar `noScripts` na landing

A landing prerenderizada **mantém os scripts** (hidrata e navega client-side normal). O CTA usa `<NuxtLink>` (`:to`); `noScripts` desligaria hidratação e prefetch, quebrando a navegação SPA. Prerender do HTML sim, `noScripts` não.

## Ao adicionar novas rotas estáticas

Só marcar `prerender: true` para uma rota se ela for de fato estática em build (sem `useFetch`/`useAsyncData`, sem estado dependente de request/DB). Rotas com formulário, dados dinâmicos ou dependentes do banco (ex.: geração de dicionário, painel) permanecem SSR — não prerenderizar.

## Checklist antes de considerar deploy pronto

1. `pnpm build` conclui sem erro e loga `Nitro preset: bun`.
2. Log de prerender mostra **apenas** `/` (+ `_payload.json`).
3. `.output/public/index.html` existe com pares `.gz` e `.br` ao lado.
4. Start local de verificação: `bun run .output/server/index.mjs`.
