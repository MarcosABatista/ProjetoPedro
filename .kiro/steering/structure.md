---
inclusion: always
name: structure
description: Project file organization, naming conventions, Nuxt v4 directory layout and the index of structural + UI-composition steerings. Loaded in every interaction.
---

# Project Structure

Convenções de organização para apps Nuxt v4 gerados por este harness. Código novo deve encaixar nestas convenções. Ver `tech.md` para a stack e índice das APIs.

## Layout de diretórios (Nuxt v4)

```
<app>/
├─ app/                 # srcDir: app.vue, app.config.ts, error.vue
│  ├─ pages/            # rotas file-based (index.vue, [id].vue)
│  ├─ layouts/          # layouts (default.vue)
│  ├─ components/       # auto-import (PascalCase, prefixo por pasta)
│  ├─ composables/ utils/   # auto-import (use*.ts / helpers)
│  ├─ middleware/       # name.ts, name.global.ts
│  ├─ plugins/ assets/  # plugins auto-registrados; css/imgs do build
├─ server/             # Nitro: api/ routes/ middleware/ utils/ plugins/
├─ shared/             # isomórfico app<->server (utils/, types/)
├─ public/             # estáticos as-is
├─ content/ layers/ modules/   # opcionais / extensões locais
├─ nuxt.config.ts  tsconfig.json  package.json
├─ .env                # TZ=America/Sao_Paulo
├─ docker-compose.yml  # app + postgres (dev)
└─ .gitlab-ci.yml      # CI/CD (lint, test, build)
```

## Convenções

- **Nomes**: componentes `PascalCase.vue`; pages kebab-case; composables `useX.ts`; middleware kebab-case.
- **Componentes**: auto-import (caminho → nome: `components/base/Button.vue` → `<BaseButton>`). Nuxt UI usa prefixo `U` (`<UButton>`).
- **Imports**: preferir auto-imports; evitar relativos profundos; usar `~/`, `#shared`, `#imports`.
- **Server**: endpoints em `server/api/**` (`.get.ts`/`.post.ts`); lógica em `server/utils/`; validar input; tipos em `shared/types`.
- **Estilo**: usar tokens/CSS variables do Nuxt UI; cores semânticas (`primary`, `neutral`, ...), não hex soltas.
- **Data/DB**: Postgres só no server (Nitro), nunca no client; queries parametrizadas.
- **TypeScript**: `strict`; `<script setup lang="ts">`.

Steerings abaixo (`inclusion: auto`) carregam sob demanda pela `description` ou via `/nome`.

---

## Directory Structure

| Nome | Descrição | Steering |
|---|---|---|
| Diretório `app/` | `app.vue`, pages, layouts, components, composables, utils, middleware, plugins, assets, `error.vue`, `app.config.ts` | [nuxt-directory-structure-app](nuxt-directory-structure-app.md) |
| Raiz & config | `nuxt.config`, `.nuxtrc`, `.nuxtignore`, `.env`, `tsconfig`, `package.json`, e dirs server/shared/public/modules/layers/content/test/.nuxt/.output | [nuxt-directory-structure-root](nuxt-directory-structure-root.md) |

## Views

| Nome | Descrição | Steering |
|---|---|---|
| Views (overview) | Camadas de componentes: app.vue, layouts, pages, components | [nuxt-views-overview](nuxt-views-overview.md) |

## Routing

| Nome | Descrição | Steering |
|---|---|---|
| Routing (overview) | Roteamento file-based do diretório `pages/` | [nuxt-routing-overview](nuxt-routing-overview.md) |
| Routing Recipes | Custom routing/router options, custom `useFetch`, mostly-static, Vite plugins | [nuxt-routing-recipes](nuxt-routing-recipes.md) |

## Assets

| Nome | Descrição | Steering |
|---|---|---|
| Assets (overview) | `assets/` processado pelo build vs `public/` | [nuxt-assets-overview](nuxt-assets-overview.md) |

## Styling

