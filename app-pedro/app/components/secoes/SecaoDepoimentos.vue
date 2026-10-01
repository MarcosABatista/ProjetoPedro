<!-- app/components/secoes/SecaoDepoimentos.vue — Prova social com depoimentos reais de alunas. -->
<!-- Carrossel (UCarousel) com arrastar/setas, substituindo o Swiper do site estático legado. -->
<!-- Reforça confiança antes do bloco de contato. -->

<script setup lang="ts">
// DEPOIMENTOS vem de app/utils/conteudo.ts (auto-import).
</script>

<template>
  <section
    id="depoimentos"
    class="relative overflow-hidden bg-zinc-900 py-24 sm:py-32"
  >
    <!-- Aspas decorativas gigantes no fundo -->
    <div class="pointer-events-none absolute -top-10 left-0 font-display text-[20rem] leading-none text-white/5 select-none">
      &ldquo;
    </div>

    <div class="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-2xl text-center">
        <UBadge
          color="primary"
          variant="soft"
          size="lg"
          class="mb-4 font-display font-semibold uppercase tracking-widest"
        >
          Resultados reais
        </UBadge>
        <h2 class="font-display text-4xl font-bold uppercase tracking-tight text-white sm:text-5xl">
          Quem treina, <span class="text-primary">confirma</span>
        </h2>
      </div>

      <UCarousel
        v-slot="{ item }"
        :items="DEPOIMENTOS"
        arrows
        loop
        :prev="{ color: 'primary' }"
        :next="{ color: 'primary' }"
        :ui="{ item: 'basis-full md:basis-1/2 lg:basis-1/3' }"
        class="mt-14"
      >
        <div class="flex h-full flex-col rounded-2xl border border-white/10 bg-zinc-950/60 p-8">
          <UIcon
            name="i-lucide-quote"
            class="size-8 text-primary"
          />
          <p class="mt-4 flex-1 text-sm leading-relaxed text-zinc-300">
            {{ item.texto }}
          </p>
          <div class="mt-6 flex items-center gap-3 border-t border-white/10 pt-6">
            <NuxtImg
              :src="item.foto"
              :alt="`Foto de ${item.nome}`"
              class="size-12 rounded-full object-cover ring-2 ring-primary/40"
              loading="lazy"
            />
            <div>
              <p class="font-display font-semibold uppercase tracking-wide text-white">
                {{ item.nome }}
              </p>
              <p class="text-xs text-primary">
                {{ item.usuario }}
              </p>
            </div>
          </div>
        </div>
      </UCarousel>
    </div>
  </section>
</template>
