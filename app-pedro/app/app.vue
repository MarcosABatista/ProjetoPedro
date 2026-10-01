<!-- app/app.vue — Shell raiz do site do personal trainer Pedro Moura. -->
<!-- Define SEO/meta pt-BR, envolve a aplicação em UApp e renderiza a página única. -->

<script setup lang="ts">
const titulo = 'Pedro Moura | Personal Trainer de Alta Performance'
const descricao = 'Treinamento personalizado baseado em ciência: biomecânica, fisiologia do exercício e antropometria ISAK. Transforme seu corpo com acompanhamento profissional.'

useHead({
  link: [{ rel: 'icon', href: '/favicon.ico' }]
})

useSeoMeta({
  title: titulo,
  description: descricao,
  ogTitle: titulo,
  ogDescription: descricao,
  ogType: 'website',
  twitterCard: 'summary_large_image'
})
</script>

<template>
  <UApp>
    <NuxtPage />
  </UApp>
</template>