| Nome | Descrição | Steering |
|---|---|---|
| Styling (overview) | Como estilizar apps Nuxt | [nuxt-styling-overview](nuxt-styling-overview.md) |

## Transitions

| Nome | Descrição | Steering |
|---|---|---|
| Transitions (overview) | Transições entre páginas/layouts (Vue + View Transitions API) | [nuxt-transitions-overview](nuxt-transitions-overview.md) |

## Layers

| Nome | Descrição | Steering |
|---|---|---|
| Layers (overview) | Estender arquivos, configs e mais via layers | [nuxt-layers-overview](nuxt-layers-overview.md) |

## Error Handling

| Nome | Descrição | Steering |
|---|---|---|
| Error Handling (overview) | Capturar e tratar erros no Nuxt | [nuxt-error-handling-overview](nuxt-error-handling-overview.md) |
| Error Codes Reference | Referência dos códigos `NUXT_` (build B*, runtime E*): causa + fix | [nuxt-error-handling-error-codes](nuxt-error-handling-error-codes.md) |

## Best Practices

| Nome | Descrição | Steering |
|---|---|---|
| Best Practices (overview) | Performance/Core Web Vitals, hydration, acessibilidade, plugins, dev containers | [nuxt-best-practices-overview](nuxt-best-practices-overview.md) |

## Working with AI

| Nome | Descrição | Steering |
|---|---|---|
| Working with AI (Nuxt) | LLMs.txt e Nuxt MCP Server | [nuxt-working-with-ai](nuxt-working-with-ai.md) |

## Sessions and Authentication

| Nome | Descrição | Steering |
|---|---|---|
| Sessions and Authentication | Registro, login, sessões, proteção de rotas (nuxt-auth-utils) | [nuxt-sessions-and-authentication](nuxt-sessions-and-authentication.md) |

## Components (Nuxt)

| Nome | Descrição | Steering |
|---|---|---|
| Routing & Layout Components | `NuxtPage`, `NuxtLayout`, `NuxtLink`, `NuxtLoadingIndicator`, `NuxtRouteAnnouncer`, `NuxtAnnouncer` | [nuxt-components-routing-layout](nuxt-components-routing-layout.md) |
| Image Components | `NuxtImg`, `NuxtPicture` | [nuxt-components-images](nuxt-components-images.md) |
| Rendering & Utility Components | `ClientOnly`, `DevOnly`, `NuxtClientFallback`, `NuxtIsland`, `NuxtErrorBoundary`, `Teleport`, `NuxtTime`, `NuxtWelcome` | [nuxt-components-rendering-util](nuxt-components-rendering-util.md) |

---

# Nuxt UI Components

## UI Components — Overview & Layout

| Nome | Descrição | Steering |
|---|---|---|
| Catálogo de Componentes | Descoberta dos 125+ componentes por categoria | [nuxtui-components-overview](nuxtui-components-overview.md) |
| Layout | App, Container, Main, Header, Footer, FooterColumns, Sidebar, Banner | [nuxtui-components-layout](nuxtui-components-layout.md) |
| Page (Core/Docs) | Page, PageHeader, PageBody, PageAside, PageAnchors, PageLinks, PageCard, PageGrid, PageColumns, PageList | [nuxtui-components-page-core](nuxtui-components-page-core.md) |
| Page (Marketing) | PageHero, PageSection, PageFeature, PageCTA, PageLogos | [nuxtui-components-page-marketing](nuxtui-components-page-marketing.md) |
| Dashboard | DashboardGroup, Sidebar, Panel, Navbar, Toolbar, Search + auxiliares | [nuxtui-components-dashboard](nuxtui-components-dashboard.md) |

## UI Components — Forms & Inputs

