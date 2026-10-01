<!-- app/components/secoes/CabecalhoSite.vue — Cabeçalho fixo da landing com logo e navegação por âncoras. -->
<!-- Fica transparente no topo e ganha fundo sólido ao rolar (efeito agressivo premium). -->
<!-- Navegação some no mobile, dando lugar ao CTA de WhatsApp sempre visível. -->

<script setup lang="ts">
const rolou = ref(false)

const aoRolar = () => {
  rolou.value = window.scrollY > 40
}

onMounted(() => {
  aoRolar()
  window.addEventListener('scroll', aoRolar, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', aoRolar)
})

const links = [
  { rotulo: 'Início', ancora: '#inicio' },
  { rotulo: 'Especialidades', ancora: '#especialidades' },
  { rotulo: 'Depoimentos', ancora: '#depoimentos' },
  { rotulo: 'Contato', ancora: '#contato' }
]
</script>

<template>
  <header
    class="fixed inset-x-0 top-0 z-50 transition-all duration-300"
    :class="rolou ? 'bg-zinc-950/90 backdrop-blur border-b border-white/10 py-3' : 'bg-transparent py-5'"
  >
    <div class="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
      <a
        href="#inicio"
        class="font-display text-2xl font-bold uppercase tracking-tight text-white"
      >
        Pedro<span class="text-primary">Moura</span>
      </a>

      <nav class="hidden items-center gap-8 md:flex">
        <a
          v-for="link in links"
          :key="link.ancora"
          :href="link.ancora"
          class="text-sm font-semibold uppercase tracking-wide text-zinc-300 transition-colors hover:text-primary"
        >
          {{ link.rotulo }}
        </a>
      </nav>

      <UButton
        :to="CONTATO_WHATSAPP_URL"
        target="_blank"
        icon="i-simple-icons-whatsapp"
        color="primary"
        size="md"
        class="font-display font-semibold uppercase tracking-wide"
      >
        <span class="hidden sm:inline">Agendar avaliação</span>
        <span class="sm:hidden">Agendar</span>
      </UButton>
    </div>
  </header>
</template>
