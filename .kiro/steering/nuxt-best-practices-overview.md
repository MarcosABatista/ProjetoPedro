---
inclusion: auto
name: nuxt-best-practices-overview
description: Boas práticas Nuxt v4 de acessibilidade (SPA routing), Dev Containers e módulos de performance (Nuxt Image/Fonts/Scripts). Ativar ao cuidar de a11y, otimizar imagens/fontes/scripts de terceiros, ou configurar dev containers. Para hidratação/performance de código e typecheck, ver nuxt-boas-praticas.
---
# Nuxt — Acessibilidade, Módulos de Performance e Dev Containers

> Escopo: este steering cobre o que é **exclusivo** de acessibilidade, módulos oficiais de performance e dev containers.
> Para **hidratação**, **performance de código** (Lazy, routeRules, data fetching, prefetch), **typecheck** e **debugging SSR**, ver [nuxt-boas-praticas](nuxt-boas-praticas.md).

## Acessibilidade

O Nuxt muda a **navegação**: após a hidratação, as rotas são client-side, então o browser não anuncia mais páginas novas nem reseta o foco. É preciso reintroduzir isso manualmente.

### Anúncio de rotas

`<NuxtRouteAnnouncer>` renderiza uma live region oculta e escreve o título da nova página após navegar. Só é útil se cada rota tiver um `<title>` distinto.

```vue [app.vue]
<template>
  <NuxtRouteAnnouncer />
  <NuxtPage />
</template>
```

Anunciar mensagens custom com `useRouteAnnouncer().set(...)`. Para updates que não são de navegação, usar `<NuxtAnnouncer>` + `useAnnouncer`.

### Títulos de página

```vue [app.vue]
useHead({ titleTemplate: title => title ? `${title} - App` : 'App' })
```

### Links

Usar `<NuxtLink>` (gera `<a href>` real focável, tab order, middle-click). O link da rota atual expõe `aria-current="page"`; sobrescrever com `aria-current-value`. Marcar links de `public/` ou entre apps como `external`.

### Gerenciamento de foco

Após a navegação client-side o foco fica no link ativado. Adicione um skip link como primeiro tab stop; o `<main>` precisa de `tabindex="-1"` para aceitar foco.

```vue [app.vue]
<a class="skip-link" href="#main">Pular para o conteúdo</a>
<main id="main" tabindex="-1"><NuxtPage /></main>
```

Opcionalmente, mover o foco para `#main` após cada navegação via um plugin `.client` usando `useRouter().afterEach`.

### Scroll

O Nuxt rola ao topo em rota nova, restaura no voltar, e rola até o hash. Customizar via `scrollBehaviorType` ou escrevendo `scrollBehavior` em `app/router.options.ts`. Respeitar `prefers-reduced-motion`.

> Validação completa de a11y exige teste manual com tecnologia assistiva e revisão por especialista.

## Módulos de Performance (oficiais)

Preferir os módulos oficiais em vez de soluções manuais — cobrem SSR, cache e Core Web Vitals por padrão.

### Nuxt Image — `<NuxtImg>` / `<NuxtPicture>`

Otimiza imagens locais/remotas, formatos modernos (WebP/Avif), `sizes` responsivo e lazy nativo. Priorizar imagens LCP:

```vue
<!-- Hero (LCP): carregar cedo, alta prioridade -->
<NuxtImg src="/hero.jpg" format="webp" :preload="{ fetchPriority: 'high' }" loading="eager" width="1200" height="600" />
<!-- Abaixo da dobra: lazy, baixa prioridade -->
<NuxtImg src="/logo.jpg" format="webp" loading="lazy" fetchpriority="low" width="200" height="100" />
```

### Nuxt Fonts

Auto self-hosting de fontes, geração de `@font-face`, proxy para `/_fonts`, métricas de fallback (reduz CLS) e bundling com cache headers. Sem config manual de `@font-face`.

### Nuxt Scripts

Carrega scripts de terceiros com SSR, type-safety e controle low-level (melhora INP/LCP):

```ts
const { proxy } = useScriptGoogleAnalytics({ id: 'G-1234567', scriptOptions: { trigger: 'manual' } })
proxy.gtag('config', 'UA-123456789-1')
```

## Plugins

- Evitar setup custoso em plugins — eles rodam durante a hidratação e bloqueiam a renderização.
- Preferir composição (composables/utilitários) a plugins sempre que possível.
- Para plugins assíncronos, definir `parallel: true` para carregar concorrentemente (plugins são síncronos por padrão).

```ts [app/plugins/exemplo.ts]
export default defineNuxtPlugin({
  name: 'meu-plugin',
  parallel: true,
  async setup () { /* ... */ },
})
```

## Dev Containers

Adicionar `.devcontainer/devcontainer.json` + `Dockerfile`. Encaminhar porta 3000, persistir `node_modules` em volume Docker, `postStartCommand: "pnpm install && pnpm dev:prepare"`. Abrir via prompt "Reopen in Container" do VS Code, Command Palette "Dev Containers: Reopen in Container", ou `@devcontainers/cli` (`devcontainer up --workspace-folder .`). Rodar `pnpm dev` → app em http://localhost:3000.

## Relacionados

- [nuxt-boas-praticas](nuxt-boas-praticas.md) — hidratação, performance de código, typecheck (`nuxi typecheck`) e debugging SSR.

## Referência

- [Accessibility](https://nuxt.com/docs/4.x/guide/best-practices/accessibility) — doc oficial Nuxt v4
- [Dev Containers](https://nuxt.com/docs/4.x/guide/best-practices/devcontainers) — doc oficial Nuxt v4
- [Performance](https://nuxt.com/docs/4.x/guide/best-practices/performance) — doc oficial Nuxt v4
- [Plugins](https://nuxt.com/docs/4.x/guide/best-practices/plugins) — doc oficial Nuxt v4
- [Nuxt Image](https://image.nuxt.com/) · [Nuxt Fonts](https://fonts.nuxt.com/) · [Nuxt Scripts](https://scripts.nuxt.com/)
