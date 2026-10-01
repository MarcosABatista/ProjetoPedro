---
inclusion: fileMatch
fileMatchPattern: ["content/**/*.md", "app/**/*.md"]
name: Nuxt UI Typography Prose Components
description: Use ao usar/configurar prose components do Nuxt UI em markdown/MDC — sintaxe MDC de cada componente (callout, card, code-group, tabs, steps, field, badge, kbd, icon, prompt...) e headers/text/lists/tables/images.
---
# Nuxt UI — Prose Components

Componentes em markdown via MDC (`::name{props}`...`::` para bloco, `:name{props}` inline) ou diretamente em Vue (`<ProseName>`). Tema de qualquer um em `app.config.ts` → `ui.prose.<name>`.

## Elementos base (headers-and-text)

Markdown padrão mapeia para prose components tematizáveis via `ui.prose`:
- Headings `H1`–`H4` (`# `…`#### `). Anchor links (ícone hash no hover) habilitados por default p/ `H2`–`H4` com `@nuxt/content`/`@nuxtjs/mdc`. Toggle via `<UTheme :props="{ prose: { h2: { anchor: true } } }">`. Nuxt Content: `content.renderer.anchorLinks` e `content.build.markdown.toc.depth` no `nuxt.config.ts`.
- `p` (parágrafo), `strong` (`**x**`), `em` (`*x*`), `a` (`[texto](url)`, interno/externo), `blockquote` (`> `), `hr` (`---`).

Cada um customizável: `ui: { prose: { p: { base: 'my-5 leading-7' }, a: { base: '...' } } }`.

## Lists and tables

- Unordered (`- `), ordered (`1. `), nested (indent 4 espaços), mixed. Temas: `ui.prose.ul` / `ol` (`base`).
- Tables via markdown pipe (`| Prop | Default |`). Tema `ui.prose.table` (`slots.root`, `slots.base`). Tipo inline: `` `string`{lang="ts-type"} ``.

## Images and embeds

- Imagens: `![alt](url)`. Zoom interativo por default (clique abre modal); desativar `![alt](url){:zoom="false"}`. Tamanho `{width="300"}`. Nuxt: usa `<NuxtImg>` se `@nuxt/image` instalado.
- Iframes (YouTube, CodeSandbox, Figma): HTML `<iframe>` direto no markdown, ex: `style="aspect-ratio: 16/9; width: 100%;"`.

## Componentes MDC

### callout — `ProseCallout`
Box colorido com contexto. `::callout{icon="i-lucide-info" color="info" to="/path"}` (aceita props do NuxtLink: `to`, `target`). Suporta markdown no slot.

### card — `ProseCard` / card-group — `ProseCardGroup`
`ProseCard`: bloco destacado, opcionalmente link. Props: `title`, `description`, `icon`, `color` (default `primary`), + props NuxtLink (`to`, `target`). `::card{title="X" icon="i-lucide-users" color="primary" to="..."}`. `ProseCardGroup`: envolve cards em grid.

### badge — `ProseBadge`
Versão/status/tag inline: `::badge`\n`**v4.0.0**`\n`::`.

### code / ProsePre
Code blocks com highlight Shiki. Inline `ProseCode`: props `lang`, `color` (default `neutral`). ProsePre lida com filename/ícone/copy.

### code-group — `ProseCodeGroup`
Agrupa code blocks em tabs. `::code-group` + blocos com `[label]`. Props: `defaultValue` (default `'0'`), `sync` (chave localStorage).

### code-collapse — `ProseCodeCollapse`
Torna code block longo colapsável. `::code-collapse` + code block.

### code-preview — `ProseCodePreview`
Preview vivo + source. Conteúdo no slot default; source no slot `#code`. `::code-preview` ... `#code` ... `::`.

### code-tree — `ProseCodeTree`
Tree view de arquivos a partir de code blocks. `::code-tree{defaultValue="app/app.config.ts"}` + blocos com `[caminho]`. Props: `defaultValue`, `modelValue`, `expandAll` (default `false`), `items`.

### accordion — `ProseAccordion` / accordion-item
Seções expansíveis. `::accordion` + `:::accordion-item`.

### collapsible — `ProseCollapsible`
Toggle de visibilidade com animação. `::collapsible` + conteúdo. Props: `icon`, `name`, `openText`, `closeText`.

### tabs — `ProseTabs` / tabs-item
Conteúdo em tabs. `::tabs` + `:::tabs-item{label="Code" icon="i-lucide-code"}`. Props: `defaultValue` (default `'0'`), `sync`, `hash`.

### steps — `ProseSteps`
Transforma headings em passos numerados. `::steps{level="4"}` + headings (`####`). Prop `level`: `'2'|'3'|'4'` (default `'3'`).

### field — `ProseField` / field-group — `ProseFieldGroup`
Documentar params/props. `::field{name="name" type="string" required}` + descrição (markdown) no slot. Props: `name`, `type`, `description`, `required`, `as`. `ProseFieldGroup` agrupa fields em lista.

### kbd — `ProseKbd`
Atalho de teclado inline: `:kbd{value="meta"} :kbd{value="K"}`. Prop `value`.

### icon — `ProseIcon`
Ícone inline: `:icon{name="i-simple-icons-nuxtdotjs"}`. Prop `name`.

### prompt — `ProsePrompt`
Prompt AI pré-construído com copy + integração IDE. `::prompt{description="..." icon="..." actions="cursor,claude"}` + texto do prompt no slot (é o que é copiado). `description` é o label visível. Props: `description`, `icon`, `actions` (`copy` sempre presente; adicionais: `cursor`, `windsurf`, `claude`).

## Referência

- https://ui.nuxt.com/docs/typography/accordion
- https://ui.nuxt.com/docs/typography/badge
- https://ui.nuxt.com/docs/typography/callout
- https://ui.nuxt.com/docs/typography/card
- https://ui.nuxt.com/docs/typography/code
- https://ui.nuxt.com/docs/typography/steps
- https://ui.nuxt.com/docs/typography/tabs
