---
inclusion: auto
name: design-system
description: Design system do sistema — fundamentos visuais (cores semânticas, espaçamento, ícones), padrões de componentes (UFormField, UInput, UButton, hints, reset) e padrões de UI/UX de composição de tela (campos lado a lado, alinhamento, validação pt-BR, acessibilidade) com Nuxt UI. Ativar ao criar ou ajustar telas, formulários, componentes ou a assinatura visual.
---

# Design System

Vocabulário visual e de interação do sistema, construído sobre **Nuxt UI v4**. Define os fundamentos (tokens), os padrões por componente e como compô-los em telas. Estes padrões nasceram do formulário de conexão (`app/components/banco/FormularioConexao.vue`) e devem ser reaplicados em qualquer tela nova para manter consistência.

Princípio geral: **preferir sempre props e recursos nativos dos componentes Nuxt UI** antes de recorrer a CSS custom ou slots. Só descer para Tailwind/`ui` prop quando o comportamento nativo não cobrir o caso.

Estrutura deste documento:
- **Fundamentos** — o vocabulário visual base (cores, espaçamento, ícones).
- **Componentes** — padrões de uso por componente (o "o quê").
- **Padrões de UI/UX** — como compor os componentes em telas (o "como usar").
- **Checklist** — verificação rápida ao construir/ajustar um formulário.

---

## Fundamentos

Tokens e assinatura visual base. Aplicáveis a qualquer tela.

- **Cores**: usar cores semânticas do design system (`primary`, `neutral`, `error`, `success`, ...) — nunca hex soltas. As cores respeitam automaticamente o color mode (light/dark).
- **Espaçamento**: `gap-4` como espaçamento padrão entre campos agrupados; `space-y-4` entre blocos verticais de um formulário.
- **Ícones**: coleção `lucide` (`i-lucide-*`) como padrão, via Iconify. Ex.: reset `i-lucide-rotate-ccw`, visibilidade `i-lucide-eye`/`i-lucide-eye-off`.
- **Largura de campo**: todo `UInput`/`UInputNumber` dentro de layout de coluna recebe `class="w-full"` para preencher o espaço.

---

## Componentes

Padrões de uso por componente.

### Campos opcionais — usar `hint`, não a label

Não escrever "(opcional)" dentro da label. Usar a prop nativa `hint` do `UFormField`, que renderiza o texto à direita, alinhado com a label à esquerda.

```vue
<!-- ✅ Correto -->
<UFormField label="Senha" name="senha" hint="opcional">

<!-- ❌ Evitar -->
<UFormField label="Senha (opcional)" name="senha">
```

### Botão de reset / restaurar padrão (icon-only no `#hint`)

Para restaurar um campo ao valor padrão, usar um `UButton` icon-only no `#hint`:

- Ícone `i-lucide-rotate-ccw`, `variant="link"`, `size="xs"`, `color="neutral"`.
- `aria-label` descritivo obrigatório (a11y) — ex.: `"Restaurar porta padrão (5432)"`.
- `:disabled` quando o valor já é o padrão (nada a resetar).
- Centralizar o valor padrão em uma constante (ex.: `const PORTA_PADRAO = 5432`) e usá-la tanto no default do state quanto no reset.
- Aplicar o ajuste de altura descrito abaixo (`:ui="{ base: '-my-1 p-0' }"`).

```vue
<UButton
  color="neutral"
  variant="link"
  size="xs"
  icon="i-lucide-rotate-ccw"
  aria-label="Restaurar porta padrão (5432)"
  :disabled="state.porta === PORTA_PADRAO"
  :ui="{ base: '-my-1 p-0' }"
  @click="state.porta = PORTA_PADRAO"
/>
```

### Altura consistente da label quando há elemento no `#hint`

Colocar um `UButton` (ou qualquer elemento mais alto que texto) no slot `#hint` aumenta a altura da linha de label daquele campo, empurrando o input para baixo e desalinhando-o do campo vizinho (cujo label é só texto).

Correção: neutralizar o padding/altura do elemento do hint com `:ui="{ base: '-my-1 p-0' }"` (para `UButton`), fazendo a linha do hint colapsar para a mesma altura do texto de label.

