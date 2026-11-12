# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Pessoas (majoritariamente de São Luís/MA, e também de outras cidades no online) que querem começar ou levar a sério o treino com acompanhamento individual: sedentários, pós-gestação, quem busca emagrecimento, estética, performance, saúde ou reabilitação. Chegam pelo Instagram ou indicação, geralmente no celular, e decidem se vale chamar o Pedro no WhatsApp.

## Product Purpose

Landing page única do personal trainer Pedro Moura Filho. Apresenta o profissional e o método, prova resultado com depoimentos reais e converte em conversa no WhatsApp. Duas trilhas de serviço: acompanhamento **presencial** (com avaliação física completa) e **consultoria online**. Sucesso = visitante clica para falar no WhatsApp com a trilha certa em mente.

## Positioning

Treino baseado em ciência, não em achismo: o Pedro é formado em Educação Física (licenciatura e bacharelado), pós-graduado em Biomecânica, especializando em Fisiologia do Exercício, membro do LACE-UFMA e antropometrista ISAK Nível 1. Todo programa parte de uma avaliação que mede o corpo de verdade (composição corporal, taxa metabólica, zonas de FC, postura, flexibilidade, risco de lesão, Fitness Score).

## Operating Context

- Contato exclusivamente via WhatsApp ((98) 9 8572-1463) com mensagem pré-preenchida, e Instagram @pedromourafilhoedf.
- Site estático gerado com Nuxt 4 + Nuxt UI v4, publicado no GitHub Pages em subdiretório (baseURL via `NUXT_APP_BASE_URL`); assets públicos passam por `urlPublica()`.
- Prerender da rota `/`; nada de backend.

## Capabilities and Constraints

- Código, identificadores, comentários e commits em pt-BR; cabeçalho de arquivo estilo Go (ver `.kiro/steering`).
- Constantes de conteúdo centralizadas em `app/utils/conteudo.ts`.
- Ferramentas interativas no cliente são permitidas (ex.: calculadora de zonas de FC), desde que baseadas em fórmulas públicas e rotuladas como estimativa.
- Indefinido: preços, planos, carga horária e detalhes operacionais da consultoria online — não inventar.

## Brand Commitments

- Nome: Pedro Moura Filho / "Pedro Moura". Tom direto, motivador, próximo ("Bora começar seu treino?", "Bons treinos!").
- O visual anterior (escuro + vermelho-fogo) **não** é compromisso: redesign autorizado.

## Evidence on Hand

- Fotos do Pedro: `public/img/pedro1.jpg`, `public/img/pedro2.jpg`; foto de academia `public/img/hero-bg.jpg`.
- Três depoimentos reais com foto (Francimária Portela, Jéssica Lacerda, Luanna Mendes) em `app/utils/conteudo.ts` e `public/img/alunos/`.
- Credenciais e lista de itens da avaliação em `app/utils/conteudo.ts`.
- "7+ anos" vem do depoimento da Francimária (7 anos de acompanhamento).
- Ausentes (não fabricar): número de alunos, percentuais de resultado, preços, prêmios, imprensa.

## Product Principles

1. Medir antes de prescrever: a avaliação é o coração da oferta.
2. Prova real acima de promessa: depoimentos e credenciais verdadeiros.
3. Um caminho curto até o WhatsApp, com a trilha (presencial/online) clara.
4. Mobile primeiro: o visitante vem do Instagram.
