---
name: Pedro Moura Filho
description: Ficha de avaliação antropométrica em papel milimetrado, com tinta de prontuário e laranja de carimbo como único sinal ativo.
colors:
  papel: "#EEF3EE"
  papel-claro: "#F7FAF6"
  quadricula: "#B9CCC3"
  tinta: "#16302B"
  tinta-suave: "#3D5A52"
  salvia: "#9FB8AD"
  carimbo: "#FF5A1F"
  carimbo-claro: "#FF7740"
  carimbo-tinta: "#E5420A"
  carimbo-texto: "#BE330B"
  carimbo-lavado: "#FFF3ED"
typography:
  display:
    fontFamily: "Archivo, Public Sans, system-ui, sans-serif"
    fontSize: "clamp(2.6rem, 8vw, 5.5rem)"
    fontWeight: 900
    lineHeight: 0.96
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Archivo, Public Sans, system-ui, sans-serif"
    fontSize: "clamp(2.25rem, 5vw, 4rem)"
    fontWeight: 900
    lineHeight: 0.98
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Archivo, Public Sans, system-ui, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 900
    lineHeight: 1
    letterSpacing: "-0.025em"
  title-campo:
    fontFamily: "Archivo, Public Sans, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 800
    lineHeight: 1.25
  body:
    fontFamily: "Public Sans, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.625
  label:
    fontFamily: "Public Sans, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.333
    letterSpacing: "0.025em"
  medida:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "1.875rem"
    fontWeight: 700
    lineHeight: 1.2
    fontFeature: "tnum"
  botao:
    fontFamily: "Archivo, Public Sans, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 800
    lineHeight: 1.5
    letterSpacing: "0.02em"
rounded:
  reto: "0px"
  ui: "0.25rem"
  marco: "9999px"
spacing:
  quadricula-fina: "8px"
  quadricula-forte: "40px"
  campo: "1.25rem"
  ficha: "1.5rem"
  secao: "5rem"
  secao-lg: "7rem"
  container: "80rem"
components:
  botao-carimbo:
    backgroundColor: "{colors.carimbo}"
    textColor: "{colors.tinta}"
    typography: "{typography.botao}"
    rounded: "{rounded.reto}"
    padding: "14px 24px"
  botao-carimbo-hover:
    backgroundColor: "{colors.carimbo-claro}"
    textColor: "{colors.tinta}"
  botao-traco:
    backgroundColor: "{colors.papel-claro}"
    textColor: "{colors.tinta}"
    typography: "{typography.botao}"
    rounded: "{rounded.reto}"
    padding: "16px 24px"
  botao-traco-hover:
    backgroundColor: "{colors.tinta}"
    textColor: "{colors.papel}"
  opcao-objetivo:
    backgroundColor: "transparent"
    textColor: "{colors.tinta}"
    rounded: "{rounded.reto}"
    padding: "6px 12px"
  opcao-objetivo-selecionada:
    backgroundColor: "{colors.tinta}"
    textColor: "{colors.papel}"
  ficha:
    backgroundColor: "{colors.papel-claro}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.reto}"
    padding: "{spacing.ficha}"
  campo-linha:
    backgroundColor: "transparent"
    textColor: "{colors.tinta}"
    rounded: "{rounded.reto}"
    padding: "0 0 4px 0"
---

# Design System: Pedro Moura Filho

## Overview

**Creative North Star: "A Ficha de Avaliação"**

O site inteiro é uma ficha antropométrica preenchida à mão: papel milimetrado verde-claro, tinta verde-escura de prontuário e um laranja de carimbo que só aparece onde há ação ou leitura. Cada superfície é um documento de avaliação (campos com linha pontilhada, caixas de marcação desenhadas, tabela de medidas, régua de ajuste, assinatura do aluno), não um panfleto de academia. A densidade é a de um formulário: blocos retangulares com contorno de tinta de 2px, rótulos pequenos em caixa-alta, números alinhados em mono tabular.

