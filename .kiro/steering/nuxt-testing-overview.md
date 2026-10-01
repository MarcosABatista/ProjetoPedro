---
inclusion: fileMatch
fileMatchPattern: ["**/*.test.ts", "**/*.spec.ts", "test/**"]
name: nuxt-testing-overview
description: Nuxt v4 testing with @nuxt/test-utils — Vitest unit tests in the Nuxt runtime env, helpers (mountSuspended, renderSuspended, mockNuxtImport, mockComponent, registerEndpoint), and E2E ($fetch/createPage/Playwright). Use when writing unit or end-to-end tests.
---

# Nuxt v4 — Testing

First-class testing via `@nuxt/test-utils` (unit + E2E). Peer deps chosen per need.

```bash
pnpm add -D @nuxt/test-utils vitest @vue/test-utils happy-dom playwright-core
```

Runtime env: `happy-dom` or `jsdom`. E2E runners: vitest (recommended), jest, cucumber, playwright.

## Unit testing (Vitest)

Optionally add `@nuxt/test-utils/module` to `nuxt.config` `modules` (DevTools integration). Config with Vitest projects — separate Node vs Nuxt environments:

```ts [vitest.config.ts]
import { defineConfig } from 'vitest/config'
import { defineVitestProject } from '@nuxt/test-utils/config'

export default defineConfig({
  test: {
    projects: [
      { test: { name: 'unit', include: ['test/unit/*.{test,spec}.ts'], environment: 'node' } },
      { test: { name: 'e2e', include: ['test/e2e/*.{test,spec}.ts'], environment: 'node' } },
      await defineVitestProject({
        test: { name: 'nuxt', include: ['test/nuxt/*.{test,spec}.ts'], environment: 'nuxt' },
      }),
    ],
  },
})
```

`defineVitestProject` is only for Nuxt-env tests; E2E must be `environment: 'node'`. Needs `"type": "module"` in package.json (or `vitest.config.mts`). `.env.test` sets test env vars.

Simple setup (all tests in Nuxt env): `defineVitestConfig({ test: { environment: 'nuxt' } })`; opt out per file with `// @vitest-environment node`. Not recommended — hybrid env pitfalls.

Organize: `test/unit/` (Node, fast), `test/nuxt/` (Nuxt runtime), `test/e2e/`. Files in `test/nuxt/` + `tests/nuxt/` get Nuxt TS context (aliases, auto-imports). Add others via `typescript.tsConfig.include`.

Run: `npx vitest`, `--project unit`, `--project nuxt`, `--watch`. Nuxt-env tests init a global Nuxt app — don't mutate global state.

Built-in DOM mocks: `intersectionObserver` (default true), `indexedDb` (default false, uses fake-indexeddb) — set in `environmentOptions.nuxt.mock`.

## Helpers (`@nuxt/test-utils/runtime`)

