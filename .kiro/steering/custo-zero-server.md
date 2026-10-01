---
inclusion: fileMatch
fileMatchPattern: ['server/**']
description: Escalabilidade server-side — evitar bloqueio/acúmulo em Node.js single-threaded. Ativar ao desenvolver backend.
---

# Alternativa Zero-Custo — Server-Side

## Contexto

Este sistema roda como processo Node.js single-threaded com centenas de usuários simultâneos. Cada recurso alocado no servidor (memória, conexões, file descriptors, threads do DuckDB) é compartilhado entre todas as requisições. Uma operação que bloqueia ou acumula recursos derruba todos.

## Regra

Toda implementação server-side deve minimizar tempo de posse de recursos compartilhados e evitar acúmulo proporcional ao número de usuários.

## O que é proibido

- **Conexões DuckDB/PostgreSQL mantidas abertas indefinidamente** — ATTACH no início do request, DETACH no final (ou no `finally`)
- **Acumular dados em arrays JavaScript** para processar depois — usar streaming nativo do DuckDB (`COPY TO`, `INSERT INTO ... SELECT`)
- **`setTimeout`/`setInterval` no servidor** para agendar trabalhos — se precisa de job recorrente, usar cron externo ou Nitro scheduled tasks
- **Manter estado em memória entre requests** (caches manuais que crescem sem limite) — usar `useStorage()` com TTL ou cache HTTP
- **Operações síncronas bloqueantes** (`fs.readFileSync`, `crypto.pbkdf2Sync`, loops CPU-bound longos) — bloqueiam o event loop para todos os usuários
- **Criar processos filhos (`child_process`)** por request — fork é caro e o DuckDB já paraleliza internamente

## O que é correto

### Conexões — abrir tarde, fechar cedo

```typescript
// ✅ CORRETO — ATTACH apenas quando precisa, DETACH no finally
try {
  await conectarPostgres({ ...config, alias: 'pg_origem', readOnly: true })
  // ... operação
}
finally {
  await desconectarPostgres('pg_origem')
}
```

```typescript
// ❌ ERRADO — ATTACH na inicialização do módulo, nunca fecha
const db = await obterDuckDB()
await conectarPostgres({ ...config, alias: 'pg_global' }) // vaza conexão para sempre
```

### Streaming SSE — fechar ao terminar

Conexões SSE são aceitáveis apenas durante operações finitas. O stream deve fechar (`controller.close()`) ao concluir — sucesso ou erro.

```typescript
// ✅ CORRETO — stream fecha em todos os caminhos
const stream = new ReadableStream({
  async start(controller) {
    try {
      // ... emitir progresso
      controller.enqueue(`data: ${JSON.stringify({ progress: 100 })}\n\n`)
    }
    catch (erro) {
      controller.enqueue(`data: ${JSON.stringify({ status: 'error' })}\n\n`)
    }
    finally {
      controller.close()
    }
  }
})
```

```typescript
// ❌ ERRADO — stream que nunca fecha se houver exceção
const stream = new ReadableStream({
  async start(controller) {
    await operacao() // se lançar, controller fica aberto → leak
    controller.close()
  }
})
```

### Memória — nunca materializar datasets grandes

```typescript
// ❌ ERRADO — 10M de linhas em memória JavaScript
const dados = await executarQuery('SELECT * FROM tabela_enorme')
for (const linha of dados) { /* ... */ }

// ✅ CORRETO — DuckDB processa internamente via SQL, sem materialização JS
await executarComando(`COPY (SELECT * FROM tabela) TO '/tmp/saida.csv' (FORMAT CSV, HEADER)`)
```

### Event loop — nunca bloquear

```typescript
// ❌ ERRADO — operação síncrona pesada
import { readFileSync } from 'node:fs'
const conteudo = readFileSync('/exports/arquivo-grande.csv', 'utf-8')

// ✅ CORRETO — operação assíncrona
import { readFile } from 'node:fs/promises'
const conteudo = await readFile('/exports/arquivo-grande.csv', 'utf-8')
```

```typescript
// ❌ ERRADO — hash síncrono que bloqueia com inputs grandes
import { pbkdf2Sync } from 'node:crypto'
const hash = pbkdf2Sync(senha, salt, 100000, 64, 'sha512')

// ✅ CORRETO — versão assíncrona
import { pbkdf2 } from 'node:crypto'
import { promisify } from 'node:util'
const pbkdf2Async = promisify(pbkdf2)
const hash = await pbkdf2Async(senha, salt, 100000, 64, 'sha512')
```

### Cache — com limite e TTL

```typescript
// ❌ ERRADO — cache manual que cresce indefinidamente
const cache = new Map<string, any>() // nunca limpa → OOM eventual

// ✅ CORRETO — useStorage com TTL (Nitro key-value)
const storage = useStorage('cache')
await storage.setItem('chave', valor, { ttl: 300 }) // 5 min
```

### Arquivos temporários — limpar após uso

```typescript
// ✅ CORRETO — cleanup no finally
import { unlink } from 'node:fs/promises'

const caminhoTemp = '/tmp/export-123.csv'
try {
  await exportar(caminhoTemp)
  // ... enviar arquivo ao cliente
}
finally {
  await unlink(caminhoTemp).catch(() => {}) // best-effort cleanup
}
```

## Regra de ouro

> Se a implementação aloca um recurso (conexão, memória, file descriptor) **por request**, multiplique por 500 requests simultâneos.
> Se o resultado é OOM, connection pool exaurido, ou too many open files — a implementação está errada.

### Exemplos

- 1 conexão PostgreSQL por request × 500 = **500 conexões** → ❌ Excede `max_connections` padrão (100)
- ATTACH/DETACH por operação × 500 = **500 attach/detach sequenciais** (DuckDB é single-writer) → ✅ Aceitável com pool interno
- Array de 100MB por request × 500 = **50 GB RAM** → ❌ OOM
- Stream DuckDB → CSV em disco × 500 = **500 streams com spill-to-disk** → ✅ Configurado via `memory_limit` + `temp_directory`

## Resumo de recursos e ciclo de vida

| Recurso | Alocação | Liberação | Padrão |
|---|---|---|---|
| Conexão DuckDB→PostgreSQL | `conectarPostgres()` | `desconectarPostgres()` no `finally` | Por operação |
| Stream SSE | `new ReadableStream()` | `controller.close()` no `finally` | Por operação |
| Arquivo temporário | `COPY TO` | `unlink()` no `finally` ou após envio | Por operação |
| Instância DuckDB | Singleton (`obterDuckDB()`) | Nunca (vive no processo) | Por processo |
| Cache em memória | `useStorage()` | TTL automático | Com expiração |

## Relação com outros steerings

- **`duckdb-performance.md`** — cobre otimização de queries e streaming SQL. Este steering cobre gerenciamento de recursos Node.js (conexões, memória, event loop).
- **`custo-zero.md`** — cobre o lado client-side (não gerar requests desnecessários). Este steering cobre o lado server-side (não desperdiçar recursos ao receber requests).
