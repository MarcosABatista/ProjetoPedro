<!-- app/components/secoes/SecaoContato.vue — Chamada final de conversão (CTA de contato). -->
<!-- Faixa de alto contraste em primary com WhatsApp, telefone e Instagram do Pedro. -->
<!-- Último empurrão para o agendamento antes do rodapé. -->

<script setup lang="ts">
// Constantes de contato vêm de app/utils/conteudo.ts (auto-import).
</script>

<template>
  <section
    id="contato"
    class="relative overflow-hidden bg-zinc-950 py-24 sm:py-32"
  >
    <div class="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
      <div class="relative overflow-hidden rounded-3xl border border-primary/25 bg-zinc-900 p-10 ring-1 ring-white/5 sm:p-16">
        <!-- Brasa sutil nos cantos (dá o ar agressivo sem o vermelho chapado) -->
        <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(217,45,32,0.22),transparent_55%)]" />
        <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(217,45,32,0.14),transparent_55%)]" />

        <div class="relative text-center">
          <h2 class="font-display text-4xl font-bold uppercase tracking-tight text-white sm:text-5xl">
            Bora começar seu <span class="text-primary">treino?</span>
          </h2>
          <p class="mx-auto mt-4 max-w-xl text-lg text-zinc-300">
            Agende seu horário, tire suas dúvidas e comece hoje com acompanhamento
            profissional de verdade. Bons treinos!
          </p>

          <div class="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <UButton
              :to="CONTATO_WHATSAPP_URL"
              target="_blank"
              icon="i-simple-icons-whatsapp"
              color="primary"
              size="xl"
              class="font-display font-semibold uppercase tracking-wide"
            >
              Chamar no WhatsApp
            </UButton>
            <UButton
              :to="CONTATO_INSTAGRAM_URL"
              target="_blank"
              icon="i-simple-icons-instagram"
              color="neutral"
              variant="subtle"
              size="xl"
              class="font-display font-semibold uppercase tracking-wide"
            >
              Seguir no Instagram
            </UButton>
          </div>

          <div class="mt-10 flex items-center justify-center gap-2 text-zinc-400">
            <UIcon
              name="i-lucide-phone"
              class="size-5 text-primary"
            />
            <span class="font-semibold text-zinc-200">{{ CONTATO_TELEFONE }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
