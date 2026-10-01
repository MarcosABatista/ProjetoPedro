---
inclusion: auto
name: fundo-animado-canvas
description: Padrão para fundos animados interativos em canvas 2D que reagem ao mouse (assinatura visual da landing) — client-only, cores do design system, custo zero de servidor, acessível. Ativar ao criar ou ajustar fundos/animações decorativas de tela.
---

# Fundo Animado Interativo (Canvas 2D)

Padrão reutilizável para a assinatura visual das telas de marketing/hero: um fundo em `<canvas>` que reage ao mouse e cuja metáfora reforça o domínio do produto (dicionário de dados → grafo de esquema relacional: tabelas + FKs).

Implementação de referência: `app/components/FundoEsquema.client.vue`, plugado no hero de `app/pages/index.vue`.

## Regras não-negociáveis

1. **Client-only** — nome `*.client.vue`. Canvas/`requestAnimationFrame`/`window` não existem no SSR; sufixo `.client` garante que só monta no browser e **não altera o HTML prerenderizado** (a landing é prerender — ver [deploy-bun-producao](deploy-bun-producao.md)).
2. **Custo zero de servidor** — só `requestAnimationFrame`, nenhum fetch/polling/timer batendo no backend (ver [custo-zero-client](custo-zero-client.md)).
3. **Cores do design system** — ler `--ui-primary`/`--ui-border` via `getComputedStyle(document.documentElement)`. Nunca hex hardcoded. Assim acompanha tema e light/dark automaticamente.
4. **Acessível e não-intrusivo** — `aria-hidden="true"`, `pointer-events: none`, posicionado atrás do conteúdo (`absolute inset-0` dentro da section, ou `fixed` global). Respeitar `prefers-reduced-motion: reduce` (desenhar quadro estático, sem loop).
5. **Decorativo, nunca funcional** — não carregar informação essencial ali; é ambientação.
6. **Semântica de domínio, não animação genérica.** A animação deve representar visualmente algo central do produto — não ser partículas/ruído aleatório sem significado. A metáfora conecta o movimento ao que o produto faz. Exemplos no projeto:
   - Dicionário de dados → grafo de esquema relacional (nós = tabelas, arestas = FKs).
   - Encurtador de URL → traços horizontais LONGOS (URLs) que o cursor CONTRAI em PONTOS compactos (links curtos): a metáfora "longo vira curto" é o próprio ato de encurtar. O encurtamento é dirigido pelo mouse (só contrai no raio do cursor), nunca automático por tempo.

   Ao criar um novo fundo animado, primeiro defina a metáfora de domínio; só então implemente. Decorativo (item 5) e com semântica de domínio (item 6) não se opõem: o fundo é ambientação, mas ambientação que fala do produto.

## Armadilha CRÍTICA — o template ref é `null` no `onMounted` de um `.client.vue`

Sintoma: no **fresh load** (reload completo, dev ou produção) o canvas fica travado no default **300×150** e a animação não aparece; após um HMR (salvar o arquivo) passa a funcionar. Fácil confundir com bug de HMR/cache — **não é**. Reproduz igual no build de produção.

Causa raiz: um componente `.client.vue` fica dentro de conteúdo renderizado no servidor. No fresh load, o Vue monta o wrapper client-only com um placeholder e o `<canvas>` real só entra no DOM **depois** do mount inicial. Logo, `useTemplateRef('canvasRef').value` é **`null`** dentro de `onMounted` → qualquer setup baseado em `onMounted` (`getContext`, instalar `ResizeObserver`, iniciar loop) é abortado e nunca reexecuta. Após HMR "funciona" porque a remontagem ocorre com o DOM já completo — daí a pegadinha.

**Solução obrigatória: inicializar a partir do template ref, não do `onMounted`.** Um `watch(canvasRef, ..., { immediate: true, flush: 'post' })` dispara tanto no caso pós-HMR (ref já existe) quanto no fresh load (ref resolve depois). `flush: 'post'` garante DOM/layout aplicados.

```ts
import { onBeforeUnmount, useTemplateRef, watch } from 'vue'

const canvasRef = useTemplateRef<HTMLCanvasElement>('canvasRef')
let ctx: CanvasRenderingContext2D | null = null
let observador: ResizeObserver | null = null
let loopIniciado = false

function redimensionar() {
  const canvas = canvasRef.value
  if (!canvas || !ctx) return
  const w = canvas.clientWidth
  const h = canvas.clientHeight
  if (w === 0 || h === 0) return                  // ignora medição pré-layout
  if (w === larguraCss && h === alturaCss) return  // sem mudança real
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  larguraCss = w; alturaCss = h
  canvas.width = Math.round(w * dpr)
  canvas.height = Math.round(h * dpr)
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  criarNos()
}

// Retry por frame até o canvas ter dimensão válida (imune a qualquer ordem de layout).
function tentarIniciar() {
  if (loopIniciado) return
  redimensionar()
  if (larguraCss > 0) { loopIniciado = true; iniciarLoop() }
  else requestAnimationFrame(tentarIniciar)
}

function inicializar(canvas: HTMLCanvasElement) {
  ctx = canvas.getContext('2d')
  if (!ctx) return
  tentarIniciar()
  observador = new ResizeObserver(() => {
    redimensionar()
    if (!loopIniciado && larguraCss > 0) { loopIniciado = true; iniciarLoop() }
  })
  observador.observe(canvas)
  // ...listeners de pointermove/pointerleave/visibilitychange...
}

// Inicializa quando o <canvas> aparece no DOM — NÃO em onMounted (ref pode ser null lá).
watch(canvasRef, (canvas) => {
  if (canvas && !ctx) inicializar(canvas)
}, { immediate: true, flush: 'post' })
```

