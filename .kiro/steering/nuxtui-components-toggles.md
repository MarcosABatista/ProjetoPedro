---
inclusion: fileMatch
fileMatchPattern: ["app/**/*.vue", "app/components/**/*.vue", "app/pages/**/*.vue", "app/layouts/**/*.vue"]
name: NuxtUI Toggles
description: Use para controles booleanos e de escolha do Nuxt UI v4 — Checkbox, CheckboxGroup (múltipla), RadioGroup (única) e Switch (liga/desliga).
---
# Nuxt UI — Checkbox, CheckboxGroup, RadioGroup, Switch

Controles de marcação. Props comuns: `color`, `size` (xs–xl), `label`, `description`, `disabled`, `required` (asterisco no label), `highlight` (ring de foco/erro), `name`. Slots comuns: `label`, `description`.

## Checkbox (`UCheckbox`)
Booleano único. `v-model` (bool). Estado indeterminado: `v-model`/`default-value` = `'indeterminate'`.

```vue
<script setup>const value = ref(true)</script>
<template><UCheckbox v-model="value" label="Check me" /></template>
```
Props: `variant` (`list` default | `card`), `indicator` (`start` default | `end` | `hidden` — quando hidden, `icon` aparece acima do label), `icon` (checked, default `i-lucide-check`), `indeterminate-icon` (default `i-lucide-minus`), `value` (dado enviado quando tem `name`, default `"on"`), `true-value`/`false-value` (customizar valores on/off). Emits: `update:modelValue` (payload `T|'indeterminate'`), `change`.

## CheckboxGroup (`UCheckboxGroup`)
Conjunto de checkboxes → `v-model` é array. Items: strings/números ou objetos (`label`, `value`, `description`, `icon`, `disabled`). Com objetos, `v-model` referencia o `value-key` (default `value`).

```vue
<script setup>
import type { CheckboxGroupItem } from '@nuxt/ui'
const items = ref<CheckboxGroupItem[]>([
  { label:'System', value:'system', description:'Matches device.' },
  { label:'Light', value:'light' },
  { label:'Dark', value:'dark' }
])
const value = ref(['system'])
</script>
<template><UCheckboxGroup v-model="value" :items="items" legend="Theme" /></template>
```
Props: `legend`, `variant` (`list` default | `card` | `table`), `orientation` (`vertical` default | `horizontal`), `indicator` (`start`|`end`|`hidden`), `value-key`, `label-key`, `description-key`, `icon`, `loop`. Emits: `update:modelValue`, `change`. Slots: `legend`, `label`, `description`.

## RadioGroup (`URadioGroup`)
Escolha única → `v-model` escalar. Mesma estrutura de items/props do CheckboxGroup (`legend`, `variant` list/card/table, `orientation`, `indicator`, `value-key`, `loop`).

```vue
<script setup>
const items = ref(['System','Light','Dark'])
const value = ref('System')
</script>
<template><URadioGroup v-model="value" :items="items" legend="Theme" /></template>
```
- `indicator="hidden"`: o `icon` do item aparece acima do label (radio não tem ícone interno).
- Com objetos, `v-model` referencia `value-key` (default `value`).

## Switch (`USwitch`)
Toggle liga/desliga. `v-model` (bool). Renderiza `<button>`.

```vue
<script setup>const value = ref(true)</script>
<template><USwitch v-model="value" label="Enable" /></template>
```
Props: `checked-icon`/`unchecked-icon` (ícones nos estados), `loading`/`loading-icon`, `value` (dado com `name`), `true-value`/`false-value`. Emits: `update:modelValue`, `change`. Slots: `label`, `description`.

## Gotchas
- Validação em Form: bool que precisa ser `true` → `z.boolean().refine(v => v === true, {...})`. CheckboxGroup (array) → `.refine(vals => vals.includes(...))`.
- `variant="card"`/`"table"` transformam os itens em cards/linhas clicáveis com destaque no estado checked.
- Todos ligam `for`/`id` automaticamente para a11y quando usam `label`.

## Lições aprendidas (listas longas de seleção)

Lições reais de UI ao usar `UCheckboxGroup` para listar muitos itens (ex.: seleção de schemas/tabelas).

### 1. `variant="table"` só arredonda o 1º e o último item — quebra em grid
Com `orientation="vertical"` + `variant="table"`, o tema aplica `first-of-type:rounded-t-lg last-of-type:rounded-b-lg` junto com `gap-0 -space-y-px`, tratando a lista como uma única tabela vertical contígua. Num **grid de 2+ colunas** apenas a primeira e a última célula ganham cantos arredondados; as demais ficam retas.

Correção: sobrescrever o slot `item` via prop `ui` para arredondar toda célula (o tailwind-merge substitui os `rounded-t/b`):