A hierarquia vem do peso, não da cor. Títulos em Archivo Black, caixa-alta e entrelinha apertada dominam o papel; o corpo em Public Sans fica em tinta suave; o laranja é reservado ao que o visitante pode apertar ou ao que foi medido. O movimento segue a mesma gramática física: o carimbo pressiona, a marca de checagem se desenha, a barra de zona cresce, sempre a partir de um estado já legível.

O sistema rejeita, por decisão confirmada, o código visual da categoria: foto escura de academia, vermelho-fogo em caixa-alta sobre preto e grade de cards iguais. O visual é sempre claro (modo de cor travado em `light`): a ficha é papel.

**Key Characteristics:**
- Fundo de papel com quadrícula milimetrada (linha fina a cada 8px, forte a cada 40px).
- Contornos de tinta de 2px e cantos retos em tudo que é campo, ficha ou botão.
- Laranja de carimbo como único sinal ativo; nunca como superfície de seção.
- Archivo 900 em caixa-alta para títulos; Public Sans no corpo; JetBrains Mono só em valores medidos.
- Estado marcado a caneta (X, check, traço) e não apenas por cor.

## Colors

Uma paleta de prontuário: verdes acinzentados de papel e tinta, com um único laranja quente de carimbo.

### Primary
- **Laranja Carimbo** (`carimbo`): o único sinal ativo. Fundo dos botões de ação (WhatsApp), polegar da régua, barras das zonas de FC, zona em foco, marco anatômico ativo, sublinhado desenhado do título, indicador da seção atual na navegação, etapas acesas da trilha. Sempre com texto em tinta por cima, nunca branco.
- **Laranja Carimbo Claro** (`carimbo-claro`): estado de hover do botão carimbo e ícones do rodapé em hover.
- **Tinta de Carimbo** (`carimbo-tinta`): traço das marcas desenhadas (X, check), o carimbo circular "ISAK Nível 1", contorno de foco (`:focus-visible`, 2px, afastado 3px) e cursor de texto.
- **Laranja de Leitura** (`carimbo-texto`): laranja quando precisa ser texto sobre papel (FC máxima, leitura em mm, hover de valores na tabela, links de telefone). Use este, nunca o 500, para texto.
- **Laranja Lavado** (`carimbo-lavado`): fundo de hover de linhas de tabela e links da navegação, e fundo da opção de trilha selecionada e do campo em foco.

### Neutral
- **Papel Milimetrado** (`papel`): fundo global da página, sob a quadrícula.
- **Papel Claro** (`papel-claro`): folhas sobre a quadrícula (ficha de inscrição, tabela, calculadora, folha de contato, cabeçalho ao rolar). Seções alternadas usam esse papel a 60% sobre a quadrícula.
- **Quadrícula Sálvia** (`quadricula`): só a grade do fundo, misturada a 70% (linha forte) e 28% (linha fina).
- **Tinta de Prontuário** (`tinta`): texto principal, todos os contornos de 2px, divisórias de seção, linha pontilhada de campo, e a única superfície escura (rodapé).
- **Tinta Suave** (`tinta-suave`): texto de apoio, parágrafos de seção, unidades ("bpm", "anos"), rótulos secundários.
- **Sálvia** (`salvia`): pauta do depoimento, fundo do recorte da foto 3x4, barra de rolagem.

O Nuxt UI recebe `primary = carimbo` e `neutral = verde`; a rampa `verde-50..950` existe para os componentes da biblioteca, e seus degraus 300, 600 e 900 coincidem com sálvia, tinta suave e tinta.

### Named Rules
**A Regra do Carimbo Único.** O laranja marca apenas o que se aperta ou o que foi medido: botão de ação, carimbo, marcador ativo, barra de FC. Nunca é fundo de seção nem faixa de largura total. Se uma tela tiver laranja em algo que não é ação, leitura ou estado ativo, está errado.

