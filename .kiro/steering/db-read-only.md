---
inclusion: always
description: "Força read-only nas conexões que o AGENTE abre no chat (psql/sqlite3/driver): proíbe o agente EXECUTAR INSERT/UPDATE/DELETE/DDL. NÃO restringe escrever código de aplicação que faz escrita em runtime."
---

# Banco de Dados — Modo Read-Only Obrigatório

## Escopo desta regra — LEIA PRIMEIRO

Esta regra vale **exclusivamente** para o banco quando **o próprio code agent (a IA) abre uma conexão e roda SQL durante a sessão** — inspeção via `psql`/`sqlite3`, drivers ou qualquer tool no chat do agente. É a conexão **interativa do agente** que precisa ser read-only.

Esta regra **NÃO** se aplica ao **código-fonte da aplicação**. Um endpoint Nitro, um `server/utils/`, uma migração ou qualquer código de feature **PODE e DEVE** conter `INSERT`/`UPDATE`/`DELETE`/DDL normalmente quando a funcionalidade exige — isso é a aplicação escrevendo no banco em runtime, executada pelo servidor, não pelo agente. **Escrever esse código é permitido, esperado e não requer aprovação especial.**

Em uma frase: **o agente não roda SQL de escrita no chat; o agente escreve, sem restrição, o código da aplicação que roda SQL de escrita em produção.**

| Situação | Read-only obrigatório? |
|---|---|
| Agente roda `psql`/`sqlite3`/driver no chat para inspecionar | ✅ Sim — só `SELECT` |
| Agente **escreve código** de endpoint/util que faz `INSERT` em runtime | ❌ Não — código de escrita é permitido e normal |
| Agente executa uma migração/seed **ele mesmo** contra o banco | ✅ Sim — apresentar ao usuário, não executar |

> ⚠️ **Não confundir as duas coisas.** Implementar a persistência de uma feature (ex.: o `INSERT` de criação de link no `server/api/`) é trabalho de código-fonte normal — escrever o SQL/driver call no arquivo é permitido. O que é proibido é o **agente** abrir uma conexão no chat e **executar** um comando de escrita ele mesmo.

## Regra absoluta

**TODA** conexão que **o code agent abrir e operar durante a sessão** (chat/tooling) DEVE ser em modo **READ-ONLY**. Sem exceção. Isso **não** governa o SQL que o código da aplicação executa em runtime.

Isso significa:
- Queries `SELECT` rodadas pelo agente — permitidas livremente.
- Queries de escrita (`INSERT`, `UPDATE`, `DELETE`, `DROP`, `TRUNCATE`, `ALTER`, `CREATE`) **executadas pelo próprio agente numa conexão do chat** — **PERMANENTEMENTE PROIBIDAS**. (Não confundir com escrever código que executa essas queries em runtime — isso é permitido; ver "Escopo desta regra".)

## Proibições explícitas

O code agent está **PERMANENTEMENTE PROIBIDO** de **executar ele mesmo** (numa conexão do chat/tooling) os seguintes comandos no banco de dados:

- `DELETE`
- `UPDATE`
- `INSERT`
- `DROP`
- `TRUNCATE`
- `ALTER`
- `CREATE`

Nenhuma justificativa, contexto ou necessidade técnica autoriza o code agent a **executar** comandos de escrita ou destrutivos no banco durante a sessão. **NUNCA.**

Isto se refere a **executar** o comando. **Escrever código-fonte** que contém esses comandos (endpoint, util, migração, seed) é permitido e faz parte do trabalho normal — ver "Escopo desta regra".

## Se precisar de escrita

Quando a tarefa exigir escrita no banco para ser concluída:

1. **PARAR** a execução.
2. **EXIBIR** para o usuário desenvolvedor:
   - O comando SQL exato que precisa ser executado.
   - Explicação do que o comando faz.
   - Qual tabela/dados serão afetados.
   - Se é reversível ou não.
3. **AGUARDAR** confirmação explícita do usuário para prosseguir (e mesmo assim, o usuário é quem executa o comando manualmente).

O code agent **NUNCA** executa o comando de escrita por conta própria — apenas apresenta e orienta.

