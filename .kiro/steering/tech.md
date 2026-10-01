---
inclusion: always
name: tech
description: Technology stack, tooling, runtime constraints and the master index of Nuxt v4 + Nuxt UI reference steerings. Loaded in every interaction.
---

# Technology Stack

Este workspace é um harness do Kiro para construir aplicações web (MVP/PoC) de forma idiomática com o ecossistema Nuxt. Prefira sempre esta stack e siga as convenções abaixo antes de sugerir alternativas.

## Stack canônica

| Camada | Tecnologia | Versão | Notas |
|---|---|---|---|
| Meta-framework | **Nuxt** | 4.5.2 | SSR/SSG/hybrid; file-based routing; auto-imports |
| Frontend | **Vue** | 3.5.42 | Composition API + `<script setup>` |
| Build | **Vite** | 8.2.2 | Dev server + HMR + bundler |
| Server/backend | **Nitro** | 2.13.4 | API routes em `server/`, deploy universal |
| UI | **Nuxt UI** | v4 | Componentes, fontes, ícones (Iconify), theming Tailwind Variants |
| Estilo | **Tailwind CSS** (via Nuxt UI) | — | tokens `@theme`, CSS variables semânticas |
| Banco de dados | **SQLite** (local) e **PostgreSQL** (homolog/prod) | SQLite no dev local; Postgres em homologação e produção | acesso via CLI `sqlite3` (local) ou `psql` (homolog/prod); conexão do agente é READ-ONLY |
| Linguagem | **TypeScript** | strict | `.ts` / `<script setup lang="ts">` |
| Package manager | **pnpm** | 11.x | nunca usar npm/yarn |
| Runtime Node | **Node.js** | v24.x (via Vite+) | gerenciado por `vp`, não nvm |

## Regras de tooling (ambiente local)

- Gerar projeto: `pnpm dlx nuxi@latest init <app>` (ou `vpx nuxi init`). Instalar deps com `pnpm install`.
- Dev server: **não** rodar em foreground bloqueante pelo agente — instruir o usuário a rodar `pnpm dev` manualmente, ou usar processo em background.
- Adicionar Nuxt UI: `pnpm add @nuxt/ui` + `modules: ['@nuxt/ui']` no `nuxt.config.ts` + `import '@nuxt/ui'` no CSS. Ver `nuxtui-getting-started-installation`.
- **MCP nuxt e nuxt-ui disponíveis** neste ambiente (tools em tempo real da doc oficial). Ordem de consulta ao implementar: (1) steerings `nuxt-*`/`nuxtui-*` (fonte primária, já no contexto), (2) MCP como **fonte de verdade ao vivo** para o que os steerings não cobrem ou para **confirmar assinatura de API/componente na versão atual** (Nuxt 4.5 / Nuxt UI v4 são recentes — não inventar prop/opção de memória). Tools úteis: nuxt-ui `search-components`/`get-component`/`get-component-metadata`/`search-icons`; nuxt `list-documentation-pages`/`get-documentation-page`. Não chamar o MCP para o que os steerings já respondem (custo/latência). Setup dos servers: `nuxtui-working-with-ai` / `nuxt-working-with-ai`.
- SQLite é o banco do **ambiente local de desenvolvimento**: arquivo `.db` local, sem serviço/container. Usar a CLI `sqlite3` para inspeção. Escritas (INSERT/UPDATE/DDL) devem ser apresentadas ao usuário, não executadas pelo agente.
- Postgres roda como serviço em `localhost` apenas para **homologação** e **produção**; usar `psql` para inspeção. Escritas (INSERT/UPDATE/DDL) devem ser apresentadas ao usuário, não executadas pelo agente.
- Timezone padrão: `America/Sao_Paulo` (definir `TZ` em Docker Compose / `.env`).
- Docker Compose para dev: serviço `app` (Nuxt) com SQLite local; `postgres` só nos ambientes de homologação/produção, com `TZ` em cada serviço.
- CI/CD: GitLab CI (`.gitlab-ci.yml`) com estágios de lint, test, build.

## Testes e inspeção de navegador

Convenção transversal do projeto (vale para toda a aplicação, não só a landing). Três coisas distintas — não confundir:

