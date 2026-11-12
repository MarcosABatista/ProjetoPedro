// app/composables/useMola.ts — Valor numérico que persegue um alvo com massa e amortecimento (mola).
// Usado nas leituras do laudo (bpm, idade): o número desliza e assenta, nunca salta.
// Com movimento reduzido ou fora do browser, devolve o alvo direto.

import type { Ref } from 'vue'

const RIGIDEZ = 170
const AMORTECIMENTO = 22
const REPOUSO = 0.01

/** @param alvo Ref com o valor de destino; o retorno acompanha com física de mola. */
export function useMola(alvo: Ref<number>) {
  const atual = ref(alvo.value)
  let velocidade = 0
  let quadro = 0
  let anterior = 0

  function passo(agora: number) {
    const dt = Math.min((agora - anterior) / 1000, 1 / 30)
    anterior = agora
    const forca = RIGIDEZ * (alvo.value - atual.value) - AMORTECIMENTO * velocidade
    velocidade += forca * dt
    atual.value += velocidade * dt
    if (Math.abs(alvo.value - atual.value) < REPOUSO && Math.abs(velocidade) < REPOUSO) {
      atual.value = alvo.value
      velocidade = 0
      quadro = 0
      return
    }
    quadro = requestAnimationFrame(passo)
  }

  watch(alvo, () => {
    if (typeof window === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      atual.value = alvo.value
      return
    }
    if (!quadro) {
      anterior = performance.now()
      quadro = requestAnimationFrame(passo)
    }
  })

  onBeforeUnmount(() => cancelAnimationFrame(quadro))

  return atual
}
