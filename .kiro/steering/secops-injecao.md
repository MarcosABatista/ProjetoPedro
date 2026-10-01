---
inclusion: auto
description: SecOps — injeção SQL/NoSQL, DSN, validação de entrada, config server-side, info disclosure. Ativar ao escrever queries ou validar inputs no backend.
---

# SecOps — Injeção, Validação e Config Server-Side

Complementa **secops.md** (§0 falsa sensação, §1 nunca confie no frontend).

## 2. Prevenção de Injeção (SQL / NoSQL)

### 2.1 Parametrização obrigatória
Toda query usa parâmetros nomeados/posicionais. Concatenação de strings é **proibida**.
```ts
// ❌ PROIBIDO
db.exec(`SELECT * FROM usuarios WHERE cpf = '${inputUsuario}'`)
// ✅ CORRETO
const stmt = db.prepare('SELECT * FROM usuarios WHERE cpf = ?')
stmt.run(inputUsuario)
```

### 2.2 Whitelist de entidades e campos
Nomes de tabelas/campos/ordenação **nunca** vêm do cliente. Use mapa server-side:
```ts
const TABELAS_PERMITIDAS = new Set(['gg_conta', 'gg_cliente', 'gg_debito'])
if (!TABELAS_PERMITIDAS.has(body.tabela)) {
  throw createError({ status: 400, statusText: 'Tabela inválida' })
}
```

### 2.3 Validação de formato antes da query
CPF/CNPJ/identificadores validados no servidor **antes** da persistência. Regex de formato não basta — dígito verificador é obrigatório.

### 2.4 Injeção via connection strings (DSN)
Connection strings libpq (`key=value ...`) são vulneráveis quando valores têm caracteres especiais (aspas, hífens, espaços, barras). Hostnames com hífens (`eldados-gpi-modelo`) quebram o parsing sem quoting e abrem superfície de injeção.

**Regras (defense in depth — 2 camadas de escape independentes):**

| Camada | Responsabilidade | Escape |
|---|---|---|
| 1. Valor DSN (libpq) | Aspas/barras dentro de cada valor | `\` → `\\`, `'` → `\'` |
| 2. String literal SQL | Connection string inteira dentro do SQL | `'` → `''` |

```ts
// ✅ CORRETO — escape em camadas
const sanitizar = (v: string) => v.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
const dbname = sanitizar(config.dbname)
const host = sanitizar(config.host)
const connStrRaw = `dbname='${dbname}' user='${user}' host='${host}' port=${port}`
const connStrEscapada = connStrRaw.replace(/'/g, "''")
const sql = `ATTACH '${connStrEscapada}' AS ${alias} (TYPE POSTGRES)`

// ❌ PROIBIDO — sem quoting (hífens/espaços quebram parsing)
const connStr = `dbname=${dbname} host=${host} port=${port}`
```
Além disso: rejeitar null bytes/newlines/caracteres não-imprimíveis; validar port como inteiro com range check.

---

## 3. Sanitização e validação de entrada

### 3.1 Checklist por tipo

| Tipo | Validação obrigatória |
|---|---|
| CPF / CNPJ | Regex de formato + dígito verificador |
| UUID / ID interno | Regex `[0-9a-fA-F-]{36}` + existência no banco |
| Datas | Parse estrito; rejeitar fora do intervalo |
| Strings livres | Tamanho máximo + strip de caracteres de controle |
| Enums / flags | Comparação contra lista fixa server-side |
| URLs do cliente | **Nunca usar diretamente** — SSRF (secops-path-ssrf.md §5) |
| Nomes de arquivo/template | **Nunca usar diretamente** — path traversal (secops-path-ssrf.md §6) |

### 3.2 Rejeição explícita, não silenciosa
Inputs inválidos → HTTP 400 com mensagem genérica. **Nunca** stack trace, mensagem de banco ou detalhe interno ao cliente.
```ts
// ❌ throw createError({ status: 500, statusText: error.message })
// ✅
logger.error('Erro ao processar requisição', error)
throw createError({ status: 400, statusText: 'Requisição inválida' })
```

---

## 4. Parâmetros de configuração server-side

Parâmetros que configuram o servidor **nunca** vêm do cliente: URLs externas, strings de conexão/datasources, caminhos de arquivo, nomes de templates/relatórios.

Vêm exclusivamente de: variáveis de ambiente (`runtimeConfig`), arquivos de config server-side, secrets manager. O cliente envia **apenas** dados de negócio (ex: `id_conta`, `id_cliente`), validados individualmente.

---

## 10. Exposição de informação (Information Disclosure)

- Stack traces, mensagens de exceção do banco, versões de framework **nunca** ao cliente
- Headers de resposta não revelam tecnologia (`X-Powered-By`, `Server`)
- Mensagens genéricas ao cliente; detalhes só nos logs internos
- Logs internos mascaram PII (hash ou truncamento)