### Formatação numérica — sem separador de milhar em identificadores

`UInputNumber` usa `Intl.NumberFormat` por padrão, exibindo separador de milhar (ex.: `5.432`). Para valores que **não** são quantidades contáveis (portas, IDs, anos, códigos numéricos), desabilitar o agrupamento:

```vue
<UInputNumber
  v-model="state.porta"
  :min="1"
  :max="65535"
  :format-options="{ useGrouping: false }"
  class="w-full"
/>
```

Regra: portas de rede, IDs e afins nunca exibem separador de milhar.

### Toggle de visibilidade (ex.: senha)

Campo de senha mascarado por padrão, com botão de alternância no `#trailing`:

- `:type` alterna entre `password` e `text`.
- `aria-label` descritivo e `aria-pressed` refletindo o estado atual.

---

## Padrões de UI/UX

Como compor os componentes em telas.

### Campos lado a lado (agrupamento horizontal)

Campos relacionados devem ficar na mesma linha no desktop e empilhar no mobile. Use um `grid` responsivo envolvendo os `UFormField`.

- Dois campos de peso igual → `grid-cols-1 sm:grid-cols-2`.
- Campos de pesos diferentes → aumente as colunas e use `col-span` no campo dominante. Ex.: Host (dominante) + Porta → `sm:grid-cols-3` com `sm:col-span-2` no Host.
- Sempre `gap-4` entre os campos e `grid-cols-1` como base (mobile empilha).

```vue
<!-- Host ocupa 2/3, Porta 1/3 -->
<div class="grid grid-cols-1 items-start gap-4 sm:grid-cols-3">
  <UFormField label="Host" name="host" required class="sm:col-span-2">
    <UInput v-model="state.host" class="w-full" />
  </UFormField>
  <UFormField label="Porta" name="porta" required>
    <UInputNumber v-model="state.porta" class="w-full" />
  </UFormField>
</div>

<!-- Par de peso igual -->
<div class="grid grid-cols-1 items-start gap-4 sm:grid-cols-2">
  <UFormField label="Usuário" name="usuario" required>
    <UInput v-model="state.usuario" class="w-full" />
  </UFormField>
  <UFormField label="Senha" name="senha" hint="opcional">
    <UInput v-model="state.senha" class="w-full" />
  </UFormField>
</div>
```

### Alinhamento de inputs em linha (`items-start`)

**Sempre** aplicar `items-start` no grid que agrupa campos lado a lado.

Motivo: quando um campo exibe mensagem de erro, ele cresce em altura. Sem `items-start`, o grid centraliza verticalmente (`stretch`/`center`) e os inputs vizinhos se deslocam. Com `items-start`, os campos alinham pelo topo e a mensagem de erro cresce **para baixo**, sem mover o vizinho.

### Mensagens de validação em pt-BR (Zod v4)

Toda mensagem de erro visível ao usuário deve estar em pt-BR (ver steering `idioma`). No Zod v4, mensagens definidas apenas em validadores como `.min(1, '...')` **não** cobrem o caso de campo intocado (`undefined`), que cai no erro de tipo padrão em inglês (ex.: `"Invalid input: expected string, received undefined"`).

Correção: definir a mensagem também no construtor do tipo, via `{ error: '...' }` (sintaxe do Zod v4, substitui `required_error`/`invalid_type_error` do v3).

```ts
// ✅ Cobre também o campo undefined (intocado)
host: z.string({ error: 'O Host é obrigatório.' }).trim().min(1, 'O Host é obrigatório.'),
porta: z.number({ error: 'A Porta é obrigatória.' }).int(...).min(1, ...).max(65535, ...),

// ❌ Deixa vazar mensagem de tipo em inglês quando o campo nunca foi preenchido
host: z.string().trim().min(1, 'O Host é obrigatório.'),
```

Schemas isomórficos (client + server) ficam em `shared/schemas/` como fonte única de verdade.

### Um `UFormField` (com `label`) envolve exatamente um controle

