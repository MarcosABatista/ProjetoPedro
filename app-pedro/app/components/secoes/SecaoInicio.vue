<!-- app/components/secoes/SecaoInicio.vue — Hero principal da landing (above the fold). -->
<!-- Fundo escuro com imagem, nome em tipografia display gigante, credenciais e CTA de WhatsApp. -->
<!-- É o ponto de maior impacto visual: define o tom agressivo de alta performance. -->

<script setup lang="ts">
// Conteúdo vem de app/utils/conteudo.ts (auto-import).
</script>

<template>
  <section
    id="inicio"
    class="relative flex min-h-screen items-center overflow-hidden bg-zinc-950"
  >
    <!-- Imagem de fundo + overlays -->
    <div class="absolute inset-0">
      <NuxtImg
        src="/img/hero-bg.jpg"
        alt=""
        class="size-full object-cover object-center opacity-30"
        loading="eager"
        fetchpriority="high"
      />
      <div class="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-zinc-950/40" />
      <div class="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent" />
    </div>

    <!-- Conteúdo -->
    <div class="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-12 px-4 pt-28 pb-16 sm:px-6 lg:grid-cols-2 lg:px-8">
      <div>
        <UBadge
          color="primary"
          variant="soft"
          size="lg"
          class="mb-6 font-display font-semibold uppercase tracking-widest"
        >
          Personal Trainer
        </UBadge>

        <h1 class="font-display text-5xl font-bold uppercase leading-[0.95] tracking-tight text-white sm:text-6xl lg:text-7xl">
          Pedro Moura
          <span class="block text-primary">Filho</span>
        </h1>

        <p class="mt-6 max-w-xl text-lg text-zinc-300">
          Treino que não é achismo. Ciência aplicada ao seu corpo com
          <span class="font-semibold text-white">biomecânica</span>,
          <span class="font-semibold text-white">fisiologia do exercício</span> e
          <span class="font-semibold text-white">antropometria ISAK</span>.
        </p>

        <ul class="mt-8 space-y-3">
          <li
            v-for="credencial in PEDRO_CREDENCIAIS"
            :key="credencial.texto"
            class="flex items-center gap-3 text-zinc-200"
          >
            <UIcon
              :name="credencial.icone"
              class="size-5 shrink-0 text-primary"
            />
            <span class="text-sm sm:text-base">{{ credencial.texto }}</span>
          </li>
        </ul>

        <div class="mt-10 flex flex-wrap gap-4">
          <UButton
            :to="CONTATO_WHATSAPP_URL"
            target="_blank"
            icon="i-simple-icons-whatsapp"
            color="primary"
            size="xl"
            class="font-display font-semibold uppercase tracking-wide"
          >
            Entrar em contato
          </UButton>
          <UButton
            to="#especialidades"
            color="neutral"
            variant="outline"
            size="xl"
            trailing-icon="i-lucide-arrow-down"
            class="font-display font-semibold uppercase tracking-wide"
          >
            Conhecer o método
          </UButton>
        </div>

        <!-- Números de impacto -->
        <div class="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-white/10 pt-8">
          <div
            v-for="numero in PEDRO_NUMEROS"
            :key="numero.rotulo"
          >
            <p class="font-display text-3xl font-bold text-primary sm:text-4xl">
              {{ numero.valor }}
            </p>
            <p class="mt-1 text-xs uppercase tracking-wide text-zinc-400">
              {{ numero.rotulo }}
            </p>
          </div>
        </div>
      </div>      
    </div>
  </section>
</template>
