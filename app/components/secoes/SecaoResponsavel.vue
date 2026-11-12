<!-- app/components/secoes/SecaoResponsavel.vue — Quem assina o laudo: formação e certificações do Pedro. -->
<!-- Retrato arredondado com o selo ISAK sobreposto; credenciais como campos do laudo e assinatura com o Instagram. -->

<script setup lang="ts">
const CAMPOS = [
  { rotulo: 'Formação', credencial: PEDRO_CREDENCIAIS[0]! },
  { rotulo: 'Pós-graduação', credencial: PEDRO_CREDENCIAIS[1]! },
  { rotulo: 'Especialização', credencial: PEDRO_CREDENCIAIS[2]! },
  { rotulo: 'Pesquisa', credencial: PEDRO_CREDENCIAIS[3]! },
  { rotulo: 'Certificação', credencial: PEDRO_CREDENCIAIS[4]! }
]
</script>

<template>
  <section
    id="responsavel"
    class="py-20 sm:py-28"
  >
    <div class="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:items-center lg:gap-16 lg:px-8">
      <div class="relative mx-auto w-full max-w-xs sm:max-w-sm lg:col-span-5 lg:max-w-md">
        <LaudoFotoPedro class="aspect-[4/5] rounded-[2.5rem] shadow-[var(--shadow-flutuante)]" />
        <LaudoSeloIsak class="absolute -right-3 -bottom-8 size-32 sm:-right-8 sm:size-40" />
      </div>

      <div class="lg:col-span-7">
        <h2 class="titulo text-[clamp(2.4rem,5.4vw,4.25rem)]">
          Quem assina o seu laudo.
        </h2>

        <dl class="painel mt-10 p-3 sm:p-4">
          <div
            v-for="campo in CAMPOS"
            :key="campo.rotulo"
            class="flex items-center gap-4 rounded-[1.25rem] px-3 py-3.5 sm:px-4"
          >
            <span class="grid size-11 shrink-0 place-items-center rounded-full bg-nevoa">
              <UIcon
                :name="campo.credencial.icone"
                class="size-5"
              />
            </span>
            <div class="min-w-0">
              <dt class="text-sm text-tinta-suave">
                {{ campo.rotulo }}
              </dt>
              <dd class="font-display text-lg leading-snug font-semibold tracking-tight">
                {{ campo.credencial.texto }}
              </dd>
            </div>
          </div>
        </dl>

        <div class="mt-8 flex flex-wrap items-center justify-between gap-4 px-2">
          <div>
            <p class="font-display text-xl font-semibold tracking-tight">
              Pedro Moura Filho
            </p>
            <p class="text-sm text-tinta-suave">
              Profissional de Educação Física · Personal trainer
            </p>
          </div>
          <a
            :href="CONTATO_INSTAGRAM_URL"
            target="_blank"
            rel="noopener"
            class="botao-fio px-5 py-3 text-sm"
          >
            <UIcon
              name="i-simple-icons-instagram"
              class="size-4"
            />
            {{ CONTATO_INSTAGRAM_USUARIO }}
          </a>
        </div>
      </div>
    </div>
  </section>
</template>
