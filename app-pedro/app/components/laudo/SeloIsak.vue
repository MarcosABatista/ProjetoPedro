<!-- app/components/laudo/SeloIsak.vue — Selo circular "Antropometrista ISAK Nível 1" desenhado em SVG. -->
<!-- O anel de texto gira devagar (parado com movimento reduzido); o centro traz ISAK em lima sobre grafite. -->

<script setup lang="ts">
const idUnico = useId()
</script>

<template>
  <div
    class="pointer-events-none relative grid place-items-center rounded-full bg-grafite text-nevoa-clara shadow-[var(--shadow-flutuante)] select-none"
    aria-hidden="true"
  >
    <svg
      viewBox="0 0 200 200"
      class="anel absolute inset-0 size-full"
    >
      <defs>
        <path
          :id="`${idUnico}-arco`"
          d="M100,100 m-76,0 a76,76 0 1,1 152,0 a76,76 0 1,1 -152,0"
        />
      </defs>
      <text
        font-family="Funnel Display, sans-serif"
        font-weight="600"
        font-size="15"
        letter-spacing="4.1"
        fill="currentColor"
      >
        <textPath :href="`#${idUnico}-arco`">ANTROPOMETRISTA · PEDRO MOURA FILHO · </textPath>
      </text>
    </svg>
    <div class="grid size-[52%] place-items-center rounded-full bg-lima-400 text-grafite">
      <div class="text-center leading-none">
        <p class="font-display text-[clamp(1rem,2.4vw,1.5rem)] font-bold tracking-tight">
          ISAK
        </p>
        <p class="mt-0.5 text-[0.6rem] font-semibold tracking-wide">
          NÍVEL 1
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.anel {
  animation: girar 40s linear infinite;
}

@keyframes girar {
  to { transform: rotate(360deg); }
}

@media (prefers-reduced-motion: reduce) {
  .anel { animation: none; }
}
</style>
