---
inclusion: fileMatch
fileMatchPattern: ["app/**/*.vue", "tests/**/*.ts", "playwright.config.ts"]
name: test-id-tid
description: Padrão obrigatório de identificadores de teste `data-testid` em elementos HTML/Vue — para testes E2E (Playwright) e para o code agent localizar/inspecionar elementos do frontend de forma estável. Ativar ao criar ou editar qualquer componente, página, layout Vue ou teste E2E.
---

# Identificadores de Teste — atributo `data-testid`

REQUISITO MANDATÓRIO. Todo elemento HTML/Vue **relevante** deve ter o atributo `data-testid`. Objetivo duplo:

1. **Testes automatizados** (Playwright) selecionam por `data-testid`, imunes a mudança de texto/classe/estrutura.
2. **Code agent** localiza, inspeciona e corrige elementos do frontend por um seletor estável — sem adivinhar por texto ou XPath frágil. Isso torna o projeto *prompt-and-play*: o agente age sobre a UI sem engenharia reversa a cada tarefa.

## Atributo: `data-testid` (padrão do Playwright)

Usar `data-testid` — é o atributo padrão que o Playwright reconhece em `getByTestId()` sem configuração extra, e a convenção mais difundida do ecossistema.

```vue
<UButton data-testid="config-banco-enviar" type="submit" label="Testar conexão" />
<UInput data-testid="config-banco-host" v-model="state.host" />
<section data-testid="landing-hero">…</section>
```

Atributo dinâmico (Vue): prefixar com `:` e usar template string.

```vue
<li v-for="t in tabelas" :key="t.nome" :data-testid="`dicionario-tabela-item-${t.nome}`">
```

### Playwright — sem config extra

`data-testid` é o default do Playwright; **não** precisa setar `testIdAttribute`. Nos testes, preferir sempre `getByTestId`:

```ts
await page.getByTestId('config-banco-host').fill('localhost')
await page.getByTestId('config-banco-enviar').click()
await expect(page.getByTestId('landing-hero')).toBeVisible()
```

## Vale para tags HTML nativas, não só componentes `U*`

`data-testid` aplica-se a **qualquer elemento renderizável** — tags HTML nativas (`<section>`, `<div>`, `<button>`, `<input>`, `<ul>`, `<li>`, `<nav>`, `<form>`, `<p>`, `<a>`, `<img>`, `<canvas>`, `<span>`…) **e** componentes Nuxt UI (`UButton`, `UInput`, `UCard`…). Em componente Nuxt UI o atributo cai no elemento raiz via fallthrough; em tag nativa vai direto no elemento.

Regra prática ao escrever/editar template: **para cada tag HTML nativa, avaliar se cabe um `data-testid`** segundo os critérios de "obrigatório" abaixo. Se o elemento é interativo, um contêiner significativo, um estado verificável ou uma âncora — colocar. Não limitar a atenção aos componentes `U*`.

```vue
<!-- tags HTML nativas também recebem data-testid quando relevantes -->
<section data-testid="perfil-cabecalho">
  <nav data-testid="perfil-abas">
    <a data-testid="perfil-aba-dados" href="#dados">Dados</a>
  </nav>
  <form data-testid="perfil-form" @submit.prevent="salvar">
    <input data-testid="perfil-nome" v-model="nome" />
    <button data-testid="perfil-salvar" type="submit">Salvar</button>
  </form>
  <p v-if="erro" data-testid="perfil-erro">{{ erro }}</p>
</section>
```

## Onde é OBRIGATÓRIO

- **Controles interativos** (tag nativa ou `U*`): botões, inputs, selects, checkboxes, switches, links de ação, itens de menu, tabs, paginação.
- **Contêineres significativos**: seções de página (hero, blocos de features, CTA), cards, modais/slideovers, formulários, linhas de tabela/lista que representam dados.
- **Estados visuais que os testes verificam**: mensagens de erro/validação, toasts, spinners/loading, empty states, badges de status.
- **Âncoras de navegação**: header, footer, sidebar, cada item de navegação.

## Onde é DISPENSÁVEL

- Elementos puramente decorativos e não testáveis (ex.: canvas de fundo `aria-hidden`, divs de espaçamento, ícones ilustrativos sem ação).
- Texto estático corrido dentro de um contêiner que já tem `data-testid`.
- Wrappers de layout sem significado semântico nem interação.

Na dúvida entre pôr ou não, **pôr** — o custo de um atributo a mais é irrelevante perto do de um teste/agente sem âncora.

## Convenção de nomenclatura dos valores

Formato: `contexto-elemento[-detalhe]`, **kebab-case, em pt-BR** (segue o steering de idioma), único na página.

- Prefixar pelo **contexto/feature** (mesma ideia de `nomenclatura-constantes`): `config-banco-host`, `dicionario-tabelas-marcar-todos`, `landing-cta-primario`.
- Não repetir o contexto no detalhe (evitar `config-banco-config-banco-host`).
- Sufixo pelo papel do elemento: `-enviar`, `-cancelar`, `-erro`, `-lista`, `-item`, `-titulo`.

```vue
<!-- Contexto: formulário de conexão -->
<UForm data-testid="config-banco-form" :state="state" @submit="enviar">
  <UFormField data-testid="config-banco-campo-host" label="Host" name="host">
    <UInput data-testid="config-banco-host" v-model="state.host" />
  </UFormField>
  <UButton data-testid="config-banco-enviar" type="submit">Testar conexão</UButton>
</UForm>
<p v-if="erro" data-testid="config-banco-erro">{{ erro }}</p>
```

### Listas e itens repetidos

O contêiner recebe `data-testid` fixo; cada item recebe `data-testid` derivado de uma chave estável do dado (não o índice, que muda com ordenação/filtro):

```vue
<ul data-testid="dicionario-tabelas-lista">
  <li v-for="t in tabelas" :key="t.nome" :data-testid="`dicionario-tabela-item-${t.nome}`">
    {{ t.nome }}
  </li>
</ul>
```

Nos testes: `page.getByTestId('dicionario-tabela-item-gg_conta')`.

## Regra para o code agent

- Ao **criar** componente/página/layout: varrer **todas as tags do template — nativas e `U*`** — e adicionar `data-testid` em cada elemento obrigatório, já na primeira escrita. Não pular tags HTML nativas.
- Ao **editar** um componente existente que ainda não tem `data-testid`: adicionar nos elementos que você tocar (não precisa refatorar o arquivo inteiro de uma vez, mas não deixar o novo código sem).
- Ao **depurar** o frontend (via Chrome DevTools MCP ou Playwright): usar `data-testid` como seletor primário. Se o elemento-alvo não tiver, **adicionar** antes de escrever o teste/interação — paga dívida e deixa o próximo acesso trivial.
- Nunca usar seletor por texto visível ou classe utilitária Tailwind como âncora de teste (quebram com i18n/refactor de estilo).

## Checklist ao finalizar uma tela

1. Todo controle interativo tem `data-testid` único e descritivo.
2. Contêineres de seção/estado que os testes verificam têm `data-testid`.
3. Itens de lista usam `data-testid` derivado de chave estável do dado.
4. Nenhum `data-testid` duplicado na mesma página.
