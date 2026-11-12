<!-- app/pages/index.vue — Página única (landing) do personal trainer Pedro Moura, desenhada como laudo de composição corporal. -->
<!-- Ordem: escaneamento e ficha de interesse, avaliação, método, zonas de FC, trilhas, depoimentos, responsável técnico, contato. -->
<!-- Rota prerenderizada (routeRules em nuxt.config) para carregamento instantâneo. -->

<template>
  <div class="min-h-screen text-grafite">
    <SecoesCabecalhoSite />
    <main>
      <SecoesSecaoInicio />
      <SecoesSecaoAvaliacao />
      <SecoesSecaoMetodo />
      <SecoesSecaoZonasFc />
      <SecoesSecaoTrilhas />
      <SecoesSecaoDepoimentos />
      <SecoesSecaoResponsavel />
      <SecoesSecaoContato />
    </main>
    <SecoesRodapeSite />
  </div>
</template>
