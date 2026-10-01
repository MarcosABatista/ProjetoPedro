---
inclusion: fileMatch
fileMatchPattern: ["app/**/*.vue", "app/components/**/*.vue", "app/pages/**/*.vue", "app/layouts/**/*.vue"]
name: NuxtUI Text Inputs
description: Use ao usar campos de entrada de texto/número/data do Nuxt UI v4 — Input, InputNumber, InputDate, InputTime, InputTags, InputRating, Textarea, PinInput.
---
# Nuxt UI — Text Inputs

Campos de entrada. Props visuais comuns a quase todos: `color` (primary…neutral), `variant` (outline default | soft | subtle | ghost | none), `size` (xs–xl), `highlight` (mostra ring de foco/erro), `icon`/`leading-icon`/`trailing-icon`, `avatar`, `loading`/`loading-icon`, `disabled`, `placeholder`. Slots comuns: `leading`, `trailing`, `default`. Todos aceitam `name`/`required` p/ integração com Form.

## Input (`UInput`)
Texto genérico. `type` (default `text`; use componentes dedicados p/ number/checkbox/radio/date). Suporta todos atributos nativos `<input>` (`maxlength`, `pattern`, `min`, `autocomplete`…). `v-model`. Emits: `update:modelValue`, `blur`, `change`. Expose: `inputRef` (HTMLInputElement).

```vue
<script setup>const value = ref('')</script>
<template>
  <UInput v-model="value" icon="i-lucide-search" placeholder="Search..." />
</template>
```
Padrões úteis via `#trailing`: botão clear, copy (`useClipboard`), toggle senha (`:type="show?'text':'password'"`), contador de chars, `UKbd`. Floating label via slot default + `:ui="{ base: 'peer' }"`. Máscara: lib externa `maska` (`v-maska`). Prefixo/país: dentro de `UFieldGroup` + `USelectMenu`.
- a11y: use `aria-label` em botões de ação; `aria-describedby` p/ contador; `aria-invalid` p/ erro. Foco por atalho: `defineShortcuts` + `input.value?.inputRef?.focus()`.

## InputNumber (`UInputNumber`)
Valor numérico com botões +/-. Baseado em `@internationalized/number`. Props: `min`, `max`, `step`, `orientation` (horizontal|vertical), `format-options` (`Intl.NumberFormatOptions`), `increment`/`decrement` (bool ou ButtonProps, default `{variant:'link'}`), `increment-icon`/`decrement-icon`, `disableWheelChange`, `locale`. `v-model` (number). Slots: `#increment`, `#decrement`. Expose: `inputRef`.

```vue
<script setup>const value = ref(5)</script>
<template>
  <UInputNumber v-model="value" :min="0" :max="10" :step="2" />
</template>
```
Formatos: decimal `{minimumFractionDigits:1}`, percentual `{style:'percent'}` (+ `:step="0.01"`), moeda `{style:'currency', currency:'EUR'}`. Sem botões: `:increment="false" :decrement="false"`.

## InputDate (`UInputDate`) / InputTime (`UInputTime`)
Seleção de data/hora com segments editáveis. Usa `@internationalized/date` — formato depende de `locale` do App. `v-model` recebe `CalendarDate`/`Time`/`CalendarDateTime`/`ZonedDateTime`, ou `{start,end}` com `range`.

Props chave: `range`, `min-value`/`max-value`, `granularity` (day|hour|minute|second), `hour-cycle` (12|24), `step`, `locale`, `is-date-unavailable`/`is-time-unavailable` (fn → bool), `separator-icon` (default `i-lucide-minus`), `readonly`. Emits: `update:modelValue`, `update:placeholder`, `change`, `blur`, `focus`. Expose: `inputsRef` (array de refs dos segments). Slots: `leading`, `trailing`, `separator`.