**A Regra do Chão de Papel.** Toda seção vive sobre o papel com quadrícula (inteiro ou `papel-claro` a 60%). A única superfície escura é o rodapé em tinta. Não existem seções escuras nem seções laranja.

## Typography

**Display Font:** Archivo (pesos 600, 800, 900), com Public Sans e system-ui de reserva
**Body Font:** Public Sans (400 a 700), com system-ui de reserva
**Label/Mono Font:** JetBrains Mono (400 a 800), só para medidas

**Character:** Archivo Black em caixa-alta tem o peso de cabeçalho de formulário oficial; Public Sans é o texto neutro de quem preenche a ficha. O mono aparece só quando há um número com unidade, como num instrumento.

### Hierarchy
- **Display** (Archivo 900, `clamp(2.6rem, 8vw, 5.5rem)`, entrelinha 0.96, caixa-alta): título da primeira dobra. A chamada final usa a mesma voz maior (`clamp(2.4rem, 9vw, 6rem)`, 0.96, -0.04em).
- **Headline** (Archivo 900, `clamp(2.25rem, 5vw, 4rem)`, entrelinha 0.98, caixa-alta, `text-wrap: balance`): título de cada seção.
- **Title** (Archivo 900, 1.875rem a 2.25rem, entrelinha 1, caixa-alta): títulos de bloco dentro da seção (trilhas, método).
- **Title de campo** (Archivo 800, 1rem a 1.25rem, entrelinha justa, caixa-alta): nome de opção, nome de zona, nome de marco, autor de depoimento, etapas.
- **Body** (Public Sans 400, 1.125rem, entrelinha 1.625, tinta suave): parágrafos de seção, até ~38rem (`max-w-md` a `max-w-xl`). Texto de tabela em 0.95rem a 1rem.
- **Label** (Public Sans 600, 0.75rem, +0.025em, caixa-alta): rótulos de campo e de legenda ("Objetivo principal", "Assinatura do aluno", cabeçalhos de tabela).
- **Medida** (JetBrains Mono 700, tabular, 0.7rem a 1.875rem): idade, bpm, FC máxima/reserva, faixas de zona, cm, mm, graus. Unidade em Public Sans 400 menor, tinta suave.
- **Botão** (Archivo 800, caixa-alta, +0.02em, 0.875rem a 1.125rem).

### Named Rules
**A Regra do Mono Medido.** JetBrains Mono só em valores medidos com unidade ou escala (bpm, cm, mm, °, anos, faixas de zona). Nunca em rótulos, ordinais, navegação ou texto decorativo.

**A Regra da Entrelinha Mínima.** Títulos display e headline usam entrelinha ≥ 0.96. Abaixo disso os acentos do português (É, Ç, Ã) e a pontuação colidem com a linha de cima.

**A Regra do Peso que Sobe.** Na calculadora de FC o peso do número cresce com a intensidade da zona (400 → 800) e o tamanho sobe 0.07rem por zona. Intensidade se lê em peso, não em cor.

## Layout

Coluna única de seções empilhadas, separadas por uma divisória de tinta de 2px no topo de cada uma. Container máximo de 80rem, com margens laterais de 1rem / 1.5rem / 2rem (celular / sm / lg). Dentro do container, grade de 12 colunas a partir de `lg` (1024px), tipicamente 5 + 7 ou 7 + 5, com a coluna do título fixa (`sticky`, topo em 7rem) enquanto a outra rola.

Ritmo vertical de seção: 5rem no celular e 7rem a partir de `sm`. Folhas internas (ficha, calculadora) usam 1.25rem a 1.5rem de respiro; a folha de contato chega a 3rem. O fundo milimetrado dá a métrica implícita: 8px e 40px.

Cabeçalho fixo de 4rem; âncoras rolam com `scroll-padding-top` de 5rem. Mobile primeiro: na primeira dobra o título e o formulário vêm antes da silhueta; em `lg` a silhueta passa para a esquerda e fica fixa. A navegação aparece só em `lg`; abaixo disso vira menu suspenso, e o botão do WhatsApp fica sempre visível.

