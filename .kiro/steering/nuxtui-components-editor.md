---
inclusion: fileMatch
fileMatchPattern: ["app/**/*.vue", "app/components/**/*.vue", "app/pages/**/*.vue", "app/layouts/**/*.vue"]
name: NuxtUI Editor Core
description: Use ao montar o editor rich-text do Nuxt UI v4 (TipTap) — Editor (conteúdo/handlers/extensions) e EditorToolbar (fixed/bubble/floating).
---
# Nuxt UI — Editor & EditorToolbar

Editor rich-text baseado em [TipTap](https://tiptap.dev). `UEditor` é o container; subcomponentes (`UEditorToolbar`, `UEditorDragHandle`, `UEditorSuggestionMenu`, `UEditorMentionMenu`, `UEditorEmojiMenu`) vão no slot default e recebem `:editor` via `v-slot="{ editor, handlers }"`.

> Gotcha SSR/Vite: se ocorrer erro prosemirror `Adding different instances of a keyed plugin`, adicionar pacotes prosemirror em `vite.optimizeDeps.include` no `nuxt.config.ts` (ex.: `'@nuxt/ui > prosemirror-state'`, `-transform`, `-model`, `-view`, `-gapcursor`).

## Editor (`UEditor`)
`v-model` aceita string (HTML), objeto/array (JSON) ou markdown. Formato inferido: string→`html`, objeto→`json`. Force com `content-type` (`json`|`html`|`markdown`).

```vue
<script setup>const value = ref('# Hello\n\nRich **text**.')</script>
<template>
  <UEditor v-model="value" content-type="markdown" placeholder="Type '/' for commands..." class="w-full" />
</template>
```

Props chave:
- `content-type`, `placeholder` (string ou `{ placeholder, mode: 'everyLine'|'firstLine', includeChildren }`).
- `starter-kit` (bool | opções TipTap StarterKit — `false` = editor texto puro, mantém paragraph/text/history). Configura headings, blockquote, link, dropcursor etc.
- `extensions` (array de extensões TipTap extras: `Emoji`, `TextAlign`, code-block-shiki, custom nodes).
- `image` / `mention` / `markdown` (bool | opções das extensões built-in; `false` desabilita).
- `handlers` (custom/override — ver abaixo).
- `editable`, `autofocus`, `text-direction` (ltr|rtl|auto), muitos callbacks TipTap (`onUpdate`, `onCreate`, `onBlur`…).

Emits: `update:modelValue`. Expose: `editor` (instância TipTap — API completa TipTap).

Extensões built-in: StarterKit, Placeholder (quando `placeholder` setado), Image, Mention, Markdown (quando content-type markdown).

### Handlers
Handlers embrulham comandos TipTap numa interface unificada. Toolbar/menu items referenciam via `kind`. Built-in: `mark` (requer `mark`: bold|italic|strike|code|underline), `textAlign` (requer `align`), `heading` (requer `level`), `link`, `image`, `blockquote`, `bulletList`, `orderedList`, `taskList`, `codeBlock`, `horizontalRule`, `paragraph`, `undo`, `redo`, `clearFormatting`, `duplicate`/`delete`/`moveUp`/`moveDown` (requerem `pos`), `suggestion` (insere `/`), `mention` (`@`), `emoji` (`:`).
> `taskList` e `textAlign` exigem instalar as respectivas extensões (não vêm por default).

Custom handler implementa `EditorHandler` (`canExecute`, `execute` → chain TipTap, `isActive`, `isDisabled?`). Passe via prop `handlers` (merge com os default):
```ts
const customHandlers = {
  highlight: {
    canExecute: (e) => e.can().toggleHighlight(),
    execute: (e) => e.chain().focus().toggleHighlight(),
    isActive: (e) => e.isActive('highlight')
  }
} satisfies EditorCustomHandlers
```

## EditorToolbar (`UEditorToolbar`)
Barra de botões que sincroniza estado ativo com o editor. **Deve** estar dentro do slot default do `UEditor`. `layout`: `fixed` (default, sempre visível), `bubble` (na seleção de texto), `floating` (em linhas vazias). Requer `:editor`.

```vue
<template>
  <UEditor v-slot="{ editor }" v-model="value" content-type="markdown">
    <UEditorToolbar :editor="editor" :items="items" layout="bubble" />
  </UEditor>
</template>
```

Prop `items`: array (ou array de arrays p/ grupos) de objetos. Campos: `kind` (handler), `mark`/`level`/`align` (conforme kind), `icon`, `label`, `tooltip` (TooltipProps), `active`, `disabled`, `loading`, `onClick`, `slot` (slot nomeado custom, ex. link popover), `items`/`children` (vira DropdownMenu aninhado), + qualquer prop de Button (`color`, `variant`, `activeColor`, `activeVariant`, `size`).

Props toolbar: `layout`, `color` (default neutral), `variant` (default ghost), `active-color` (primary), `active-variant` (soft), `size` (sm), `options` (Floating UI, bubble/floating), `should-show` (fn `({editor,view,state})=>bool` p/ bubble/floating), `append-to`. Slot: `item` + slots nomeados via `slot` nos items.

Tipos TS: `EditorToolbarItem`, `EditorToolbarItem<typeof customHandlers>` (p/ kinds custom).

### Padrões
- Toolbar dupla: uma `fixed` (topo, sticky) + uma `bubble` (seleção). Filtre a bubble com `should-show` (ex.: esconder em imagens).
- Toolbar de imagem: `layout="bubble"` + `should-show={ editor.isActive('image') }`, ações download/replace/delete manipulando `editor.chain()...deleteRange(...)`.
- Link popover: item com `slot: 'link'` + `<template #link>` renderizando componente com `UPopover` + `UInput`, usando `editor.chain().extendMarkRange('link').setLink({href})`.
- Image upload: extensão TipTap custom (`Node.create` + `VueNodeViewRenderer`) + handler `imageUpload` + `UFileUpload` no NodeView.

## Referência

- [Editor](https://ui.nuxt.com/docs/components/editor)
- [EditorToolbar](https://ui.nuxt.com/docs/components/editor-toolbar)
- [Todos os componentes](https://ui.nuxt.com/docs/components)
