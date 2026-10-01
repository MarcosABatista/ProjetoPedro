---
inclusion: fileMatch
fileMatchPattern: "server/**/*.ts"
description: Bug Rollup — aspas simples em template literals removidas no build, quebra SQL. Usar quoteSql(). Ativar ao escrever SQL em strings.
---

# Rollup — Armadilha com Aspas em Template Literals

## O problema

O Rollup (bundler do Nitro/Nuxt) **otimiza template literals** que contêm apenas uma interpolação envolvida por aspas simples. O pattern:

```ts
`'${variavel}'`
```

é transformado no bundle compilado em:

```js
String(variavel)
```

As aspas simples literais são **eliminadas silenciosamente** durante o build.

## Impacto

Toda construção de SQL que usa template literal para envolver valores com aspas simples **funciona em dev mode** (onde o source é executado diretamente) mas **falha em produção** (onde o bundle Rollup é usado).

Exemplo real — o DuckDB interpreta o valor como nome de coluna:

```sql
-- ESPERADO (dev):
WHERE id = 'C81E728D9D4C2F636F067F89CC14862C'

-- GERADO NO BUILD (produção):
WHERE id = C81E728D9D4C2F636F067F89CC14862C
-- → "Binder Error: Referenced column ... not found"
```

## Regra obrigatória

**Nunca** usar template literals para envolver valores SQL com aspas simples:

```ts
// ❌ PROIBIDO — Rollup remove as aspas no build
.replaceAll('@idcliente', `'${idCliente}'`)

// ❌ PROIBIDO — mesmo pattern em connection strings
const connStr = `dbname='${dbname}' host='${host}'`

// ✅ CORRETO — usar quoteSql() (server/utils/duckdb.ts)
.replaceAll('@idcliente', quoteSql(idCliente))

// ✅ CORRETO — concatenação explícita para connection strings
const connStr = "dbname='" + dbname + "' host='" + host + "'"
```

## A função `quoteSql`

Disponível via auto-import em todo o servidor (`server/utils/duckdb.ts`). Função **única e centralizada** para todo o sistema — substitui tanto o antigo `quoteSql` (escape básico) quanto o helper local `escaparSql()` + `q()` do copiador.

```ts
export function quoteSql(valor: string): string {
  const escapado = valor
    .replace(/\0/g, '')        // remove null bytes
    .replace(/\\/g, '\\\\')   // escapa backslashes
    .replace(/'/g, "''")      // escapa aspas simples (SQL standard)
    .replace(/\n/g, '\\n')    // escapa newlines
    .replace(/\r/g, '\\r')    // escapa carriage returns
  return "'" + escapado + "'"
}
```

Proteções aplicadas (defense in depth — secops §0.2):
- Remove null bytes (`\0`) — previne truncamento em parsers C
- Escapa backslashes (`\` → `\\`) — previne escape sequences em camadas downstream
- Dobra aspas simples (`'` → `''`) — escape padrão SQL
- Escapa newlines/carriage returns — previne injeção multiline
- Envolve com aspas simples via concatenação (Rollup-safe)

### Quando usar `quoteSql`

| Cenário | Usar |
|---|---|
| Valor string em WHERE/filtros DuckDB | `quoteSql(valor)` |
| Valor string em INSERT VALUES (inclusive via `postgres_execute`) | `quoteSql(valor)` |
| Connection string libpq | Concatenação explícita (não usa `quoteSql` porque libpq tem escape diferente) |
| Valores numéricos em SQL | Interpolação direta (números não precisam de aspas) |

### Quando NÃO usar `quoteSql`

- Nomes de tabela/schema/alias (usam aspas duplas ou são validados como identificadores)
- Strings que vão **diretamente** como argumento de `postgres_execute('alias', '...')` — o SQL inteiro precisa de escape de aspas via `.replace(/'/g, "''")` separadamente
- Connection strings libpq (formato de escape diferente: `\` → `\\`, `'` → `\'`)

## Onde o problema foi encontrado

| Arquivo | Linha afetada | Correção |
|---|---|---|
| `server/utils/metadados.ts` | `.replaceAll('@idconta', ...)` | `quoteSql(idConta)` |
| `server/utils/duckdb.ts` | Connection string do ATTACH | Concatenação explícita |
| `server/utils/arquivos-s3.ts` | `WHERE b.id_cliente = ...` | `quoteSql(idCliente)` |
| `server/utils/copiador.ts` | INSERT VALUES de logs | `quoteSql(valor)` direto (unificado) |

## Como detectar proativamente

Buscar no código por este pattern (regex):

```
`'?\$\{[^}]+\}'?`
```

Qualquer template literal onde uma interpolação está diretamente envolvida por aspas simples (`'${x}'`) é vulnerável a essa otimização do Rollup.

## Relação com outros steerings

- **`secops.md` §2.1** — parametrização obrigatória; `quoteSql` é defense in depth quando parâmetros nativos não estão disponíveis (DuckDB via `db.exec`)
- **`secops.md` §2.4** — connection strings; a concatenação explícita resolve o mesmo problema para DSNs libpq
- **`duckdb-performance.md`** — patterns de query corretos que devem usar `quoteSql` para valores