## Elevation & Depth

O sistema é plano por contorno: a profundidade principal vem da folha de `papel-claro` com borda de tinta de 2px sobre o papel quadriculado. Sombras existem, mas são difusas, com tinta ou laranja e espalhamento negativo, como papel apoiado sobre papel. Não há sombra dura deslocada.

### Shadow Vocabulary
- **Carimbo em repouso** (`box-shadow: 0 6px 14px -6px color-mix(in srgb, #BE330B 70%, transparent)`): sob o botão carimbo.
- **Carimbo erguido** (`box-shadow: 0 10px 20px -8px color-mix(in srgb, #BE330B 80%, transparent)`): hover do botão carimbo.
- **Carimbo pressionado** (`box-shadow: 0 2px 6px -3px color-mix(in srgb, #BE330B 80%, transparent)`): `:active`.
- **Faixa ao rolar** (`box-shadow: 0 8px 20px -14px rgb(22 48 43 / 0.5)`): cabeçalho depois de 24px de rolagem.
- **Foto presa** (`box-shadow: 0 10px 24px -10px rgb(22 48 43 / 0.45)`): foto 3x4 com clipe.
- **Folha final** (`box-shadow: 0 18px 40px -24px rgb(22 48 43 / 0.6)`): folha de contato.

### Named Rules
**A Regra do Papel sobre Papel.** Profundidade é folha clara com contorno de tinta. Sombra só como ar difuso sob algo físico (botão, foto, folha); nunca deslocada e dura.

## Shapes

Cantos retos em tudo que é da ficha: folhas, tabelas, botões, opções, caixas de marcação, polegar da régua. O raio de 0.25rem existe apenas para componentes do Nuxt UI. O círculo é reservado aos marcos anatômicos da silhueta e ao carimbo circular. Bordas falam a língua do formulário: 2px de tinta para contorno, 1px de tinta a 25–40% para divisória, tracejado para linhas de tabela e rodapés de folha, pontilhado (traço de 6px, 40% preenchido) para a linha de campo. Elementos físicos podem girar levemente: foto 3x4 em +3°, carimbo em -10°.

## Components

### Buttons
Carimbo de verdade: pesado, retangular, pressiona ao clicar.
- **Shape:** cantos retos (0px), contorno de tinta de 2px.
- **Primary (carimbo):** fundo laranja carimbo, texto em tinta, Archivo 800 caixa-alta; ícone à esquerda com 0.6rem de espaço. Padding de 0.5rem 0.75rem (cabeçalho) até 1rem 1.5rem (formulário e contato).
- **Hover / Focus:** sobe 1px e clareia para o laranja claro; `:active` desce 1px com escala 0.985; foco com contorno de 2px em tinta de carimbo, afastado 3px. Transições de 180ms em `cubic-bezier(0.16, 1, 0.3, 1)`.
- **Secundário (traço):** contorno de tinta sobre papel claro, mesmo tipo; no hover inverte para fundo de tinta e texto em papel.

### Chips
- **Style:** opções de objetivo com borda de 1px em tinta a 40%, fundo transparente, Public Sans 500 0.875rem.
- **State:** selecionada inverte para fundo de tinta e texto em papel (não laranja); hover escurece a borda para tinta cheia.

### Cards / Containers
- **Corner Style:** reto (0px).
- **Background:** papel claro sobre a quadrícula.
- **Shadow Strategy:** nenhuma por padrão; só a folha final e a foto levam sombra difusa (ver Elevation & Depth).
- **Border:** 2px de tinta.
- **Internal Padding:** 1.25rem a 1.5rem; 3rem na folha de contato em `sm`.

