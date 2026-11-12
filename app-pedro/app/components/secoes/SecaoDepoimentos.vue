<!-- app/components/secoes/SecaoDepoimentos.vue — Depoimentos reais como "evolução" no laudo de quem treina com o Pedro. -->
<!-- Um painel com a citação em destaque; as fotos das alunas são as abas e as setas avançam em ciclo. -->
<!-- A citação troca com desfoque suave; o contador anuncia a posição para leitores de tela. -->

<script setup lang="ts">
const atual = ref(0)
const total = DEPOIMENTOS.length
const depoimento = computed(() => DEPOIMENTOS[atual.value]!)

function ir(passo: number) {
  atual.value = (atual.value + passo + total) % total
}
</script>

<template>
  <section
    id="depoimentos"
    class="py-20 sm:py-28"
  >
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="grid gap-6 lg:grid-cols-12 lg:items-end">
        <h2 class="titulo text-[clamp(2.4rem,5.4vw,4.25rem)] lg:col-span-7">
          Evolução que se vê.
        </h2>
        <p class="max-w-md text-lg leading-relaxed text-tinta-suave lg:col-span-5 lg:justify-self-end">
          Nas palavras de quem treina com o Pedro.
        </p>
      </div>

      <div class="painel mt-12 grid gap-10 p-7 sm:p-12 lg:grid-cols-12 lg:gap-14">
        <!-- Alunas -->
        <div class="flex flex-col gap-6 lg:col-span-4">
          <div
            class="grid gap-2"
            role="group"
            aria-label="Escolher depoimento"
          >
            <button
              v-for="(pessoa, indice) in DEPOIMENTOS"
              :key="pessoa.nome"
              type="button"
              class="flex items-center gap-4 rounded-full p-1.5 pr-5 text-left transition-colors duration-300"
              :class="indice === atual ? 'bg-grafite text-nevoa-clara' : 'hover:bg-nevoa'"
              :aria-pressed="indice === atual"
              @click="atual = indice"
            >
              <img
                :src="urlPublica(pessoa.foto)"
                :alt="`Foto de ${pessoa.nome}`"
                class="size-12 shrink-0 rounded-full object-cover ring-2 transition-[box-shadow]"
                :class="indice === atual ? 'ring-lima-400' : 'ring-white'"
                width="96"
                height="96"
                loading="lazy"
              >
              <span class="min-w-0">
                <span class="block font-display font-semibold tracking-tight">{{ pessoa.nome }}</span>
                <span
                  class="block truncate text-sm"
                  :class="indice === atual ? 'text-nevoa-suave' : 'text-tinta-suave'"
                >{{ pessoa.contexto }}</span>
              </span>
            </button>
          </div>

          <div class="mt-auto flex items-center gap-2">
            <button
              type="button"
              class="botao-fio size-12"
              aria-label="Depoimento anterior"
              @click="ir(-1)"
            >
              <UIcon
                name="i-lucide-arrow-left"
                class="size-5"
              />
            </button>
            <button
              type="button"
              class="botao-fio size-12"
              aria-label="Próximo depoimento"
              @click="ir(1)"
            >
              <UIcon
                name="i-lucide-arrow-right"
                class="size-5"
              />
            </button>
            <p
              class="medida ml-2 text-sm text-tinta-suave"
              aria-live="polite"
            >
              {{ atual + 1 }}/{{ total }}
            </p>
          </div>
        </div>

        <!-- Citação -->
        <div class="lg:col-span-8">
          <Transition
            name="citacao"
            mode="out-in"
          >
            <figure :key="depoimento.nome">
              <UIcon
                name="i-lucide-quote"
                class="size-10 text-lima-600"
              />
              <blockquote class="mt-5 font-display text-[clamp(1.35rem,2.4vw,2rem)] leading-[1.32] font-medium tracking-[-0.015em] text-pretty">
                {{ depoimento.texto }}
              </blockquote>
              <figcaption class="mt-8 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                <span class="font-semibold">{{ depoimento.nome }}</span>
                <span class="text-tinta-suave">{{ depoimento.usuario }}</span>
              </figcaption>
            </figure>
          </Transition>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.citacao-enter-active,
.citacao-leave-active {
  transition: opacity 280ms var(--ease-laudo), filter 280ms var(--ease-laudo), transform 420ms var(--ease-laudo);
}

.citacao-enter-from {
  opacity: 0;
  filter: blur(8px);
  transform: translateY(10px);
}

.citacao-leave-to {
  opacity: 0;
  filter: blur(6px);
}
</style>
