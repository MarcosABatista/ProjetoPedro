---
inclusion: fileMatch
fileMatchPattern: ['app/plugins/**', 'app/composables/**', 'app/components/**', 'app/pages/**']
description: Escalabilidade client-side — evitar custos ocultos para centenas de usuários simultâneos. Ativar ao implementar frontend.
---

# Alternativa Zero-Custo — Diretriz de Escalabilidade

## Contexto

Este sistema espera **centenas de usuários ativos simultaneamente** em produção. Qualquer implementação que pareça inofensiva com 1 usuário pode se tornar um problema grave quando multiplicada por centenas.

## Regra

Sempre que possível, dê preferência à **abordagem "alternativa zero-custo"** — soluções que não geram carga contínua no servidor por parte dos clientes.

## O que é proibido

- **Polling periódico** — `setInterval` + `$fetch` para endpoints do servidor (ex: verificar status a cada N segundos)
- **WebSockets mantidos abertos** sem necessidade real de comunicação bidirecional em tempo real
- **Server-Sent Events (SSE) permanentes** para dados que não mudam frequentemente ou para manter estado de sincronização
- **Heartbeat requests** — pings periódicos para manter sessão viva

## O que é permitido e preferido

- **BroadcastChannel API** — comunicação entre abas do mesmo domínio, zero custo no servidor
- **Storage events (`localStorage`)** — fallback para sincronização entre abas, zero custo no servidor
- **`visibilitychange`** — verificar estado apenas quando o usuário volta para a aba (1 request pontual, não contínuo)
- **Service Workers** — interceptar e cachear no cliente
- **Cache HTTP** — `Cache-Control`, `ETag`, `304 Not Modified`
- **Stale-While-Revalidate** — servir cache e revalidar em background
- **SSE para operações finitas** — conexão aberta apenas durante uma operação em andamento (exportação, cópia, download), fechada automaticamente ao final. Zero custo entre operações. Ver `docs/tecnico/07-sse-progresso-tempo-real.md`.

## Regra de ouro

> Se a implementação gera N requests por minuto **por usuário**, multiplique por 500.
> Se o resultado é inaceitável, a implementação está errada.

### Exemplo

- Polling a cada 5s = 12 req/min/usuário × 500 usuários = **6.000 req/min** → ❌ Inaceitável
- Verificação no `visibilitychange` = ~1 req quando volta para aba × 500 = **~500 req esporádicos** → ✅ Aceitável

## Quando polling é inevitável

Se não houver alternativa zero-custo possível:

1. Use intervalo **mínimo de 60 segundos**
2. Implemente **exponential backoff** em caso de erro
3. **Pause** quando a aba não está visível (`document.hidden`)
4. Documente explicitamente por que não há alternativa
5. Considere **long-polling** ou **SSE com reconexão** em vez de polling burro

## Aplicação

Esta diretriz se aplica a:

- Plugins client-side (`app/plugins/`)
- Composables (`app/composables/`)
- Componentes que fazem fetch periódico
- Qualquer código que rode em loop no cliente e bata no servidor
