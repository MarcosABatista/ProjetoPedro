---
inclusion: auto
name: Nuxt UI Migration (v3 & v4) & Contribution
description: Use ao migrar Nuxt UI v2→v3 ou v3→v4 (breaking changes de componentes, props, composables, forms) e ao contribuir para o repo Nuxt UI.
---
# Nuxt UI — Migração v2→v3 e v3→v4

## Migração v3 → v4

v4 unifica Nuxt UI + Nuxt UI Pro no pacote `@nuxt/ui` (125+ componentes, open-source). Requer **Nuxt 4.1+**.

### De Nuxt UI Pro

```bash
pnpm remove @nuxt/ui-pro && pnpm add @nuxt/ui tailwindcss
```

- `nuxt.config.ts` modules: `'@nuxt/ui-pro'` → `'@nuxt/ui'`. Vite: `import ui from '@nuxt/ui/vite'`.
- Usar chave `ui` em vez de `uiPro` no `app.config.ts` (mesclar overlays Pro dentro de `ui`).
- CSS: `@import "@nuxt/ui-pro"` → `@import "@nuxt/ui"`. Se subir Nuxt 4 junto, ajustar `@source` (`../../content` → `../../../content`).
- Imports de tipos: `from '@nuxt/ui-pro'` → `from '@nuxt/ui'`.

### De Nuxt UI v3

```bash
pnpm add @nuxt/ui tailwindcss
```

### Breaking changes v4

- `ButtonGroup` → `FieldGroup` (`<UButtonGroup>` → `<UFieldGroup>`).
- `PageMarquee` → `Marquee`.
- `PageAccordion` removido → `Accordion` com `:unmount-on-hide="false"`.
- Model modifiers de `Input`/`InputNumber`/`Textarea`: `nullify` → `nullable` (empty→`null`); novo `optional` (empty→`undefined`).
- `Form`: transformações de schema só aplicam ao `@submit` (não mutam state); nested forms exigem prop `nested` + `name`.
- Removidos `findPageBreadcrumb`/`findPageHeadline` do UI Pro → usar `@nuxt/content/utils`.
- AI SDK (opcional, chat components): `@ai-sdk/vue` `^4.0.x`, `ai` `^7.0.x`, adicionar `@comark/nuxt` ou `@comark/vue`. `useChat`: `input`/`handleSubmit` removidos → `sendMessage`; `messages` vira ref setável; mensagens usam `parts` em vez de `content`; `reload()` → `regenerate()`; `<MDC>` → `<Markdown>` (streaming). Usar `isPartStreaming` de `@nuxt/ui/utils/ai`.

## Migração v2 → v3

v3 = reconstrução: Tailwind CSS v4 (config CSS-first), Reka UI (substitui Headless UI), Tailwind Variants.

### Setup

Rodar `npx @tailwindcss/upgrade`. Criar `main.css` com `@import "tailwindcss"; @import "@nuxt/ui";`. Instalar `@nuxt/ui` mais recente. Envolver app com `<UApp>`.

### Design system

7 aliases: `primary`(green), `secondary`(blue), `success`(green), `info`(blue), `warning`(yellow), `error`(red), `neutral`(slate).

- `gray` → `neutral` (`text-gray-500` → `text-neutral-500` ou token `text-muted`).
- Props `color`: `black`→`neutral`, `gray`→`neutral variant="subtle"`, `white`→`neutral variant="outline"`, `red`→`error`. Sem cores Tailwind cruas nos `color`.
- `app.config.ts`: cores agora em objeto `colors: { primary, neutral }`.

### Theming (Tailwind Variants API)

- `app.config.ts`: props soltas → `slots` + `defaultVariants`.
- `ui` prop: `:ui="{ font: ... }"` → `:ui="{ base: ... }"` (nomes de slots).

### Componentes renomeados

`Divider`→`Separator`, `Dropdown`→`DropdownMenu`, `FormGroup`→`FormField`, `Range`→`Slider`, `Toggle`→`Switch`, `Notification`→`Toast`, `VerticalNavigation`/`HorizontalNavigation`→`NavigationMenu` (`orientation`). `Meter`, `Radio` removidos (use `RadioGroup`).

### Mudanças de API de componentes

