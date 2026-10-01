---
inclusion: fileMatch
fileMatchPattern: ["app/**/*.vue", "app/app.vue", "app/layouts/**/*.vue"]
name: Nuxt Head & SEO Composables
description: Use ao definir tags de <head>, título, meta e SEO/Open Graph em pages/components (useHead, useHeadSafe, useSeoMeta, useServerSeoMeta). Powered by Unhead.
---
# Nuxt v4 — Head & SEO Composables

Powered por Unhead. Chamar no setup. Todas aceitam valores reativos (`ref`/`computed`/`reactive`) ou função retornando o objeto (reatividade total).

## useHead
Gerencia `<head>` de forma programática/reativa.
```ts
function useHead(meta: MaybeComputedRef<MetaObject>): ActiveHeadEntry<UseHeadInput>

interface MetaObject {
  title?: string
  titleTemplate?: string | ((title?: string) => string)  // '%s - App' ou fn
  base?: Base
  link?: Link[]        // <link>
  meta?: Meta[]        // <meta>
  style?: Style[]
  script?: Script[]
  noscript?: Noscript[]
  htmlAttrs?: HtmlAttributes  // atrib. <html>
  bodyAttrs?: BodyAttributes  // atrib. <body>
}
// retorno: { patch(input), dispose() } — atualizar/remover a entry
```
```vue
<script setup lang="ts">
useHead({
  title: 'About Us',
  titleTemplate: '%s - MyApp',
  meta: [
    { name: 'description', content: 'Learn more about us' },
    { property: 'og:title', content: 'About Us' },
  ],
  link: [{ rel: 'stylesheet', href: 'https://cdn.example.com/s.css' }],
  script: [{ src: 'https://cdn.example.com/s.js', async: true }],
  htmlAttrs: { lang: 'en', class: computed(() => isDark.value ? 'dark' : 'light') },
  bodyAttrs: { class: 'themed' },
})
// reatividade total via função:
useHead(() => ({ title: `Count: ${count.value}` }))
</script>
```
Não retorna valor útil de leitura — registra no Unhead (gerencia DOM). Gotcha: dados de fonte não confiável (usuário) → usar `useHeadSafe` (XSS).

## useHeadSafe
Wrapper de `useHead` que sanitiza input via allow-list de tags/atributos → seguro para dados não confiáveis. Mesma assinatura/objeto de `useHead`, mas propriedades/valores fora da whitelist são removidos (ex.: só permite `script` com `src`/`type`/`textContent` restritos, sem handlers inline perigosos).
```vue
<script setup lang="ts">
useHeadSafe({
  meta: [{ name: 'description', content: userProvidedContent }],
  script: [{ id: 'analytics', src: userProvidedUrl }],
})
</script>
```
Usar sempre que o conteúdo do head vier de usuário/CMS/fonte externa.

## useSeoMeta
Define meta SEG/Open Graph/Twitter como objeto plano, 100+ tags tipadas. XSS-safe. **Forma recomendada** para meta tags. Evita erros comuns (`name` vs `property`, typos).
```vue
<script setup lang="ts">
useSeoMeta({
  title: 'My Site',
  description: 'About my site.',
  ogTitle: 'My Site',
  ogDescription: 'About my site.',
  ogImage: 'https://example.com/image.png',
  twitterCard: 'summary_large_image',
  robots: 'index, follow',
})
// reativo: usar getter () => value
const title = ref('My title')
useSeoMeta({ title, description: () => `Desc for ${title.value}` })
</script>
```
Chaves em camelCase (`ogTitle`, `ogImage`, `twitterCard`, `articlePublishedTime`, etc.). Perf: meta SEO geralmente não precisa ser reativa (robôs leem load inicial) → envolver estáticas em `if (import.meta.server) { useSeoMeta({...}) }` e usar getters só nas dinâmicas.

## useServerSeoMeta (deprecated)
Antes: versão só-server/não-reativa de `useSeoMeta`. **Deprecado** — usar `useSeoMeta` dentro de `if (import.meta.server)` no lugar. Mesmo objeto de parâmetros.
```vue
<script setup lang="ts">
// legado — preferir o padrão acima
useServerSeoMeta({ ogImage: 'https://example.com/image.png', description: 'Static' })
</script>
```

## Referência

- [useHead](https://nuxt.com/docs/4.x/api/composables/use-head)
- [useHeadSafe](https://nuxt.com/docs/4.x/api/composables/use-head-safe)
- [useSeoMeta](https://nuxt.com/docs/4.x/api/composables/use-seo-meta)
- [useServerSeoMeta](https://nuxt.com/docs/4.x/api/composables/use-server-seo-meta)
