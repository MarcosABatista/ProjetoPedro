---
inclusion: fileMatch
fileMatchPattern: "{server/**,app/composables/**,app/plugins/**}"
description: Proteção CSRF stateless HMAC via SSR payload. Ativar ao criar endpoints de escrita (POST/PUT/PATCH/DELETE).
---

# CSRF — Stateless HMAC via SSR Payload (OBRIGATÓRIO)

Sempre que possível, todo endpoint POST/PUT/PATCH/DELETE deve ter proteção CSRF via **Stateless HMAC** (token + assinatura). Sem estado/sessão no backend — altamente escalável.

## Arquitetura — token via SSR payload (zero requests extras)

Token gerado durante o SSR e transferido ao cliente via `useState` payload. Frontend já possui o token no load — sem endpoint dedicado.

**Fluxo:**
1. **SSR:** middleware `server/middleware/csrf-token.ts` gera HMAC-SHA256 e injeta em `event.context.csrfToken`
2. **Composable:** `useTokenCsrf()` lê do `event.context` no servidor e popula `useState('csrf-token')`
3. **Payload:** Nuxt transfere o `useState` ao cliente automaticamente
4. **Submissão:** frontend inclui `token.value` no body como `_token`
5. **Validação:** backend valida assinatura + TTL com `validarToken()` (`timingSafeEqual`)
6. **Renovação:** aba inativa >10min → plugin `csrf-renovacao.client.ts` detecta via `visibilitychange` e faz `reloadNuxtApp()` (novo SSR traz token fresco)

## Implementação de referência

```ts
// server/utils/token-hmac.ts
import { createHmac, timingSafeEqual } from 'node:crypto'

const TTL_MS = 10 * 60 * 1000 // 10 minutos

export function gerarToken(chave: string): string {
  const timestamp = Date.now().toString()
  const hmac = createHmac('sha256', chave).update(timestamp).digest('hex')
  return `${timestamp}.${hmac}`
}

export function validarToken(token: string, chave: string): boolean {
  const partes = token.split('.')
  if (partes.length !== 2) return false
  const [timestamp, hmac] = partes
  if (!timestamp || !hmac) return false
  const idade = Date.now() - Number(timestamp)
  if (Number.isNaN(idade) || idade > TTL_MS || idade < 0) return false
  const esperado = createHmac('sha256', chave).update(timestamp).digest('hex')
  if (esperado.length !== hmac.length) return false
  return timingSafeEqual(Buffer.from(esperado, 'hex'), Buffer.from(hmac, 'hex'))
}
```

```ts
// server/middleware/csrf-token.ts — gera e injeta no event.context
export default defineEventHandler((event) => {
  const path = event.path
  if (path.startsWith('/api/') || path.startsWith('/_nuxt/')) return
  const { encryptionKey } = useRuntimeConfig(event)
  event.context.csrfToken = gerarToken(encryptionKey)
})
```

```ts
// app/composables/useTokenCsrf.ts — lê do event.context no SSR
export function useTokenCsrf() {
  const token = useState<string>('csrf-token', () => '')
  if (import.meta.server) {
    const evento = useRequestEvent()
    if (evento?.context.csrfToken) token.value = evento.context.csrfToken as string
  }
  return { token: readonly(token) }
}
```

## Uso no frontend

```ts
const { token } = useTokenCsrf()
await $fetch('/api/endpoint', {
  method: 'POST',
  body: { _token: token.value, ...dados },
})
```

## Validação no endpoint

```ts
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const resultado = schema.safeParse(body)
  if (!resultado.success) throw createError({ statusCode: 400, statusMessage: 'Dados inválidos' })

  const { encryptionKey } = useRuntimeConfig(event)
  if (!validarToken(resultado.data._token, encryptionKey)) {
    throw createError({ statusCode: 403, statusMessage: 'Acesso negado' })
  }
  // ... lógica
})
```

## Regras obrigatórias

- Chave secreta **exclusivamente** de `useRuntimeConfig()` (`NUXT_ENCRYPTION_KEY`) — nunca hardcoded
- **Estritamente** `timingSafeEqual` do `node:crypto` na comparação — nunca `===`
- **TTL** (padrão 10min) — rejeitar tokens expirados
- Token entregue via SSR payload (middleware + `useTokenCsrf`) — **não existe endpoint dedicado**
- Schemas Zod incluem `_token: z.string().min(1).max(200)` obrigatório
- Renovação automática via `visibilitychange` + `reloadNuxtApp()`

## Quando aplicar

| Cenário | CSRF? |
|---|---|
| POST que altera estado (write) | ✅ Sim |
| POST read-only (consulta) | ✅ Sim (protege abuso automatizado) |
| GET dados públicos | ❌ Não |
| GET dados sensíveis | Considerar auth/rate limit |
| SSE que recebe body | ✅ Sim |

## O que NÃO fazer

```ts
if (hmacRecebido === hmacEsperado) { }              // ❌ timing attack
createHmac('sha256', chave).update(randomUUID())    // ❌ token sem expiração (replay)
const token = await $fetch('/api/token-formulario') // ❌ endpoint dedicado (request extra)
// ❌ nunca armazenar token no localStorage — usar useState (memória reativa)
```
