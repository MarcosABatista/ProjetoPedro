---
inclusion: fileMatch
fileMatchPattern: ["app/**/*.vue", "app/components/**/*.vue", "app/pages/**/*.vue", "app/layouts/**/*.vue"]
name: nuxtui-chat
description: Componentes Nuxt UI v4 para interfaces de chat AI (streaming, reasoning, tool calling) integrados ao Vercel AI SDK. Usar ao construir chatbots, prompts, mensagens ou palettes de chat.
---
# Nuxt UI — Chat Components (AI)

Conjunto de componentes para chat AI integrados ao [Vercel AI SDK](https://ai-sdk.dev/) (`@ai-sdk/vue` `useChat`). Renderização de markdown via `@comark/nuxt` / `@comark/vue` (`Markdown` component, streaming incremental).

Componentes: `ChatMessages`, `ChatMessage`, `ChatPrompt`, `ChatPromptSubmit`, `ChatReasoning`, `ChatTool`, `ChatShimmer`, `ChatPalette`.

## Setup
```bash
pnpm add ai @ai-sdk/gateway @ai-sdk/vue @comark/nuxt   # Nuxt
pnpm add ai @ai-sdk/gateway @ai-sdk/vue @comark/vue    # Vue
```
Nuxt: adicionar `'@comark/nuxt'` aos `modules`. Server endpoint `server/api/chat.post.ts` usa `streamText` + `toUIMessageStream` + `createUIMessageStreamResponse`.

Utilitários `@nuxt/ui/utils/ai`: `isPartStreaming(part)`, `isToolStreaming(part)`, `isToolApprovalPending(part)`. Helpers AI SDK: `isTextUIPart`, `isReasoningUIPart`, `isToolUIPart`, `getToolName`, `lastAssistantMessageIsCompleteWithApprovalResponses`.

## Composição típica (client)
```vue
<script setup lang="ts">
import { isReasoningUIPart, isTextUIPart, isToolUIPart, getToolName, lastAssistantMessageIsCompleteWithApprovalResponses } from 'ai'
import { useChat } from '@ai-sdk/vue'
import { isPartStreaming, isToolStreaming } from '@nuxt/ui/utils/ai'

const input = ref('')
const { messages, status, error, sendMessage, regenerate, stop, addToolApprovalResponse } = useChat({
  sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithApprovalResponses
})
function onSubmit() { sendMessage({ text: input.value }); input.value = '' }
</script>

<template>
  <UChatMessages :messages="messages" :status="status">
    <template #content="{ message }">
      <template v-for="(part, i) in message.parts" :key="`${message.id}-${part.type}-${i}`">
        <UChatReasoning v-if="isReasoningUIPart(part)" :text="part.text" :streaming="isPartStreaming(part)" />
        <UChatTool v-else-if="isToolUIPart(part)" :text="getToolName(part)" :streaming="isToolStreaming(part)" />
        <template v-else-if="isTextUIPart(part)">
          <Markdown v-if="message.role === 'assistant'" :value="part.text" :streaming="isPartStreaming(part)" />
          <p v-else class="whitespace-pre-wrap">{{ part.text }}</p>
        </template>
      </template>
    </template>
  </UChatMessages>

  <UChatPrompt v-model="input" :error="error" @submit="onSubmit">
    <UChatPromptSubmit :status="status" @stop="stop()" @reload="regenerate()" />
  </UChatPrompt>
</template>
```

## ChatMessages
Lista scrollável de mensagens. Props: `messages`, `status` (`submitted`|`streaming`|`ready`|`error`), `user` / `assistant` (override de props do ChatMessage — user default `side:'right' variant:'soft'`; assistant default `side:'left' variant:'naked'`), `autoScroll` (bool|ButtonProps, botão "voltar ao fim"), `autoScrollIcon` (`i-lucide-arrow-down`), `shouldAutoScroll` (default false), `shouldScrollToBottom` (default true), `compact`, `spacingOffset`.
Slots: `default`, `indicator` (loading custom, ex. ChatShimmer), `viewport`; encaminha todos os slots de ChatMessage (`content`, `body`, `actions`, etc.) — usar `#content="{ message }"`.

## ChatMessage
`<article>` de uma mensagem. Props: `id`, `role` (`user`|`assistant`|`system`), `parts` (formato AI SDK — recomendado; `content` string é deprecated), `side` (`left`|`right`), `variant` (`solid`|`outline`|`soft`|`subtle`|`naked`, default `naked`), `color` (default `neutral`), `icon`, `avatar` (AvatarProps, aceita `avatar.icon`), `actions` (ButtonProps[] — aparecem no hover; `onClick(e, message)`), `compact`.
Slots: `header`, `leading`, `files`, `body`, `content`, `actions`.

## ChatPrompt
`<form>` que estende [Textarea](https://ui.nuxt.com/docs/components/textarea). Props: `modelValue` (v-model), `placeholder`, `color`, `variant` (`outline`|`soft`|`subtle`|`naked`, default `outline`), `submitOnEnter` (default true; false → Enter=newline, Ctrl/Cmd+Enter=submit), `error`, `icon`, `avatar`, `loading`, `rows`, `autofocus`, `autoresize`, `maxrows`.
Emits: `submit`, `close` (Escape), `update:modelValue`. Slots: `header`, `footer`, `body` (substitui a textarea interna — ex. Editor com mentions, expõe `{ submit, close, placeholder }`), `leading`, `trailing`.
```vue
<UChatPrompt v-model="input" @submit="onSubmit">
  <template #footer>
    <UButton icon="i-lucide-plus" color="neutral" variant="ghost" />
    <UChatPromptSubmit :status="status" />
  </template>
</UChatPrompt>
```

## ChatPromptSubmit
Botão de submit dentro do ChatPrompt, estende [Button](https://ui.nuxt.com/docs/components/button). Trata `status` automaticamente:
- `ready`: `color='primary' variant='solid' icon='i-lucide-arrow-up'`
- `submitted`/`streaming`: `*-color='neutral' *-variant='subtle' *-icon='i-lucide-square'` → emite `stop`
- `error`: `error-color='error' error-variant='soft' error-icon='i-lucide-rotate-ccw'` → emite `reload`
Props por estado: `icon`/`color`/`variant`, `streamingIcon`/`streamingColor`/`streamingVariant`, `submittedIcon`/..., `errorIcon`/... Emits: `stop`, `reload`.

## ChatReasoning
Bloco colapsável do raciocínio da IA. Auto-abre ao iniciar streaming, auto-fecha ao terminar. Props: `text`, `streaming` (default false), `duration`, `icon`, `chevron` (`leading`|`trailing`), `chevronIcon`, `autoCloseDelay` (ms, default 500; 0 desabilita), `shimmer` (`{duration,spread}`), `open`/`defaultOpen`. Slot `default` (conteúdo do corpo, ex. `<Markdown>`). Emit `update:open`.

## ChatTool
Bloco colapsável do status de invocação de tool AI. Props: `text`, `suffix`, `icon`, `loading`/`loadingIcon`, `streaming` (shimmer no label), `variant` (`inline`|`card`, default `inline`), `chevron` (`leading`|`trailing`, default `trailing`), `chevronIcon`, `shimmer`, `actions` (ButtonProps[], `4.10+` — fluxo de aprovação de tool), `open`/`defaultOpen`. Slot `default` (output), `actions`. Emit `update:open`.
Aprovação: quando `part.state === 'approval-requested'`, passar `actions` Approve/Deny chamando `addToolApprovalResponse({ id: part.approval.id, approved })`.

## ChatShimmer
Animação shimmer sobre texto (loading/streaming). Usado automaticamente por ChatTool e ChatReasoning. Props: `text` (obrigatório), `as` (default `span`), `duration` (s, default 2), `spread` (mult, default 2; largura = `text.length * spread` px). Auto-desabilita com prefers-reduced-motion.

## ChatPalette
Wrapper de layout para embutir chat em overlay (Modal, Slideover, Drawer). ChatMessages na área scrollável + ChatPrompt fixo no rodapé (slot `#prompt`). Props: `as`. Slots: `default`, `prompt`. Dentro de UChatPalette, ChatMessages entra em modo `compact` automaticamente.
```vue
<UChatPalette>
  <UChatMessages :messages="messages" :status="status" />
  <template #prompt>
    <UChatPrompt v-model="input" icon="i-lucide-search" variant="naked" @submit="onSubmit" />
  </template>
</UChatPalette>
```

## Referência

- [ChatMessages](https://ui.nuxt.com/docs/components/chat-messages)
- [ChatMessage](https://ui.nuxt.com/docs/components/chat-message)
- [ChatPrompt](https://ui.nuxt.com/docs/components/chat-prompt)
- [ChatPromptSubmit](https://ui.nuxt.com/docs/components/chat-prompt-submit)
- [ChatReasoning](https://ui.nuxt.com/docs/components/chat-reasoning)
- [ChatTool](https://ui.nuxt.com/docs/components/chat-tool)
- [ChatPalette](https://ui.nuxt.com/docs/components/chat-palette)
- [ChatShimmer](https://ui.nuxt.com/docs/components/chat-shimmer)
- [Todos os componentes](https://ui.nuxt.com/docs/components)