- **Unit / propriedade** → Vitest + fast-check (`pnpm test`). Cobrem lógica e invariantes de código.
- **E2E (suíte automatizada, dev/CI)** → Playwright (`@playwright/test`). No estado atual pode não haver testes E2E escritos (opcionais no MVP), mas o runner oficial da suíte E2E é o Playwright.
- **Inspeção visual/interativa pelo AGENTE** → MCP `chrome-devtools` em **modo headful**, conectado a uma instância de **Chrome for Testing** (traz WebDriver/CDP nativamente) na **porta 9222**, iniciada manualmente pelo desenvolvedor **antes** de acionar o MCP. Usado para screenshot, medir performance/Core Web Vitals, conferir layout e interagir. Ver `mcp-chrome-devtools-headful`.

Separação-chave: **Playwright = suíte E2E automatizada**; **MCP `chrome-devtools` = ferramenta do agente, NÃO é o runner da suíte E2E**. São ferramentas diferentes com propósitos diferentes.

`data-testid` serve aos dois (seletores estáveis para Playwright e para o agente localizar elementos via MCP). Ver `test-id-tid`.

## Arquivos temporários (`.local/`)

A pasta `.local/` está no `.gitignore` (não versionada). Quando o agente precisar criar scripts avulsos (`.ts`, `.js`, `.mjs`, `.sh`, `.fish`, `.bash`, `.py`) para rodar algo em lote — dumps, verificações, migrações ad-hoc, saídas de debug —, colocá-los em **`.local/temp/`** e **remover ao terminar**. Não criar temporários fora de `.local/` nem versioná-los.

```bash
mkdir -p .local/temp
rtk python3 .local/temp/verifica.py   # rodar
rm .local/temp/verifica.py            # remover ao concluir
```

## Armadilhas de shell e verificação (lições)

Lições reais do shell do agente (fish) e do tooling deste projeto. Complementam a regra de "não usar código inline no shell".

- **Heredoc não funciona no shell do agente.** Construções como `cat > arquivo << 'EOF' ... EOF` ou `python3 - << 'PY' ... PY` (stdin via heredoc) **não** executam de forma confiável no terminal do agente — truncam ou simplesmente não rodam. Para criar/editar arquivos, prefira a ferramenta de edição de arquivo (ou delegue a um subagente que a tenha). Se precisar mesmo escrever via shell, use um script curto já existente em `.local/temp/` e execute-o — nunca heredoc inline.

  ```bash
  # ❌ Não funciona — heredoc no shell do agente
  cat > script.py << 'EOF'
  print("nao roda")
  EOF
  python3 - << 'PY'
  print("nao roda")
  PY

  # ✅ Script já em arquivo, executado direto
  node .local/temp/verifica.mjs
  python3 .local/temp/verifica.py
  ```

- **Pipe engole a saída de test runners.** Encadear `pnpm vitest ... | tail` (ou `| head`, `| grep`) pode retornar **vazio** no terminal do agente, escondendo o resultado. Rode o vitest **sem pipe** e use um reporter compacto — o resumo (passed/failed) aparece direto.

  ```bash
  # ❌ Pode voltar vazio — pipe engole a saída
  pnpm vitest run --project unit | tail

  # ✅ Sem pipe, reporter compacto
  pnpm vitest run --project unit --reporter=dot
  pnpm vitest run --project nuxt --reporter=dot
  ```

- **Não prefixe `pnpm` com wrappers que reescrevem o gerenciador.** Prefixar `pnpm` com o wrapper `rtk` fez o comando rodar como `npm`, disparando `EBADDEVENGINES` (o `package.json` exige pnpm via `devEngines`). Chame scripts de projeto que dependem do gerenciador correto como `pnpm <script>`, sem wrapper que altere o gerenciador.

  ```bash
  # ❌ Wrapper reescreve para npm → EBADDEVENGINES
  rtk pnpm typecheck

  # ✅ pnpm direto
  pnpm typecheck
  pnpm vitest run --reporter=dot
  pnpm build
  ```

## Como usar este índice