```vue
<script setup>
import { CalendarDate } from '@internationalized/date'
const value = shallowRef(new CalendarDate(2022, 2, 3))
</script>
<template>
  <UInputDate v-model="value" icon="i-lucide-calendar" />
</template>
```
Date picker: combine com `UCalendar` dentro de `UPopover` no slot `#trailing` (`:reference="inputDate?.inputsRef[3]?.$el"`). Range picker: `range` + `UCalendar range :number-of-months="2"`. Use `shallowRef` p/ valores de data (objetos imutáveis).

## InputTags (`UInputTags`)
Tags interativas. `v-model` é `string[]`. Props: `max-length` (chars por tag), `max` (nº de tags), `delimiter` (char/RegExp que dispara adição e split no paste), `add-on-paste`, `add-on-tab`, `add-on-blur`, `duplicate` (permite repetidas), `delete-icon` (default `i-lucide-x`), `convert-value`/`display-value` (p/ objetos). Emits: `update:modelValue`, `addTag`, `removeTag`, `invalid`, `change`, `blur`, `focus`. Slots: `item-text`, `item-delete`, `leading`, `trailing`.

```vue
<script setup>const value = ref(['Vue'])</script>
<template>
  <UInputTags v-model="value" placeholder="Enter tags..." />
</template>
```
- **Validação**: erros vêm indexados (`tags.0`). No FormField use `:error-pattern="/^tags\..+/"`.

## InputRating (`UInputRating`)
Estrelas p/ coletar/exibir nota. `v-model` (number). Props: `length` (default 5), `step` (1|0.5|0.25|0.1 — meia estrela = `0.5`), `clearable` (clicar no valor atual zera), `hoverable` (preview no hover), `icon` (default `i-lucide-star`), `empty-icon`, `color`, `size`, `orientation`, `readonly` (visual normal, sem interação), `disabled` (opacity reduzida). Emits: `update:modelValue`, `change`. Slot: `item` (`filled` bool).

```vue
<script setup>const value = ref(3)</script>
<template>
  <UInputRating v-model="value" :step="0.5" hoverable />
</template>
```

## Textarea (`UTextarea`)
Texto multilinha. Props: `rows` (default 3), `autoresize` (cresce com conteúdo), `maxrows` (limite ao autoresize; `0` = infinito), + props visuais comuns e atributos nativos `<textarea>` (`maxlength`, `readonly`…). `v-model`. Emits: `update:modelValue`, `blur`, `change`. Expose: `textareaRef`, `autoResize()`.

```vue
<script setup>const value = ref('')</script>
<template>
  <UTextarea v-model="value" autoresize :maxrows="6" placeholder="Type..." />
</template>
```

## PinInput (`UPinInput`)
Código/OTP em campos separados. `v-model` é `string[]`. Props: `length` (default 5), `type` (text default | number — só dígitos), `mask` (trata como senha), `otp` (autodetect SMS/clipboard em mobile), `separator` (número = a cada N inputs, ou array de posições — 4.9+), `placeholder`. Emits: `update:modelValue`, `complete` (dispara quando preenchido), `change`, `blur`. Slot: `separator` (4.9+). Expose: `inputsRef`.

```vue
<script setup>const value = ref([])</script>
<template>
  <UPinInput v-model="value" :length="6" otp placeholder="○" @complete="onComplete" />
</template>
```
- **Validação**: valores indexados (`pin.0`). Use `:error-pattern="/(pin)\..*/"` no FormField. Escute `@complete` p/ auto-submit.

## Referência

- [Input](https://ui.nuxt.com/docs/components/input)
- [InputNumber](https://ui.nuxt.com/docs/components/input-number)
- [InputDate](https://ui.nuxt.com/docs/components/input-date)
- [InputTime](https://ui.nuxt.com/docs/components/input-time)
- [InputTags](https://ui.nuxt.com/docs/components/input-tags)
- [InputRating](https://ui.nuxt.com/docs/components/input-rating)
- [Textarea](https://ui.nuxt.com/docs/components/textarea)
- [PinInput](https://ui.nuxt.com/docs/components/pin-input)
- [Todos os componentes](https://ui.nuxt.com/docs/components)