```vue
<UCheckboxGroup
  v-model="selecionados"
  :items="itens"
  orientation="vertical"
  variant="table"
  :ui="{ fieldset: 'grid w-full grid-cols-1 gap-1.5 sm:grid-cols-2', item: 'rounded-lg' }"
/>
```

### 2. `orientation="horizontal"` estoura a tela com muitos itens
Com 10+ itens, a orientação horizontal gera overflow horizontal e fica ilegível. Para listas longas, usar `orientation="vertical"` + grid no `fieldset` (`grid-cols-1` no mobile, `sm:grid-cols-2`) + altura máxima com scroll vertical:

```vue
<UCheckboxGroup
  orientation="vertical"
  variant="table"
  :ui="{ fieldset: 'grid w-full grid-cols-1 gap-1.5 sm:grid-cols-2', item: 'rounded-lg' }"
  class="max-h-72 overflow-y-auto"
/>
```

### 3. Badge/contagem ao lado do rótulo → slot `#label`
Carregar o metadado no item (ex.: `totalTabelas`) e renderizá-lo no slot `#label` com um `UBadge`. O `v-model` continua sendo `string[]` dos `value`; o metadado serve apenas para exibição:

```vue
<template #label="{ item }">
  <span class="inline-flex items-center gap-2">
    {{ item.label }}
    <UBadge size="sm" variant="subtle" color="neutral" :label="(item as MeuItem).total" />
  </span>
</template>
```

### 4. Ações "marcar/desmarcar todos" para listas longas
Colocar dois `UButton variant="link" size="xs"` no slot `#hint` do `UFormField` que setam o `v-model` para todos os `value` ou `[]`. Desabilitar "Marcar todos" quando todos já estão marcados e "Desmarcar todos" quando nenhum está marcado:

```vue
<UFormField label="Tabelas" name="tabelas">
  <template #hint>
    <UButton
      variant="link"
      size="xs"
      label="Marcar todos"
      :disabled="selecionados.length === itens.length"
      @click="selecionados = itens.map(i => i.value)"
    />
    <UButton
      variant="link"
      size="xs"
      label="Desmarcar todos"
      :disabled="selecionados.length === 0"
      @click="selecionados = []"
    />
  </template>
  <UCheckboxGroup v-model="selecionados" :items="itens" />
</UFormField>
```

## Armadilha — `UFormField label` agrupando vários `UCheckbox` marca sempre o primeiro

Envolver **múltiplos `UCheckbox` independentes** num único `UFormField` com `label` cria um bug de clique: o `label` do `UFormField` renderiza `<label for={id}>` e o `id` gerado é injetado no **primeiro** controle filho. Resultado: clicar no título do grupo — ou em qualquer área de label que não pertença a um checkbox específico — alterna sempre o **primeiro** checkbox (sintoma real: clicar em "Módulos opcionais" ou no texto de outro item marcava/desmarcava "Foreign Keys").

Causa: um `for`/`id` só pode apontar para um controle; `UFormField` foi feito para envolver **um** controle (input, select, ou um `UCheckboxGroup`/`URadioGroup` que já é um único controle com `role="group"`), não N checkboxes soltos.

Correção (grupo de N booleanos independentes): não usar `UFormField` com `label`. Usar `<fieldset>` + `<legend>` para o título do grupo (legend não associa `for` a controle algum); cada `UCheckbox` já liga seu próprio `label` ao próprio `input` internamente.

```vue
<!-- ❌ Errado — label do FormField cai no primeiro checkbox -->
<UFormField label="Módulos opcionais" name="modulos">
  <UCheckbox v-model="foreignKeys" label="Foreign Keys" />
  <UCheckbox v-model="views" label="Views" />
</UFormField>

<!-- ✅ Correto — título de grupo sem `for`; cada checkbox tem seu próprio id -->
<fieldset>
  <legend class="text-sm font-medium text-highlighted">Módulos opcionais</legend>
  <p class="mt-1 text-sm text-muted">Descrição do grupo…</p>
  <div class="mt-2.5 grid grid-cols-1 gap-3 sm:grid-cols-2">
    <UCheckbox v-model="foreignKeys" label="Foreign Keys" />
    <UCheckbox v-model="views" label="Views" />
  </div>
</fieldset>
```

Alternativas válidas: (a) se o dado é um **array** de selecionados, usar `UCheckboxGroup` (um único controle, um `id`); (b) se realmente quiser um `UFormField` por checkbox, dar **um** `UFormField` para **cada** `UCheckbox`. A regra de ouro: **um `UFormField` com `label` envolve exatamente um controle**.

## Referência

- [Checkbox](https://ui.nuxt.com/docs/components/checkbox)
- [CheckboxGroup](https://ui.nuxt.com/docs/components/checkbox-group)
- [RadioGroup](https://ui.nuxt.com/docs/components/radio-group)
- [Switch](https://ui.nuxt.com/docs/components/switch)
- [Todos os componentes](https://ui.nuxt.com/docs/components)