Este arquivo indexa **todos** os steerings `nuxt-*.md` (Nuxt core) e `nuxtui-*.md` (Nuxt UI) por subcategoria, além das **Convenções do Projeto** (segurança, escalabilidade, código, tooling). Cada steering carrega sob demanda: os marcados `inclusion: auto` ativam pela `description`; os marcados `inclusion: fileMatch` ativam ao editar arquivos que casam o `fileMatchPattern`; os `inclusion: always` estão sempre ativos. Todos também podem ser invocados via `/nome`. `structure.md` traz o índice das categorias estruturais e de composição de UI com o mesmo conjunto de links.

---

# Convenções do Projeto

Steerings que definem padrões, políticas e workflow deste harness (não são referência de API). Complementam a documentação Nuxt/Nuxt UI e prevalecem sobre ela em caso de conflito.

## Segurança (SecOps)

| Nome | Descrição | Steering |
|---|---|---|
| SecOps (índice) | Índice das diretrizes de segurança: SQLi, path traversal, SSRF, CSRF, supply chain, info disclosure | [secops](secops.md) |
| Injeção & Validação | Injeção SQL/NoSQL, DSN, validação de entrada, config server-side, info disclosure | [secops-injecao](secops-injecao.md) |
| SSRF, Path Traversal & Acesso | SSRF, path traversal, isolamento de diretórios, rate limit, controle de acesso, segurança de banco | [secops-path-ssrf](secops-path-ssrf.md) |
| CSRF & Auditoria | CSRF stateless HMAC, auditoria/alertas, checklist de review, referências (LGPD, OWASP, CWE) | [secops-csrf-auditoria](secops-csrf-auditoria.md) |
| Supply Chain & Upload | Supply chain (Docker/npm, isolamento de rede, pinagem), upload de arquivos e web shells | [secops-supply-upload](secops-supply-upload.md) |
| CSRF no Nuxt (implementação) | Proteção CSRF stateless HMAC via SSR payload para endpoints de escrita (POST/PUT/PATCH/DELETE) | [nuxt-server-csrf](nuxt-server-csrf.md) |
| Banco de Dados Read-Only | Força modo read-only em toda conexão; proíbe INSERT/UPDATE/DELETE/DDL diretos pelo agente | [db-read-only](db-read-only.md) |

## Escalabilidade

| Nome | Descrição | Steering |
|---|---|---|
| Custo Zero — Client | Escalabilidade client-side: evitar custos ocultos com centenas de usuários simultâneos | [custo-zero-client](custo-zero-client.md) |
| Custo Zero — Server | Escalabilidade server-side: evitar bloqueio/acúmulo no Node.js single-threaded | [custo-zero-server](custo-zero-server.md) |

## Features (contratos de produto)

| Nome | Descrição | Steering |
|---|---|---|
| Geração de Dicionário — Contrato & Saída | Contrato e formato de saída da geração de dicionário PostgreSQL: endpoints (schemas/gerar SSE/download), pré-condição teste→introspecção, ciclo de credenciais, formato EXATO dos arquivos markdown, sanitização e compactação | [gerar-dicionario-dados-contrato-saida](gerar-dicionario-dados-contrato-saida.md) |
| Geração de Dicionário — Tela | Composição e intenção da tela `/dicionario-dados` e do layout painel: blocos, ordem, estados visuais e tom da copy pt-BR (reforço para reproduzir a mesma experiência de tela) | [gerar-dicionario-dados-tela](gerar-dicionario-dados-tela.md) |

## Convenções de Código

| Nome | Descrição | Steering |
|---|---|---|
| Cabeçalho de Arquivo | Cabeçalho estilo Go no topo de arquivos de código descrevendo o propósito | [cabecalho-arquivo](cabecalho-arquivo.md) |
| Tipos Numéricos | Valores numéricos (IDs, contadores, portas) devem ser `number`/int, nunca string | [tipos-numericos](tipos-numericos.md) |
| Nomenclatura de Constantes | Prefixar constantes pelo contexto geral; evitar prefixo/sufixo redundante; onde colocar (server/app/shared) quando compartilhada | [nomenclatura-constantes](nomenclatura-constantes.md) |
| Rollup — Template Literals | Bug do Rollup com aspas em template literals que quebra SQL; usar `quoteSql()` | [rollup-template-literals](rollup-template-literals.md) |
| Documentação curl em Endpoints | Bloco `curl` obrigatório no final de cada arquivo em `server/api/` | [curl-docs-endpoint](curl-docs-endpoint.md) |
| Idioma (pt-BR) | REQUISITO MANDATÓRIO: pt-BR estrito em código, docs, commits e respostas, preservando convenções reservadas de frameworks | [idioma](idioma.md) |
| Diagramas Mermaid | Preferir Mermaid em Markdown e validar todo diagrama gerado (parser headless, sem browser) | [mermaid-diagramas](mermaid-diagramas.md) |
| Test ID (`data-testid`) | REQUISITO MANDATÓRIO: atributo `data-testid` (padrão Playwright) em todo elemento relevante para testes E2E e para o agente localizar elementos do frontend | [test-id-tid](test-id-tid.md) |
| Fundo animado (canvas) | Padrão de fundo animado interativo em canvas 2D (assinatura visual): client-only, cores do design system, custo zero, acessível, dimensionamento via ResizeObserver | [fundo-animado-canvas](fundo-animado-canvas.md) |

