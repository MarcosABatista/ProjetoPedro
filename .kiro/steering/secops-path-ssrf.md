---
inclusion: auto
description: SecOps — SSRF, path traversal, isolamento de diretórios, rate limit, controle de acesso, segurança de banco. Ativar ao lidar com URLs, filesystem ou endpoints com PII.
---

# SecOps — SSRF, Path Traversal, Rate Limit e Acesso

Complementa **secops.md** (§0, §1) e **secops-injecao.md**.

## 5. Prevenção de SSRF

### 5.1 Whitelist de hosts + validação de IP resolvido
Validar só o hostname não protege contra DNS rebinding. Resolver o hostname para IP **no momento da checagem** e validar o IP:
```ts
import { lookup } from 'node:dns/promises'
const HOSTS_PERMITIDOS = new Set(['assets.meudominio.com.br'])

async function validarUrl(rawUrl: string) {
  const url = new URL(rawUrl)
  if (!HOSTS_PERMITIDOS.has(url.hostname.toLowerCase())) {
    throw createError({ status: 400, statusText: 'Host não permitido' })
  }
  const { address } = await lookup(url.hostname)
  if (ehEnderecoPrivado(address)) {
    throw createError({ status: 400, statusText: 'Host resolve para endereço privado' })
  }
}

function ehEnderecoPrivado(ip: string): boolean {
  return ip.startsWith('10.') || ip.startsWith('172.16.') /* ...172.31 */ ||
    ip.startsWith('192.168.') || ip.startsWith('127.') || ip.startsWith('169.254.')
}
```

### 5.2 Bloquear ranges privados e IMDS
Rejeitar: `169.254.0.0/16` (AWS IMDS), `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `127.0.0.0/8`, `::1`, `fc00::/7`.

---

## 6. Path Traversal e Isolamento de Diretórios

### 6.1 Regra fundamental: nome simples, nunca caminho
Valor do frontend que compõe caminho no filesystem → tratar como **nome simples**, nunca caminho/fragmento. O cliente envia um **nome** (`exportacao-01`); o servidor decide **onde**. O cliente nunca controla a estrutura de diretórios.

### 6.2 Regex de nome seguro (obrigatória)
```ts
const REGEX_NOME_SEGURO = /^[a-zA-Z0-9À-ÿ _-]+$/

function validarNomePasta(valor: string): string {
  if (valor.includes('\0')) throw createError({ status: 400, statusText: 'Dados inválidos' })
  if (valor.includes('/') || valor.includes('\\') || valor.includes('..'))
    throw createError({ status: 400, statusText: 'Dados inválidos' })
  if (valor.startsWith('/') || valor.startsWith('\\') || /^[A-Za-z]:/.test(valor))
    throw createError({ status: 400, statusText: 'Dados inválidos' })
  if (!REGEX_NOME_SEGURO.test(valor)) throw createError({ status: 400, statusText: 'Dados inválidos' })
  if (valor.length > 100) throw createError({ status: 400, statusText: 'Dados inválidos' })
  return valor
}
```

### 6.3 Confinamento em diretório base (jail)
Após validar o nome, verificar contra diretório base fixo (server-side):
```ts
import { resolve } from 'node:path'
const DIRETORIO_BASE = resolve(process.cwd(), 'exports')

function montarCaminhoSeguro(nomePasta: string): string {
  const nome = validarNomePasta(nomePasta)
  const final = resolve(DIRETORIO_BASE, nome)
  if (!final.startsWith(DIRETORIO_BASE + '/') && final !== DIRETORIO_BASE)
    throw createError({ status: 400, statusText: 'Dados inválidos' })
  return final
}
```

### 6.4 Isolamento entre clientes (IDOR via filesystem)
Caminho de cada cliente **determinado pelo servidor**, nunca pelo valor do cliente:
```ts
// ❌ PROIBIDO — cliente controla (body.pastaCliente = "../../outrocliente")
const pasta = join(DIRETORIO_BASE, body.pastaCliente)
// ✅ CORRETO — servidor determina por ID autenticado
const pasta = join(DIRETORIO_BASE, `cliente-${sessao.idCliente}`)
```
Mitigação em camadas: validar nome simples (§6.2) → confinar (§6.3) → gerar nome server-side se possível → se vier do cliente, `REGEX_NOME_SEGURO` + jail.

### 6.5 Antipadrões

| Antipadrão | Ataque | Correção |
|---|---|---|
| Validar apenas `..` | `....//`, `..%2f`, encodings | Regex positiva + `resolve()` + prefixo |
| `join()` sem verificação de prefixo | `join('/base', '/etc/passwd')` | `.startsWith(DIRETORIO_BASE)` após `resolve()` |
| Aceitar path completo | `/tmp/dados`, `C:\Windows\System32` | Só nome simples, nunca path absoluto |
| Confiar no nome p/ extensão | `arquivo.csv.exe`, `\x00.jpg` | Validar extensão server-side; strip null bytes |
| ID do cliente no caminho sem sanitizar | `id_conta = "../admin"` | Validar como numérico/UUID estrito |

### 6.6 Quando o valor DEVE vir do frontend
Camadas: (1) frontend com placeholder/hint; (2) Zod `.min(1).max(100).regex(/^[a-zA-Z0-9À-ÿ _-]+$/)`; (3) `validarNomePasta()`; (4) `montarCaminhoSeguro()`; (5) log de tentativas de traversal.

---

## 7. Rate Limiting

| Endpoint / tipo | Limite sugerido |
|---|---|
| Busca com dados pessoais | 30 req/min por IP |
| Download de documentos | 10 req/min por IP |
| Autenticação | 5 tentativas/min por IP |
| Endpoint público (teto geral) | 200 req/min por IP |

Resposta: HTTP 429 com header `Retry-After`. Rate limit por IP não basta — combinar com sessão/token, fingerprint, volume de dados retornados.

---

## 8. Controle de acesso e autenticação

- Endpoints com dados pessoais exigem autenticação
- Identificadores internos não expostos sem necessidade
- Validar autorização no servidor por recurso — não confiar em IDs do cliente

**8.1 IDOR:** UUID não é segredo. Proteção correta = verificar autorização no servidor por acesso, independente de como o ID foi obtido.
**8.2 Obscuridade não é controle:** rotas não documentadas, parâmetros ofuscados — nada disso protege. A proteção existe no servidor.

---

## 9. Segurança de banco de dados

- Usuário de banco com privilégios mínimos. **Nunca** superuser em produção
- Credenciais **nunca** em código-fonte ou config versionada — usar `runtimeConfig`
