---
inclusion: fileMatch
fileMatchPattern: ['**/*.ts', '**/*.js', '**/*.mjs', '**/*.cjs', '**/*.vue']
description: Constantes — prefixo de contexto, prevenção de prefixo/sufixo redundante e ONDE COLOCAR (server/utils, app/utils ou shared/utils conforme os consumidores) quando usada em mais de um arquivo. Ativar ao criar, mover ou revisar constantes.
---

# Nomenclatura de Constantes — Prefixo de Contexto

## Regra 1 — Prefixar pelo contexto geral

Ao criar uma constante, quando fizer sentido, **prefixar o nome com o contexto geral** ao qual ela pertence (feature, módulo, subsistema). Isso evita colisão de nomes, deixa a origem explícita e agrupa constantes relacionadas.

O prefixo é o nome do contexto em `SCREAMING_SNAKE_CASE`.

```ts
// ✅ Contexto: geração de dicionário → prefixo GERAR_DICIONARIO
export const GERAR_DICIONARIO_TAMANHO_LOTE = 100
export const GERAR_DICIONARIO_CAPACIDADE_BUFFER_LOGS = 30
export const GERAR_DICIONARIO_STATEMENT_TIMEOUT_MS = 30_000

// ❌ Sem contexto — genérico demais, colide fácil entre módulos
export const TAMANHO_LOTE = 100
export const CAPACIDADE_BUFFER_LOGS = 30
```

## Regra 2 — Evitar prefixo e sufixo redundantes

Ao aplicar o prefixo, **verificar se ele não repete o miolo/sufixo** da constante. Prefixo e conteúdo iguais geram nomes esquisitos e redundantes.

```ts
// ❌ Redundante — "GERAR_DICIONARIO" repetido no prefixo e no sufixo
export const GERAR_DICIONARIO_ENDPOINT_GERAR_DICIONARIO = '/api/dicionario/gerar'

// ✅ Sem repetição — o prefixo dá o contexto, o sufixo diz o que é
export const GERAR_DICIONARIO_ENDPOINT = '/api/dicionario/gerar'
```

**Procedimento ao nomear:**
1. Definir o prefixo de contexto (ex.: `GERAR_DICIONARIO`).
2. Definir o miolo/sufixo pelo que a constante representa (ex.: `ENDPOINT`, `TAMANHO_LOTE`).
3. Concatenar `PREFIXO_SUFIXO` e reler: se o contexto aparecer duas vezes, remover a repetição do sufixo.

## Quando o prefixo é dispensável

- Constante verdadeiramente global/transversal do projeto, sem dono de contexto (ex.: `TIMEZONE_PADRAO`).
- Constante local a um único arquivo pequeno onde o contexto é óbvio e ela não é exportada.
- Enums/uniões de tipo cujo próprio nome do tipo já dá o contexto.

Na dúvida entre prefixar ou não, **prefixar** — o custo de um nome mais longo é menor que o de uma colisão silenciosa.

## Regra 3 — Onde colocar (constante usada em mais de um lugar)

Constante usada num **único arquivo** fica **no próprio arquivo**, perto do uso — não centralizar prematuramente. Só quando o **mesmo valor, com o mesmo propósito**, aparece em **dois ou mais arquivos** é que ele deve ser extraído para um módulo de constantes compartilhado. Duplicar o literal é o problema real: mudar num lugar e esquecer no outro quebra silenciosamente (ex.: tamanho da entropia gerado num endpoint e validado em outro).

### Árvore de decisão — qual pasta

O destino é ditado por **quem consome** a constante. Regra do menor escopo que cobre todos os consumidores:

| Consumidores | Pasta | Import |
|---|---|---|
| Só código do **servidor** (`server/**`) | `server/utils/` | auto-import do Nitro (sem `import`) |
| Só código do **app Vue** (`app/**`) | `app/utils/` | auto-import do Nuxt (sem `import`) |
| **App E servidor** (isomórfica) | `shared/utils/` | `#shared` (auto-import só para `shared/utils/` e `shared/types/` top-level) |

Uniões/tipos de domínio que acompanham a constante (ex.: `type LinkEscopo`) seguem a mesma regra: `shared/types/` quando isomórficos, senão `server/types/` ou `app/types/`.

### Nome do arquivo

- Constantes de **um domínio/feature** → arquivo nomeado pela feature: `server/utils/link-curto.ts`, `shared/utils/encurtamento.ts`. Preferir agrupar junto de utilitários já existentes daquele domínio.
- Constantes **transversais sem dono de contexto** (várias features) → `constantes.ts` na pasta de escopo apropriada (`server/utils/constantes.ts`, `shared/utils/constantes.ts`).

### Regra do menor escopo — e quando promover

Comece no escopo mais estreito que cobre os consumidores atuais. Uma constante hoje só-server vive em `server/utils/`; **quando** um consumidor do app Vue passar a precisar dela, **promova para `shared/`** em vez de duplicar no app. Duplicar entre `server/` e `app/` é exatamente o que esta regra existe para evitar.

```ts
// ✅ Isomórfica (validada no cliente e no servidor) → shared/utils/, importável via #shared
// shared/utils/encurtamento.ts
export const LINK_ENTROPIA_TAMANHO = 10
export const LINK_ENTROPIA_ALFABETO = 'A-Za-z0-9_-'

// ✅ Só-servidor (nunca usada no bundle do cliente) → server/utils/
// server/utils/constantes.ts
export const LINK_RATE_LIMIT_MAX_REQ = 20

// ❌ Mesma constante copiada em server/ e app/ — vão divergir
// server/api/encurtar.post.ts →  const ENTROPIA_TAMANHO = 10
// app/composables/useEncurtar.ts → const ENTROPIA_TAMANHO = 10
```

> ⚠️ **`shared/` não pode importar código Vue nem Nitro.** Só valores puros/isomórficos entram em `shared/utils/`. Constante que depende de API só-server (ex.: `node:*`, `useRuntimeConfig`) fica em `server/utils/`, nunca em `shared/`.