## Tooling & Workflow

| Nome | Descrição | Steering |
|---|---|---|
| vpx (substituto de npx) | Usar `vpx` no lugar de `npx` para executar binários de pacotes | [vpx](vpx.md) |
| Criação Nuxt não-interativa | Criar projetos Nuxt sem prompts para não travar o agente (`pnpm create nuxt`) | [nuxt-create-nao-interativo](nuxt-create-nao-interativo.md) |
| Version Bump | Procedimento de bump de versão em projetos JS/TS com `package.json` na raiz | [version-bump](version-bump.md) |
| Typecheck Nativo (Golar) | Typecheck via Golar (motor typescript-go) sem prompt interativo do `nuxi typecheck` nem `ERR_PACKAGE_PATH_NOT_EXPORTED`; config, shims-vue e troubleshooting | [nuxt-typecheck-golar](nuxt-typecheck-golar.md) |
| MCP chrome-devtools (headful) | Fazer o MCP `chrome-devtools` abrir Chrome headful sob Wayland/Xwayland; resolver "Missing X server" via `XAUTHORITY` (valor aleatório em `/run/user/UID/xauth_*` que muda a cada sessão) | [mcp-chrome-devtools-headful](mcp-chrome-devtools-headful.md) |

---

## Configuration

| Nome | Descrição | Steering |
|---|---|---|
| Configuration / Introduction / Installation / Upgrade | Setup inicial do Nuxt, defaults, instalação e upgrade | [nuxt-configuration-getting-started](nuxt-configuration-getting-started.md) |

## Nuxt Configuration

| Nome | Descrição | Steering |
|---|---|---|
| nuxt.config Reference | Opções mais usadas do `nuxt.config.ts` (app, css, modules, runtimeConfig, nitro, vite, routeRules, experimental, typescript, components, imports) | [nuxt-nuxt-configuration-reference](nuxt-nuxt-configuration-reference.md) |
| nuxt.config Canônico (prompt-and-play) | Estado esperado do `nuxt.config.ts` do projeto: ícones/fontes locais (proxy), `$production` bun + compressão + prerender da landing, armadilhas (zstd não suportado, servidor custom) | [nuxt-config-canonico](nuxt-config-canonico.md) |

## Runtime Config

| Nome | Descrição | Steering |
|---|---|---|
| State & App Context | `useRuntimeConfig`, `useAppConfig`, `useState`, `useNuxtApp`, `useCookie`, hidratação | [nuxt-composables-state-app](nuxt-composables-state-app.md) |

## Key Concepts

| Nome | Descrição | Steering |
|---|---|---|
| Rendering, Lifecycle, Server Engine & Server Components | Modos de renderização, route rules, lifecycle SSR/hydration, Nitro, island components | [nuxt-key-concepts-rendering-lifecycle](nuxt-key-concepts-rendering-lifecycle.md) |
| Auto-imports, ES Modules & Modules | Auto-imports, interop ESM/CJS, adicionar/desabilitar módulos | [nuxt-key-concepts-imports-esm-modules](nuxt-key-concepts-imports-esm-modules.md) |
| TypeScript, Vue.js Development & Code Style | Type-checking, augmentação de contexto, Composition API/Vapor, ESLint | [nuxt-key-concepts-typescript-vue-codestyle](nuxt-key-concepts-typescript-vue-codestyle.md) |

