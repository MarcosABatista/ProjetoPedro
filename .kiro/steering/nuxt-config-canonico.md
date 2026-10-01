---
inclusion: fileMatch
fileMatchPattern: "nuxt.config.ts"
name: nuxt-config-canonico
description: Receita canônica (prompt-and-play) do nuxt.config.ts deste projeto — estado esperado do arquivo, decisões obrigatórias e armadilhas já resolvidas (proxy corporativo quebrando fontes/ícones no build, preset bun + compressão + prerender no $production, zstd não suportado). Ativar ao criar ou editar nuxt.config.ts.
---

# `nuxt.config.ts` — Receita Canônica (Prompt-and-Play)

Estado esperado do `nuxt.config.ts` quando o projeto é reconstruído do zero (workspace vazio + `.kiro/`). O objetivo é que o arquivo já nasça correto e a apresentação não quebre por config faltando. Referência de API genérica das opções: [nuxt-nuxt-configuration-reference](nuxt-nuxt-configuration-reference.md). Detalhe de deploy: [deploy-bun-producao](deploy-bun-producao.md). Detalhe de tema/fontes: [design-system](design-system.md).

## Config de referência (estado esperado)

```ts [nuxt.config.ts]
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const { version: VERSAO_SISTEMA } = JSON.parse(
  readFileSync(fileURLToPath(new URL('./package.json', import.meta.url)), 'utf-8')
)

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  modules: ['@nuxt/ui'],
  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    public: { versao: VERSAO_SISTEMA } // exibida no rodapé (single source of truth = package.json)
  },

  // Ícones locais (@iconify-json/lucide) — sem fetch à Iconify API em runtime/build.
  icon: {
    serverBundle: 'local',
    clientBundle: { scan: true }
  },

  // Fontes: TODO provedor remoto desligado (a sondagem trava atrás do proxy corporativo).
  fonts: {
    providers: {
      google: false, googleicons: false, bunny: false,
      fontshare: false, fontsource: false, adobe: false
    }
  },

  // Só em build de produção (não afeta `nuxt dev`).
  $production: {
    routeRules: { '/': { prerender: true } },
    nitro: {
      preset: 'bun',
      compressPublicAssets: { gzip: true, brotli: true },
      prerender: { crawlLinks: false }
    }
  }
})
```

## Decisões obrigatórias (e o PORQUÊ)

### 1. Ícones e fontes resolvidos localmente — proxy corporativo
O ambiente fica atrás de `http://proxy.el.com.br:3128`, que **bloqueia** o fetch remoto à Iconify API e aos provedores de fontes. Se deixar o default:
- `@nuxt/icon` tenta baixar SVGs da Iconify API em runtime → falha/trava.
- `@nuxt/fonts` sonda provedores remotos no boot do build → **trava o build**.

Por isso, obrigatoriamente: instalar a coleção local (`@iconify-json/lucide` em devDependencies), `icon.serverBundle: 'local'` + `icon.clientBundle.scan: true`, e **todos** os `fonts.providers` em `false` (usa a stack de fonte do sistema via `--font-sans` no `@theme`; nenhum `@font-face` remoto). Não reintroduzir fonte web remota nem ícone de coleção não instalada.

### 2. `$production` — nunca afeta o dev
Todo o bloco de deploy vive em `$production` (override de ambiente do Nuxt). Consequência esperada e correta: `pnpm dev` roda SSR sem compressão nem prerender. Um trace de performance em dev **não** reflete produção — medir sempre no build (`bun run .output/server/index.mjs`).

### 3. Preset `bun` + compressão + prerender da landing
- `preset: 'bun'` → start canônico `bun run .output/server/index.mjs` (ver [deploy-bun-producao](deploy-bun-producao.md)). Não usar `node`.
- `compressPublicAssets: { gzip, brotli }` → pré-comprime assets públicos e HTML prerenderizado (gera `.gz`/`.br`).
- `'/': { prerender: true }` + `prerender.crawlLinks: false` → prerenderiza **só** a landing (estática); `crawlLinks: false` impede o crawler de arrastar rotas dinâmicas (`/dicionario-dados`, `/painel`).

### 4. `runtimeConfig.public.versao`
Lê o `version` do `package.json` em build-time e expõe no client para o rodapé. Single source of truth — não duplicar o número em outro lugar.

## Armadilhas conhecidas (não repetir)

- **`zstd` no `compressPublicAssets` NÃO funciona nesta stack.** A opção existe no schema do Nitro atual (`{ gzip, brotli, zstd }`), mas o **nitropack 2.13.4** (empacotado no Nuxt 4.5.2) não a implementa — `zstd: true` é silenciosamente ignorado e nenhum `.zst` é gerado. Não adicionar `zstd` até o Nitro empacotado suportar (verificar com `grep -r zstd node_modules/.pnpm/nitropack@*/dist` após upgrade).
- **Formatador remove a vírgula final** ao editar objetos aninhados; ao aplicar `str_replace` no config, reler o trecho antes (a última linha de um bloco pode estar sem `,`).
- **Não criar servidor HTTP custom** (ex.: `bun.server.ts` com `Bun.serve`) para servir o `.output` — ignora o SSR/rotas do Nitro e reimplementa compressão pior. O `.output/server/index.mjs` do preset já faz tudo.

## Checklist prompt-and-play

1. `modules: ['@nuxt/ui']` + `css: ['~/assets/css/main.css']`.
2. `icon.serverBundle: 'local'` + `clientBundle.scan: true` e `@iconify-json/lucide` instalado.
3. Todos os `fonts.providers` em `false`.
4. `$production` com `preset: 'bun'`, `compressPublicAssets: { gzip, brotli }` (sem zstd), `routeRules['/'].prerender` e `prerender.crawlLinks: false`.
5. `pnpm build` conclui logando `Nitro preset: bun` e `Prerendered 2 routes` (só `/` + `_payload.json`).
6. `pnpm typecheck` passa.