Ainda assim, o `ResizeObserver` continua sendo a forma correta de acompanhar mudanças de tamanho **depois** de inicializado (resize da janela, altura do hero). O que muda é o **gatilho de inicialização**: template ref via `watch`, nunca `onMounted`.

Sempre limpar no `onBeforeUnmount`: `cancelAnimationFrame(frameId)` + `observador?.disconnect()` + remover listeners de `pointermove`/`pointerleave`/`visibilitychange`.

## Reação ao mouse

- Escutar `pointermove` em `window` (não no canvas — ele tem `pointer-events: none`), converter para coordenadas locais via `getBoundingClientRect()`.
- Manter posição do cursor num objeto simples (não precisa ser reativo). Iniciar fora da tela (`-9999`) p/ nada destacar no load.
- Campo do mouse: elementos dentro de um raio acendem em `primary` e/ou são levemente atraídos; fora do raio ficam sutis (borda neutra, baixa opacidade). Usar `ctx.globalAlpha` para intensidade em vez de parsear/interpolar cor.

## Interpolação de cor entre tokens

O `globalAlpha` acima resolve o caso simples: variar a **intensidade de UMA cor** (aceso/apagado). É o mais barato e continua sendo a recomendação padrão.

Quando a metáfora exige **transição ENTRE dois tokens** (ex.: traço longo em `--ui-border` que ao encurtar vira ponto em `--ui-primary`, conforme o estado do elemento), aí é preciso interpolar de fato em RGB. Porém os tokens do Nuxt UI (`--ui-primary`, `--ui-border`) podem estar em espaços de cor modernos (oklch, etc.) que **não** dá para interpolar componente a componente diretamente.

Técnica robusta: resolver a cor CSS arbitrária para RGB usando o próprio canvas — atribuir a string ao `ctx.fillStyle` e ler de volta o valor normalizado (o navegador converte para `rgb(...)`/hex), então extrair os componentes. Fazer isso **uma vez** na inicialização (nunca por quadro).

```ts
// Resolve qualquer cor CSS (hex, rgb(), oklch(), var(...)) para [r,g,b] via canvas.
function converterParaRgb(cor: string, ctx: CanvasRenderingContext2D): [number, number, number] | null {
  if (!cor) return null
  const anterior = ctx.fillStyle
  ctx.fillStyle = '#000'
  ctx.fillStyle = cor            // navegador normaliza
  const resolvida = ctx.fillStyle
  ctx.fillStyle = anterior
  if (typeof resolvida !== 'string') return null
  if (resolvida.startsWith('#')) {
    const h = resolvida.slice(1)
    const n = h.length === 3 ? h.split('').map(c => c + c).join('') : h
    const v = Number.parseInt(n, 16)
    return [(v >> 16) & 255, (v >> 8) & 255, v & 255]
  }
  const m = resolvida.match(/(\d+(?:\.\d+)?)/g)
  return m && m.length >= 3 ? [Number(m[0]), Number(m[1]), Number(m[2])] : null
}
```

Com os dois tokens já em RGB, interpolar linearmente por uma fração `f` (0 = `border`, 1 = `primary`) e montar a string no `strokeStyle`/`fillStyle`:

```ts
function interpolar(a: [number, number, number], b: [number, number, number], f: number) {
  const r = Math.round(a[0] + (b[0] - a[0]) * f)
  const g = Math.round(a[1] + (b[1] - a[1]) * f)
  const bl = Math.round(a[2] + (b[2] - a[2]) * f)
  return `rgb(${r}, ${g}, ${bl})`
}
```

Reafirmando a regra 3: ler os tokens (`getComputedStyle`) e convertê-los para RGB só na init/`lerCores` (e ao trocar de tema), **nunca a cada frame**.

## Performance

- Pausar o loop quando a aba não está visível (`document.hidden` via `visibilitychange`) — não gastar CPU em background.
- Limitar `devicePixelRatio` a 2 (telas 3x+ dobram custo de fill sem ganho visível num fundo).
- Escalar a densidade de elementos pela área do viewport, com teto (ex.: máx ~48 nós) — evita explosão de custo O(n²) nas arestas em telas grandes.
- `pointermove` com `{ passive: true }`.

## Como validar (evita "funciona só depois de salvar")

O teste que importa é o **fresh load**, não o estado pós-HMR — HMR mascara o bug do template ref. Ao depurar via Chrome DevTools MCP:

1. `navigate_page` com `ignoreCache: true` para `/` (reload de verdade, não confiar no HMR).
2. Conferir `canvas.width`/`height` reais: devem casar com `clientWidth/clientHeight` (ex.: 1003×580), **não** 300×150.
3. Se der 300×150 no fresh load mas funcionar após salvar o arquivo → é a race do template ref (ver acima), não HMR.
4. Confirmar no **build de produção** (`bun run .output/server/index.mjs`), não só no dev.

## Checklist

1. Componente é `*.client.vue`.
2. Inicialização via `watch(canvasRef, …, { immediate: true, flush: 'post' })` — **nunca** `onMounted` (ref é null lá no fresh load).
3. `ResizeObserver` acompanha mudanças de tamanho após inicializado (não como gatilho de init).
4. Cores lidas de `--ui-primary`/`--ui-border`; se houver transição entre tokens, RGB resolvido via canvas só na init (nunca por frame).
5. Metáfora de domínio definida antes de implementar — a animação representa algo central do produto, não ruído genérico.
6. `aria-hidden`, `pointer-events: none`, atrás do conteúdo.
7. `prefers-reduced-motion` desliga a animação (quadro estático).
8. Pausa com aba oculta; cleanup completo no unmount.
9. Validado em **fresh load** (dev com ignoreCache + build de produção), não só pós-HMR.
10. Build passa e prerender da landing continua intacto.
