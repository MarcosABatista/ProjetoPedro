<!-- app/components/secoes/SecaoZonasFc.vue — Calculadora de zonas de frequência cardíaca (interação-assinatura). -->
<!-- FC máxima por Tanaka (208 − 0,7 × idade) e zonas por Karvonen (% da FC de reserva + FC de repouso). -->
<!-- Leituras deslizam com mola e o peso tipográfico cresce com a intensidade da zona. Rotulada como estimativa. -->

<script setup lang="ts">
const ZONAS_FC_IDADE_PADRAO = 30
const ZONAS_FC_REPOUSO_PADRAO = 65

const ZONAS_FC_FAIXAS = [
  { nome: 'Regenerativo', uso: 'Recuperação ativa e aquecimento', min: 0.5, max: 0.6, peso: 400 },
  { nome: 'Aeróbio leve', uso: 'Base aeróbia e queima de gordura', min: 0.6, max: 0.7, peso: 500 },
  { nome: 'Aeróbio moderado', uso: 'Condicionamento cardiorrespiratório', min: 0.7, max: 0.8, peso: 600 },
  { nome: 'Limiar', uso: 'Resistência em ritmo forte', min: 0.8, max: 0.9, peso: 700 },
  { nome: 'Máximo', uso: 'Tiros curtos e potência', min: 0.9, max: 1, peso: 800 }
] as const

const idBase = useId()
const idade = ref(ZONAS_FC_IDADE_PADRAO)
const fcRepouso = ref(ZONAS_FC_REPOUSO_PADRAO)
const zonaFoco = ref<number | null>(null)

const fcMaxima = computed(() => 208 - 0.7 * idade.value)

// Leituras com mola: o valor exibido persegue o calculado
const fcMaximaMola = useMola(fcMaxima)
const repousoMola = useMola(computed(() => fcRepouso.value))

const zonas = computed(() => ZONAS_FC_FAIXAS.map((faixa) => {
  const reserva = fcMaximaMola.value - repousoMola.value
  return {
    nome: faixa.nome,
    uso: faixa.uso,
    peso: faixa.peso,
    min: repousoMola.value + faixa.min * reserva,
    max: repousoMola.value + faixa.max * reserva
  }
}))

// Eixo de bpm compartilhado por todas as barras
const EIXO_MIN = 40
const EIXO_MAX = 210
const posicao = (bpm: number) => `${((bpm - EIXO_MIN) / (EIXO_MAX - EIXO_MIN)) * 100}%`
const largura = (min: number, max: number) => `${((max - min) / (EIXO_MAX - EIXO_MIN)) * 100}%`
const marcasEixo = [40, 80, 120, 160, 200]

const preenchimento = (valor: number, min: number, max: number) => `${((valor - min) / (max - min)) * 100}%`

function restaurar() {
  idade.value = ZONAS_FC_IDADE_PADRAO
  fcRepouso.value = ZONAS_FC_REPOUSO_PADRAO
}

const mensagemWhatsapp = computed(() => montarUrlWhatsapp(
  `Olá, Pedro! Calculei minhas zonas no site (FC máx. estimada ${Math.round(fcMaxima.value)} bpm, repouso ${fcRepouso.value} bpm). Quero medir de verdade na avaliação.`
))
</script>

