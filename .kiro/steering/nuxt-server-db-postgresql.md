---
inclusion: fileMatch
fileMatchPattern: ["server/**/*.ts"]
name: nuxt-server-db-postgresql
description: PostgreSQL no server Nitro do Nuxt v4 — leitura de metadados estruturais via catálogos pg_* (pg_class, pg_proc, pg_trigger), paginação keyset por OID e decomposição robusta de parâmetros de função. Use ao consultar o catálogo do PostgreSQL em endpoints/utils server. Ver nuxt-server-overview.md para o server genérico e db-read-only.md para a política read-only.
---

# Nuxt v4 — Server + PostgreSQL

Lições específicas de PostgreSQL ao ler o **catálogo do sistema** (`pg_*`) a partir do server Nitro (`server/api/**`, `server/utils/**`). Conexão do agente é **read-only** (ver [db-read-only](db-read-only.md)). Para o server genérico (endpoints, middleware, SSE, routeRules), ver [nuxt-server-overview](nuxt-server-overview.md).

> **Escopo de motor.** Este steering cobre **apenas PostgreSQL** (catálogos `pg_*`). A introspeção de esquema é específica de cada motor. Para outros bancos, usar o steering dedicado correspondente quando existir: `nuxt-server-db-mssql` (SQL Server — `sys.*`/`INFORMATION_SCHEMA`), `nuxt-server-db-mariadb` (MariaDB/MySQL — `INFORMATION_SCHEMA`), `nuxt-server-db-firebirdsql` (Firebird — `RDB$*`), `nuxt-server-db-oracle` (Oracle — `ALL_*`/`DBA_*`). As lições abaixo NÃO se transferem literalmente: os nomes de catálogo, o conceito de OID e as funções (`format_type`, `pg_get_function_result`) são exclusivos do PostgreSQL. O que se transfere é o **princípio**: paginar por chave única por objeto/catálogo, e decompor metadados a partir de colunas estruturadas do catálogo em vez de parsear strings pré-formatadas.

## 1. Keyset por OID sobre `UNION ALL` de catálogos distintos duplica linhas

Paginar `WHERE oid > $cursor ORDER BY oid LIMIT n` sobre um `UNION ALL` de catálogos diferentes (`pg_class` + `pg_proc` + `pg_trigger`, etc.) produz **duplicatas**. OID é único **dentro** de um catálogo, não **entre** catálogos. O cursor avança pelo maior OID do lote combinado e relê linhas de outra fonte cujo OID cai na mesma faixa. Sintoma real: views apareceram 3x no output.

Regra: paginar **cada catálogo separadamente**, cada um com seu próprio keyset por OID (único dentro do catálogo) — um `AsyncGenerator` por catálogo. Não usar `UNION ALL` + keyset global. E não "consertar" com um `Set` global de deduplicação: mascara o bug, segura todo o dataset em memória (viola custo-zero server) e ainda paga o custo de reler no banco. Paginação por catálogo é mais correta e mais barata.

## 2. Decompor parâmetros de função do PostgreSQL de forma robusta — não parsear `pg_get_function_arguments`

Ao documentar funções/procedures (metadados **estruturais** — NUNCA o corpo: `prosrc`/`pg_get_functiondef`), a assinatura de retorno vem de `pg_get_function_result(oid)`. Para os **parâmetros decompostos** (nome/modo/tipo), NÃO parsear a string de `pg_get_function_arguments`: é frágil (vírgulas dentro de tipos, defaults, modos embutidos). Buscar as arrays cruas do catálogo e zipar por índice em TS:

- `proargnames` — nomes; pode ser `null` → usar posicional `$n`.
- `proargmodes` — modos (char): `i`=IN, `o`=OUT, `b`=INOUT, `v`=VARIADIC, `t`=TABLE; `null` → todos IN.
- tipos resolvidos para texto numa coluna `text[]` **ordenada**, via `LATERAL unnest(COALESCE(p.proallargtypes, p.proargtypes::oid[])) WITH ORDINALITY` + `format_type(oid, NULL)` — assim a aridade cobre OUT/INOUT/TABLE (`proallargtypes`) e cai para `proargtypes` quando não há.

```sql
(
  SELECT array_agg(pg_catalog.format_type(t.oid_tipo, NULL) ORDER BY t.ord)
  FROM unnest(COALESCE(p.proallargtypes, p.proargtypes::oid[]))
    WITH ORDINALITY AS t(oid_tipo, ord)
) AS tipos_args
```

Regra: a aridade dos parâmetros = comprimento do array de tipos (fonte de verdade, cobre OUT/INOUT/TABLE); zipar nomes/modos por índice em TS; nome ausente → `$n`; modo ausente → IN. `format_type`/`pg_get_function_result` são assinatura (metadado permitido), nunca o corpo.

## 3. Mapeamento de metadados por objeto (catálogo `pg_*`)

