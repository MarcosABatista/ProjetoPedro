---
inclusion: fileMatch
fileMatchPattern: ["app/app.config.ts", "app/**/*.vue", "app/assets/**/*.css"]
name: Nuxt UI Theming - Customize Components
description: Use ao customizar estilos de componentes Nuxt UI via Tailwind Variants — slots, variants, compoundVariants, global config (app.config.ts/vite.config.ts), componente Theme, props ui e class.
---
# Nuxt UI — Customizar Componentes (Tailwind Variants)

Componentes estilizados via [Tailwind Variants](https://www.tailwind-variants.org/) (usa `tailwind-merge` internamente — sem conflito de classes). Tema de cada componente na doc (seção Theme) ou em `src/theme/<comp>.ts` no repo.

## Estrutura do tema

### Slots

Cada slot = elemento/seção do componente. Ex: Card tem `root`, `header`, `title`, `description`, `body`, `footer`:

```ts [src/theme/card.ts]
export default {
  slots: {
    root: 'rounded-lg overflow-hidden',
    header: 'p-4 sm:px-6',
    title: 'text-highlighted font-semibold',
    body: 'p-4 sm:p-6',
    footer: 'p-4 sm:px-6'
  }
}
```

Componentes sem slots têm só `base` (ex: Container: `base: 'w-full max-w-(--ui-container) mx-auto px-4 ...'`). Estes expõem chave `base` no `ui` prop. `Link` e `Icon` não têm `ui` prop → use `class`.

### Variants / defaultVariants

`variants` ajustam slots conforme props; `defaultVariants` define valor default:

```ts [src/theme/avatar.ts]
export default {
  slots: { root: '... rounded-full bg-elevated', image: 'h-full w-full object-cover' },
  variants: {
    size: { sm: { root: 'size-7 text-sm' }, md: { root: 'size-8 text-base' }, lg: { root: 'size-9 text-lg' } }
  },
  defaultVariants: { size: 'md' }
}
```

Uso: `<UAvatar src="..." size="lg" />`. Sobrescrever `md`/`primary` de todos os componentes: opção `theme.defaultVariants` no `nuxt.config.ts`/`vite.config.ts`.

### compoundVariants

Aplica classes quando múltiplas condições batem (ex: Button `color` + `variant`):

```ts
compoundVariants: [{
  color: 'neutral', variant: 'outline',
  class: 'ring ring-inset ring-accented text-default bg-default hover:bg-elevated ...'
}]
```

## Formas de customizar (ordem de prioridade crescente)

`variants` resolvidos < global config < componente `Theme` < `ui` prop / `class` prop.

### Global config (`app.config.ts` Nuxt / `ui` no `vite.config.ts` Vue)

Mesma estrutura do objeto de tema. Merge nos defaults:

```ts [app/app.config.ts]
export default defineAppConfig({
  ui: {
    button: {
      slots: { base: 'font-bold' },
      variants: { size: { md: { leadingIcon: 'size-4' } } },
      compoundVariants: [{ color: 'neutral', variant: 'outline', class: 'ring-default hover:bg-accented' }],
      defaultVariants: { color: 'neutral', variant: 'outline' }
    }
  }
})
```

Vue: envolver em `ui({ ui: { button: { ... } } })` no `vite.config.ts`.

Slot como **função** substitui (não merge) as classes default; recebe as classes default como argumento:

```ts
ui: { button: { slots: { label: () => 'text-base font-bold' } } }
```

`theme.unstyled` remove todas as classes default de uma vez.

### Componente `Theme`

Sobrescreve slots/defaults para todos os descendentes, sem afetar o resto da app. Prioridade sobre global config; `ui`/`class` ainda ganham dele:

```vue
<template>
  <UTheme :ui="{ button: { base: 'rounded-full' } }">
    <UButton label="Button" color="neutral" />
  </UTheme>
</template>
```

### `ui` prop (por instância)

Sobrescreve slots; prioridade sobre global config e `variants` resolvidos:

```vue
<template>
  <UButton trailing-icon="i-lucide-chevron-right" size="md" :ui="{ trailingIcon: 'rotate-90 size-3' }">
    Button
  </UButton>
</template>
```

Função aqui substitui as classes **resolvidas** (o argumento contém o que `variants`/`compoundVariants` casaram); `class` no mesmo slot ainda faz merge por cima: `:ui="{ label: () => 'text-base font-bold' }"`.

### `class` prop

Sobrescreve o slot `root`/`base`. Prioridade sobre global config e `variants`:

```vue
<template>
  <UButton class="font-bold rounded-full">Button</UButton>
</template>
```

## Referência

- https://ui.nuxt.com/docs/getting-started/theme/components