Nunca agrupar **vários** `UCheckbox` independentes dentro de um único `UFormField` com `label`: o `label` do FormField vira `<label for={id}>` e o `id` é injetado no primeiro controle, fazendo qualquer clique no título/textos do grupo alternar sempre o primeiro checkbox. Para um grupo de booleanos independentes, usar `<fieldset>` + `<legend>` como título (sem `for`); para um array de selecionados, usar `UCheckboxGroup`. Detalhes e exemplo em `nuxtui-components-toggles`.

### Acessibilidade (a11y)

- Botões icon-only sempre com `aria-label` descritivo.
- Toggles de estado (ex.: mostrar/ocultar senha) com `aria-pressed` refletindo o estado.
- `UFormField` liga `label` ao controle automaticamente — não setar `id` manual.
- Preferir cores semânticas do design system (`primary`, `neutral`, `error`, ...) em vez de hex soltas.

---

## Assinatura visual do projeto (tokens canônicos)

Valores de referência deste app (fonte: `app/app.config.ts`, `app/assets/css/main.css`). Reaplicar em telas novas para manter a identidade.

- **Paleta semântica**: `primary: 'blue'` (identidade técnica/dados/PostgreSQL) e `neutral: 'slate'` (texto, bordas, superfícies), em `app.config.ts` → `ui.colors`. As demais (`success`, `warning`, `error`, `info`) usam os defaults do Nuxt UI.
- **Fonte**: stack de sistema via `--font-sans: 'Inter', system-ui, sans-serif` no `@theme`. Sem `@font-face` custom — fontes/ícones são resolvidos localmente (proxy corporativo; ver `nuxt.config.ts`). Não introduzir fonte web remota.
- **Radius**: `--ui-radius: 0.625rem`. **Container**: `--ui-container: 72rem`.
- **Cursor**: restaurar `cursor: pointer` em `button`/`[role="button"]` não desabilitados (Tailwind v4 usa `default`).


### Modal de execução persistente

Para operações longas com progresso (geração, exportação), usar `UModal` que **não pode ser fechado durante a execução**:

- `:dismissible="!emExecucao"` e `:close="!emExecucao"` bloqueiam backdrop, `Esc` e botão X enquanto executa; `@close:prevent` é no-op (mantém aberto).
- Abertura derivada do estado (`aberto = estado !== 'pronto'`); o setter só honra `false` fora de execução.
- Rodapé com dois botões: **"Cancelar geração"** (`color="error" variant="soft" icon="i-lucide-x"`) visível **só** em execução; **"Fechar"** (`color="neutral" variant="outline"`) **desabilitado** em execução, habilitado nos estados terminais (`concluido`/`cancelado`/`erro`). Botão de download aparece só em `concluido`.
- Foco: ao abrir, focar o primeiro controle (cancelar em execução, fechar em terminal); ao fechar, devolver foco ao gatilho (fallback `<main>`/`<body>` com `tabindex=-1`).
- Cabeçalho contextual no topo do corpo: `Host: {host} | Banco: {banco}` (cores `text-dimmed`/`text-default`).

### Barra de progresso — única (só a geral)

**Uma** `UProgress` `color="primary"` de progresso geral (`Progresso geral` + `N%` com `tabular-nums`), sempre visível durante a execução. Sanitizar o percentual para inteiro em `[0,100]` (defesa do `aria-valuenow`).

Decisão de UI/UX: **não** exibir uma segunda barra "por schema". Uma barra contextual que aparece e some a cada schema polui a tela e piora a leitura do progresso. O detalhe por schema já aparece como linha no terminal de logs (ex.: `Schema X concluído (N objetos)`); a barra fica só com o consolidado. O servidor ainda pode emitir `schemaAtual`/`percentualSchema` no evento SSE (usados nos logs), mas a UI consome apenas `percentualGeral`.

### Terminal de logs (FIFO com níveis)

Buffer **FIFO de no máximo 30 linhas** (`GERAR_DICIONARIO_CAPACIDADE_BUFFER_LOGS`) — a retenção é aplicada a montante (composable/util `adicionarLog`), o componente só renderiza. Auto-scroll ao fim a cada nova linha (`nextTick` + `scrollTop = scrollHeight`). Container `role="log" aria-live="polite"`, `font-mono text-xs`.