### Inputs / Fields
- **Style:** campo de ficha: sem caixa, só a linha pontilhada de tinta embaixo, rótulo à esquerda em label caixa-alta.
- **Focus:** fundo laranja lavado no campo; sem contorno extra.
- **Seleção (rádio de trilha):** caixa quadrada de 2px; quando marcada, um X em tinta de carimbo se desenha (260ms) e a opção ganha fundo laranja lavado e borda de tinta cheia.
- **Régua (range):** escala de risquinhos a cada 10px; polegar retangular laranja de 1.1rem com contorno de tinta.

### Navigation
- **Style:** faixa de cabeçalho de ficha com borda inferior de 2px em tinta; links são células separadas por divisórias verticais de 1px, Public Sans 600 0.875rem.
- **Estados:** hover com fundo laranja lavado; seção atual com traço laranja de 3px que cresce da esquerda na base da célula (`aria-current="location"`).
- **Mobile:** menu suspenso em papel claro, cada item é um campo com linha pontilhada, Archivo 800 caixa-alta 1.125rem.

### Tabela de Avaliação (assinatura)
Tabela com contorno de 2px, cabeçalho separado por 2px de tinta, linhas tracejadas a 35%. Primeira coluna com caixa de marcação de 2px onde o check em tinta de carimbo se desenha em sequência (110ms entre linhas) ao entrar na tela; última coluna com o valor em mono, que vira laranja de leitura no hover da linha.

### Zonas de FC (assinatura)
Cinco linhas: número da zona em célula quadrada (zona em foco preenchida de laranja carimbo), nome em Archivo 800, e uma barra laranja posicionada sobre uma régua de bpm com transição de 500ms. O peso do rótulo de bpm sobe com a zona.

### Silhueta com Marcos (assinatura)
Silhueta anatômica em traço com marcos ISAK circulares (borda de 2px em tinta). O marco ativo cresce 1.25x e se enche de laranja, com pulso em laranja a 40% (oculto com movimento reduzido); a leitura abaixo traz o nome em Archivo e a medida em mono.

### Carimbo e Foto 3x4
Carimbo circular em tinta de carimbo com `mix-blend-mode: multiply`, girado -10°, que pressiona ao entrar na tela (escala 1.3 → 0.96 → 1 em 700ms). Foto 3x4 com moldura de papel claro de 6px, anel de tinta a 20%, girada +3° e presa por clipe desenhado em SVG.

## Do's and Don'ts

### Do:
- **Do** manter toda seção sobre o papel quadriculado (`papel` ou `papel-claro` a 60%), separada por uma divisória de tinta de 2px.
- **Do** usar o laranja carimbo só em botão de ação, carimbo, marcador ativo e barras de FC, sempre com texto em tinta por cima.
- **Do** usar o laranja de leitura (`carimbo-texto`) quando o laranja precisar ser texto sobre papel.
- **Do** escrever todo número medido em JetBrains Mono tabular, com a unidade em Public Sans menor e tinta suave.
- **Do** manter entrelinha ≥ 0.96 nos títulos display e headline em caixa-alta.
- **Do** mostrar estado como marca de caneta (X, check, traço que cresce) além da cor.
- **Do** animar a partir de um estado já legível (carimbo que pressiona, marca que se desenha) e respeitar `prefers-reduced-motion`.

### Don't:
- **Don't** usar o laranja como fundo de seção, faixa de largura total ou superfície decorativa.
- **Don't** criar seções escuras; o rodapé em tinta é a única superfície escura.
- **Don't** usar JetBrains Mono em rótulos, navegação, ordinais ou texto que não seja medida.
- **Don't** pôr rótulo pequeno em caixa-alta (sobretítulo) acima dos títulos de seção; o título abre a seção sozinho.
- **Don't** arredondar folhas, botões ou caixas de marcação; o círculo é só do marco anatômico e do carimbo.
- **Don't** usar sombra dura deslocada; sombra é sempre difusa e com espalhamento negativo.
- **Don't** voltar ao código da categoria: foto escura de academia, vermelho-fogo sobre preto, grade de cards iguais.
