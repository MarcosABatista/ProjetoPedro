// app/utils/urlPublica.ts — Resolve caminhos de assets em public/ considerando o baseURL do app.
// Necessário no deploy em subdiretório (GitHub Pages em /ProjetoPedro/): um src "/img/x.jpg"
// precisa virar "/ProjetoPedro/img/x.jpg". Em dev (baseURL "/") o caminho fica inalterado.

/**
 * Prefixa um caminho de asset público com o baseURL do runtime.
 * @param caminho Caminho a partir de public/, iniciando com "/" (ex.: "/img/pedro2.jpg").
 */
export function urlPublica(caminho: string): string {
  const { app: { baseURL } } = useRuntimeConfig()
  const base = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL
  return `${base}${caminho}`
}
