<!-- app/pages/index.vue — Página única (landing) do personal trainer Pedro Moura. -->
<!-- Compõe as seções na ordem de conversão: início, especialidades, depoimentos, contato, rodapé. -->
<!-- Rota prerenderizada (routeRules em nuxt.config) para carregamento instantâneo. -->

<script setup lang="ts">
// Componentes de seção são auto-importados de app/components/secoes/.
</script>

<template>
  <div class="min-h-screen bg-zinc-950 text-white antialiased">
    <SecoesCabecalhoSite />
    <main>
      <SecoesSecaoInicio />
      <SecoesSecaoEspecialidades />
      <SecoesSecaoDepoimentos />
      <SecoesSecaoContato />
    </main>
    <SecoesRodapeSite />
  </div>
</template>
