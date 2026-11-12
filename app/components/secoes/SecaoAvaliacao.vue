<!-- app/components/secoes/SecaoAvaliacao.vue — Laudo com os 10 itens medidos na avaliação do Pedro. -->
<!-- Abre com uma barra de composição corporal (exemplo rotulado); cada item tem sua unidade de registro e um check que se desenha ao entrar na tela. -->
<!-- Comunica o diferencial central: medir antes de prescrever. -->

<script setup lang="ts">
const laudo = ref<HTMLElement | null>(null)
const naTela = useNaTela(laudo, { limiar: 0.2 })

// Exemplo ilustrativo de como a composição aparece no laudo (não é dado de aluno).
const COMPOSICAO_EXEMPLO = [
  { rotulo: 'Gordura', valor: 18, cor: 'bg-ambar' },
  { rotulo: 'Muscular', valor: 45, cor: 'bg-lima-400' },
  { rotulo: 'Óssea', valor: 15, cor: 'bg-salvia' },
  { rotulo: 'Residual', valor: 22, cor: 'bg-nevoa-suave' }
]
</script>

<template>
  <section
    id="avaliacao"
    class="py-20 sm:py-28"
  >
    <div class="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:gap-16 lg:px-8">
      <div class="lg:col-span-5">
        <div class="lg:sticky lg:top-32">
          <h2 class="titulo text-[clamp(2.4rem,5.4vw,4.25rem)]">
            Dez medidas antes da primeira série.
          </h2>
          <p class="mt-6 max-w-md text-lg leading-relaxed text-tinta-suave">
            A avaliação mapeia seu corpo por completo antes de montar qualquer treino.
            Decisão baseada em dado, não em palpite.
          </p>
          <a
            :href="montarUrlWhatsapp('Olá, Pedro! Quero agendar minha avaliação física completa.')"
            target="_blank"
            rel="noopener"
            class="botao-grafite mt-9 px-6 py-3.5 text-base"
          >
            <UIcon
              name="i-simple-icons-whatsapp"
              class="size-5 text-lima-400"
            />
            Agendar minha avaliação
          </a>
        </div>
      </div>

      <div
        ref="laudo"
        class="painel overflow-hidden lg:col-span-7"
      >
        <!-- Cabeçalho do laudo: composição corporal de exemplo -->
        <div class="border-b border-grafite/8 bg-nevoa-clara p-6 sm:p-8">
          <div class="flex items-baseline justify-between gap-4">
            <p class="font-display text-xl font-semibold tracking-tight">
              Composição corporal
            </p>
            <p class="text-sm text-tinta-suave">
              Exemplo ilustrativo
            </p>
          </div>
          <div
            class="mt-5 flex h-4 gap-1 overflow-hidden rounded-full"
            aria-hidden="true"
          >
            <span
              v-for="(fatia, indice) in COMPOSICAO_EXEMPLO"
              :key="fatia.rotulo"
              class="fatia h-full rounded-full"
              :class="[fatia.cor, { 'fatia--cheia': naTela }]"
              :style="{ flexGrow: fatia.valor, transitionDelay: `${indice * 120}ms` }"
            />
          </div>
          <dl class="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
            <div
              v-for="fatia in COMPOSICAO_EXEMPLO"
              :key="fatia.rotulo"
            >
              <dt class="flex items-center gap-2 text-sm text-tinta-suave">
                <span
                  class="size-2.5 rounded-full"
                  :class="fatia.cor"
                />
                {{ fatia.rotulo }}
              </dt>
              <dd class="medida mt-0.5 text-2xl font-medium">
                {{ fatia.valor }}<span class="ml-0.5 text-sm text-tinta-suave">%</span>
              </dd>
            </div>
          </dl>
        </div>

        <!-- Itens avaliados -->
        <ul
          class="p-3 sm:p-4"
          aria-label="Itens da avaliação física e como cada resultado é registrado"
        >
          <li
            v-for="(linha, indice) in AVALIACAO_FISIOLOGICA"
            :key="linha.item"
            class="group flex items-center gap-4 rounded-[1.25rem] px-3 py-3.5 transition-colors hover:bg-nevoa-clara sm:px-4"
          >
            <span
              class="grid size-7 shrink-0 place-items-center rounded-full bg-grafite"
              aria-hidden="true"
            >
              <svg
                viewBox="0 0 20 20"
                class="size-4 text-lima-400"
              >
                <path
                  d="M4.5 10.5 L8.5 14.5 L15.5 5.5"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.6"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="marca"
                  :class="{ 'marca--desenhada': naTela }"
                  :style="{ animationDelay: `${indice * 90}ms` }"
                />
              </svg>
            </span>
            <span class="min-w-0 flex-1 text-[0.98rem] leading-snug sm:text-base">
              {{ linha.item }}
            </span>
            <span class="shrink-0 rounded-full bg-nevoa px-3 py-1 text-xs font-medium whitespace-nowrap text-tinta-suave transition-colors group-hover:bg-grafite group-hover:text-lima-300">
              {{ linha.registro }}
            </span>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<style scoped>
.marca {
  stroke-dasharray: 20;
  stroke-dashoffset: 0;
}

.marca--desenhada {
  animation: desenhar 520ms var(--ease-laudo) both;
}

@keyframes desenhar {
  from { stroke-dashoffset: 20; }
  to { stroke-dashoffset: 0; }
}

.fatia {
  flex-basis: 0;
  transition: flex-grow 1100ms var(--ease-laudo);
}

.fatia:not(.fatia--cheia) {
  flex-grow: 25 !important;
}
</style>
