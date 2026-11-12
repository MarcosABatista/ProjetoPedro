<!-- app/components/laudo/FormularioTrilha.vue — Ficha de interesse do topo da página (ação principal). -->
<!-- O visitante escolhe a modalidade (segmentado presencial/online) e o objetivo; o link do WhatsApp sai com a mensagem pronta. -->
<!-- Assinada pelo responsável (avatar do Pedro) para lembrar que quem lê a ficha é o próprio avaliador. -->

<script setup lang="ts">
const idBase = useId()

const nome = ref('')
const trilha = ref<TrilhaId>('presencial')
const objetivo = ref<string | null>(null)

const indiceTrilha = computed(() => TRILHAS.findIndex(opcao => opcao.id === trilha.value))
const trilhaAtual = computed(() => TRILHAS[indiceTrilha.value]!)
const urlWhatsapp = computed(() => montarUrlWhatsapp(montarMensagemFicha(trilha.value, objetivo.value, nome.value)))

function alternarObjetivo(valor: string) {
  objetivo.value = objetivo.value === valor ? null : valor
}
</script>

<template>
  <form
    class="painel relative p-5 sm:p-6"
    aria-label="Ficha de interesse"
    @submit.prevent
  >
    <!-- Responsável -->
    <div class="flex items-center gap-3.5">
      <LaudoFotoPedro
        alt=""
        prioridade
        class="size-12 shrink-0 rounded-full ring-2 ring-white shadow-[0_6px_14px_-6px_rgb(18_22_20/0.5)]"
      />
      <div class="min-w-0 leading-tight">
        <p class="font-display text-lg font-semibold tracking-tight">
          Comece pela avaliação
        </p>
        <p class="truncate text-sm text-tinta-suave">
          Lida por Pedro Moura Filho · ISAK Nível 1
        </p>
      </div>
    </div>

    <div class="mt-4 grid gap-4">
      <!-- Modalidade: controle segmentado -->
      <fieldset>
        <legend class="sr-only">
          Modalidade
        </legend>
        <div class="relative grid grid-cols-2 rounded-full bg-nevoa p-1.5">
          <span
            class="absolute inset-y-1.5 left-1.5 w-[calc(50%-0.375rem)] rounded-full bg-grafite shadow-[0_8px_18px_-10px_rgb(18_22_20/0.8)] transition-transform duration-500 ease-[var(--ease-laudo)]"
            :style="{ transform: `translateX(${indiceTrilha * 100}%)` }"
            aria-hidden="true"
          />
          <label
            v-for="opcao in TRILHAS"
            :key="opcao.id"
            class="relative z-10 flex items-center justify-center gap-2 rounded-full px-3 py-2.5 text-center font-display text-[0.95rem] font-semibold transition-colors duration-300 sm:text-base"
            :class="trilha === opcao.id ? 'text-nevoa-clara' : 'text-tinta-suave hover:text-grafite'"
          >
            <input
              v-model="trilha"
              type="radio"
              :name="`${idBase}-trilha`"
              :value="opcao.id"
              class="peer sr-only"
            >
            <UIcon
              :name="opcao.id === 'presencial' ? 'i-lucide-map-pin' : 'i-lucide-globe'"
              class="size-4 shrink-0"
              :class="trilha === opcao.id ? 'text-lima-400' : ''"
            />
            {{ opcao.id === 'presencial' ? 'Presencial' : 'Online' }}
            <span class="pointer-events-none absolute inset-0 rounded-full peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-grafite" />
          </label>
        </div>
        <p
          class="mt-2 px-1 text-sm text-tinta-suave"
          aria-live="polite"
        >
          {{ trilhaAtual.id === 'presencial' ? 'Acompanhamento em Santa Luzia do Paruá, com avaliação física completa.' : 'Consultoria de qualquer cidade, com acompanhamento pelo WhatsApp.' }}
        </p>
      </fieldset>

      <!-- Objetivo -->
      <fieldset>
        <legend class="mb-2.5 px-1 text-sm font-medium">
          Objetivo principal <span class="font-normal text-tinta-suave">(opcional)</span>
        </legend>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="opcao in OBJETIVOS"
            :key="opcao"
            type="button"
            :aria-pressed="objetivo === opcao"
            class="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-[background-color,color,box-shadow] duration-200"
            :class="objetivo === opcao
              ? 'bg-grafite text-nevoa-clara'
              : 'bg-transparent text-grafite ring-1 ring-grafite/15 hover:ring-grafite/50'"
            @click="alternarObjetivo(opcao)"
          >
            <UIcon
              v-if="objetivo === opcao"
              name="i-lucide-check"
              class="size-3.5 text-lima-400"
            />
            {{ opcao }}
          </button>
        </div>
      </fieldset>

      <!-- Nome + envio na mesma linha a partir de sm -->
      <div>
        <label
          :for="`${idBase}-nome`"
          class="mb-2.5 block px-1 text-sm font-medium"
        >Como você gosta de ser chamado? <span class="font-normal text-tinta-suave">(opcional)</span></label>
        <div class="flex flex-col gap-3 sm:flex-row">
          <input
            :id="`${idBase}-nome`"
            v-model="nome"
            type="text"
            autocomplete="given-name"
            placeholder="Seu nome"
            maxlength="40"
            class="min-w-0 flex-1 rounded-full bg-nevoa px-5 py-3.5 text-base text-grafite ring-1 ring-transparent transition-shadow placeholder:text-tinta-suave/80 hover:ring-grafite/15 focus:bg-white focus:ring-2 focus:ring-grafite focus:outline-none"
          >
          <a
            :href="urlWhatsapp"
            target="_blank"
            rel="noopener"
            class="botao-lima shrink-0 px-6 py-3.5 text-base sm:text-lg"
          >
            <UIcon
              name="i-simple-icons-whatsapp"
              class="size-5"
            />
            Enviar pelo WhatsApp
          </a>
        </div>
      </div>
      <p class="-mt-1 px-1 text-xs text-tinta-suave">
        Abre o WhatsApp com a mensagem pronta. Você revisa antes de enviar.
      </p>
    </div>
  </form>
</template>