## Data Fetching

| Nome | Descrição | Steering |
|---|---|---|
| Data Fetching (overview) | Estratégia geral de busca de dados no Nuxt | [nuxt-data-fetching-overview](nuxt-data-fetching-overview.md) |
| Composables de Data Fetching | `useFetch`, `useAsyncData`, lazy, `useNuxtData`, `useRequestFetch`, `createUse*` | [nuxt-composables-data-fetching](nuxt-composables-data-fetching.md) |
| Data & State utils | `$fetch`, `refreshNuxtData`, `clearNuxtData`, `clearNuxtState`, `refreshCookie`, `callOnce`, `updateAppConfig` | [nuxt-utils-data-state](nuxt-utils-data-state.md) |
| Request & SSR | `useRequestEvent`, `useRequestHeaders`, `useRequestURL`, `useResponseHeader`, `usePreviewMode` | [nuxt-composables-request-ssr](nuxt-composables-request-ssr.md) |

## State Management

| Nome | Descrição | Steering |
|---|---|---|
| State Management (overview) | `useState` e libs de estado SSR-friendly | [nuxt-state-management-overview](nuxt-state-management-overview.md) |

## SEO and Meta

| Nome | Descrição | Steering |
|---|---|---|
| SEO and Meta (overview) | Head config, composables e componentes para SEO | [nuxt-seo-meta-overview](nuxt-seo-meta-overview.md) |
| Head & SEO composables | `useHead`, `useHeadSafe`, `useSeoMeta`, `useServerSeoMeta` | [nuxt-composables-head-seo](nuxt-composables-head-seo.md) |

## Server

| Nome | Descrição | Steering |
|---|---|---|
| Server (overview) | Rotas de API, DB, full-stack com Nitro | [nuxt-server-overview](nuxt-server-overview.md) |
| Server + PostgreSQL | Leitura de catálogos `pg_*`, paginação keyset por OID, decomposição de parâmetros de função | [nuxt-server-db-postgresql](nuxt-server-db-postgresql.md) |
| Banco nativo do Nitro (db0) | Camada de banco db0 — PGLite em dev, PostgreSQL em prod, dialeto Postgres único, `useDatabase()` async, migrations manuais (`db/migrations`) só em dev com guarda anti-produção | [nuxt-nitro-database](nuxt-nitro-database.md) |

## Deployment

| Nome | Descrição | Steering |
|---|---|---|
| Deployment (overview) | Deploy universal em qualquer provider | [nuxt-deployment-overview](nuxt-deployment-overview.md) |
| Deploy Bun (convenção do projeto) | Preset Nitro bun, start via `bun run .output/server/index.mjs`, compressão gzip/brotli e prerender seletivo da landing no bloco `$production` | [deploy-bun-producao](deploy-bun-producao.md) |
| Prerendering | Renderização estática em build time | [nuxt-prerendering-overview](nuxt-prerendering-overview.md) |

## Testing

| Nome | Descrição | Steering |
|---|---|---|
| Testing (overview) | Como testar apps Nuxt (unit + e2e) | [nuxt-testing-overview](nuxt-testing-overview.md) |

## Composables

| Nome | Descrição | Steering |
|---|---|---|
| Routing composables | `useRoute`, `useRouter` | [nuxt-composables-routing](nuxt-composables-routing.md) |
| Error/Loading/A11y/Layout | `useError`, `useLoadingIndicator`, `useAnnouncer`, `useRouteAnnouncer`, `useLayout` | [nuxt-composables-misc](nuxt-composables-misc.md) |

## Utils

| Nome | Descrição | Steering |
|---|---|---|
| Navigation & Routing utils | `navigateTo`, middleware, `definePageMeta`, `defineRouteRules`, `setPageLayout`, guards | [nuxt-utils-navigation](nuxt-utils-navigation.md) |
| Error Handling utils | `createError`, `showError`, `clearError` | [nuxt-utils-error](nuxt-utils-error.md) |
| Component/Plugin/Lifecycle utils | `defineNuxtPlugin`, `defineNuxtComponent`, lazy hydration, preload, `onNuxtReady`, `prerenderRoutes`, `setResponseStatus` | [nuxt-utils-components-lifecycle](nuxt-utils-components-lifecycle.md) |

