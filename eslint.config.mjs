// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'
import betterTailwindcss from 'eslint-plugin-better-tailwindcss'
import { getDefaultAttributes } from 'eslint-plugin-better-tailwindcss/api/defaults'

export default withNuxt(
  betterTailwindcss.configs['correctness-error'],
  {
    settings: {
      'better-tailwindcss': {
        entryPoint: 'app/assets/css/main.css',
        attributes: [
          ...getDefaultAttributes(),
          ['^v-bind:ui$', [{ match: 'objectValues' }]]
        ]
      }
    },
    rules: {
      // Classes de <style scoped> do laudo (varredura, marcas, barras) e o escopo de foco em painéis escuros
      'better-tailwindcss/no-unknown-classes': ['error', {
        ignore: ['^no-escuro$', '^varredura-(mascara|barra)$', '^anel$', '^fatia(--cheia)?$', '^entrada$', '^destaque$', '^controle$', '^marca(--desenhada)?$']
      }]
    }
  }
)
