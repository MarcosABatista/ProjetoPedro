---
inclusion: fileMatch
fileMatchPattern: "{app,server,shared}/**,nuxt.config.ts"
name: nuxt-boas-praticas
description: Boas práticas Nuxt — hidratação, performance de código, verificação de tipos e debugging SSR. Ativar ao desenvolver features no Nuxt. Para acessibilidade, dev containers e módulos de performance (Image/Fonts/Scripts), ver nuxt-best-practices-overview.
---

# Boas Práticas Nuxt

> Escopo: hidratação, performance de código, typecheck e debugging SSR.
> Para **acessibilidade**, **dev containers** e **módulos de performance** (Nuxt Image/Fonts/Scripts), ver [nuxt-best-practices-overview](nuxt-best-practices-overview.md).

## Hidratação

Erros de hidratação não são apenas avisos — podem quebrar a aplicação. Sempre corrija-os.

### Regras

- **Nunca acesse APIs do browser durante SSR** (ex: `localStorage`, `window`, `document`). Use `useCookie` ou mova o código para `onMounted`
- **Use composables SSR-friendly** para dados compartilhados entre servidor e cliente: `useFetch`, `useAsyncData`, `useState`
- **Evite conteúdo não-determinístico no template** (ex: `Math.random()`, `new Date()`). Use `useState` para valores aleatórios e `<NuxtTime>` ou `<ClientOnly>` para conteúdo baseado em tempo
- **Inicialize bibliotecas de terceiros com efeitos colaterais dentro de `onMounted`**, nunca diretamente no `<script setup>`
- **Use `<ClientOnly>`** para envolver conteúdo que só faz sentido no cliente, sempre fornecendo um `#fallback`
- **Evite condicionais baseadas em `window` no template** — prefira media queries CSS ou classes responsivas do Tailwind

### Side-effects no `<script setup>`

Código com side-effects que precisam de cleanup (timers, event listeners, subscriptions) **deve ficar dentro de `onMounted`**, nunca no nível raiz do `<script setup>`:

```vue
<script setup>
// ❌ ERRADO — setInterval nunca será limpo no servidor (onUnmounted não executa em SSR)
const intervalo = setInterval(() => { /* ... */ }, 1000)
onUnmounted(() => clearInterval(intervalo))

// ✅ CORRETO — side-effects dentro de onMounted
onMounted(() => {
  const intervalo = setInterval(() => { /* ... */ }, 1000)
  onUnmounted(() => clearInterval(intervalo))
})
</script>
```

### Exemplo correto

```vue
<script setup>
// ✅ funciona em servidor e cliente
const tema = useCookie('tema', { default: () => 'claro' })

// ✅ biblioteca com efeitos colaterais
onMounted(async () => {
  const { default: Lib } = await import('lib-apenas-browser')
  Lib.init()
})
</script>
```

---

## Performance

### Carregamento de Componentes

- **Use o prefixo `Lazy`** em componentes que não são necessários no carregamento inicial (ex: `<LazyListaResultados v-if="mostrar" />`)
- **Use hidratação lazy** em componentes pesados que ficam abaixo da dobra: `<LazyMeuComponente hydrate-on-visible />`

### Busca de Dados

- **Sempre use `useFetch` ou `useAsyncData`** para buscar dados — evita buscar os mesmos dados duas vezes (servidor + cliente)
- **Nunca use `fetch` nativo ou `$fetch` sozinho no setup** em componentes que renderizam no servidor — causa busca duplicada
- **Use `pick` ou `transform`** para reduzir o tamanho do payload transferido do servidor para o cliente
- **Suspense:** o Nuxt usa `<Suspense>` do Vue internamente — `useFetch`/`useAsyncData` bloqueiam a navegação até resolver. Use `lazy: true` para não bloquear

### Renderização Híbrida

Configure `routeRules` no `nuxt.config.ts` de acordo com a natureza de cada rota:

```ts
routeRules: {
  '/': { prerender: true },       // estático, gerado no build
  '/admin/**': { ssr: false },    // SPA, apenas cliente
}
```

> ⚠️ **Segurança (secops §10):** Nunca use `cors: true` sem restringir a origem. CORS aberto (`Access-Control-Allow-Origin: *`) permite que qualquer site faça requisições autenticadas à sua API. Se precisar de CORS, restrinja a origens confiáveis:
>
> ```ts
> routeRules: {
>   '/api/**': {
>     cors: true,
>     headers: { 'Access-Control-Allow-Origin': 'https://meudominio.com.br' }
>   }
> }
> ```

### Links e Navegação

- **Use sempre `<NuxtLink>`** em vez de `<a>` para links internos — habilita prefetch automático
- Para prefetch apenas na interação (hover/foco), configure em `nuxt.config.ts`:

```ts
experimental: {
  defaults: {
    nuxtLink: {
      prefetchOn: { interaction: true, visibility: false }
    }
  }
}
```