## CLI

| Nome | Descrição | Steering |
|---|---|---|
| Nuxt CLI Overview | Como rodar o CLI (nuxi), opções globais, completions | [nuxt-cli-overview](nuxt-cli-overview.md) |
| Nuxt CLI Commands Reference | dev, build, generate, preview, add, module, init, prepare, analyze, cleanup, info, test, typecheck, upgrade | [nuxt-cli-commands](nuxt-cli-commands.md) |

## Nuxt Kit

| Nome | Descrição | Steering |
|---|---|---|
| Nuxt Kit — Modules & Setup | `defineNuxtModule`, compat checks, auto-imports, componentes, resolução de paths, uso programático | [nuxt-kit-modules-setup](nuxt-kit-modules-setup.md) |
| Nuxt Kit — Build & Runtime | Builder, Nitro, templates, plugins, layouts, pages, head, runtime/app config, layers, logging | [nuxt-kit-build-runtime](nuxt-kit-build-runtime.md) |

## Advanced

| Nome | Descrição | Steering |
|---|---|---|
| Lifecycle Hooks & import.meta | Hooks de app/nuxt/nitro + flags `import.meta` para tree-shaking | [nuxt-advanced-hooks-import-meta](nuxt-advanced-hooks-import-meta.md) |

## Directory Structure

| Nome | Descrição | Steering |
|---|---|---|
| Diretório `app/` | `app.vue`, pages, layouts, components, composables, utils, middleware, plugins, assets, `error.vue`, `app.config.ts` | [nuxt-directory-structure-app](nuxt-directory-structure-app.md) |
| Raiz & config | `nuxt.config`, `.nuxtrc`, `.env`, `tsconfig`, `package.json`, e dirs server/shared/public/modules/layers/content/test/.nuxt/.output | [nuxt-directory-structure-root](nuxt-directory-structure-root.md) |

## Views

| Nome | Descrição | Steering |
|---|---|---|
| Views (overview) | Camadas de componentes: app.vue, layouts, pages, components | [nuxt-views-overview](nuxt-views-overview.md) |

## Routing

| Nome | Descrição | Steering |
|---|---|---|
| Routing (overview) | Roteamento file-based do diretório `pages/` | [nuxt-routing-overview](nuxt-routing-overview.md) |
| Routing Recipes | Custom routing/router options, custom `useFetch`, mostly-static, Vite plugins | [nuxt-routing-recipes](nuxt-routing-recipes.md) |

## Assets

| Nome | Descrição | Steering |
|---|---|---|
| Assets (overview) | `assets/` processado pelo build vs `public/` | [nuxt-assets-overview](nuxt-assets-overview.md) |

## Styling

| Nome | Descrição | Steering |
|---|---|---|
| Styling (overview) | Como estilizar apps Nuxt | [nuxt-styling-overview](nuxt-styling-overview.md) |

## Transitions

| Nome | Descrição | Steering |
|---|---|---|
| Transitions (overview) | Transições entre páginas/layouts (Vue + View Transitions API) | [nuxt-transitions-overview](nuxt-transitions-overview.md) |

## Layers

| Nome | Descrição | Steering |
|---|---|---|
| Layers (overview) | Estender arquivos, configs e mais via layers | [nuxt-layers-overview](nuxt-layers-overview.md) |

## Error Handling

| Nome | Descrição | Steering |
|---|---|---|
| Error Handling (overview) | Capturar e tratar erros no Nuxt | [nuxt-error-handling-overview](nuxt-error-handling-overview.md) |
| Error Codes Reference | Referência dos códigos `NUXT_` (build B*, runtime E*): causa + fix | [nuxt-error-handling-error-codes](nuxt-error-handling-error-codes.md) |

## Best Practices

| Nome | Descrição | Steering |
|---|---|---|
| Best Practices (overview) | Performance/Core Web Vitals, hydration, acessibilidade, plugins, dev containers | [nuxt-best-practices-overview](nuxt-best-practices-overview.md) |

## Working with AI

| Nome | Descrição | Steering |
|---|---|---|
| Working with AI (Nuxt) | LLMs.txt e Nuxt MCP Server | [nuxt-working-with-ai](nuxt-working-with-ai.md) |

## Sessions and Authentication

