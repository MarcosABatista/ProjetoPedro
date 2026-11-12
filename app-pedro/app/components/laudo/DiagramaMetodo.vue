<!-- app/components/laudo/DiagramaMetodo.vue — Diagramas animados dos três pilares do método (SVG + requestAnimationFrame). -->
<!-- angulo: goniometria do joelho; curva: frequência cardíaca percorrendo zonas; adipometro: pinça de dobra cutânea. -->
<!-- Animação só roda visível e com aba ativa; prefers-reduced-motion mostra um quadro estático. -->

<script setup lang="ts">
const props = defineProps<{ tipo: DiagramaMetodo }>()

const raiz = ref<HTMLElement | null>(null)
const naTela = useNaTela(raiz, { once: false, limiar: 0.1 })

// Fase 0..1 oscilando suavemente (seno), dirigida por rAF.
const fase = ref(0.35)
let quadro = 0
let inicio = 0

function passo(agora: number) {
  if (!inicio) inicio = agora
  if (naTela.value && !document.hidden) {
    fase.value = (1 - Math.cos(((agora - inicio) / 3200) * Math.PI * 2)) / 2
  }
  quadro = requestAnimationFrame(passo)
}

onMounted(() => {
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) quadro = requestAnimationFrame(passo)
})

onBeforeUnmount(() => cancelAnimationFrame(quadro))

// ---------------- Ângulo do joelho
const QUADRIL = { x: 92, y: 52 }
const JOELHO = { x: 170, y: 120 }
const CANELA = 104
const anguloJoelho = computed(() => 75 + fase.value * 100)
const direcaoCoxa = Math.atan2(QUADRIL.y - JOELHO.y, QUADRIL.x - JOELHO.x)
const tornozelo = computed(() => {
  const phi = direcaoCoxa - (anguloJoelho.value * Math.PI) / 180
  return { x: JOELHO.x + CANELA * Math.cos(phi), y: JOELHO.y + CANELA * Math.sin(phi) }
})
const arcoJoelho = computed(() => {
  const r = 30
  const a1 = direcaoCoxa
  const a2 = direcaoCoxa - (anguloJoelho.value * Math.PI) / 180
  const p1 = { x: JOELHO.x + r * Math.cos(a1), y: JOELHO.y + r * Math.sin(a1) }
  const p2 = { x: JOELHO.x + r * Math.cos(a2), y: JOELHO.y + r * Math.sin(a2) }
  const grande = anguloJoelho.value > 180 ? 1 : 0
  return `M${p1.x},${p1.y} A${r},${r} 0 ${grande} 0 ${p2.x},${p2.y}`
})

// ---------------- Curva de FC
const caminhoCurva = ref<SVGPathElement | null>(null)
const CURVA_D = 'M10,170 C40,168 50,120 80,110 S120,104 140,96 C160,60 172,52 186,56 C200,60 204,98 222,100 C240,60 252,46 266,50 C280,54 286,100 310,120'
const pontoCurva = computed(() => {
  const caminho = caminhoCurva.value
  if (!caminho) return { x: 140, y: 96 }
  const comprimento = caminho.getTotalLength()
  const ponto = caminho.getPointAtLength(fase.value * comprimento)
  return { x: ponto.x, y: ponto.y }
})
const bpmCurva = computed(() => Math.round(195 - ((pontoCurva.value.y - 30) / 150) * 120))
const ZONAS_FAIXAS = [
  { y: 30, opacidade: 0.55 },
  { y: 60, opacidade: 0.4 },
  { y: 90, opacidade: 0.28 },
  { y: 120, opacidade: 0.18 },
  { y: 150, opacidade: 0.1 }
]

// ---------------- Adipômetro
const aberturaMm = computed(() => 6 + fase.value * 18)
const giroBraco = computed(() => -(aberturaMm.value - 6) * 0.9)
</script>

