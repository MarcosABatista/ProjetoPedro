<!-- app/components/laudo/EscaneamentoCorpo.vue — Escaneamento corporal com os 8 marcos de dobras cutâneas ISAK. -->
<!-- Uma barra de varredura lima percorre a silhueta revelando a camada medida; os marcos acendem em ciclo e respondem a hover/foco/toque. -->
<!-- O marco ativo ganha rótulo com fio-guia e a leitura embaixo: demonstra "medir antes de prescrever". -->

<script setup lang="ts">
const VIEWBOX_LARGURA = 300
const VIEWBOX_ALTURA = 720
const CICLO_MS = 2800
const PAUSA_APOS_INTERACAO_MS = 9000
const DESVIO_ROTULO = 26

// Meia silhueta (lado direito da figura); a outra metade é o espelho.
const MEIA_SILHUETA = [
  'M150,22 C170,22 186,38 186,62 C186,84 176,100 164,104 L163,120',
  'C172,128 190,132 206,138 C226,144 238,160 238,184',
  'C240,220 244,250 246,282 C250,320 256,350 258,384',
  'C262,400 266,420 260,436 C256,446 244,444 242,432',
  'C240,418 240,400 238,388 C232,354 224,322 220,290',
  'C216,262 212,236 208,212 C204,246 198,276 194,296',
  'C192,320 198,346 202,372 C206,400 204,440 198,480',
  'C194,510 192,530 194,546 C198,580 196,620 186,662',
  'C190,680 200,692 196,700 C190,706 168,706 162,700',
  'C160,690 164,676 162,662 C158,620 160,580 160,548',
  'C160,520 158,500 158,480 C156,440 154,410 150,398'
].join(' ')

const idBase = useId()
const raiz = ref<HTMLElement | null>(null)
const naTela = useNaTela(raiz, { once: false, limiar: 0.2 })

const ativo = ref(0)
const marcoAtivo = computed(() => MARCOS_ISAK[ativo.value]!)
// Leituras ilustrativas (rotuladas como exemplo no painel; não são dados de aluno)
const LEITURAS_EXEMPLO = [
  { rotulo: 'Gordura corporal', valor: '18,4', unidade: '%' },
  { rotulo: 'Taxa metabólica', valor: '1.712', unidade: 'kcal/dia' }
]
const ladoEsquerdo = computed(() => marcoAtivo.value.x < VIEWBOX_LARGURA / 2)

const fioGuia = computed(() => {
  const { x, y } = marcoAtivo.value
  const yRotulo = y - DESVIO_ROTULO
  return ladoEsquerdo.value
    ? `M${x},${y} L${x - DESVIO_ROTULO},${yRotulo} L-36,${yRotulo}`
    : `M${x},${y} L${x + DESVIO_ROTULO},${yRotulo} L336,${yRotulo}`
})

let temporizador: ReturnType<typeof setInterval> | null = null
let retomarEm = 0

function avancar() {
  if (!naTela.value || document.hidden || Date.now() < retomarEm) return
  ativo.value = (ativo.value + 1) % MARCOS_ISAK.length
}

function selecionar(indice: number) {
  ativo.value = (indice + MARCOS_ISAK.length) % MARCOS_ISAK.length
  retomarEm = Date.now() + PAUSA_APOS_INTERACAO_MS
}

function aoTeclar(evento: KeyboardEvent, indice: number) {
  let alvo: number | null = null
  if (evento.key === 'ArrowRight' || evento.key === 'ArrowDown') alvo = indice + 1
  else if (evento.key === 'ArrowLeft' || evento.key === 'ArrowUp') alvo = indice - 1
  if (alvo === null) return
  evento.preventDefault()
  selecionar(alvo)
  raiz.value?.querySelector<HTMLButtonElement>(`[data-marco="${ativo.value}"]`)?.focus()
}

onMounted(() => {
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) temporizador = setInterval(avancar, CICLO_MS)
})

onBeforeUnmount(() => {
  if (temporizador) clearInterval(temporizador)
})

