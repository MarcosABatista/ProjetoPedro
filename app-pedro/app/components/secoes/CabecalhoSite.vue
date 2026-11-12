<!-- app/components/secoes/CabecalhoSite.vue — Cabeçalho flutuante em pílula: nome, navegação e CTA do WhatsApp. -->
<!-- Ganha fundo opaco e sombra ao rolar; destaca a seção atual na navegação (scroll-spy) com uma pílula que desliza. -->
<!-- No mobile a navegação vira um painel suspenso arredondado; o CTA do WhatsApp fica sempre visível. -->

<script setup lang="ts">
const LINKS = [
  { rotulo: 'Avaliação', ancora: 'avaliacao' },
  { rotulo: 'Método', ancora: 'metodo' },
  { rotulo: 'Zonas de FC', ancora: 'zonas' },
  { rotulo: 'Trilhas', ancora: 'trilhas' },
  { rotulo: 'Depoimentos', ancora: 'depoimentos' }
]

const rolou = ref(false)
const secaoAtual = ref('')
const menuAberto = ref(false)

function aoRolar() {
  rolou.value = window.scrollY > 24
  const limite = window.innerHeight * 0.35
  let atual = ''
  for (const link of LINKS) {
    const alvo = document.getElementById(link.ancora)
    if (alvo && alvo.getBoundingClientRect().top <= limite) atual = link.ancora
  }
  secaoAtual.value = atual
}

onMounted(() => {
  aoRolar()
  window.addEventListener('scroll', aoRolar, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', aoRolar)
})
</script>

<template>
  <header class="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4">
    <div
      class="mx-auto flex h-14 max-w-6xl items-center gap-3 rounded-full pr-1.5 pl-5 ring-1 backdrop-blur-xl transition-[background-color,box-shadow] duration-500 sm:h-16 sm:pr-2 sm:pl-6"
      :class="rolou || menuAberto
        ? 'bg-white/85 shadow-[0_18px_40px_-24px_rgb(18_22_20/0.45)] ring-grafite/8'
        : 'bg-white/55 ring-white/70'"
    >
      <a
        href="#inicio"
        class="flex items-center gap-2 rounded-full"
        @click="menuAberto = false"
      >
        <span
          class="grid size-7 place-items-center rounded-full bg-grafite"
          aria-hidden="true"
        >
          <span class="size-2 rounded-full bg-lima-400" />
        </span>
        <span class="font-display text-lg font-semibold tracking-tight whitespace-nowrap">Pedro Moura</span>
      </a>

      <nav
        class="ml-auto hidden items-center gap-0.5 lg:flex"
        aria-label="Seções"
      >
        <a
          v-for="link in LINKS"
          :key="link.ancora"
          :href="`#${link.ancora}`"
          class="rounded-full px-4 py-2 text-[0.95rem] font-medium transition-colors duration-300"
          :class="secaoAtual === link.ancora ? 'bg-grafite text-nevoa-clara' : 'text-tinta-suave hover:bg-nevoa hover:text-grafite'"
          :aria-current="secaoAtual === link.ancora ? 'location' : undefined"
        >
          {{ link.rotulo }}
        </a>
      </nav>

      <a
        :href="CONTATO_WHATSAPP_URL"
        target="_blank"
        rel="noopener"
        class="botao-lima ml-auto shrink-0 px-4 py-2.5 text-[0.95rem] sm:px-5 lg:ml-2"
      >
        <UIcon
          name="i-simple-icons-whatsapp"
          class="size-4"
        />
        Agendar
      </a>

      <button
        type="button"
        class="grid size-11 shrink-0 place-items-center rounded-full transition-colors hover:bg-nevoa lg:hidden"
        :aria-expanded="menuAberto"
        aria-controls="menu-mobile"
        :aria-label="menuAberto ? 'Fechar menu' : 'Abrir menu'"
        @click="menuAberto = !menuAberto"
      >
        <UIcon
          :name="menuAberto ? 'i-lucide-x' : 'i-lucide-menu'"
          class="size-5"
        />
      </button>
    </div>

    <Transition name="menu">
      <nav
        v-show="menuAberto"
        id="menu-mobile"
        class="mx-auto mt-2 max-w-6xl rounded-[1.75rem] bg-white/95 p-2 shadow-[0_24px_48px_-24px_rgb(18_22_20/0.5)] ring-1 ring-grafite/8 backdrop-blur-xl lg:hidden"
        aria-label="Seções no celular"
      >
        <a
          v-for="link in LINKS"
          :key="link.ancora"
          :href="`#${link.ancora}`"
          class="flex items-center justify-between rounded-[1.25rem] px-5 py-4 font-display text-xl font-semibold tracking-tight transition-colors hover:bg-nevoa"
          @click="menuAberto = false"
        >
          {{ link.rotulo }}
          <UIcon
            name="i-lucide-arrow-right"
            class="size-5 text-tinta-suave"
          />
        </a>
      </nav>
    </Transition>
  </header>
</template>

<style scoped>
.menu-enter-active,
.menu-leave-active {
  transition: opacity 260ms var(--ease-laudo), transform 360ms var(--ease-laudo);
  transform-origin: top center;
}

.menu-enter-from,
.menu-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.98);
}
</style>