| Nome | Descrição | Steering |
|---|---|---|
| Form Core | Form, FormField, FieldGroup — validação/submit por schema | [nuxtui-components-form-core](nuxtui-components-form-core.md) |
| Text Inputs | Input, InputNumber/Date/Time/Tags/Rating, Textarea, PinInput | [nuxtui-components-text-inputs](nuxtui-components-text-inputs.md) |
| Selection Menus | Select, SelectMenu, InputMenu, Listbox | [nuxtui-components-selection-menus](nuxtui-components-selection-menus.md) |
| Toggles | Checkbox, CheckboxGroup, RadioGroup, Switch | [nuxtui-components-toggles](nuxtui-components-toggles.md) |
| Advanced Inputs | Slider, ColorPicker, Calendar, FileUpload | [nuxtui-components-inputs-advanced](nuxtui-components-inputs-advanced.md) |
| Editor | Editor rich-text TipTap (conteúdo, handlers, extensions, toolbar) | [nuxtui-components-editor](nuxtui-components-editor.md) |
| Editor Menus | DragHandle, SuggestionMenu (/), MentionMenu (@), EmojiMenu (:) | [nuxtui-components-editor-menus](nuxtui-components-editor-menus.md) |

## UI Components — Overlays & Navigation

| Nome | Descrição | Steering |
|---|---|---|
| Overlays — Dialogs | Modal, Slideover, Drawer (+ `useOverlay`) | [nuxtui-components-overlays-dialogs](nuxtui-components-overlays-dialogs.md) |
| Overlays — Popover & Menus | Popover, Tooltip, ContextMenu, DropdownMenu, CommandPalette | [nuxtui-components-overlays-menus](nuxtui-components-overlays-menus.md) |
| Navigation — Menus | Breadcrumb, NavigationMenu, Tabs, Pagination | [nuxtui-components-navigation-menus](nuxtui-components-navigation-menus.md) |
| Navigation — Disclosure | Accordion, Collapsible, Stepper, Tree | [nuxtui-components-navigation-disclosure](nuxtui-components-navigation-disclosure.md) |

## UI Components — Data Display, Feedback & Elements

| Nome | Descrição | Steering |
|---|---|---|
| Data Display — Structured | Table (TanStack), Timeline | [nuxtui-components-data-display-structured](nuxtui-components-data-display-structured.md) |
| Data Display — Containers | Carousel, Marquee, ScrollArea, Splitter | [nuxtui-components-data-display-containers](nuxtui-components-data-display-containers.md) |
| Feedback — Notifications | Alert, Banner, Toast | [nuxtui-components-feedback-notifications](nuxtui-components-feedback-notifications.md) |
| Feedback — Indicators | Progress, Skeleton, Badge, Chip, Kbd | [nuxtui-components-feedback-indicators](nuxtui-components-feedback-indicators.md) |
| Elements — Interactive | Button, Link, Icon, Avatar, AvatarGroup | [nuxtui-components-elements-interactive](nuxtui-components-elements-interactive.md) |
| Elements — Structure | Card, Separator, Empty | [nuxtui-components-elements-structure](nuxtui-components-elements-structure.md) |

## UI Components — Chat, Content, Color Mode & Marketing

| Nome | Descrição | Steering |
|---|---|---|
| Chat (AI SDK) | ChatMessages/Message/Prompt/PromptSubmit/Reasoning/Tool/Shimmer/Palette | [nuxtui-components-chat](nuxtui-components-chat.md) |
| Content / Blog / Changelog | ContentNavigation/Search/Surround/Toc, BlogPost(s), ChangelogVersion(s) | [nuxtui-components-content](nuxtui-components-content.md) |
| Color Mode | ColorModeButton/Switch/Select/Avatar/Image | [nuxtui-components-color-mode](nuxtui-components-color-mode.md) |
| Marketing & Auth | PricingPlan(s), PricingTable, AuthForm, User | [nuxtui-components-marketing](nuxtui-components-marketing.md) |

## UI Typography

| Nome | Descrição | Steering |
|---|---|---|
| Typography Overview | Renderizar markdown estilizado (prose, ContentRenderer/MDC) | [nuxtui-typography-overview](nuxtui-typography-overview.md) |
| Typography Prose Components | Sintaxe MDC de cada prose component + headers/text/lists/tables/images | [nuxtui-typography-prose](nuxtui-typography-prose.md) |
