// app/app.config.ts — Configuração de runtime do Nuxt UI para o site do Pedro Moura.
// Mapeia as cores semânticas para a paleta do laudo definida em main.css:
// primary = lima de sinal, neutral = grafite esverdeado.

export default defineAppConfig({
  ui: {
    colors: {
      primary: 'lima',
      neutral: 'grafite'
    }
  }
})
