<!-- app/components/secoes/SecaoContato.vue — Fechamento da página: chamada final num painel lima. -->
<!-- É o único painel inteiro em lima: o laudo termina na ação. WhatsApp em grafite, Instagram e telefone ao lado. -->

<template>
  <section
    id="contato"
    class="px-2 pt-8 pb-4 sm:px-4"
  >
    <div class="relative isolate mx-auto max-w-[96rem] overflow-hidden rounded-[2.5rem] bg-lima-400 px-6 py-16 text-grafite sm:rounded-[3.5rem] sm:px-12 sm:py-24 lg:px-20">
      <h2 class="titulo max-w-4xl text-[clamp(2.8rem,8.5vw,6rem)]">
        Bora começar seu treino?
      </h2>
      <p class="mt-6 max-w-xl text-lg leading-relaxed text-grafite/80 sm:text-xl">
        Agende seu horário, tire suas dúvidas e comece com acompanhamento profissional de verdade. Bons treinos!
      </p>

      <div class="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <a
          :href="CONTATO_WHATSAPP_URL"
          target="_blank"
          rel="noopener"
          class="botao-grafite px-7 py-4 text-lg"
        >
          <UIcon
            name="i-simple-icons-whatsapp"
            class="size-5 text-lima-400"
          />
          Chamar no WhatsApp
        </a>
        <a
          :href="CONTATO_INSTAGRAM_URL"
          target="_blank"
          rel="noopener"
          class="botao-fio px-7 py-4 text-lg"
        >
          <UIcon
            name="i-simple-icons-instagram"
            class="size-5"
          />
          Instagram
        </a>
        <a
          :href="CONTATO_TELEFONE_URL"
          class="medida inline-flex items-center gap-2 rounded-full px-3 py-4 text-base underline decoration-grafite/30 underline-offset-4 hover:decoration-grafite sm:ml-2"
        >
          <UIcon
            name="i-lucide-phone"
            class="size-5"
          />
          {{ CONTATO_TELEFONE }}
        </a>
      </div>
    </div>
  </section>
</template>
