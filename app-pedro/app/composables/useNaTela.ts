// app/composables/useNaTela.ts — Observa quando um elemento entra na viewport (IntersectionObserver).
// Usado pelas seções do laudo para disparar animações (marcas de checagem, barras, trilho) uma única vez.
// Sem JS ou fora do browser o conteúdo já está visível: a animação só acrescenta, nunca esconde.

import type { Ref } from 'vue'

/**
 * @param alvo Ref do elemento observado.
 * @param opcoes once: para de observar após a primeira entrada (padrão true); limiar: fração visível.
 */
export function useNaTela(alvo: Ref<HTMLElement | null | undefined>, opcoes: { once?: boolean, limiar?: number } = {}) {
  const { once = true, limiar = 0.25 } = opcoes
  const naTela = ref(false)
  let observador: IntersectionObserver | null = null

  function desconectar() {
    observador?.disconnect()
    observador = null
  }

  watch(alvo, (elemento) => {
    desconectar()
    if (!elemento || typeof IntersectionObserver === 'undefined') return
    observador = new IntersectionObserver((entradas) => {
      const visivel = entradas.some(e => e.isIntersecting)
      if (visivel) {
        naTela.value = true
        if (once) desconectar()
      } else if (!once) {
        naTela.value = false
      }
    }, { threshold: limiar })
    observador.observe(elemento)
  }, { immediate: true, flush: 'post' })

  onBeforeUnmount(desconectar)

  return naTela
}
