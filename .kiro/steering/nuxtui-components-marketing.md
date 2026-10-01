---
inclusion: fileMatch
fileMatchPattern: ["app/**/*.vue", "app/components/**/*.vue", "app/pages/**/*.vue", "app/layouts/**/*.vue"]
name: nuxtui-marketing
description: Componentes Nuxt UI v4 para marketing e auth (pricing plan/plans/table, auth-form, user). Usar ao construir páginas de preços, formulários de login/registro/reset ou exibir info de usuário.
---
# Nuxt UI — Marketing & Auth

Componentes: `PricingPlan`, `PricingPlans`, `PricingTable`, `AuthForm`, `User`.

## PricingPlan
Card de plano de preço. Props: `title`, `description`, `badge` (string|BadgeProps — ao lado do título), `price` (ex. `"$249"`), `discount` (preço com desconto; `price` vira strikethrough), `billingCycle` (ex. `"/month"`), `billingPeriod` (contexto acima do cycle, ex. `"billed annually"`), `features` (`string[]` ou `{ title, icon? }[]`), `button` (ButtonProps — usar `onClick` p/ compra), `tagline`, `terms`, `orientation` (`vertical`|`horizontal`, default vertical), `variant` (`solid`|`outline`|`soft`|`subtle`, default outline), `highlight` (ring de destaque), `scale` (aumenta o card). Slots: `badge`, `title`, `description`, `price`, `discount`, `billing`, `features`, `button`, `header`, `body`, `footer`, `tagline`, `terms`.
```vue
<UPricingPlan title="Solo" description="For indie hackers." price="$249" discount="$199"
  :features="['One developer', 'Lifetime access']" :button="{ label: 'Buy now' }" highlight />
```

## PricingPlans
Grid responsivo de PricingPlan (colunas calculadas pelo nº de planos). Props: `plans` (`PricingPlanProps[]`) ou default slot, `orientation` (default `horizontal`; com `plans` prop a orientação é invertida automaticamente), `compact` (sem gap), `scale` (gap maior quando um plano tem `scale:true`; não combina com `compact`). Encaminha slots de PricingPlan.
```vue
<UPricingPlans :plans="plans" />
<!-- ou -->
<UPricingPlans scale>
  <UPricingPlan v-for="(p, i) in plans" :key="i" v-bind="p" />
</UPricingPlans>
```

## PricingTable
Tabela de comparação de planos (tabela horizontal no desktop, cards verticais no mobile). Props obrigatórios: `tiers`, `sections`. Também `caption`.
- `tiers: PricingTableTier[]`: `{ id (req), title?, description?, price?, discount?, billingCycle?, billingPeriod?, badge?, button? (ButtonProps), highlight? }`
- `sections: PricingTableSection[]`: `{ title, features: [{ title, tiers: { [tierId]: boolean | string | number } }] }` — `true`/`false` viram ✓/-, strings/números exibidos como texto.
Slots: por tier `#{tier-id}-{element}` (ex. `#team-title`, `#solo-price`); por seção `#section-{id|title}-title`; por feature `#feature-{id|title}-{title|value}`; genéricos `#tier-title`, `#section-title`, `#feature-value`, etc. Sem `id`, o slot é gerado do title.
```vue
<UPricingTable :tiers="tiers" :sections="sections">
  <template #feature-developers-value="{ feature, tier }">
    <UBadge :label="String(feature.tiers[tier.id])" color="primary" variant="soft" />
  </template>
</UPricingTable>
```

## AuthForm
Form de login/registro/reset construído sobre [Form](https://ui.nuxt.com/docs/components/form). O form se constrói a partir de `fields` e gerencia o state internamente. Props: `fields` (`AuthFormField[]`), `title`, `description`, `icon` (acima do título), `providers` (`ButtonProps[]` — botões sociais; aceitam `onClick`), `separator` (string|SeparatorProps, default `'or'`), `submit` (ButtonProps do botão de envio), `schema` (Zod/Valibot/etc.), `validate`, `validateOn`, `disabled`, `loading`.
`AuthFormField`: `{ name, type, label?, placeholder?, required?, ... }`. `type`: `checkbox` (props de Checkbox), `select` (props de SelectMenu, precisa `items`), `otp` (props de PinInput, ex. `length`), demais tipos usam props de Input. Também aceita props de FormField.
Slots: `header`, `leading`, `title`, `description`, `providers`, `separator`, `validation`, `submit`, `footer`, e `#{field-name}-hint` (ex. `#password-hint`). Emit `submit` (`FormSubmitEvent`). Expose via ref: `formRef`, `state`.
```vue
<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent, AuthFormField } from '@nuxt/ui'
const fields: AuthFormField[] = [
  { name: 'email', type: 'email', label: 'Email', placeholder: 'Enter your email', required: true },
  { name: 'password', type: 'password', label: 'Password', required: true },
  { name: 'remember', type: 'checkbox', label: 'Remember me' }
]
const providers = [
  { label: 'GitHub', icon: 'i-simple-icons-github', onClick: () => {} }
]
const schema = z.object({ email: z.email(), password: z.string().min(8) })
type Schema = z.output<typeof schema>
function onSubmit(payload: FormSubmitEvent<Schema>) { console.log(payload) }
</script>
<template>
  <UPageCard class="w-full max-w-md">
    <UAuthForm :schema="schema" title="Login" icon="i-lucide-user"
      :fields="fields" :providers="providers" @submit="onSubmit">
      <template #password-hint><ULink to="#">Forgot password?</ULink></template>
    </UAuthForm>
  </UPageCard>
</template>
```

## User
Exibe info de usuário (nome, descrição, avatar). Props: `name`, `description`, `avatar` (AvatarProps sem `size`; aceita `icon`), `chip` (bool|ChipProps), `size` (`3xs`..`3xl`, default `md`), `orientation` (`horizontal`|`vertical`, default horizontal), `to`/`target` (NuxtLink). Slots: `avatar`, `name`, `description`, `default`. Usado por `authors` em BlogPost/ChangelogVersion.
```vue
<UUser name="Benjamin Canac" description="Software Engineer"
  :avatar="{ src: 'https://github.com/benjamincanac.png' }" chip size="xl" />
```

## Referência

- [PricingPlan](https://ui.nuxt.com/docs/components/pricing-plan)
- [PricingPlans](https://ui.nuxt.com/docs/components/pricing-plans)
- [PricingTable](https://ui.nuxt.com/docs/components/pricing-table)
- [AuthForm](https://ui.nuxt.com/docs/components/auth-form)
- [User](https://ui.nuxt.com/docs/components/user)
- [Todos os componentes](https://ui.nuxt.com/docs/components)
