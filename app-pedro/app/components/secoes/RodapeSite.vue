<!-- app/components/secoes/RodapeSite.vue — Rodapé: nome, redes e copyright. -->
<!-- Linha discreta sobre a névoa, depois do painel lima de contato. -->

<script setup lang="ts">
const ano = new Date().getFullYear()
</script>

<template>
  <footer class="py-10">
    <div class="mx-auto flex max-w-7xl flex-col gap-6 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
      <p class="flex items-center gap-2 font-display text-lg font-semibold tracking-tight">
        <span
          class="grid size-7 place-items-center rounded-full bg-grafite"
          aria-hidden="true"
        >
          <span class="size-2 rounded-full bg-lima-400" />
        </span>
        Pedro Moura Filho
      </p>
      <div class="flex items-center gap-1">
        <a
          :href="CONTATO_INSTAGRAM_URL"
          target="_blank"
          rel="noopener"
          aria-label="Instagram"
          class="grid size-11 place-items-center rounded-full transition-colors hover:bg-white"
        >
          <UIcon
            name="i-simple-icons-instagram"
            class="size-5"
          />
        </a>
        <a
          :href="CONTATO_WHATSAPP_URL"
          target="_blank"
          rel="noopener"
          aria-label="WhatsApp"
          class="grid size-11 place-items-center rounded-full transition-colors hover:bg-white"
        >
          <UIcon
            name="i-simple-icons-whatsapp"
            class="size-5"
          />
        </a>
      </div>
      <p class="text-sm text-tinta-suave">
        © {{ ano }} Pedro Moura Filho · Personal trainer
      </p>
    </div>
  </footer>
</template>
