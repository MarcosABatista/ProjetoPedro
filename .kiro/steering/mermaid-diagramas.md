---
inclusion: always
name: mermaid-diagramas
description: Preferir diagramas Mermaid em documentos Markdown (specs, design, docs) e validar cada diagrama gerado, garantindo renderização sem erro de parse.
---

# Diagramas em Markdown — Mermaid Preferencial e Validado

## Regra 1 — Preferir Mermaid

Ao representar arquitetura, fluxos, sequências, estados, entidades ou qualquer relação em documentos Markdown (specs `design.md`/`requirements.md`, READMEs, docs, comentários longos), **preferir diagramas Mermaid** em bloco de código com a linguagem `mermaid`. Só recorrer a imagem estática, ASCII art ou tabela quando o Mermaid não suportar o tipo de diagrama.

Tipos usados com frequência: `flowchart`, `sequenceDiagram`, `classDiagram`, `stateDiagram-v2`, `erDiagram`.

## Regra 2 — Validar todo diagrama gerado (OBRIGATÓRIO)

**Todo** diagrama Mermaid criado ou editado DEVE ser validado antes de considerar a tarefa concluída. Um diagrama que quebra o parser não renderiza no Markdown e é um defeito.

### Procedimento de validação

A validação usa o **parser do pacote `mermaid`** (`mermaid.parse`), que roda em Node **sem navegador**. NÃO usar `@mermaid-js/mermaid-cli`/`mmdc`: ele sobe Chromium via Puppeteer só para renderizar SVG — dependência pesada e desnecessária para checar sintaxe. Se um dia for preciso renderizar imagem (não apenas validar), preferir o Playwright já presente no ambiente em vez de Puppeteer.

0. **Pré-requisito — devDependencies.** A validação exige `mermaid` e `jsdom` como devDependencies do projeto. Neste projeto já estão instalados (`mermaid`, `jsdom` em `devDependencies` do `package.json`). Se ausentes em outro projeto, instalar com:
   ```bash
   rtk pnpm add -D mermaid jsdom
   ```
   `mermaid` fornece o parser (`mermaid.parse`); `jsdom` provê o DOM que o `mermaid`/DOMPurify exige em Node. Alternativamente, se o projeto já usa `happy-dom` (como neste), o script pode ser adaptado para ele — mas o padrão documentado é `jsdom`.
1. Garantir que o script validador existe em `.local/temp/validar-mermaid.mjs` (ver conteúdo no fim deste steering). Ele extrai cada bloco ```` ```mermaid ```` do(s) Markdown e chama `mermaid.parse` em cada um.
2. Rodar sobre o(s) documento(s) alterado(s):
   ```bash
   rtk node .local/temp/validar-mermaid.mjs .kiro/specs/<feature>/design.md
   ```
3. **Exit 0** e todos os blocos com `✓` → diagramas válidos.
4. Qualquer bloco com `✗` (o parser reporta a mensagem de erro) → corrigir a sintaxe do bloco indicado e revalidar. Repetir até passar.
5. Remover o script e temporários de `.local/temp/` ao concluir, se não forem reutilizados.

Se o pacote `mermaid` não puder ser baixado (sem rede), fazer a **revisão manual** contra as armadilhas abaixo e declarar explicitamente que a validação automática não foi possível.

## Armadilhas de sintaxe conhecidas (causas reais de parse error)

Aprendidas em incidentes deste projeto — o parser trata vários caracteres como tokens de controle.

### `sequenceDiagram` — texto de mensagem é o ponto mais frágil

No texto após `:` de uma mensagem (`A->>B: texto`), **evitar**:

- Parênteses `(` `)` — quebram o parser. `SELECT keyset (LIMIT 100)` vira `SELECT keyset limite 100`.
- Maior/menor `>` `<` soltos — confundidos com setas. Reescrever em palavras.
- Chaves `{` `}` — usadas por objetos/JSON. `{tipo: "x"}` vira `tipo x`.
- Cifrão + número `$1`, `$2` — reescrever como `parametro 1`.
- Reticências `...` — remover.
- Ponto e vírgula `;`, vírgula `,`, igual `=`, barra `/`, dois-pontos `:` extra — preferir texto só com letras, números e espaços.
- Aspas `"` `'` no texto — remover.