<template>
  <div
    ref="raiz"
    class="relative aspect-[16/11] w-full"
  >
    <!-- Ângulo -->
    <svg
      v-if="props.tipo === 'angulo'"
      viewBox="0 0 320 220"
      class="size-full"
      role="img"
      :aria-label="`Goniometria do joelho: ${Math.round(anguloJoelho)} graus`"
    >
      <line
        x1="0"
        y1="200"
        x2="320"
        y2="200"
        stroke="var(--color-nevoa-clara)"
        stroke-width="1"
        stroke-dasharray="3 5"
      />
      <path
        :d="arcoJoelho"
        fill="color-mix(in srgb, var(--color-lima-400) 18%, transparent)"
        stroke="var(--color-lima-400)"
        stroke-width="2"
      />
      <line
        :x1="QUADRIL.x"
        :y1="QUADRIL.y"
        :x2="JOELHO.x"
        :y2="JOELHO.y"
        stroke="var(--color-nevoa-clara)"
        stroke-width="7"
        stroke-linecap="round"
      />
      <line
        :x1="JOELHO.x"
        :y1="JOELHO.y"
        :x2="tornozelo.x"
        :y2="tornozelo.y"
        stroke="var(--color-nevoa-clara)"
        stroke-width="7"
        stroke-linecap="round"
      />
      <circle
        v-for="(ponto, i) in [QUADRIL, JOELHO, tornozelo]"
        :key="i"
        :cx="ponto.x"
        :cy="ponto.y"
        r="7"
        fill="var(--color-grafite-painel)"
        stroke="var(--color-nevoa-clara)"
        stroke-width="2.5"
      />
      <text
        x="300"
        y="40"
        text-anchor="end"
        class="medida"
        font-size="34"
        font-weight="500"
        fill="var(--color-nevoa-clara)"
      >{{ Math.round(anguloJoelho) }}°</text>
      <text
        x="300"
        y="60"
        text-anchor="end"
        font-size="11"
        fill="var(--color-nevoa-suave)"
      >flexão do joelho</text>
    </svg>

    <!-- Curva de FC -->
    <svg
      v-else-if="props.tipo === 'curva'"
      viewBox="0 0 320 220"
      class="size-full"
      role="img"
      :aria-label="`Frequência cardíaca durante o treino: ${bpmCurva} batimentos por minuto`"
    >
      <rect
        v-for="faixa in ZONAS_FAIXAS"
        :key="faixa.y"
        x="0"
        :y="faixa.y"
        width="320"
        height="30"
        fill="var(--color-lima-400)"
        :opacity="faixa.opacidade * 0.5"
      />
      <path
        ref="caminhoCurva"
        :d="CURVA_D"
        fill="none"
        stroke="var(--color-nevoa-clara)"
        stroke-width="3"
        stroke-linecap="round"
      />
      <line
        :x1="pontoCurva.x"
        y1="20"
        :x2="pontoCurva.x"
        y2="200"
        stroke="var(--color-nevoa-clara)"
        stroke-width="1"
        stroke-dasharray="3 4"
      />
      <circle
        :cx="pontoCurva.x"
        :cy="pontoCurva.y"
        r="7"
        fill="var(--color-lima-400)"
        stroke="var(--color-nevoa-clara)"
        stroke-width="2.5"
      />
      <text
        x="12"
        y="212"
        font-size="11"
        fill="var(--color-nevoa-suave)"
      >tempo de sessão →</text>
      <text
        x="308"
        y="214"
        text-anchor="end"
        class="medida"
        font-size="13"
        font-weight="500"
        fill="var(--color-nevoa-clara)"
      >{{ bpmCurva }} bpm</text>
    </svg>

    <!-- Adipômetro -->
    <svg
      v-else
      viewBox="0 0 320 220"
      class="size-full"
      role="img"
      :aria-label="`Adipômetro medindo dobra cutânea: ${aberturaMm.toFixed(1)} milímetros`"
    >
      <!-- Pele com dobra pinçada -->
      <path
        d="M0,188 C70,188 96,186 118,170 C130,150 136,128 150,128 C164,128 170,150 182,170 C204,186 250,188 320,188"
        fill="color-mix(in srgb, var(--color-lima-400) 14%, transparent)"
        stroke="var(--color-nevoa-clara)"
        stroke-width="2.5"
      />
      <!-- Corpo do adipômetro -->
      <g
        stroke="var(--color-nevoa-clara)"
        stroke-width="2.5"
        stroke-linejoin="round"
      >
        <rect
          x="196"
          y="36"
          width="110"
          height="34"
          rx="4"
          fill="var(--color-grafite-painel)"
        />
        <path
          d="M200,52 L136,52 L136,140"
          fill="none"
          stroke-width="7"
          stroke-linecap="round"
        />
        <g
          :transform="`rotate(${giroBraco} 200 64)`"
          class="origin-center"
        >
          <path
            d="M200,64 L170,64 L166,140"
            fill="none"
            stroke-width="7"
            stroke-linecap="round"
          />
        </g>
      </g>
      <text
        x="300"
        y="59"
        text-anchor="end"
        class="medida"
        font-size="17"
        font-weight="500"
        fill="var(--color-nevoa-clara)"
      >{{ aberturaMm.toFixed(1).replace('.', ',') }} mm</text>
      <text
        x="14"
        y="30"
        font-size="11"
        fill="var(--color-nevoa-suave)"
      >dobra cutânea pinçada</text>
    </svg>
  </div>
</template>