> Esta seção trata de o agente **rodar** uma escrita agora (migração, seed, correção pontual de dado). Não trata de **implementar** persistência em código de feature — para isso, basta escrever o `INSERT`/`UPDATE` no arquivo normalmente; ele roda em runtime pelo servidor, não pelo agente.

## Conexão

Ao conectar no banco (via `psql`, driver, ORM, ou qualquer outro meio):

- Usar `default_transaction_read_only = on` quando possível.
- Usar `SET SESSION CHARACTERISTICS AS TRANSACTION READ ONLY;` como primeiro comando da sessão.
- Se o driver/ferramenta suportar flag de read-only, ativá-la.

## psql — FORÇAR conexão somente leitura (OBRIGATÓRIO)

**TODO** uso do `psql` pelo code agent DEVE forçar a sessão como somente leitura. Apenas `SELECT`/leitura é permitido. Sem isso a conexão NÃO é aceitável.

### 1. Variável de ambiente (preferencial e sempre)

Exportar antes de qualquer execução do `psql`:

```bash
export PGOPTIONS="-c default_transaction_read_only=on"
```

Exemplo de uso:

```bash
export PGOPTIONS="-c default_transaction_read_only=on"
PGPASSWORD="***" psql -h "$HOST" -p "$PORT" -U "$USER" -d "$DB" -c "SELECT ..."
```

Essa variável aplica `default_transaction_read_only=on` a **toda sessão psql** e faz o PostgreSQL recusar qualquer comando de escrita (INSERT/UPDATE/DELETE/DROP/TRUNCATE/ALTER/CREATE) com erro.

### 2. Flag nativa do psql

Usar quando a versão/situação permitir:

```bash
psql --set=default_transaction_read_only=on -c "SELECT ..."
```

### 3. SQL de sessão — pré-comando obrigatório

Se as opções acima não forem aplicáveis ou como defesa em profundidade, executar **antes** do SQL que pretende executar:

```sql
SET SESSION CHARACTERISTICS AS TRANSACTION READ ONLY;
SELECT ...;
```

## Erros por conexão somente leitura — COMPORTAMENTO ESPERADO E IDEAL

Se o SQL executado falhar porque a conexão está em modo somente leitura, **isso é esperado e ideal** — significa que a proteção está funcionando.

- **NUNCA** desarmar a conexão read-only para "resolver" o erro.
- **NUNCA** contornar o erro reonectando sem `PGOPTIONS`/read-only ou com outro driver gravável.
- Quando ocorrer erro porque o SQL a ser executado **não é somente leitura** (tentativa de INSERT/UPDATE/DELETE/DROP/TRUNCATE/ALTER/CREATE): **PARAR** — não tentar resolver ou executar a query de outro jeito.
- **EXPLICAR** ao usuário o que aconteceu (query de escrita bloqueada pela conexão read-only) e **solicitar que o usuário execute a consulta manualmente**, conforme a seção [Se precisar de escrita](#se-precisar-de-escrita).

## Resumo

Coluna "Permitida?" = **o agente executar o comando ele mesmo numa conexão do chat**. Escrever código de aplicação que executa essas operações em runtime é sempre permitido (ver "Escopo desta regra").

| Operação executada pelo agente no chat | Permitida? |
|----------|-----------|
| SELECT / leitura | Sim |
| INSERT | Não — exibir para usuário executar |
| UPDATE | Não — exibir para usuário executar |
| DELETE | Não — exibir para usuário executar |
| DROP | Não — exibir para usuário executar |
| TRUNCATE | Não — exibir para usuário executar |
| ALTER | Não — exibir para usuário executar |
| CREATE | Não — exibir para usuário executar |

| Escrever no código-fonte | Permitida? |
|----------|-----------|
| Endpoint/util com `INSERT`/`UPDATE`/`DELETE`/DDL (runtime) | Sim — trabalho normal, sem aprovação especial |

## Checklist obrigatório — antes de QUALQUER psql

1. `export PGOPTIONS="-c default_transaction_read_only=on"` **sempre** exportado na sessão.
2. Nunca executar INSERT/UPDATE/DELETE/DROP/TRUNCATE/ALTER/CREATE — erro de read-only é a proteção funcionando (esperado e ideal).
3. Ícone mental: **toda** sessão psql é somente leitura, sem exceções.