| Nome | Descrição | Steering |
|---|---|---|
| Sessions and Authentication | Registro, login, sessões, proteção de rotas (nuxt-auth-utils) | [nuxt-sessions-and-authentication](nuxt-sessions-and-authentication.md) |
| Autenticação Nuxt + SSO (OAuth/OIDC) | Guia portável do-zero: login OAuth/OIDC com nuxt-auth-utils, padrão BFF, tokens server-side (Nitro Storage), refresh token opcional, logout no SSO, proteção de rotas (server + client), validação de input, autorização (nuxt-authorization) e alternativas (credenciais, password hashing, WebAuthn/passkeys) | [autenticacao-nuxt-sso](autenticacao-nuxt-sso.md) |

## Components (Nuxt)

| Nome | Descrição | Steering |
|---|---|---|
| Routing & Layout Components | `NuxtPage`, `NuxtLayout`, `NuxtLink`, `NuxtLoadingIndicator`, `NuxtRouteAnnouncer`, `NuxtAnnouncer` | [nuxt-components-routing-layout](nuxt-components-routing-layout.md) |
| Image Components | `NuxtImg`, `NuxtPicture` | [nuxt-components-images](nuxt-components-images.md) |
| Rendering & Utility Components | `ClientOnly`, `DevOnly`, `NuxtClientFallback`, `NuxtIsland`, `NuxtErrorBoundary`, `Teleport`, `NuxtTime`, `NuxtWelcome` | [nuxt-components-rendering-util](nuxt-components-rendering-util.md) |

---

# Nuxt UI

## UI Getting Started

| Nome | Descrição | Steering |
|---|---|---|
| Getting Started & Installation | Instalar/configurar Nuxt UI v4 em Nuxt ou Vue; options do módulo/plugin | [nuxtui-getting-started-installation](nuxtui-getting-started-installation.md) |
| Migration (v3 & v4) & Contribution | Migrar v2→v3, v3→v4 (breaking changes) e contribuir | [nuxtui-getting-started-migration](nuxtui-getting-started-migration.md) |

## UI Integrations

| Nome | Descrição | Steering |
|---|---|---|
| Color Mode | Alternância light/dark (@nuxtjs/color-mode / VueUse) | [nuxtui-integrations-color-mode](nuxtui-integrations-color-mode.md) |
| Fonts | Fontes web via @nuxt/fonts (`@theme`) | [nuxtui-integrations-fonts](nuxtui-integrations-fonts.md) |
| Icons | Ícones Iconify: `UIcon`, prop `icon`, coleções | [nuxtui-integrations-icons](nuxtui-integrations-icons.md) |
| i18n | Internacionalização de componentes (locale, `defineLocale`, dir) | [nuxtui-integrations-i18n](nuxtui-integrations-i18n.md) |
| Content | Integração @nuxt/content: `@source`, componentes de docs | [nuxtui-integrations-content](nuxtui-integrations-content.md) |
| SSR (Vue) | SSR em Vue puro/Inertia: @unhead, color scheme, ícones | [nuxtui-integrations-ssr](nuxtui-integrations-ssr.md) |

## UI Theming

| Nome | Descrição | Steering |
|---|---|---|
| Customize Components | Tailwind Variants (slots, variants, prop `ui`/`class`, `Theme`) | [nuxtui-theming-components](nuxtui-theming-components.md) |
| Design System & CSS Variables | Cores semânticas, tokens `@theme`, CSS variables | [nuxtui-theming-design-system](nuxtui-theming-design-system.md) |

## UI Composables

| Nome | Descrição | Steering |
|---|---|---|
| Toast, Overlay, Shortcuts, ScrollShadow, Tour | `useToast`, `useOverlay`, `defineShortcuts`, `useScrollShadow`, `useTour` | [nuxtui-composables-ui](nuxtui-composables-ui.md) |
| Locale | `defineLocale`, `extendLocale` | [nuxtui-composables-locale](nuxtui-composables-locale.md) |

## UI Working with AI

| Nome | Descrição | Steering |
|---|---|---|
| Working with AI (MCP, Skills, LLMs.txt) | Integrar Nuxt UI a assistentes AI: MCP, skills, LLMs.txt | [nuxtui-working-with-ai](nuxtui-working-with-ai.md) |