### Problemas Comuns a Evitar

| Problema | Solução |
|---|---|
| Muitos plugins pesados | Converter em composables ou funções utilitárias |
| Dependências não utilizadas | Auditar `package.json` regularmente |
| Carregar tudo ao mesmo tempo | Usar carregamento progressivo e lazy loading |
| Ignorar otimizações do Vue | Usar `shallowRef`, `v-memo`, `v-once` quando apropriado |

### Ferramentas de Diagnóstico

- `pnpm nuxi analyze` — visualiza o bundle de produção
- Nuxt DevTools (habilitado em dev) — timeline, árvore de renderização, inspeção de arquivos
- Chrome DevTools → Performance e Lighthouse

---

## Verificação de Tipos

### Comando correto: `nuxi typecheck`

**Nunca** use `tsc --noEmit` diretamente em projetos Nuxt. O `tsconfig.json` do Nuxt usa project references (`.nuxt/tsconfig.*.json`) que geram erros falsos TS6305/TS6306/TS6310 com `tsc` puro.

O verificador correto é:

```bash
vpx nuxi typecheck
```

O `nuxi typecheck` configura o ambiente TypeScript do Nuxt corretamente antes de invocar `vue-tsc`, resolvendo aliases (`~/`, `#imports`, `#components`), auto-imports e project references.

### Quando usar

| Situação | Comando |
|---|---|
| Verificar tipos do projeto inteiro | `vpx nuxi typecheck` |
| CI/CD | `vpx nuxi typecheck` no pipeline |
| Arquivo específico (diagnóstico rápido) | Usar diagnostics da IDE (Kiro/VS Code) |

### O que NÃO fazer

```bash
# ❌ ERRADO — gera dezenas de erros falsos TS6305/TS6306/TS6310
vpx tsc --noEmit

# ❌ ERRADO — vue-tsc puro sem contexto Nuxt
vpx vue-tsc --noEmit

# ✅ CORRETO
vpx nuxi typecheck
```

### Erros esperados (pré-existentes)

Se `nuxi typecheck` reportar **apenas** erros TS6305 ("Output file has not been built from source") e TS6306/TS6310 ("must have composite: true"), significa que os types gerados em `.nuxt/` estão desatualizados. Resolver com:

```bash
vpx nuxi prepare
vpx nuxi typecheck
```

### Erro "Nuxt Instance Unavailable"

Ocorre ao chamar composables fora do contexto correto:

```ts
// ❌ ERRADO — composable no nível de módulo
const config = useRuntimeConfig()
export function useMeuComposable() { return config.public.apiBase }

// ✅ CORRETO — composable dentro da função
export function useMeuComposable() {
  const config = useRuntimeConfig()
  return config.public.apiBase
}
```

### Obter contexto antes de `await`

```vue
<script setup lang="ts">
// ✅ Obtenha todos os composables ANTES de qualquer await
const route = useRoute()
const config = useRuntimeConfig()

await algumaOperacaoAssincrona()
// Agora é seguro usar route e config
</script>
```

### Vazamento de estado entre requisições

No servidor, estado no nível de módulo persiste entre requisições:

```ts
// ❌ ERRADO — estado compartilhado entre todas as requisições
const estadoGlobal = ref({ usuario: null })

// ✅ CORRETO — useState cria estado isolado por requisição
export const useUsuario = () => useState('usuario', () => null)
```

### Integração de bibliotecas de terceiros

```vue
<script setup lang="ts">
// ❌ ERRADO — import de lib browser-only no top level
import BibliotecaBrowser from 'lib-browser-only' // Quebra SSR

// ✅ CORRETO — dynamic import dentro de onMounted
let biblioteca: typeof import('lib-browser-only')

onMounted(async () => {
  biblioteca = await import('lib-browser-only')
  biblioteca.init()
})
</script>
```

### Debugging SSR

| Erro | Causa |
|---|---|
| "Nuxt instance unavailable" | Composable chamado fora do contexto setup |
| "Hydration mismatch" | HTML do servidor difere do cliente |
| "window is not defined" | API do browser usada durante SSR |
| "document is not defined" | Acesso ao DOM durante SSR |

---

## Relacionados

- [nuxt-best-practices-overview](nuxt-best-practices-overview.md) — acessibilidade, dev containers e módulos de performance (Image/Fonts/Scripts).

## Referência

- [Hydration](https://nuxt.com/docs/4.x/guide/best-practices/hydration) — doc oficial Nuxt v4
- [Performance](https://nuxt.com/docs/4.x/guide/best-practices/performance) — doc oficial Nuxt v4
- [TypeScript](https://nuxt.com/docs/4.x/guide/concepts/typescript) — doc oficial Nuxt v4
- [nuxt typecheck](https://nuxt.com/docs/4.x/api/commands/typecheck) — doc oficial Nuxt v4