- `links`/`options` → `items` (Breadcrumb, InputMenu, RadioGroup, Select, SelectMenu, NavigationMenu).
- `click` em items → `onClick` (Toast, NavigationMenu, DropdownMenu, CommandPalette...).
- `<UModals>`/`<USlideovers>`/`<UNotifications>` removidos → `<UApp>`.
- Visibilidade: `v-model` → `v-model:open` (ContextMenu, Modal, Slideover; também InputMenu/Select/SelectMenu/Tooltip).
- Trigger no slot default, conteúdo em `#content` (Modal, Popover, Slideover, Tooltip). Slots `#header`/`#body`/`#footer` dentro de `#content`.
- `prevent-close` → `:dismissible="false"` (Modal, Slideover).
- `Pagination`: `v-model` → `v-model:page`.
- `change` agora emite evento nativo; novo valor em `update:modelValue` (Select, SelectMenu, RadioGroup).
- `SelectMenu`: `searchable` → `search-input` (default `true`; para desativar `:search-input="false"`).
- `Accordion`: `multiple` → `type` (`'single'` default / `'multiple'`); `default-open`/`defaultOpen` → `default-value` ou `v-model`; slot `#item` → `#content`/`#body`; `unmount` → `unmount-on-hide` (default `true`).
- `Tabs`: `#item` → `#content`; `default-index` → `default-value`; `unmount` → `unmount-on-hide`.
- `Table`: TanStack Table; `rows` → `data`; colunas `label`/`key` → `header`/`accessorKey`; slots `<col>-data` → `<col>-cell`.
- `Alert`: `close-button` → `close`; evento `close` → `update:open`; slots `#icon`/`#avatar` → `#leading`.
- `Form`: sempre valida no submit; `validate-on` só controla eventos de input (`:validate-on="[]"` = só submit). Form components agora `inline-flex` (não expandem 100%; adicione `w-full`).
- `popper` → `content` (posicionamento: `placement`→`side`/`align`) em Tooltip, Popover, DropdownMenu, ContextMenu, SelectMenu, InputMenu.
- `Tooltip`: `shortcuts` → `kbds`, `prevent` → `disabled`.
- `Popover`: slot `#panel` → `#content`.
- `ContextMenu`: redesenhado, usa `items` + trigger/content.
- `Progress`: `value` → `model-value`, `indicator` → `status`.
- `Carousel`: `indicators` → `dots` (usa Embla).
- `help` → `description` (Checkbox, RadioGroup).
- `Breadcrumb`: `divider` → `separator-icon`, slot `#divider` → `#separator`.
- `Avatar`: `chip-color`/`chip-position`/`chip-text` → objeto `:chip`.
- `Button`: `padded`/`truncate` removidos (`:padded="false"` → `square`).
- `Chip`: `show` → `v-model:show`.
- `CommandPalette`: grupos com `items` (não `commands`) e `onSelect` (não `click`).

### Composables

- `useToast().add({ timeout })` → `duration`.
- `useModal`/`useSlideover` removidos → `useOverlay`: `overlay.create(Comp, { props })`, `instance.open()` retorna resultado awaitable; fechar via evento `close` emitido pelo componente.

### Validação de forms

`FormError`: propriedade `path` → `name`.

## Contribuição

Guidelines para AI em [`AGENTS.md`](https://github.com/nuxt/ui/blob/v4/AGENTS.md). Docs em `docs/` (Nuxt + `@nuxt/content`); módulo em `src/` (componentes em `src/runtime/components`, temas em `src/theme/<comp>.ts`).

CLI `nuxt-ui make` (após `npm link`): `nuxt-ui make component <name>` (`--primitive`, `--prose`, `--content`, `--template=docs|test|theme|...`); `nuxt-ui make locale --code <code>`.

Dev local: `git clone -b v4 https://github.com/nuxt/ui.git`, `corepack enable`, `pnpm install`, `pnpm run dev:prepare`. Rodar docs `pnpm run docs`, playground Nuxt `pnpm run dev`, Vue `pnpm run dev:vue`. `pnpm run lint[:fix]`, `pnpm run typecheck`, `pnpm run test` (tecla `u` p/ atualizar snapshots). Commits: Conventional Commits (`fix`/`feat`/`docs`/`chore`). Squash and Merge no merge.

## Referência

- https://ui.nuxt.com/docs/getting-started/migration/v3
- https://ui.nuxt.com/docs/getting-started/migration/v4
- https://ui.nuxt.com/docs/getting-started/contribution
