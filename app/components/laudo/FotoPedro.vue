<!-- app/components/laudo/FotoPedro.vue — Foto do Pedro recortada da imagem oval original (pedro2.jpg). -->
<!-- Amplia e centraliza o rosto para esconder os cantos brancos do oval; a forma (círculo ou retrato) vem do contêiner. -->

<script setup lang="ts">
withDefaults(defineProps<{ prioridade?: boolean, alt?: string }>(), { prioridade: false, alt: 'Pedro Moura Filho, personal trainer' })
</script>

<template>
  <div class="overflow-hidden bg-salvia">
    <img
      :src="urlPublica('/img/WhatsApp Image 2026-11-12 at 20.11.58.jpeg')"
      :alt="alt"
      class="size-full scale-[1.34] object-cover object-[50%_40%]"
      width="1170"
      height="1280"
      :loading="prioridade ? 'eager' : 'lazy'"
      :fetchpriority="prioridade ? 'high' : 'auto'"
    >
  </div>
</template>
