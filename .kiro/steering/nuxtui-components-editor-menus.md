---
inclusion: fileMatch
fileMatchPattern: ["app/**/*.vue", "app/components/**/*.vue", "app/pages/**/*.vue", "app/layouts/**/*.vue"]
name: NuxtUI Editor Menus
description: Use ao adicionar interações ao Editor Nuxt UI v4 — EditorDragHandle (reordenar blocos), EditorSuggestionMenu (slash /), EditorMentionMenu (@) e EditorEmojiMenu (:).
---
# Nuxt UI — EditorDragHandle, SuggestionMenu, MentionMenu, EmojiMenu

Subcomponentes do [Editor](nuxtui-components-editor.md). **Todos devem ficar dentro do slot default do `UEditor`** e recebem `:editor` (via `v-slot="{ editor, handlers }"`). Menus (`suggestion`/`mention`/`emoji`) usam `char` p/ disparar, `plugin-key` p/ identificar, `filter-fields`, `limit` (42), `options` (Floating UI), `append-to` (evita z-index issues — `() => document.body`).

## EditorDragHandle (`UEditorDragHandle`)
Alça arrastável p/ reordenar/selecionar blocos (pacote `@tiptap/extension-drag-handle-vue-3`). Estende Button (aceita `color`, `variant`, `size`, `icon`…). `options` (Floating UI, default `{placement:'left-start'}`), `nested` (alça em blocos aninhados: list items, blockquotes).

```vue
<template>
  <UEditor v-slot="{ editor }" v-model="value" content-type="markdown">
    <UEditorDragHandle :editor="editor" />
  </UEditor>
</template>
```
Emits: `node-change` / `hover` (`{ node, pos }`). Slot default expõe `{ ui, onClick }`.

Padrões:
- **Menu de bloco**: slot default com `UDropdownMenu`, escute `@node-change="selectedNode = $event"`, gere items com `mapEditorItems(editor, [...], customHandlers)` de `@nuxt/ui/utils/editor` (mapeia kinds `duplicate`/`delete`/`moveUp`/`moveDown`/`clearFormatting` p/ comandos). Trave a alça: `@update:open="editor.chain().setMeta('lockDragHandle', $event).run()"`.
- **Botão inserir bloco**: `onClick()` retorna o node selecionado; `handlers.suggestion?.execute(editor, { pos: selected?.pos }).run()`.

## EditorSuggestionMenu (`UEditorSuggestionMenu`)
Slash commands. `char` default `/`. Items: array (ou array de arrays) de objetos `{ kind, label, icon, level?, type?:'label' }`. Tipos: `EditorSuggestionMenuItem`.

```vue
<script setup>
import type { EditorSuggestionMenuItem } from '@nuxt/ui'
const items: EditorSuggestionMenuItem[][] = [[
  { type:'label', label:'Text' },
  { kind:'paragraph', label:'Paragraph', icon:'i-lucide-type' },
  { kind:'heading', level:1, label:'Heading 1', icon:'i-lucide-heading-1' }
],[
  { kind:'bulletList', label:'Bullet List', icon:'i-lucide-list' },
  { kind:'codeBlock', label:'Code Block', icon:'i-lucide-square-code' }
]]
</script>
<template>
  <UEditor v-slot="{ editor }" v-model="value" content-type="markdown" placeholder="Type / for commands...">
    <UEditorSuggestionMenu :editor="editor" :items="items" />
  </UEditor>
</template>
```
Props: `char` (/), `plugin-key` (`suggestionMenu`), `filter-fields` (`['label']`), `limit`, `size`, `options`, `append-to`.

## EditorMentionMenu (`UEditorMentionMenu`)
Menções `@`. Items: objetos `{ label, avatar?, icon?, description?, disabled? }`. Tipos: `EditorMentionMenuItem`.

```vue
<script setup>
import type { EditorMentionMenuItem } from '@nuxt/ui'
const items: EditorMentionMenuItem[] = [
  { label:'benjamincanac', avatar:{ src:'https://github.com/benjamincanac.png', loading:'lazy' } }
]
</script>
<template>
  <UEditor v-slot="{ editor }" v-model="value" content-type="markdown" placeholder="Type @ to mention...">
    <UEditorMentionMenu :editor="editor" :items="items" />
  </UEditor>
</template>
```
Props: `char` (`@` — também vira prefixo do render, ex. `#channel`), `plugin-key` (`mentionMenu`), `filter-fields` (`['label']`), `limit`, `suggestion` (4.7+, ex. `{ allowedPrefixes: null }` p/ abrir após qualquer char), `ignore-filter` + `v-model:search-term` (busca via API), `options`, `append-to`, `size`.
- Múltiplos menus no mesmo editor: use `char`+`plugin-key` distintos (ex. `@` users + `#` tags).

## EditorEmojiMenu (`UEditorEmojiMenu`)
Picker de emoji `:`. Requer a extensão `Emoji` no `extensions` do `UEditor`. Items geralmente `gitHubEmojis` de `@tiptap/extension-emoji`. Tipos: `EditorEmojiMenuItem`.

```vue
<script setup>
import { Emoji, gitHubEmojis } from '@tiptap/extension-emoji'
const items = gitHubEmojis.filter(e => !e.name.startsWith('regional_indicator_'))
</script>
<template>
  <UEditor v-slot="{ editor }" v-model="value" :extensions="[Emoji]" content-type="markdown" placeholder="Type : for emojis...">
    <UEditorEmojiMenu :editor="editor" :items="items" />
  </UEditor>
</template>
```
Props: `char` (`:`), `plugin-key` (`emojiMenu`), `filter-fields` (`['name','shortcodes','tags']`), `limit` (42), `suggestion`, `options`, `append-to`, `size`.

## Referência

- [EditorDragHandle](https://ui.nuxt.com/docs/components/editor-drag-handle)
- [EditorSuggestionMenu](https://ui.nuxt.com/docs/components/editor-suggestion-menu)
- [EditorMentionMenu](https://ui.nuxt.com/docs/components/editor-mention-menu)
- [EditorEmojiMenu](https://ui.nuxt.com/docs/components/editor-emoji-menu)
- [Todos os componentes](https://ui.nuxt.com/docs/components)