**Aliases de participante** (`participant A as X`): usar identificadores alfanuméricos simples (`APIGerar`, `PostgresReadOnly`), **sem** `/`, `-`, `.`, parênteses. Colocar caracteres especiais só faz sentido dentro de `[...]`/`"..."` em nós de flowchart, não em alias de sequência.

### `flowchart`

- Texto de nó com caracteres especiais deve ficar entre aspas: `A["texto (com) detalhes"]`.
- `>` só é válido em setas (`-->`, `-->|rótulo|`), nunca solto em rótulo sem aspas.
- Rótulos de aresta com espaço/símbolo: usar `-->|"rótulo com símbolos"|`.

### Regra prática de ouro

Quando um diagrama falhar **duas vezes** com patches incrementais, **parar de remendar** e reescrever o bloco inteiro com sintaxe minimalista: aliases alfanuméricos e mensagens só com letras, números e espaços. Preservar a semântica (nomes técnicos podem virar prosa: `LIMIT 100` vira `limite 100`).

## Checklist antes de concluir

1. Cada relação/fluxo relevante do documento tem um diagrama Mermaid (Regra 1).
2. Cada bloco `mermaid` foi validado pelo parser headless (`mermaid.parse` via `.local/temp/validar-mermaid.mjs`) **ou** revisado manualmente contra as armadilhas (Regra 2).
3. Nenhum bloco produz `Parse error`.
4. Temporários de validação removidos de `.local/temp/`.

## Script validador (`.local/temp/validar-mermaid.mjs`)

```js
// .local/temp/validar-mermaid.mjs — Valida blocos Mermaid de arquivos Markdown sem navegador.
// Usa o parser do pacote `mermaid` (mermaid.parse) sobre um DOM provido por jsdom — sem
// Puppeteer/Chromium. Extrai cada bloco ```mermaid``` dos .md passados como argumentos e reporta
// parse errors. Uso: rtk node .local/temp/validar-mermaid.mjs <arquivo1.md> [arquivo2.md ...]
import { readFileSync } from 'node:fs'
import { JSDOM } from 'jsdom'

const arquivos = process.argv.slice(2)
if (arquivos.length === 0) {
  console.error('Uso: node validar-mermaid.mjs <arquivo.md> [...]')
  process.exit(2)
}

// Provê um DOM global antes de importar mermaid (DOMPurify precisa de window/document).
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', { pretendToBeVisual: true })
globalThis.window = dom.window
globalThis.document = dom.window.document
globalThis.DOMParser = dom.window.DOMParser
globalThis.Node = dom.window.Node
globalThis.HTMLElement = dom.window.HTMLElement
if (!globalThis.navigator) {
  Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator, configurable: true })
}

const { default: mermaid } = await import('mermaid')
mermaid.initialize({ startOnLoad: false, securityLevel: 'loose' })

function extrairBlocos(md) {
  const blocos = []
  const regex = /```mermaid\s*\n([\s\S]*?)```/g
  let m
  let indice = 0
  while ((m = regex.exec(md)) !== null) {
    indice += 1
    const linhaInicio = md.slice(0, m.index).split('\n').length
    blocos.push({ indice, linhaInicio, codigo: m[1] })
  }
  return blocos
}

let falhas = 0
for (const arquivo of arquivos) {
  const conteudo = readFileSync(arquivo, 'utf8')
  const blocos = extrairBlocos(conteudo)
  if (blocos.length === 0) {
    console.log('· ' + arquivo + ': nenhum bloco mermaid')
    continue
  }
  for (const bloco of blocos) {
    try {
      await mermaid.parse(bloco.codigo)
      console.log('OK  ' + arquivo + ' bloco #' + bloco.indice + ' linha ' + bloco.linhaInicio)
    }
    catch (erro) {
      falhas += 1
      const msg = erro && erro.message ? erro.message : String(erro)
      console.error('ERRO ' + arquivo + ' bloco #' + bloco.indice + ' linha ' + bloco.linhaInicio + ': ' + msg)
    }
  }
}

process.exit(falhas > 0 ? 1 : 0)
```