- **mountSuspended(Component, { route })** — mounts any component in Nuxt env (async setup, plugin injections). Wraps `@vue/test-utils` `mount`.
- **renderSuspended(Component, { route })** — renders via `@testing-library/vue` (use with `screen`, `fireEvent`; enable Vitest globals for cleanup). Rendered in `<div id="test-wrapper">`.
- **mockNuxtImport(name, factory)** — mock an auto-import (macro → `vi.mock`, once per import per file). For dynamic impls use `vi.hoisted`.
- **mockComponent(name|path, factory)** — mock a component (can't reference locals in factory; import inside it).
- **registerEndpoint(path, handler|{ method, handler, once })** — mock a Nitro endpoint returning data.

```ts
import { mountSuspended, mockNuxtImport, registerEndpoint } from '@nuxt/test-utils/runtime'
import { SomeComponent } from '#components'

mockNuxtImport<typeof useState>('useState', original => (...args) => ({ ...original('k'), value: 'mocked' }))
registerEndpoint('/test/', () => ({ test: 'test-field' }))

it('mounts', async () => {
  const c = await mountSuspended(SomeComponent)
  expect(c.text()).toContain('...')
})
```

Runtime and E2E utils can't share a file — split, or name runtime files `*.nuxt.spec.ts` / use `// @vitest-environment nuxt`.

## Plain @vue/test-utils

For components not using Nuxt composables/auto-imports/context: `vitest` + `@vue/test-utils` + `happy-dom` + `@vitejs/plugin-vue`, `defineConfig({ plugins: [vue()], test: { environment: 'happy-dom' } })`, then `mount(Component)`.

## E2E (`@nuxt/test-utils/e2e`)

```ts [test/my-test.spec.ts]
import { describe, test } from 'vitest'
import { $fetch, setup } from '@nuxt/test-utils/e2e'

describe('My test', async () => {
  await setup({ /* options */ })
  test('my test', () => {})
})
```

`setup()` options: `rootDir`, `configFile`, `setupTimeout` (120000/240000 win), `teardownTimeout` (30000), `build`, `server`, `port`, `host` (target a deployed/running server — skips build), `browser` + `browserOptions.type` (chromium/firefox/webkit), `runner`, `logLevel`, `captureServerLogs`.

APIs: `$fetch(url)` (HTML), `fetch(url)` (response), `url(path)` (full URL), `getServerLogs()`/`clearServerLogs()`.

Browser: `createPage(url)` returns a Playwright page.

### Playwright test runner

```bash
pnpm add -D @playwright/test @nuxt/test-utils
```

```ts [playwright.config.ts]
import type { ConfigOptions } from '@nuxt/test-utils/playwright'
export default defineConfig<ConfigOptions>({
  use: { nuxt: { rootDir: fileURLToPath(new URL('.', import.meta.url)) } },
})
```

```ts [tests/example.test.ts]
import { expect, test } from '@nuxt/test-utils/playwright'
test('test', async ({ page, goto }) => {
  await goto('/', { waitUntil: 'hydration' })
  await expect(page.getByRole('heading')).toHaveText('Welcome to Playwright!')
})
```

## Lições aprendidas (armadilhas recorrentes)

Padrões que já quebraram testes neste harness. Seguir ao escrever testes num projeto novo + specs, para evitar falhas espúrias que **não** são bug de código de produção.

### 1. Auto-imports do Nitro/Nuxt NÃO existem no projeto `unit` (Node puro)

O projeto vitest `unit` roda em `environment: 'node'`, **sem** runtime Nuxt/Nitro. Logo, funções que em produção chegam por **auto-import do Nitro** (`server/utils/*`) ou auto-import do Nuxt (composables/utils do app) **não existem** no escopo global do teste. Código sob teste que as referencia lança `ReferenceError: <fn> is not defined` — geralmente escondido dentro de um caminho de erro (`try/catch`), então só aparece quando o teste exercita aquele ramo.

Sintoma típico:

```
Caused by: ReferenceError: limparMensagemErro is not defined
 ❯ server/utils/testarConexao.ts:93 ...
```

Isso é falha de **setup do teste**, não do código de produção. O código está correto — em produção o Nitro injeta a função.

**Regra:** ao testar no projeto `unit` um módulo `server/` (ou app) que usa auto-imports, torne cada auto-import disponível explicitamente no teste. Duas formas:

- **Preferencial** — expor no `globalThis` num `beforeAll`, replicando o que o Nitro faz:

  ```ts
  import { beforeAll } from 'vitest'
  import { limparMensagemErro } from './sanitizarParametros'

  beforeAll(() => {
    ;(globalThis as unknown as { limparMensagemErro: typeof limparMensagemErro }).limparMensagemErro
      = limparMensagemErro
  })
  ```

- **Alternativa** — testar no projeto `nuxt` (`environment: 'nuxt'`, `test/nuxt/**`), onde auto-imports resolvem. Mais lento; use só quando o teste realmente precisa do runtime.

**Consistência entre arquivos do mesmo módulo:** se um teste do módulo (ex. `*.integration.unit.test.ts`) já injeta o auto-import no `globalThis`, **todos** os outros testes unit do mesmo módulo (ex. `*.pbt.test.ts`) precisam do mesmo `beforeAll`. Cada arquivo de teste tem escopo próprio — a injeção de um não vale para o outro. Ao criar um novo arquivo de teste unit para um módulo que já tem testes, copie o bloco de setup.

### 2. Clientes/mocks falsos devem espelhar o contrato ATUAL do código

Mocks manuais (cliente de banco falso, fetch falso, etc.) que não acompanham a evolução do código quebram silenciosamente. Ex.: a verificação de conectividade passou a fazer ida-e-volta por UUID (`SELECT $1::text AS eco`, comparando o valor retornado com o enviado); um cliente falso que devolve `{ rows: [] }` faz o código retornar `sucesso: false` — o teste falha sem que haja bug real.

**Regra:** o mock deve reproduzir o comportamento que o código espera do dependente real (ecoar parâmetros, retornar as colunas consultadas, etc.). Quando houver mais de um teste com cliente falso para o mesmo módulo, mantenha os mocks equivalentes — se um ecoa `$1`, o outro também deve. Buscas por SQL no mock devem casar a query real emitida (ex. procurar `'SELECT'`, não o literal `'SELECT 1'` se o código emite `SELECT $1::text`).

### 3. Testes derivam valores de `#shared` (single source of truth), nunca hardcodam literais

Testes que verificam rotas, nomes de produto, rótulos e textos devem **importar as constantes de `#shared`** (ou do módulo de domínio) e asserir contra elas — nunca duplicar o literal no teste. Quando a spec/produto evolui (renomear rota, trocar CTA, mudar nome do sistema), o teste que hardcoda o valor antigo passa a falhar mesmo com o código correto.

- Importe a constante e asserte contra ela: `expect(cta.attributes('href')).toBe(ROTA_CONFIG_BANCO)`.
- Para textos de UI que podem variar, prefira `toMatch(/regex tolerante/i)` a `toContain('frase exata')`.
- Se o teste importa uma constante que **não é mais** usada pelo componente (ex. `GENERATION_ROUTE` num CTA que agora aponta para outra rota), atualize o import junto — constante obsoleta no teste é sinal de asserção obsoleta.

### 4. Não montar componentes Dashboard do Nuxt UI sob happy-dom

Montar `UDashboardGroup`/`UDashboardSidebar` em ambiente de teste (happy-dom via `mountSuspended`) pode **travar** o processo (ResizeObserver/contexto de dashboard não resolvem sob happy-dom). Para cobrir layout/estrutura desses componentes, prefira **análise estática do fonte** (`readFileSync` do `.vue` + verificação das constantes de `#shared`) no projeto `unit`, em vez de montar o componente.

### 5. Mudança de contrato de resposta propaga por toda a cadeia — e quebra mocks silenciosamente

Quando o formato de retorno de um endpoint/util muda, a mudança precisa propagar por **todas** as camadas. Exemplo real deste projeto: a resposta da Introspecção de Schemas passou de `{ schemas: string[] }` para `{ schemas: { nome: string, totalTabelas: number }[] }`. Essa alteração atravessa a cadeia inteira: SQL/util → schema Zod (`#shared/schemas`) → tipo derivado (`#shared/types`) → endpoint → composable → componente. E, criticamente, **todo** mock de teste que finge esse endpoint/util precisa ser atualizado para o **novo** formato ao mesmo tempo:

- Mocks de `registerEndpoint(...)` em `test/nuxt/**` devem retornar o novo formato.
- Clientes pg falsos / asserções de integração devem asserir os novos campos.
- Se um mock continua devolvendo o formato antigo, o `safeParse` do Zod falha ou as asserções quebram, e o teste falha mesmo com o código de produção correto.

**Regra:** ao mudar o formato de retorno de um endpoint/util, faça um grep pelos mocks que o simulam (`registerEndpoint`, `page.route`, clientes falsos) e atualize todos junto, no mesmo commit. Derive o mock do mesmo schema Zod quando possível, em vez de literal solto.

### 6. Testes de análise estática de layout/página ficam defasados quando o design evolui

Testes de análise estática do fonte (`readFileSync` do `.vue` + `toContain('UDashboardSidebar')` etc.) são rápidos e evitam o travamento do dashboard sob happy-dom (ver item 4), **mas** codificam a estrutura ATUAL. Exemplo real: o painel evoluiu de um layout com sidebar (UDashboardSidebar + UNavigationMenu, página com `definePageMeta({ layout: 'painel' })`) para um layout de tela única (header + `<slot />` + footer), com `/painel` virando um redirect (`definePageMeta({ redirect: ROTA_CONFIG_BANCO })`). O teste antigo continuou asserindo `toContain('UDashboardSidebar')` / `toContain('UNavigationMenu')` e falhou — mesmo o novo design sendo intencional e correto.

**Regra:** quando o design de um layout/página muda deliberadamente, atualize os testes de análise estática no MESMO commit. Prefira asserções que expressem a INTENÇÃO do design atual e sua negação (ex.: `expect(layout).toContain('<slot />')` + `expect(layout).not.toContain('UDashboardSidebar')` para provar "tela única, sem sidebar") em vez de casar detalhes de implementação frágeis. Continue derivando rotas/textos de `#shared` (ver item 3). Se um teste falhar após uma mudança de design, primeiro confirme se o design novo é intencional (não reverta o código de produção para fazer um teste velho passar).

## Referência

- [Testing](https://nuxt.com/docs/4.x/getting-started/testing) — doc oficial Nuxt v4
