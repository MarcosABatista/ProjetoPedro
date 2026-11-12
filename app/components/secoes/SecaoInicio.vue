<!-- app/components/secoes/SecaoInicio.vue — Primeira dobra: o laudo do visitante. -->
<!-- Escaneamento corporal com marcos ISAK à esquerda; título, apresentação e a ficha de interesse à direita. -->
<!-- A ação principal (escolher trilha e chamar no WhatsApp) já funciona aqui, sem rolar. -->

<template>
  <section
    id="inicio"
    class="relative overflow-x-clip pt-24 sm:pt-28"
  >
    <!-- Luz de laboratório: brilho frio no alto da página -->
    <div
      class="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[46rem] bg-[radial-gradient(70%_60%_at_70%_0%,#FFFFFF,transparent)]"
      aria-hidden="true"
    />

    <div class="mx-auto grid max-w-7xl gap-8 px-4 pb-20 sm:px-6 lg:grid-cols-12 lg:gap-x-14 lg:gap-y-7 lg:px-8 lg:pb-28">
      <!-- Título e ficha -->
      <div class="entrada min-w-0 lg:col-span-6 lg:col-start-7 lg:row-start-1 lg:pt-2">
        <h1 class="titulo text-[clamp(3.1rem,8.4vw,5.4rem)] font-bold">
          Seu corpo,
          <span class="relative isolate inline-block whitespace-nowrap">
            <span
              class="destaque absolute inset-x-[-0.08em] bottom-[0.08em] -z-10 h-[0.36em] rounded-full bg-lima-400"
              aria-hidden="true"
            />
            medido.
          </span>
        </h1>

        <p class="mt-5 max-w-[34rem] text-lg leading-relaxed text-pretty text-tinta-suave sm:text-xl">
          Treino prescrito a partir dos seus números, por um
          <strong class="font-semibold text-grafite">antropometrista ISAK</strong> pós-graduado em
          <strong class="font-semibold text-grafite">biomecânica</strong>.
        </p>
      </div>

      <!-- Escaneamento (no celular vem antes da ficha: primeiro o corpo medido, depois a ação) -->
      <div class="min-w-0 lg:col-span-6 lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:pt-2">
        <LaudoEscaneamentoCorpo />
      </div>

      <LaudoFormularioTrilha class="entrada min-w-0 lg:col-span-6 lg:col-start-7 lg:row-start-2 lg:self-start" />
    </div>
  </section>
</template>

<style scoped>
.entrada {
  animation: assentar 900ms var(--ease-laudo) both;
}

.destaque {
  transform-origin: left center;
  animation: riscar 900ms 350ms var(--ease-laudo) both;
}

@keyframes riscar {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}
</style>
