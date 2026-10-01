---
inclusion: fileMatch
fileMatchPattern: ["app/**/*.vue", "app/components/**/*.vue", "app/pages/**/*.vue", "app/layouts/**/*.vue"]
name: NuxtUI Form Core
description: Use ao construir formulários com Nuxt UI v4 — Form (validação + submit), FormField (label/erro/help) e FieldGroup (agrupar botões/inputs).
---
# Nuxt UI — Form, FormField, FieldGroup

Núcleo de formulários. `Form` orquestra validação/submit; `FormField` envolve cada campo com label/erro; `FieldGroup` agrupa botões/inputs visualmente.

## Form (`UForm`)

Valida `state` reativo contra um `schema` (Standard Schema: Zod, Valibot, Yup, Joi, Superstruct, Regle) ou função `validate`. Nenhuma lib de validação vem inclusa — instale a que usar.

Props chave: `state` (obj reativo, obrigatório), `schema`, `validate` (fn → `FormError[]`), `validateOn` (`['blur','change','input']`), `validateOnInputDelay` (300ms), `disabled`, `loadingAuto` (default true, desabilita inputs no submit), `nested` (aninhar forms), `name` (path no state pai quando nested), `transform`. Suporta todos atributos nativos `<form>`.

Emits: `@submit` → `FormSubmitEvent<Schema>` (payload em `event.data`); `@error` → `FormErrorEvent` (array de `{ id, name, message }`).

Expose (via `useTemplateRef`): `submit()` (dispara HTML5 validation + submit), `validate(opts)`, `clear(path?)`, `getErrors(path?)`, `setErrors(errors, name?)`, `errors` (Ref), `dirty`, `dirtyFields`, `touchedFields`, `blurredFields`.

```vue
<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const schema = z.object({
  email: z.email('Invalid email'),
  password: z.string().min(8, 'Must be at least 8 characters')
})
type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({ email: undefined, password: undefined })

async function onSubmit(event: FormSubmitEvent<Schema>) {
  console.log(event.data) // dados validados e tipados
}
</script>

<template>
  <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
    <UFormField label="Email" name="email">
      <UInput v-model="state.email" />
    </UFormField>
    <UFormField label="Password" name="password">
      <UInput v-model="state.password" type="password" />
    </UFormField>
    <UButton type="submit">Submit</UButton>
  </UForm>
</template>
```

Validação customizada (combina com `schema`):
```ts
import type { FormError } from '@nuxt/ui'
function validate(state: Partial<Schema>): FormError[] {
  const errors = []
  if (!state.email) errors.push({ name: 'email', message: 'Required' })
  return errors
}
// <UForm :validate="validate" :state="state" ...>
```

Submit programático (botão fora do form, ex. footer de modal) — dispara HTML5 validation:
```vue
<UForm ref="form" :state="state" @submit="onSubmit">...</UForm>
<UButton @click="form?.submit()">Submit</UButton>
```

### Gotchas de validação/erros
- Erros casam com `FormField` pelo `name`. Campos aninhados usam dot notation: schema `{ user: { email } }` → `<UFormField name="user.email">`.
- **Arrays**: erros incluem índice (`tags.0`, `tags.1`) e NÃO casam com `name="tags"` sozinho. Use `:error-pattern="/^tags\..+/"` no FormField (crítico p/ `InputTags`, `PinInput`).
- Form sempre valida no submit, independente de `validate-on`.
- `nested` forms herdam o state do pai; validar o pai valida os filhos. Use `name` para apontar sub-path e adicionar campos dinamicamente.
- Foco no primeiro erro: escute `@error` e chame `document.getElementById(e.errors[0].id)?.focus()`.

## FormField (`UFormField`)

Envolve um controle e provê label, descrição, hint, help e erro. Dentro de `UForm`, o `error` é setado automaticamente na validação.

Props: `name` (casa erros), `errorPattern` (RegExp p/ arrays), `label`, `description`, `help`, `error` (string|bool; precede `help`), `hint`, `size` (proxy p/ o controle), `required` (adiciona asterisco), `eagerValidation`, `validateOnInputDelay`, `orientation` (`vertical` default | `horizontal`, 4.3+).

Slots: `label`, `hint`, `description`, `help`, `error`, `default`.

```vue
<UFormField label="Email" description="Nunca compartilhamos." hint="Opcional" required>
  <UInput placeholder="Enter your email" class="w-full" />
</UFormField>
```
- `for` do label liga ao controle via `id` gerado automaticamente (a11y). Não precisa setar `id` manual.
- `error` seta `color="error"` no controle.
- `orientation="horizontal"` põe label e controle lado a lado.

## FieldGroup (`UFieldGroup`)

Agrupa botões/inputs colados (remove bordas internas). Props: `size` (xs–xl, aplica a todos filhos), `orientation` (`horizontal` default | `vertical`), `as`. Slot: `default`.

```vue
<UFieldGroup>
  <UInput placeholder="Enter token" />
  <UButton color="neutral" variant="subtle" icon="i-lucide-clipboard" />
</UFieldGroup>
```
Aceita Button, Input, InputMenu, Select, SelectMenu, Tooltip, DropdownMenu, Badge dentro. Útil p/ input com prefixo (Badge `https://` + Input) ou input com dropdown.

## Referência

- [Form](https://ui.nuxt.com/docs/components/form)
- [FormField](https://ui.nuxt.com/docs/components/form-field)
- [FieldGroup](https://ui.nuxt.com/docs/components/field-group)
- [Todos os componentes](https://ui.nuxt.com/docs/components)