Quais colunas de catálogo carregam cada metadado estrutural. Conhecimento reutilizável de PostgreSQL — o **layout** de saída (que consome isto) fica em `gerar-dicionario-dados-contrato-saida`. Regra transversal: **metadado sim, corpo/DDL não** (`prosrc`, `pg_get_functiondef`, `pg_get_viewdef`, `pg_get_triggerdef` são proibidos; `pg_get_expr`, `pg_get_constraintdef`, `format_type`, `pg_get_function_result` são assinatura/expressão permitidos).

### Triggers — decodificar `pg_trigger.tgtype` (bitmask)

`tgtype` é um `int2` com bits que definem momento, nível e eventos. Decodificar por máscara de bits (não parsear texto):

- Nível: bit `1` (`TRIGGER_TYPE_ROW`) setado → `FOR EACH ROW` (a cada registro); senão `FOR EACH STATEMENT` (uma vez por comando/lote).
- Momento: bit `2` (`BEFORE`); bit `64` (`INSTEAD OF`); nenhum dos dois → `AFTER`.
- Eventos (podem combinar): bit `4` = INSERT, bit `8` = DELETE, bit `16` = UPDATE, bit `32` = TRUNCATE.

Demais campos: `tgrelid` → tabela (`pg_class`+`pg_namespace`), `tgfoid` → função (`pg_proc`), `pg_get_expr(tgqual, tgrelid)` → condição `WHEN` (expressão, permitido), `tgenabled` (`O`=habilitada, `D`=desabilitada, `R`=replica, `A`=always), `obj_description(oid,'pg_trigger')` → comentário. Filtrar `NOT tgisinternal`. Paginar `pg_trigger` por `oid` (keyset próprio do catálogo).

```sql
SELECT t.oid, n.nspname AS schema, t.tgname AS nome,
  (t.tgtype & 1) <> 0        AS por_linha,          -- FOR EACH ROW vs STATEMENT
  (t.tgtype & 2) <> 0        AS antes,              -- BEFORE
  (t.tgtype & 64) <> 0       AS instead_of,         -- INSTEAD OF
  (t.tgtype & 4) <> 0        AS ev_insert,
  (t.tgtype & 8) <> 0        AS ev_delete,
  (t.tgtype & 16) <> 0       AS ev_update,
  (t.tgtype & 32) <> 0       AS ev_truncate,
  t.tgenabled                AS habilitada,
  pg_get_expr(t.tgqual, t.tgrelid) AS condicao_when,
  obj_description(t.oid, 'pg_trigger') AS comentario
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE NOT t.tgisinternal AND n.nspname = $1 AND t.oid > $2
ORDER BY t.oid ASC LIMIT $3
```

### Types / Enums / Domains — `pg_type.typtype`

Paginar `pg_type` por `oid`, filtrando `typtype IN ('e','c','d')` e excluindo os gerados por tabela/array (`typtype='c'` só quando `typrelid=0` OU o relkind da relação associada não é tabela/índice) e tipos de sistema/extensão (`pg_depend deptype='e'`):

- Enum (`typtype='e'`): valores em `pg_enum` ordenados por `enumsortorder` (`SELECT enumlabel FROM pg_enum WHERE enumtypid=$1 ORDER BY enumsortorder`).
- Composite standalone (`typtype='c'`): campos via `pg_attribute` do `typrelid` (mesmo padrão de colunas de tabela: `attnum>0 AND NOT attisdropped`, `format_type`, `attnotnull`, `col_description`).
- Domain (`typtype='d'`): tipo base `format_type(typbasetype, typtypmod)`, `typnotnull`, `typdefault`, e CHECKs via `pg_constraint contype='c'` com `pg_get_constraintdef(oid)` (metadado de restrição permitido).

### Atributos extras (enriquecimento) — permitidos

- Função (`pg_proc`): `prokind` (f/p/a/w), linguagem via `pg_language.lanname`, `provolatile` (i/s/v → IMMUTABLE/STABLE/VOLATILE), `prosecdef` (security definer/invoker), `proparallel` (s/r/u → SAFE/RESTRICTED/UNSAFE).
- Coluna (`pg_attribute`): `attidentity` (`a`/`d` → GENERATED ALWAYS/BY DEFAULT AS IDENTITY), `attgenerated` (`s` → GENERATED STORED).
- Tabela (`pg_class`): `relkind` (`r` ordinária, `p` particionada), `relpersistence` (`u` UNLOGGED). Índices: `pg_index`+`pg_class` (`indisunique`, `indpred` para parcial, colunas via `pg_attribute`) — sem `pg_get_indexdef` cru se quiser evitar DDL, ou usá-lo apenas como texto de referência do índice (decisão do produto; preferir metadados decompostos).

Todos degradam para `—`/omitido quando o campo não existe na versão do servidor — nunca quebram o cabeçalho fixo das tabelas.

## Referência

- [Server](https://nuxt.com/docs/4.x/getting-started/server) — doc oficial Nuxt v4
- [db-read-only](db-read-only.md) — política de conexão read-only
- [nuxt-server-overview](nuxt-server-overview.md) — server Nitro genérico (endpoints, middleware, SSE, routeRules)
