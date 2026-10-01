---
inclusion: fileMatch
fileMatchPattern: ["app/**/*.vue", "app/components/**/*.vue", "app/pages/**/*.vue", "app/layouts/**/*.vue"]
name: NuxtUI Advanced Inputs
description: Use para inputs avançados do Nuxt UI v4 — Slider (valor/range numérico), ColorPicker (cor), Calendar (datas) e FileUpload (upload/dropzone).
---
# Nuxt UI — Slider, ColorPicker, Calendar, FileUpload

## Slider (`USlider`)
Valor numérico num range. `v-model` (number ou array p/ range). Props: `min` (0), `max` (100), `step` (1), `orientation` (horizontal|vertical), `color`, `size`, `tooltip` (bool | TooltipProps — mostra valor), `min-steps-between-thumbs` (distância mínima entre thumbs), `inverted`, `disabled`, `name`. Emits: `update:modelValue`, `change`.

```vue
<script setup>const value = ref(50)</script>
<template><USlider v-model="value" :min="0" :max="100" :step="5" /></template>
```
Range: `v-model` array de 2+ valores → `ref([25,75])`. Vertical precisa altura (`class="h-48"`).
- a11y: single thumb → `aria-label`/`aria-labelledby` (encaminhado ao thumb com role `slider`). Múltiplos thumbs são nomeados por posição automaticamente.

## ColorPicker (`UColorPicker`)
Seletor de cor. `v-model` (string). Props: `format` (`hex` default | `rgb` | `hsl` | `cmyk` | `lab` — muda o formato da string emitida), `throttle` (ms, default 50), `size`, `disabled`. Emits: `update:modelValue`.

```vue
<script setup>const value = ref('#00C16A')</script>
<template><UColorPicker v-model="value" /></template>
```
- Color chooser: envolva em `UPopover` com trigger `UButton` mostrando um chip da cor no `#leading`.

## Calendar (`UCalendar`)
Seleção de datas. Usa `@internationalized/date` — formato depende do `locale` do App. `v-model` recebe `CalendarDate` (ou array com `multiple`, ou `{start,end}` com `range`). Use `shallowRef` p/ os valores.

```vue
<script setup>
import { CalendarDate } from '@internationalized/date'
const value = shallowRef(new CalendarDate(2022, 2, 3))
</script>
<template><UCalendar v-model="value" /></template>
```
Props chave: `type` (`date` default | `month` | `year`, 4.9+ — heading clicável navega day→month→year), `multiple`, `range` (funciona com month/year também), `number-of-months`, `min-value`/`max-value`, `is-date-disabled`/`is-date-unavailable` (fn; use `is-month-*`/`is-year-*` p/ type month/year), `week-numbers` (4.4+), `fixed-weeks` (default true), `week-starts-on`, `month-controls`/`year-controls` (default true), `view-control` (4.9+), `color`, `variant` (solid|outline|soft|subtle), `size`, `disabled`, `readonly`. Emits: `update:modelValue`, `update:placeholder`, `update:startValue`. Slots: `heading`, `day`, `week-day`, `month-cell`, `year-cell`.

Padrões:
- Date picker: `UButton` + `UPopover`, `UCalendar` no `#content`. Formatar via `DateFormatter` + `.toDate(getLocalTimeZone())`.
- Range picker com presets: manipular `{start,end}` via `.subtract({days,months,years})`. `:number-of-months="2" range`.
- Hoje: `today(getLocalTimeZone())`. Eventos por dia: slot `#day` + `UChip`.
- Controle externo: `date.add({months:1})` / `date.subtract(...)`.
- Outros sistemas: `new CalendarDate(new HebrewCalendar(), ...)`.

## FileUpload (`UFileUpload`)
Upload com dropzone. `v-model` é `File` (ou `File[]` com `multiple`). Props: `multiple`, `accept` (MIME/extensões CSV, default `*`), `dropzone` (área droppable, default true), `interactive` (área clicável, default true), `variant` (`area` default | `button`; button só sem multiple), `layout` (`grid` default | `list`; só variant area), `position` (`outside` default | `inside`; só area+list), `label`, `description`, `icon` (default `i-lucide-upload`), `file-icon`, `file-image` (preview img, default true), `file-delete` (bool|ButtonProps), `preview`, `reset`, `color`, `size`, `highlight`, `name`. Emits: `update:modelValue`, `change`. Expose: `inputRef`, `dropzoneRef`.

Slots: `default` (`{ open, removeFile, files }` — UI própria), `actions` (`{ open }`), `files-top`/`files-bottom` (`{ open, removeFile, files }`), `file`, `file-name`, `file-size`, `file-trailing`.

```vue
<script setup>const value = ref(null)</script>
<template>
  <UFileUpload v-model="value" accept="image/*" label="Drop your image here"
    description="PNG, JPG (max. 2MB)" class="w-96 min-h-48" />
</template>
```
- **Validação em Form**: `z.instanceof(File).refine(f => f.size <= MAX, {...})` p/ tamanho/tipo/dimensões. Envolva em `UFormField name="image"`.
- Custom UI: use slot default com `open()`/`removeFile()`. Preview via `URL.createObjectURL(file)`.
- Botão externo (sem clickable area): `:interactive="false"` + `#actions` com `UButton @click="open()"`.

## Referência

- [Slider](https://ui.nuxt.com/docs/components/slider)
- [ColorPicker](https://ui.nuxt.com/docs/components/color-picker)
- [Calendar](https://ui.nuxt.com/docs/components/calendar)
- [FileUpload](https://ui.nuxt.com/docs/components/file-upload)
- [Todos os componentes](https://ui.nuxt.com/docs/components)
