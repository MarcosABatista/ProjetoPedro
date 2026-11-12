<!-- app/components/secoes/SecaoTrilhas.vue — As duas trilhas de serviço (presencial e online) e o passo a passo do acompanhamento. -->
<!-- Presencial em painel grafite e online em painel claro, cada um com CTA e mensagem própria no WhatsApp. -->
<!-- "Como funciona" é um trilho contínuo com quatro etapas que acendem em sequência ao entrar na tela. -->

<script setup lang="ts">
const trilho = ref<HTMLElement | null>(null)
const naTela = useNaTela(trilho, { limiar: 0.3 })

const mensagemTrilha = (trilha: Trilha) => montarUrlWhatsapp(montarMensagemFicha(trilha.id, null, ''))
</script>

<template>
  <section
    id="trilhas"
    class="py-20 sm:py-28"
  >
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <h2 class="titulo max-w-3xl text-[clamp(2.4rem,5.4vw,4.25rem)]">
        Perto ou longe, o mesmo método.
      </h2>

      <div class="mt-12 grid gap-4 md:grid-cols-2">
        <article
          v-for="trilha in TRILHAS"
          :key="trilha.id"
          class="relative isolate flex flex-col overflow-hidden rounded-[2.5rem] p-7 sm:p-10"
          :class="trilha.id === 'presencial'
            ? 'no-escuro bg-grafite text-nevoa-clara shadow-[var(--shadow-flutuante)]'
            : 'painel'"
        >
          <h3 class="titulo text-[clamp(2.25rem,4vw,3.25rem)]">
            {{ trilha.titulo }}
          </h3>
          <p
            class="mt-3 inline-flex items-center gap-1.5 text-sm font-medium"
            :class="trilha.id === 'presencial' ? 'text-lima-300' : 'text-tinta-suave'"
          >
            <UIcon
              :name="trilha.id === 'presencial' ? 'i-lucide-map-pin' : 'i-lucide-globe'"
              class="size-4"
            />{{ trilha.local }}
          </p>
          <p
            class="mt-4 max-w-md text-base leading-relaxed sm:text-lg"
            :class="trilha.id === 'presencial' ? 'text-nevoa-suave' : 'text-tinta-suave'"
          >
            {{ trilha.descricao }}
          </p>
          <ul class="mt-8 grid gap-3">
            <li
              v-for="item in trilha.inclui"
              :key="item"
              class="flex items-center gap-3"
            >
              <span
                class="grid size-6 shrink-0 place-items-center rounded-full"
                :class="trilha.id === 'presencial' ? 'bg-lima-400 text-grafite' : 'bg-grafite text-lima-400'"
              >
                <UIcon
                  name="i-lucide-check"
                  class="size-3.5"
                />
              </span>
              {{ item }}
            </li>
          </ul>
          <a
            :href="mensagemTrilha(trilha)"
            target="_blank"
            rel="noopener"
            class="mt-10 self-start px-6 py-3.5"
            :class="trilha.id === 'presencial' ? 'botao-lima' : 'botao-grafite'"
          >
            <UIcon
              name="i-simple-icons-whatsapp"
              class="size-5"
              :class="trilha.id === 'presencial' ? '' : 'text-lima-400'"
            />
            Quero o {{ trilha.id === 'presencial' ? 'presencial' : 'online' }}
          </a>
        </article>
      </div>

      <!-- Como funciona: trilho contínuo -->
      <div
        ref="trilho"
        class="painel mt-4 p-7 sm:p-10"
      >
        <h3 class="titulo text-[clamp(1.75rem,3vw,2.25rem)]">
          Como funciona
        </h3>
        <ol class="relative mt-10 grid gap-9 md:grid-cols-4 md:gap-6">
          <!-- Trilho -->
          <span
            class="absolute top-2 bottom-2 left-[1.1875rem] w-0.5 rounded-full bg-nevoa md:top-[1.1875rem] md:right-0 md:bottom-auto md:left-0 md:h-0.5 md:w-auto"
            aria-hidden="true"
          />
          <span
            class="absolute top-2 bottom-2 left-[1.1875rem] w-0.5 origin-top rounded-full bg-grafite transition-transform duration-[1400ms] ease-[var(--ease-laudo)] md:top-[1.1875rem] md:right-0 md:bottom-auto md:left-0 md:h-0.5 md:w-auto md:origin-left"
            :class="naTela ? 'scale-100' : 'max-md:scale-y-0 md:scale-x-0'"
            aria-hidden="true"
          />
          <li
            v-for="(etapa, indice) in ETAPAS_PROCESSO"
            :key="etapa.titulo"
            class="relative pl-14 md:pt-16 md:pl-0"
          >
            <span
              class="absolute top-0 left-0 grid size-10 place-items-center rounded-full font-display font-semibold ring-4 ring-white transition-colors duration-500"
              :class="naTela ? 'bg-lima-400 text-grafite' : 'bg-nevoa text-tinta-suave'"
              :style="{ transitionDelay: `${300 + indice * 280}ms` }"
              aria-hidden="true"
            >{{ indice + 1 }}</span>
            <p class="font-display text-xl font-semibold tracking-tight">
              {{ etapa.titulo }}
            </p>
            <p class="mt-2 max-w-xs leading-relaxed text-tinta-suave">
              {{ etapa.texto }}
            </p>
          </li>
        </ol>
      </div>
    </div>
  </section>
</template>
