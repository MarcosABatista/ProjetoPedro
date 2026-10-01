---
inclusion: fileMatch
fileMatchPattern: ["app/assets/**/*.css", "app/app.config.ts", "nuxt.config.ts"]
name: Nuxt UI Theming - Design System & CSS Variables
description: Use ao configurar cores semânticas, design tokens (@theme), cores/fontes/breakpoints custom e variáveis CSS de tema (text/bg/border, radius, container, header) em Nuxt UI.
---
# Nuxt UI — Design System & CSS Variables

Config CSS-first (Tailwind v4): tokens no `@theme` do CSS. Cores por **naming semântico**.

## `@theme` (design tokens)

```css [app/assets/css/main.css]
@import "tailwindcss";
@import "@nuxt/ui";

@theme {
  /* tokens custom */
}
```

### Fonts

```css
@theme {
  --font-sans: 'Public Sans', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}
```

### Colors custom (`@theme static`)

Defina todos os shades `50`–`950`. Pode sobrescrever cor default ou criar nova (`brand`):

```css
@theme static {
  --color-green-400: #00DC82;
  --color-green-500: #00C16A;
  /* ...50 a 950... */
  --color-brand-500: #ef4444;
  /* ...definir 50 a 950 do brand... */
}
```

### Breakpoints / Motion

```css
@theme {
  --breakpoint-3xl: 1920px;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);  /* enter/exit animations */
}
```

`--ease-in-out` reged loading indeterminado. Com `prefers-reduced-motion`, overlays fazem fade sem escalar/deslizar.

Cursor de botões (Tailwind v4 usa `default`) — restaurar pointer:

```css
@layer base {
  button:not(:disabled), [role="button"]:not(:disabled) { cursor: pointer; }
}
```

## Cores semânticas

7 aliases (com o color default): `primary`(green, CTAs/brand), `secondary`(blue), `success`(green), `info`(blue), `warning`(yellow), `error`(red, validação de forms), `neutral`(slate, texto/bordas/bg). Disponíveis na prop `color`: `<UButton color="primary">`.

### Runtime config

**Nuxt** — `app.config.ts` chave `ui.colors`:

```ts [app/app.config.ts]
export default defineAppConfig({
  ui: { colors: { primary: 'blue', secondary: 'purple', neutral: 'zinc' } }
})
```

**Vue** — `vite.config.ts` `ui({ ui: { colors: {...} } })`. Só cores existentes no tema (defaults Tailwind ou custom via `@theme`).

### Estender cores (novo alias)

Registrar em `theme.colors` (Nuxt `nuxt.config.ts` / Vue `vite.config.ts`), depois atribuir em `ui.colors`:

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  ui: { theme: { colors: ['primary','secondary','tertiary','info','success','warning','error'] } }
})
```

```ts [app/app.config.ts]
export default defineAppConfig({
  ui: { colors: { primary: 'blue', secondary: 'purple', tertiary: 'indigo' } }
})
```

Uso: `<UButton color="tertiary">`.

## CSS Variables (design tokens)

Classes utilitárias mapeiam para CSS vars, com valores light (`:root`) e dark (`.dark`). Customize no `main.css`.

### Cores semânticas

Classes: `text-primary`, `bg-success`, etc. Light usa shade `-500`, dark `-400`:

```css
:root { --ui-primary: var(--ui-color-primary-500); }
.dark { --ui-primary: var(--ui-color-primary-400); }
```

`primary: 'black'` não funciona no config (sem shades) → definir no CSS: `:root { --ui-primary: black } .dark { --ui-primary: white }`.

### Texto

Classes: `text-dimmed`, `text-muted`, `text-toned`, `text-default`, `text-highlighted`, `text-inverted`. Mapeiam para `--ui-text-*` (baseados em `neutral`). Trocar todas de uma vez: mude o alias `neutral`.

### Background

`bg-default`, `bg-muted`, `bg-elevated`, `bg-accented`, `bg-inverted` → `--ui-bg*`. Light: `--ui-bg: white`; dark: `--ui-color-neutral-900`.

### Border

`border-default`, `border-muted`, `border-accented`, `border-inverted` → `--ui-border*`.

### Focus `4.9+`

`focus-visible` outline tingido pela prop `color` (ex: `outline-primary/25`). Cor única global no `main.css` (fora de `@layer`):

```css
*, ::before, ::after { @apply outline-primary/25; }
*:focus-visible, *:has(> a:focus-visible) { --tw-ring-color: var(--ui-primary); }
```

### Radius

`rounded-xs`…`rounded-3xl` calculados de `--ui-radius` (default `0.25rem`). Customizar afeta também sua markup e componentes de terceiros:

```css
:root { --ui-radius: 0.5rem; }
```

Escala: `--radius-xs: calc(var(--ui-radius) * 0.5)`, `sm: var(--ui-radius)`, `md: *1.5`, `lg: *2`, `xl: *3`, `2xl: *4`, `3xl: *6`.

### Container / Header

`--ui-container` (max-width do Container, default `80rem`), `--ui-header-height` (default `4rem`):

```css
:root {
  --ui-container: var(--container-8xl);  /* após definir no @theme */
  --ui-header-height: --spacing(24);
}
```

### Body

Classes default: `body { @apply antialiased text-default bg-default scheme-light dark:scheme-dark; }`.

## Referência

- https://ui.nuxt.com/docs/getting-started/theme/design-system
- https://ui.nuxt.com/docs/getting-started/theme/css-variables