const porcentagem = (valor: number, total: number) => `${(valor / total) * 100}%`
</script>

<template>
  <figure
    ref="raiz"
    class="no-escuro relative isolate flex flex-col overflow-hidden rounded-[2.5rem] bg-grafite text-nevoa-clara shadow-[var(--shadow-flutuante)]"
  >
    <!-- Malha de pontos do scanner e halo de leitura -->
    <div
      class="pointer-events-none absolute inset-0 -z-10 [background-image:radial-gradient(rgb(211_219_209/0.13)_1px,transparent_1.3px)] [background-size:18px_18px]"
      aria-hidden="true"
    />
    <div
      class="pointer-events-none absolute inset-x-0 top-0 -z-10 h-3/4 bg-[radial-gradient(55%_55%_at_50%_35%,rgb(212_242_74/0.09),transparent)]"
      aria-hidden="true"
    />

    <figcaption class="flex items-center justify-between gap-4 px-6 pt-6 text-sm sm:px-8 sm:pt-7">
      <span class="inline-flex items-center gap-2.5 font-medium">
        <span class="relative flex size-2">
          <span class="absolute inset-0 rounded-full bg-lima-400/70 motion-safe:animate-ping" />
          <span class="relative size-2 rounded-full bg-lima-400" />
        </span>
        Dobras cutâneas
      </span>
      <span class="text-nevoa-suave">Perfil restrito ISAK</span>
    </figcaption>

    <div class="relative flex flex-1 justify-center px-24 pt-4 pb-3 sm:px-28">
      <!-- Leituras de exemplo do laudo -->
      <dl class="absolute bottom-4 left-5 z-10 grid gap-2.5 sm:bottom-6 sm:left-8 sm:gap-3">
        <div
          v-for="leitura in LEITURAS_EXEMPLO"
          :key="leitura.rotulo"
        >
          <dt class="text-xs text-nevoa-suave">
            {{ leitura.rotulo }}
          </dt>
          <dd class="medida text-xl leading-tight sm:text-3xl">
            {{ leitura.valor }}<span class="ml-1 font-sans text-xs text-nevoa-suave">{{ leitura.unidade }}</span>
          </dd>
        </div>
        <div>
          <dt class="sr-only">
            Origem
          </dt>
          <dd class="text-xs text-nevoa-suave/80">
            Valores de exemplo
          </dd>
        </div>
      </dl>
      <ul
        class="absolute right-5 bottom-4 z-10 grid gap-1.5 text-xs text-nevoa-suave sm:right-8 sm:bottom-6"
        aria-label="Legenda do escaneamento"
      >
        <li class="flex items-center gap-2">
          <span class="size-2.5 rounded-full bg-lima-400" />Massa magra
        </li>
        <li class="flex items-center gap-2">
          <span class="size-2.5 rounded-full bg-ambar" />Gordura
        </li>
      </ul>
      <div class="relative aspect-[300/720] h-[17rem] sm:h-[min(30rem,52vh)] sm:min-h-[18rem]">
        <svg
          :viewBox="`0 0 ${VIEWBOX_LARGURA} ${VIEWBOX_ALTURA}`"
          class="absolute inset-0 size-full overflow-visible"
          aria-hidden="true"
        >
          <defs>
            <g :id="`${idBase}-corpo`">
              <path :d="MEIA_SILHUETA" />
              <path
                :d="MEIA_SILHUETA"
                transform="translate(300,0) scale(-1,1)"
              />
            </g>
            <linearGradient
              :id="`${idBase}-massa`"
              x1="0"
              y1="0"
              x2="1"
              y2="0"
            >
              <stop
                offset="0"
                stop-color="#D4F24A"
                stop-opacity="0.04"
              />
              <stop
                offset="0.5"
                stop-color="#D4F24A"
                stop-opacity="0.30"
              />
              <stop
                offset="1"
                stop-color="#D4F24A"
                stop-opacity="0.04"
              />
            </linearGradient>
            <clipPath :id="`${idBase}-silhueta`">
              <path :d="MEIA_SILHUETA" />
              <path
                :d="MEIA_SILHUETA"
                transform="translate(300,0) scale(-1,1)"
              />
            </clipPath>
            <filter
              :id="`${idBase}-difuso`"
              x="-50%"
              y="-50%"
              width="200%"
              height="200%"
            >
              <feGaussianBlur stdDeviation="9" />
            </filter>
            <clipPath :id="`${idBase}-varrido`">
              <rect
                class="varredura-mascara"
                x="-40"
                y="0"
                width="380"
                height="720"
              />
            </clipPath>
          </defs>

          <!-- Silhueta em repouso -->
          <use
            :href="`#${idBase}-corpo`"
            fill="rgb(211 219 209 / 0.05)"
            stroke="rgb(211 219 209 / 0.32)"
            stroke-width="1.5"
          />

          <!-- Camada medida, revelada pela varredura -->
          <g :clip-path="`url(#${idBase}-varrido)`">
            <use
              :href="`#${idBase}-corpo`"
              :fill="`url(#${idBase}-massa)`"
              stroke="#D4F24A"
              stroke-width="2"
              stroke-linejoin="round"
            />
            <!-- Mapa de gordura (âmbar) sobre a massa magra (lima) -->
            <g :clip-path="`url(#${idBase}-silhueta)`">
              <g
                :filter="`url(#${idBase}-difuso)`"
                fill="#FFB547"
              >
                <ellipse
                  cx="150"
                  cy="318"
                  rx="44"
                  ry="40"
                  opacity="0.55"
                />
                <ellipse
                  cx="150"
                  cy="392"
                  rx="52"
                  ry="22"
                  opacity="0.4"
                />
                <ellipse
                  cx="66"
                  cy="236"
                  rx="12"
                  ry="34"
                  opacity="0.38"
                />
                <ellipse
                  cx="234"
                  cy="236"
                  rx="12"
                  ry="34"
                  opacity="0.38"
                />
                <ellipse
                  cx="124"
                  cy="470"
                  rx="18"
                  ry="36"
                  opacity="0.3"
                />
                <ellipse
                  cx="176"
                  cy="470"
                  rx="18"
                  ry="36"
                  opacity="0.3"
                />
              </g>
            </g>
            <path
              d="M150,140 L150,396"
              stroke="#D4F24A"
              stroke-width="1"
              stroke-dasharray="2 7"
              opacity="0.55"
            />
          </g>

          <!-- Barra de varredura -->
          <g class="varredura-barra">
            <rect
              x="-40"
              y="-16"
              width="380"
              height="16"
              fill="#D4F24A"
              opacity="0.12"
            />
            <line
              x1="-40"
              y1="0"
              x2="340"
              y2="0"
              stroke="#D4F24A"
              stroke-width="1.5"
            />
          </g>

          <!-- Fio-guia do marco ativo até o rótulo -->
          <path
            :d="fioGuia"
            fill="none"
            stroke="#F6F7F4"
            stroke-opacity="0.75"
            stroke-width="1"
            vector-effect="non-scaling-stroke"
            class="max-sm:hidden"
          />
        </svg>

        <!-- Rótulo do marco ativo, na ponta do fio-guia -->
        <p
          class="pointer-events-none absolute z-10 whitespace-nowrap max-sm:hidden"
          :class="ladoEsquerdo ? 'text-right' : ''"
          :style="ladoEsquerdo
            ? { top: porcentagem(marcoAtivo.y - DESVIO_ROTULO, VIEWBOX_ALTURA), right: `calc(100% + ${(36 / VIEWBOX_LARGURA) * 100}% + 0.4rem)`, transform: 'translateY(-50%)' }
            : { top: porcentagem(marcoAtivo.y - DESVIO_ROTULO, VIEWBOX_ALTURA), left: `calc(100% + ${(36 / VIEWBOX_LARGURA) * 100}% + 0.4rem)`, transform: 'translateY(-50%)' }"
        >
          <span class="block font-display text-sm font-semibold sm:text-base">{{ marcoAtivo.nome }}</span>
          <span class="block text-xs text-lima-300">dobra cutânea</span>
        </p>

        <!-- Marcos como botões reais (acessíveis) sobrepostos à silhueta -->
        <button
          v-for="(marco, indice) in MARCOS_ISAK"
          :key="marco.id"
          type="button"
          :data-marco="indice"
          :aria-label="`Marco ${marco.nome}`"
          :aria-pressed="indice === ativo"
          :tabindex="indice === ativo ? 0 : -1"
          class="group absolute z-20 flex size-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full"
          :style="{ left: porcentagem(marco.x, VIEWBOX_LARGURA), top: porcentagem(marco.y, VIEWBOX_ALTURA) }"
          @mouseenter="selecionar(indice)"
          @focus="selecionar(indice)"
          @click="selecionar(indice)"
          @keydown="aoTeclar($event, indice)"
        >
          <span
            v-if="indice === ativo"
            class="absolute inset-1.5 rounded-full bg-lima-400/25 motion-safe:animate-ping"
          />
          <span
            class="relative rounded-full transition-all duration-300 ease-[var(--ease-assentar)]"
            :class="indice === ativo
              ? 'size-3.5 bg-lima-400 ring-4 ring-lima-400/30'
              : 'size-2.5 bg-nevoa-clara/80 ring-1 ring-nevoa-clara/40 group-hover:bg-lima-300'"
          />
        </button>
      </div>
    </div>

    <!-- Leitura do marco ativo -->
    <div
      class="m-3 mt-0 rounded-[1.9rem] bg-grafite-painel p-5 ring-1 ring-grafite-linha sm:m-4 sm:mt-0 sm:p-6"
      aria-live="polite"
    >
      <div class="flex items-start justify-between gap-4">
        <div class="min-w-0">
          <p class="font-display text-xl font-semibold tracking-tight">
            {{ marcoAtivo.nome }}
          </p>
          <p class="mt-1 min-h-[2.6rem] text-sm leading-snug text-nevoa-suave">
            {{ marcoAtivo.descricao }}
          </p>
        </div>
        <div class="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            class="grid size-9 place-items-center rounded-full ring-1 ring-grafite-linha transition-colors hover:bg-grafite-linha"
            aria-label="Marco anterior"
            @click="selecionar(ativo - 1)"
          >
            <UIcon
              name="i-lucide-chevron-left"
              class="size-4"
            />
          </button>
          <button
            type="button"
            class="grid size-9 place-items-center rounded-full ring-1 ring-grafite-linha transition-colors hover:bg-grafite-linha"
            aria-label="Próximo marco"
            @click="selecionar(ativo + 1)"
          >
            <UIcon
              name="i-lucide-chevron-right"
              class="size-4"
            />
          </button>
        </div>
      </div>
      <div class="mt-4 flex items-center justify-between border-t border-grafite-linha pt-3 text-xs text-nevoa-suave">
        <span>Leitura <span class="medida mx-1 text-sm text-lima-300">__,_ mm</span> na sua avaliação</span>
        <span class="medida">{{ ativo + 1 }}/{{ MARCOS_ISAK.length }}</span>
      </div>
    </div>
  </figure>
</template>

<style scoped>
.varredura-mascara {
  transform-box: view-box;
  transform-origin: 0 0;
  animation: revelar 6s var(--ease-laudo) infinite;
}

.varredura-barra {
  animation: varrer 6s var(--ease-laudo) infinite;
}

@keyframes revelar {
  0% { transform: scaleY(0); }
  55%, 100% { transform: scaleY(1); }
}

@keyframes varrer {
  0% { transform: translateY(0); opacity: 0; }
  5% { opacity: 1; }
  55% { transform: translateY(720px); opacity: 1; }
  62%, 100% { transform: translateY(720px); opacity: 0; }
}

@media (prefers-reduced-motion: reduce) {
  .varredura-mascara { animation: none; transform: none; }
  .varredura-barra { display: none; }
}
</style>
