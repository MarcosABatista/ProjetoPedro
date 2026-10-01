---
inclusion: auto
name: nuxt-typecheck-golar
description: Typecheck estático em Nuxt v4 via Golar (motor typescript-go) sem prompts interativos do CLI nem ERR_PACKAGE_PATH_NOT_EXPORTED. Ativar ao configurar, rodar ou depurar typecheck (nuxi typecheck, vue-tsc, golar).
---

# Nuxt v4 — Typecheck Nativo (Golar)

Verificação estática de tipos em projetos Nuxt sem cair em prompts interativos do CLI nem em erros de resolução de módulos ESM.

## O prompt interativo — mecanismo (por que trava o agente)

`nuxt typecheck` (alias `nuxi typecheck`) roda **`vue-tsc` OU `golar`**. Comportamento oficial do CLI:

> Se **nenhum dos dois** estiver instalado, o comando **pergunta qual instalar** (terminal interativo) ou **mostra instruções** (terminal não-interativo).

Ou seja, o prompt "vue-tsc vs golar" aparece **quando nenhum checker está nas dependências no momento da primeira execução**. Um agente de código roda em terminal não-interativo e trava/falha nesse ponto.

**Duas defesas combinadas eliminam o prompt de forma determinística:**

1. **Instalar `golar` ANTES da primeira invocação** de `nuxt typecheck` → não há prompt porque um checker já existe.
2. **Fixar o checker explicitamente** com a flag `--checker golar` → o CLI não tenta auto-detectar nem decidir entre `vue-tsc` e `golar`.

Aplicar **as duas** garante que o `nuxi typecheck` nunca pergunte nada.

## Procedimento para projeto novo (nenhum arquivo criado ainda)

Executar **nesta ordem**, ANTES de qualquer `nuxt typecheck`:

### 1. Criar o projeto Nuxt não-interativamente

Ver steering `nuxt-create-nao-interativo`. Ex.:

```bash
pnpm create nuxt@latest meu-app --packageManager pnpm --modules @nuxt/ui --gitInit
```

### 2. Instalar o checker (antes de rodar typecheck)

```bash
pnpm add -D golar @golar/vue
```

Manter `golar` e `@golar/vue` **explicitamente** em `devDependencies`. É a presença do checker instalado que impede o prompt de seleção.

### 3. Criar `golar.config.ts` (raiz do projeto)

Apontar direto para o `tsconfig` gerado pelo Nuxt:

```ts [golar.config.ts]
export default {
  tsconfig: './.nuxt/tsconfig.json',
}
```

> ⚠️ **NÃO** usar `import { defineConfig } from 'golar'`. O binário CLI do pacote não declara ponto de entrada raiz em `exports` para o loader ESM do Node.js → `ERR_PACKAGE_PATH_NOT_EXPORTED`. Exportar o objeto literal direto.

Suporte a `.vue` via plugin `@golar/vue` — **só ativar se o type check deixar de enxergar tipos dentro de `.vue`** (SFCs/templates). Config básica acima já resolve a maioria dos casos; se necessário, descomentar o plugin:

```ts [golar.config.ts]
import vue from '@golar/vue'

export default {
  plugins: [vue()],
  tsconfig: './.nuxt/tsconfig.json',
}
```

### 4. Criar `shims-vue.d.ts` (raiz do projeto)

Declaração global para o compilador reconhecer `.vue` fora da árvore interna de componentes (necessário p/ imports de `.vue` em testes):

```ts [shims-vue.d.ts]
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
```

### 5. Configurar scripts no `package.json`

O `golar.config.ts` aponta para `./.nuxt/tsconfig.json`, que **só existe após `nuxt prepare`**. Em projeto recém-criado esse arquivo ainda não foi gerado — por isso o script encadeia `nuxt prepare` antes, e fixa o checker com `--checker golar`:

```json [package.json]
{
  "scripts": {
    "postinstall": "nuxt prepare",
    "typecheck": "nuxt prepare && nuxt typecheck --checker golar"
  }
}
```

> `nuxt prepare` gera `.nuxt/` (tipos + `tsconfig`). Rodar `nuxt typecheck` avulso num projeto sem `.nuxt/` falha por ausência do tsconfig referenciado.

### 6. Rodar ponta a ponta

```bash
pnpm run typecheck
```

Esperado: `Using config from ./golar.config.ts...` seguido de `Type check passed`, **sem nenhum prompt**.

## Checklist antecipado (agente) — garantir zero prompt

1. Projeto criado via `pnpm create nuxt` não-interativo.
2. `pnpm add -D golar @golar/vue` executado **antes** de qualquer `nuxt typecheck`.
3. `golar.config.ts` criado (objeto literal, sem `defineConfig`).
4. `shims-vue.d.ts` criado na raiz.
5. Script `typecheck` usa `nuxt prepare && nuxt typecheck --checker golar`.
6. Primeira execução é sempre via `pnpm run typecheck` (nunca `nuxt typecheck` avulso).

## Lições aprendidas / troubleshooting

| Sintoma | Causa | Solução |
|---|---|---|
| Prompt "vue-tsc vs golar" travando CI/dev | Nenhum checker instalado na 1ª execução do `nuxi typecheck` | Instalar `golar` + `@golar/vue` ANTES; usar `--checker golar` |
| `ERR_PACKAGE_PATH_NOT_EXPORTED` no `vue-tsc` | `vue-tsc` usa `typescript/lib/tsc`; versões novas restringem subcaminhos em `exports` | Usar Golar (motor Go, independente de scripts JS internos) |
| `import { defineConfig } from 'golar'` falha | CLI não expõe entrypoint raiz em `exports` | Exportar objeto literal direto no `golar.config.ts` |
| tsconfig `./.nuxt/tsconfig.json` não encontrado | `.nuxt/` não gerado (projeto novo / sem prepare) | Rodar `nuxt prepare` antes (script já encadeia) |
| Tipos dentro de `.vue` não reconhecidos no check | Golar sem plugin Vue | Ativar `plugins: [vue()]` de `@golar/vue` no `golar.config.ts` |
| `.vue` não encontrado em testes (TS2307) | `import Page from '~/pages/index.vue'` sem tipo para a extensão | Incluir `shims-vue.d.ts` na raiz |
| Genéricos perdidos em auto-imports (TS2347) | `ref`/`computed` por auto-import no Vitest podem perder a sobrecarga genérica `<T>` | Importar explícito (`import { ref } from 'vue'`) ou tipar o inicial (`ref(null as Tipo \| null)`) |

## Referência

- [Golar Docs](https://golar.dev/) — motor typescript-go, run modes (default/lint/typecheck/tsc)
- [auvred/golar](https://github.com/auvred/golar) — repositório do orquestrador
- [nuxt typecheck](https://nuxt.com/docs/api/commands/typecheck) — comando Nuxt v4 (flag `--checker`, prompt quando nenhum checker instalado)