Níveis com **emoji + tom pastel por cor semântica** (sem hex): fundo da mesma família a 10% de opacidade.

| Nível | Emoji | Classe |
|---|---|---|
| `info` | ℹ️ | `text-info bg-info/10` |
| `warning` | ⚠️ | `text-warning bg-warning/10` |
| `error` | ❌ | `text-error bg-error/10` |

Categoria inválida degrada para `info`.

### Seleção múltipla com "selecionados no topo"

Para listar muitos itens selecionáveis (ex.: schemas), usar `UCheckboxGroup` `orientation="vertical" variant="table"` em grid (`grid-cols-1 sm:grid-cols-2`, `item: 'rounded-lg'`) com `max-h-72 overflow-y-auto`. Padrões obrigatórios:

- Todos marcados por padrão.
- **Selecionados no topo**: particionar em selecionados/não-selecionados e ordenar cada grupo por `localeCompare(…, 'pt-BR')`; reordena reativamente ao marcar/desmarcar.
- Contagem por item no slot `#label` via `UBadge` (ex.: `public` + badge `42`).
- **Contador fora da lista** no `#hint`: `UBadge` `X de Y selecionados` (orienta quando itens reordenam).
- Ações **"Marcar todos" / "Desmarcar todos"** (`UButton variant="link" size="xs"`), desabilitadas quando já todos/nenhum.
- Bloquear a ação principal com 0 selecionados; ausência de itens → `UAlert` (não lista vazia silenciosa).

(Ver também as lições de listas longas em `nuxtui-components-toggles`.)

### Cards selecionáveis — destacar do fundo (não deixar chapado)

Itens selecionáveis renderizados como card (`UCheckboxGroup variant="table"`, `URadioGroup variant="card"`) sobre uma superfície da mesma cor (ex.: dentro de um `UCard`/`bg-muted`) ficam "chapados" e somem visualmente. Dar contraste ao **contêiner** do item via slot `item` do tema:

- Fundo um passo mais claro que o card: `bg-default` (branco no light).
- Borda tingida de `primary` suave: `ring ring-primary/30`, reforçando no hover `hover:ring-primary/50`, com `transition-colors`.

```vue
<!-- Checkboxes (schemas) -->
<UCheckboxGroup
  variant="table"
  :ui="{ item: 'rounded-lg cursor-pointer bg-default ring ring-primary/30 hover:ring-primary/50 transition-colors' }"
/>

<!-- Radios (formato) -->
<URadioGroup
  variant="card"
  :ui="{ item: 'bg-default ring ring-primary/30 hover:ring-primary/50 transition-colors' }"
/>
```

Regra: o estado selecionado (destaque mais forte) fica por conta do próprio componente; a customização acima é só o **repouso** — dar borda/fundo para o item não se confundir com a superfície de fundo. Sempre via cores semânticas (`primary`, `bg-default`), nunca hex.

**Gotcha — ring cortado em container com scroll:** quando a lista está num container `overflow-y-auto`/`overflow-hidden` (ex.: `max-h-72 overflow-y-auto`), o `ring` dos itens colados na borda é recortado nas laterais/topo. Dar um respiro interno ao container de scroll com `p-1` (ou `px-1`) para o anel caber inteiro:

```vue
<UCheckboxGroup
  variant="table"
  :ui="{ item: '… ring ring-primary/30 …' }"
  class="max-h-72 overflow-y-auto p-1"
/>
```

---

## Checklist ao construir/ajustar um formulário

1. Campos relacionados agrupados em `grid` responsivo com `items-start` e `gap-4`.
2. Inputs com `class="w-full"` dentro do grid.
3. Campos opcionais usam `hint="opcional"`, não a label.
4. Elementos no `#hint` com altura neutralizada (`-my-1 p-0`) para não desalinhar.
5. Botões icon-only com `aria-label`; reset desabilitado quando já no padrão.
6. `UInputNumber` de identificadores com `useGrouping: false`.
7. Mensagens de validação em pt-BR, cobrindo o caso `undefined` via `{ error: '...' }`.
8. Valores padrão centralizados em constantes.
9. Cores semânticas do design system, nunca hex soltas.