<template>
  <section
    id="zonas"
    class="py-20 sm:py-28"
  >
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="grid gap-6 lg:grid-cols-12 lg:items-end">
        <h2 class="titulo text-[clamp(2.4rem,5.4vw,4.25rem)] lg:col-span-7">
          Descubra sua zona de esforço.
        </h2>
        <p class="max-w-md text-lg leading-relaxed text-tinta-suave lg:col-span-5 lg:justify-self-end">
          Mexa nos dois controles e veja as zonas se ajustarem. É a mesma conta do seu laudo, só que aqui com fórmula; na avaliação, com o seu coração.
        </p>
      </div>

      <div class="mt-12 grid gap-4 lg:grid-cols-12">
        <!-- Entradas -->
        <div class="painel grid content-start gap-8 p-6 sm:p-8 lg:col-span-4">
          <div>
            <div class="flex items-baseline justify-between">
              <label
                :for="`${idBase}-idade`"
                class="font-medium"
              >Idade</label>
              <output
                :for="`${idBase}-idade`"
                class="medida text-4xl font-medium"
              >{{ idade }}<span class="ml-1 font-sans text-sm text-tinta-suave">anos</span></output>
            </div>
            <input
              :id="`${idBase}-idade`"
              v-model.number="idade"
              type="range"
              min="14"
              max="80"
              step="1"
              class="controle mt-4 w-full"
              :style="{ '--preenchido': preenchimento(idade, 14, 80) }"
            >
          </div>

          <div>
            <div class="flex items-baseline justify-between">
              <label
                :for="`${idBase}-repouso`"
                class="font-medium"
              >FC de repouso</label>
              <output
                :for="`${idBase}-repouso`"
                class="medida text-4xl font-medium"
              >{{ fcRepouso }}<span class="ml-1 font-sans text-sm text-tinta-suave">bpm</span></output>
            </div>
            <input
              :id="`${idBase}-repouso`"
              v-model.number="fcRepouso"
              type="range"
              min="40"
              max="100"
              step="1"
              class="controle mt-4 w-full"
              :style="{ '--preenchido': preenchimento(fcRepouso, 40, 100) }"
            >
            <p class="mt-3 text-sm leading-relaxed text-tinta-suave">
              Conte os batimentos por 1 minuto ao acordar, ainda deitado.
            </p>
          </div>

          <dl class="grid grid-cols-2 gap-3 border-t border-grafite/8 pt-6">
            <div>
              <dt class="text-sm text-tinta-suave">
                FC máxima
              </dt>
              <dd class="medida mt-1 text-3xl text-lima-700">
                {{ Math.round(fcMaximaMola) }}<span class="ml-1 font-sans text-xs text-tinta-suave">bpm</span>
              </dd>
            </div>
            <div>
              <dt class="text-sm text-tinta-suave">
                FC de reserva
              </dt>
              <dd class="medida mt-1 text-3xl">
                {{ Math.round(fcMaximaMola - repousoMola) }}<span class="ml-1 font-sans text-xs text-tinta-suave">bpm</span>
              </dd>
            </div>
          </dl>

          <button
            type="button"
            class="inline-flex items-center gap-2 self-start rounded-full text-sm text-tinta-suave underline decoration-grafite/30 underline-offset-4 hover:text-grafite disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="idade === ZONAS_FC_IDADE_PADRAO && fcRepouso === ZONAS_FC_REPOUSO_PADRAO"
            @click="restaurar"
          >
            <UIcon
              name="i-lucide-rotate-ccw"
              class="size-4"
            />
            Restaurar valores de exemplo
          </button>
        </div>

        <!-- Gráfico de zonas -->
        <div class="painel flex flex-col p-6 sm:p-8 lg:col-span-8">
          <ol
            class="grid gap-2"
            aria-live="polite"
          >
            <li
              v-for="(zona, indice) in zonas"
              :key="zona.nome"
              class="grid grid-cols-[2.75rem_1fr] items-center gap-3 rounded-[1.25rem] px-1 py-1.5 transition-colors sm:grid-cols-[2.75rem_10.5rem_1fr] sm:gap-4"
              :class="zonaFoco === indice ? 'bg-nevoa-clara' : ''"
              @mouseenter="zonaFoco = indice"
              @mouseleave="zonaFoco = null"
            >
              <span
                class="medida grid size-11 place-items-center rounded-full text-sm transition-colors duration-300"
                :class="zonaFoco === indice ? 'bg-grafite text-lima-400' : 'bg-nevoa text-grafite'"
              >Z{{ indice + 1 }}</span>
              <div class="hidden sm:block">
                <p class="font-display leading-tight font-semibold">
                  {{ zona.nome }}
                </p>
                <p class="text-xs leading-snug text-tinta-suave">
                  {{ zona.uso }}
                </p>
              </div>
              <div class="relative h-12">
                <p class="absolute top-0 left-0 font-display text-sm font-semibold sm:hidden">
                  {{ zona.nome }}
                </p>
                <div class="absolute inset-x-0 top-1/2 h-px bg-grafite/10 max-sm:top-[70%]" />
                <div
                  class="absolute top-1/2 h-7 -translate-y-1/2 rounded-full transition-colors duration-300 max-sm:top-[70%] max-sm:h-4"
                  :class="zonaFoco === indice ? 'bg-grafite' : 'bg-lima-400'"
                  :style="{ left: posicao(zona.min), width: largura(zona.min, zona.max), opacity: zonaFoco === indice ? 1 : 0.4 + indice * 0.15 }"
                />
                <p
                  class="medida absolute top-1/2 -translate-y-1/2 pr-3 text-sm whitespace-nowrap max-sm:top-[70%] sm:text-base"
                  :style="{ right: `calc(100% - ${posicao(zona.min)})`, fontWeight: zona.peso - 100, fontSize: `${0.9 + indice * 0.07}rem` }"
                >
                  {{ Math.round(zona.min) }}–{{ Math.round(zona.max) }}
                </p>
              </div>
            </li>
          </ol>

          <!-- Eixo -->
          <div class="mt-3 grid grid-cols-[2.75rem_1fr] gap-3 px-1 sm:grid-cols-[2.75rem_10.5rem_1fr] sm:gap-4">
            <span class="sm:col-span-2" />
            <div class="medida relative h-6 text-xs text-tinta-suave">
              <span
                v-for="marca in marcasEixo"
                :key="marca"
                class="absolute top-1 -translate-x-1/2"
                :style="{ left: posicao(marca) }"
              >{{ marca }}</span>
            </div>
          </div>

          <div class="mt-auto flex flex-col gap-5 border-t border-grafite/8 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p class="max-w-md text-sm leading-relaxed text-tinta-suave">
              Estimativa por fórmula (Tanaka + Karvonen), só para referência. Na avaliação, sua zona é definida com seus dados reais e seu histórico.
            </p>
            <a
              :href="mensagemWhatsapp"
              target="_blank"
              rel="noopener"
              class="botao-lima shrink-0 px-6 py-3.5"
            >
              <UIcon
                name="i-simple-icons-whatsapp"
                class="size-5"
              />
              Medir de verdade
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.controle {
  appearance: none;
  height: 2rem;
  background: transparent;
  cursor: pointer;
  --trilho: linear-gradient(to right, var(--color-lima-400) 0 var(--preenchido), var(--color-nevoa) var(--preenchido) 100%);
}

.controle::-webkit-slider-runnable-track {
  height: 0.75rem;
  border-radius: 999px;
  background: var(--trilho);
  box-shadow: inset 0 0 0 1px rgb(18 22 20 / 0.06);
}

.controle::-moz-range-track {
  height: 0.75rem;
  border-radius: 999px;
  background: var(--trilho);
}

.controle::-webkit-slider-thumb {
  appearance: none;
  width: 1.75rem;
  height: 1.75rem;
  margin-top: -0.5rem;
  border-radius: 999px;
  background: var(--color-grafite);
  border: 6px solid #FFFFFF;
  box-shadow: 0 6px 14px -4px rgb(18 22 20 / 0.45);
  transition: transform 200ms var(--ease-assentar);
}

.controle:active::-webkit-slider-thumb {
  transform: scale(1.12);
}

.controle::-moz-range-thumb {
  width: 1rem;
  height: 1rem;
  border-radius: 999px;
  background: var(--color-grafite);
  border: 6px solid #FFFFFF;
  box-shadow: 0 6px 14px -4px rgb(18 22 20 / 0.45);
}

.controle:focus-visible {
  outline: 2px solid var(--color-grafite);
  outline-offset: 4px;
}
</style>
