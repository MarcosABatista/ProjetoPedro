<!-- app/components/secoes/RodapeSite.vue — Rodapé do site com marca, redes sociais e copyright. -->
<!-- Encerra a página reforçando a identidade e oferecendo os links de redes do Pedro. -->

<script setup lang="ts">
const ano = new Date().getFullYear()

const redes = [
  { icone: 'i-simple-icons-instagram', url: CONTATO_INSTAGRAM_URL, rotulo: 'Instagram' },
  { icone: 'i-simple-icons-whatsapp', url: CONTATO_WHATSAPP_URL, rotulo: 'WhatsApp' }
]
</script>

<template>
  <footer class="border-t border-white/10 bg-zinc-950 py-12">
    <div class="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 sm:px-6 lg:flex-row lg:justify-between lg:px-8">
      <a
        href="#inicio"
        class="font-display text-2xl font-bold uppercase tracking-tight text-white"
      >
        Pedro<span class="text-primary">Moura</span>
      </a>

      <div class="flex items-center gap-3">
        <UButton
          v-for="rede in redes"
          :key="rede.rotulo"
          :to="rede.url"
          target="_blank"
          :icon="rede.icone"
          :aria-label="rede.rotulo"
          color="neutral"
          variant="ghost"
          size="lg"
        />
      </div>

      <p class="text-sm text-zinc-500">
        © {{ ano }} Pedro Moura Filho — Personal Trainer
      </p>
    </div>
  </footer>
</template>
