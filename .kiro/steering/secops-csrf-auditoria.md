---
inclusion: auto
description: SecOps — CSRF stateless HMAC, auditoria/alertas, checklist de code review, referências normativas (LGPD, OWASP, CWE).
---

# SecOps — CSRF, Auditoria e Checklist

Complementa **secops.md** (§0, §1). Implementação de referência CSRF no Nuxt → **nuxt-server-csrf.md**.

## 11. Proteção contra CSRF

### 11.1 Stateless HMAC via SSR payload
Token + assinatura entregue via **SSR payload** — sem endpoint dedicado, sem requests extras. Gerado no SSR, transferido ao cliente via `useState`.

**Fluxo:**
1. Middleware `server/middleware/csrf-token.ts` gera token (timestamp + HMAC-SHA256, chave secreta do servidor)
2. `useTokenCsrf()` lê do `event.context` no SSR e popula `useState('csrf-token')`
3. Nuxt transfere via payload SSR (zero requests extras)
4. Frontend inclui `token.value` no body POST como `_token`
5. Backend valida assinatura + expiração antes de processar
6. Idle >10min → plugin `csrf-renovacao.client.ts` detecta via `visibilitychange` + `reloadNuxtApp()`

### 11.2 Requisitos obrigatórios

| Requisito | Detalhe |
|---|---|
| Comparação em tempo constante | `timingSafeEqual` do `node:crypto` — **nunca** `===` |
| TTL do token | Máximo 10 minutos — rejeitar expirados |
| Chave secreta | Via `runtimeConfig` — nunca hardcoded |
| Entrega via SSR | Middleware + `useTokenCsrf()` — **nunca endpoint dedicado** |
| Renovação automática | Plugin client-only com `visibilitychange` + `reloadNuxtApp()` |
| Escopo | Compartilhado por sessão de página — renovado a cada reload/navegação |

### 11.3 Quando aplicar
- ✅ Todo POST/PUT/PATCH/DELETE que altera estado
- ✅ POST de consulta (protege abuso automatizado)
- ✅ SSE que recebe body
- ❌ GET públicos sem dados sensíveis

### 11.4 Antipadrões

| Antipadrão | Risco |
|---|---|
| Comparação com `===` | Timing attack deduz o HMAC byte a byte |
| Token sem expiração | Replay attack indefinido |
| Endpoint dedicado para gerar token | Request extra desnecessário — usar SSR payload |
| Token no `localStorage` | Acessível via XSS — usar `useState` |
| Polling para renovar token | Viola custo-zero — usar `visibilitychange` |

---

## 12. Auditoria e rastreabilidade

Todo acesso a dados pessoais gera registro de auditoria:
```
timestamp | ip_origem | user_agent | endpoint | parametros_sanitizados | id_sessao | resultado
```
- Logs de auditoria imutáveis (append-only), separados dos logs de aplicação
- Retenção mínima de 12 meses para logs de acesso a PII (LGPD)

### 12.1 Log sem alerta é falsa sensação de segurança

| Padrão | Threshold | Ação |
|---|---|---|
| Mesmo IP consultando > N documentos distintos | > 50 em 10 min | Alerta imediato + bloqueio |
| Mesmo IP com > N erros 400/403 | > 20 em 5 min | Alerta + investigação |
| Pico de volume em busca | > 3× média histórica | Alerta para revisão |
| IDs sequenciais ou com padrão | Detecção de enumeração | Alerta imediato |

---

## 13. Checklist de revisão (code review)

Antes de aprovar PR com endpoints, queries ou integração externa:

- [ ] Nenhuma query usa concatenação de string com input do cliente
- [ ] Todos os inputs validados por tipo, formato e tamanho antes do uso
- [ ] CPF/CNPJ validam dígito verificador, não só formato
- [ ] Nenhum parâmetro de config server-side aceito do cliente
- [ ] Erros retornam mensagem genérica; detalhes só no log
- [ ] Endpoints com PII têm rate limit
- [ ] Nenhum identificador interno usado como prova de autorização
- [ ] Nenhum acesso a filesystem usa input sem validação de nome simples + confinamento
- [ ] Valores em caminhos são nomes simples (regex positiva), nunca paths
- [ ] Impossível acessar dados de outro cliente via manipulação de nomes de pasta/arquivo
- [ ] Credenciais não estão em código ou config versionada
- [ ] Serviços Docker em redes segmentadas (§14)
- [ ] Imagens Docker de produção usam digest SHA256, não tags mutáveis (§14)
- [ ] Dependências novas revisadas antes de adicionadas (§14)

---

## 16. Referências normativas

- **LGPD** — Lei nº 13.709/2018, Art. 46 e 48
- **Resolução CD/ANPD nº 15/2024** — Comunicação de Incidentes
- **OWASP Top 10** — A03 Injection, A05 Security Misconfiguration, A07 Auth Failures
- **CWE-89** SQL Injection · **CWE-200** Information Exposure · **CWE-1357** Untrustworthy Component
- **SLSA** — integridade de supply chain
- **OWASP SSRF / SQL Injection Prevention Cheat Sheets**
