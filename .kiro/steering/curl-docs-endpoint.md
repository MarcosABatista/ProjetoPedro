---
description: Documentação curl obrigatória no final de cada arquivo de endpoint em server/api/
inclusion: fileMatch
fileMatchPattern: "server/api/**/*.ts"
---

# Documentação curl em Endpoints

## Regra

Todo arquivo em `server/api/` **deve** conter, no final do arquivo, um bloco de comentário multi-linha (`/* */`) documentando como o endpoint pode ser chamado via `curl`.

## Quando aplicar

- **Arquivo criado** — adicionar bloco curl completo no final
- **Arquivo modificado** — verificar se houve alteração em:
  - Nome ou tipo de parâmetros (body, query, params)
  - Formato do body (campos adicionados, removidos ou renomeados)
  - Método HTTP
  - Respostas possíveis (novos status codes, mensagens alteradas)
  - Se houve qualquer dessas mudanças → atualizar o bloco curl

## Formato obrigatório

Usar comentário multi-linha (`/* */`) — **nunca** comentários de linha (`//`).
Motivo: o conteúdo dentro de `/* */` pode ser copiado e colado diretamente no terminal sem precisar limpar prefixos `//` de cada linha.

```typescript
/*

─── Documentação: chamada via curl ───────────────────────────────────────────

curl -X <MÉTODO> http://localhost:3000<ROTA> \
  -H "Content-Type: application/json" \
  -d '{<BODY_JSON>}'

Respostas:
  <STATUS> — <CORPO_RESPOSTA>  → <DESCRIÇÃO>

Observações:
  - <NOTAS_RELEVANTES>

*/
```

## Regras de conteúdo

1. **Rota completa** — incluir o path exato como mapeado pelo Nuxt (ex: `/api/gerar/template/parar`)
2. **Método HTTP** — deduzir do sufixo do arquivo (`.post.ts` → POST, `.get.ts` → GET, etc.)
3. **Body** — listar todos os campos do schema Zod com placeholders descritivos:
   - Strings: `"<DESCRICAO_DO_CAMPO>"`
   - Números: `<descricao_numero>`
   - Booleanos: `true|false`
   - Arrays: `["<item1>", "<item2>"]`
   - Token CSRF: `"<TOKEN_CSRF>"`
4. **Respostas** — documentar todos os status codes retornados pelo endpoint (sucesso e erros)
5. **Observações** — incluir informações relevantes para quem está testando:
   - Se precisa de token CSRF e como obtê-lo
   - Se o endpoint é streaming (SSE)
   - Se depende de estado prévio (ex: operação em andamento)
   - Pré-condições necessárias
6. **Query params** (GET) — documentar como query string na URL do curl

## Exemplos

### POST com body JSON

```typescript
/*

─── Documentação: chamada via curl ───────────────────────────────────────────

curl -X POST http://localhost:3000/api/contas \
  -H "Content-Type: application/json" \
  -d '{"_token": "<TOKEN_CSRF>"}'

Respostas:
  200 — { "contas": [{ "label": "...", "value": "..." }] }  → lista de contas disponíveis
  400 — { "statusMessage": "Dados inválidos" }              → body ausente ou _token vazio
  403 — { "statusMessage": "Acesso negado" }                → token CSRF expirado/inválido

Observações:
  - Requer configuração de banco ativa no servidor (POST /api/config-banco antes)
  - O _token é o CSRF HMAC gerado via SSR payload (composable useTokenCsrf)

*/
```

### GET com query params

```typescript
/*

─── Documentação: chamada via curl ───────────────────────────────────────────

curl http://localhost:3000/api/operacao-ativa

Respostas:
  200 — { "operacao": { "tipo": "...", "progresso": 50, "mensagem": "..." } }  → operação em andamento
  200 — { "operacao": null }                                                     → nenhuma operação ativa

Observações:
  - Endpoint sem autenticação — apenas consulta estado interno do servidor
  - Usado pelo frontend após F5 para detectar operação em andamento

*/
```

### POST streaming (SSE)

```typescript
/*

─── Documentação: chamada via curl ───────────────────────────────────────────

curl -X POST http://localhost:3000/api/stream-export \
  -H "Content-Type: application/json" \
  -d '{"_token": "<TOKEN_CSRF>", "data": {"idconta": "<ID_HEX_32>", "clientes": ["<ID_HEX_32>"], "siglas": ["Unico"], "gerarHash": "S", "path": "<NOME_PASTA>"}}'

Respostas (SSE — text/event-stream):
  data: {"progress": 0-100, "message": "..."}              → progresso parcial
  data: {"progress": 100, "message": "...", "status": "success"}  → concluído com sucesso
  data: {"progress": N, "message": "...", "status": "error"}      → falha durante execução

Observações:
  - Resposta é Server-Sent Events (streaming) — curl exibe chunks conforme chegam
  - Apenas uma operação por vez no servidor (singleton)
  - Use --no-buffer para ver eventos em tempo real: curl --no-buffer -X POST ...

*/
```

## O que NÃO fazer

- Não usar comentários de linha (`//`) — o comando curl fica poluído com `//` no início de cada linha, obrigando a limpar manualmente antes de colar no terminal
- Não omitir o separador visual (`───`)
- Não documentar headers que o curl já envia por padrão (ex: `Accept`)
- Não incluir tokens reais ou valores sensíveis — sempre usar placeholders
- Não duplicar documentação que já está no cabeçalho do arquivo

## Posição no arquivo

O bloco curl é **sempre a última coisa** do arquivo — após o `export default`, após qualquer função auxiliar, no final absoluto.

## Arquivos isentos

- `*.test.ts` — arquivos de teste não precisam de documentação curl
- Arquivos que apenas re-exportam ou são helpers internos sem rota própria
