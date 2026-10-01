<!-- app/components/secoes/SecaoEspecialidades.vue — Pilares técnicos do método do Pedro. -->
<!-- Três cards (biomecânica, fisiologia, antropometria) + bloco da avaliação fisiológica completa. -->
<!-- Comunica autoridade científica, diferencial central do posicionamento de alta performance. -->

<script setup lang="ts">
// Conteúdo vem de app/utils/conteudo.ts (auto-import).
</script>

<template>
  <section
    id="especialidades"
    class="relative bg-zinc-950 py-24 sm:py-32"
  >
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <!-- Cabeçalho da seção -->
      <div class="mx-auto max-w-2xl text-center">
        <UBadge
          color="primary"
          variant="soft"
          size="lg"
          class="mb-4 font-display font-semibold uppercase tracking-widest"
        >
          O método
        </UBadge>
        <h2 class="font-display text-4xl font-bold uppercase tracking-tight text-white sm:text-5xl">
          Ciência por trás de <span class="text-primary">cada repetição</span>
        </h2>
        <p class="mt-4 text-lg text-zinc-400">
          Nada de treino genérico. Cada programa é construído sobre três pilares que
          garantem resultado real e segurança.
        </p>
      </div>

      <!-- Cards de especialidade -->
      <div class="mt-16 grid gap-6 lg:grid-cols-3">
        <UCard
          v-for="especialidade in ESPECIALIDADES"
          :key="especialidade.titulo"
          variant="subtle"
          class="group border border-white/10 bg-zinc-900/60 transition-all duration-300 hover:border-primary/50 hover:-translate-y-1"
        >
          <div class="flex size-14 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/30 transition-colors group-hover:bg-primary/20">
            <UIcon
              :name="especialidade.icone"
              class="size-7 text-primary"
            />
          </div>

          <h3 class="mt-6 font-display text-2xl font-bold uppercase tracking-tight text-white">
            {{ especialidade.titulo }}
          </h3>
          <p class="mt-3 text-sm leading-relaxed text-zinc-400">
            {{ especialidade.descricao }}
          </p>

          <ul class="mt-6 space-y-2 border-t border-white/10 pt-6">
            <li
              v-for="destaque in especialidade.destaques"
              :key="destaque"
              class="flex items-center gap-2 text-sm text-zinc-300"
            >
              <UIcon
                name="i-lucide-check"
                class="size-4 shrink-0 text-primary"
              />
              {{ destaque }}
            </li>
          </ul>
        </UCard>
      </div>

      <!-- Bloco avaliação fisiológica -->
      <div class="mt-20 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-900 to-zinc-950">
        <div class="grid gap-10 p-8 lg:grid-cols-2 lg:p-12">
          <div>
            <h3 class="font-display text-3xl font-bold uppercase tracking-tight text-white">
              O que entra na sua <span class="text-primary">avaliação</span>
            </h3>
            <p class="mt-4 text-zinc-400">
              A avaliação do fisiologista do exercício mapeia seu corpo por completo
              antes de montar qualquer treino. Decisões baseadas em dados, não em palpite.
            </p>
            <UButton
              :to="CONTATO_WHATSAPP_URL"
              target="_blank"
              icon="i-simple-icons-whatsapp"
              color="primary"
              size="lg"
              class="mt-8 font-display font-semibold uppercase tracking-wide"
            >
              Agendar minha avaliação
            </UButton>
          </div>

          <ul class="grid gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <li
              v-for="item in AVALIACAO_FISIOLOGICA"
              :key="item"
              class="flex items-start gap-2 text-sm text-zinc-300"
            >
              <UIcon
                name="i-lucide-circle-check-big"
                class="mt-0.5 size-4 shrink-0 text-primary"
              />
              {{ item }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>
