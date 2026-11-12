<!-- app/components/secoes/SecaoMetodo.vue — Os três pilares do método num painel grafite de laboratório. -->
<!-- Um controle segmentado (biomecânica, fisiologia, antropometria) troca a pergunta, a explicação, os destaques e o diagrama animado. -->
<!-- Tablist acessível (setas, Home/End) seguindo o padrão WAI-ARIA de abas. -->

<script setup lang="ts">
const idBase = useId()
const ativa = ref(0)
const pilar = computed(() => METODO_PILARES[ativa.value]!)

function aoTeclar(evento: KeyboardEvent) {
  const total = METODO_PILARES.length
  let proxima = ativa.value
  if (evento.key === 'ArrowRight') proxima = (ativa.value + 1) % total
  else if (evento.key === 'ArrowLeft') proxima = (ativa.value - 1 + total) % total
  else if (evento.key === 'Home') proxima = 0
  else if (evento.key === 'End') proxima = total - 1
  else return
  evento.preventDefault()
  ativa.value = proxima
  document.getElementById(`${idBase}-aba-${proxima}`)?.focus()
}
</script>

<template>
  <section
    id="metodo"
    class="px-2 py-4 sm:px-4"
  >
    <div class="no-escuro relative isolate mx-auto max-w-[96rem] overflow-hidden rounded-[2.5rem] bg-grafite py-20 text-nevoa-clara sm:rounded-[3.5rem] sm:py-28">
      <div class="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div class="grid gap-6 lg:grid-cols-12 lg:items-end">
          <h2 class="titulo text-[clamp(2.4rem,5.4vw,4.25rem)] lg:col-span-7">
            Ciência por trás de cada repetição.
          </h2>
          <p class="max-w-md text-lg leading-relaxed text-nevoa-suave lg:col-span-5 lg:justify-self-end">
            Nada de treino genérico. Três perguntas respondidas com método antes de definir carga, volume e exercício.
          </p>
        </div>

        <!-- Controle segmentado -->
        <div
          role="tablist"
          aria-label="Pilares do método"
          class="mt-12 inline-flex max-w-full gap-1 overflow-x-auto rounded-full bg-grafite-painel p-1.5 ring-1 ring-grafite-linha"
          @keydown="aoTeclar"
        >
          <button
            v-for="(item, indice) in METODO_PILARES"
            :id="`${idBase}-aba-${indice}`"
            :key="item.id"
            type="button"
            role="tab"
            :aria-selected="indice === ativa"
            :aria-controls="`${idBase}-painel`"
            :tabindex="indice === ativa ? 0 : -1"
            class="shrink-0 rounded-full px-4 py-2.5 font-display text-[0.95rem] font-semibold whitespace-nowrap transition-colors duration-300 sm:px-6 sm:text-base"
            :class="indice === ativa ? 'bg-lima-400 text-grafite' : 'text-nevoa-suave hover:text-nevoa-clara'"
            @click="ativa = indice"
          >
            {{ item.titulo }}
          </button>
        </div>

        <div
          :id="`${idBase}-painel`"
          role="tabpanel"
          :aria-labelledby="`${idBase}-aba-${ativa}`"
          class="mt-8"
        >
          <Transition
            name="pilar"
            mode="out-in"
          >
            <div
              :key="pilar.id"
              class="grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-16"
            >
              <div class="lg:col-span-5">
                <h3 class="titulo text-[clamp(2rem,3.6vw,3rem)]">
                  {{ pilar.pergunta }}
                </h3>
                <p class="mt-5 max-w-prose text-base leading-relaxed text-nevoa-suave sm:text-lg">
                  {{ pilar.descricao }}
                </p>
                <ul class="mt-8 grid gap-3.5 border-t border-grafite-linha pt-6">
                  <li
                    v-for="destaque in pilar.destaques"
                    :key="destaque"
                    class="flex items-center gap-3"
                  >
                    <span class="grid size-6 shrink-0 place-items-center rounded-full bg-lima-400 text-grafite">
                      <UIcon
                        name="i-lucide-check"
                        class="size-4"
                      />
                    </span>
                    {{ destaque }}
                  </li>
                </ul>
              </div>

              <div class="rounded-[2rem] bg-grafite-painel p-5 ring-1 ring-grafite-linha sm:p-8 lg:col-span-7">
                <LaudoDiagramaMetodo :tipo="pilar.diagrama" />
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.pilar-enter-active,
.pilar-leave-active {
  transition: opacity 260ms var(--ease-laudo), transform 420ms var(--ease-laudo), filter 260ms;
}

.pilar-enter-from {
  opacity: 0;
  transform: translateY(14px);
  filter: blur(6px);
}

.pilar-leave-to {
  opacity: 0;
  transform: translateY(-8px);
  filter: blur(4px);
}
</style>
