---
inclusion: auto
description: SecOps obrigatório — prevenção SQLi, path traversal, SSRF, CSRF, supply chain, info disclosure. Ativar ao implementar backend/inputs.
---

# SecOps — Diretrizes de Segurança

> Toda implementação deve ser revisada contra estas diretrizes antes de concluída.

Este é o índice. Detalhes por tema (todos `inclusion: auto` — ativados sob demanda):

- **secops-injecao.md** — Injeção SQL/NoSQL, validação de entrada, config server-side, info disclosure (§2, §3, §4, §10)
- **secops-path-ssrf.md** — SSRF, path traversal, isolamento de diretórios, rate limit, access control, segurança de banco (§5, §6, §7, §8, §9)
- **secops-csrf-auditoria.md** — CSRF stateless HMAC, auditoria/alertas, checklist de code review, referências normativas (§11, §12, §13, §16)
- **secops-supply-upload.md** — Supply chain attack, upload de arquivos e web shells (§14, §15)

> CSRF no Nuxt (implementação de referência) → **nuxt-server-csrf.md**

---

## 0. Falsa sensação de segurança — o risco invisível

O problema mais perigoso em SecOps: um controle que **parece** proteger, mas é contornado em minutos. Passa nos checklists, a equipe se sente segura, a vulnerabilidade permanece.

### 0.1 Antipadrões que geram falsa sensação de segurança

Cada item é um controle real que **não protege** como parece:

| Antipadrão | Por que não protege | O que fazer |
|---|---|---|
| Validar CPF/CNPJ só por regex de formato | Formato ≠ documento válido; não impede injeção | Validar dígito verificador + parametrizar query |
| Rate limit só por IP | Pool de IPs, proxies, botnets | IP + sessão + fingerprint |
| CAPTCHA como barreira de segurança | Fricção, não autenticação; serviços de resolução custam centavos | Nunca substituir auth por CAPTCHA |
| Whitelist de hostname para SSRF | DNS rebinding bypassa nome | Resolver IP e validar endereço resolvido |
| Validação só no frontend | JS é editável; requisição forjável via curl | Toda validação de segurança no backend |
| Esconder endpoint "por obscuridade" | Tudo é visível no tráfego | Autenticação e autorização, não obscuridade |
| Tratar HTTP 500 como "seguro" | Confirma que input chegou ao banco (oracle de injeção) | Validar antes da persistência |
| Log de auditoria sem alerta | Log que ninguém lê não detecta ataque | Alertas ativos para padrões anômalos |
| Checklist como formalidade | Item marcado sem evidência é ruído | Cada item exige evidência verificável |
| Defesa em uma única camada | Se o WAF cai/é bypassado, não há mais nada | Defense in depth (§0.2) |
| Validar path só com `includes('..')` | Encodings (`%2e%2e`, `....//`), paths absolutos passam | Regex positiva + `resolve()` + prefixo |
| Aceitar "nome de pasta" sem regex positiva | `../../outrocliente` → IDOR via filesystem | Nome simples `/^[a-zA-Z0-9À-ÿ _-]+$/` + jail |

### 0.2 Defense in depth — cada camada independente

Nunca assuma que a camada anterior validou. Cada camada valida por conta própria:

```
[Cliente] → [WAF/CDN] → [API Gateway] → [Controller] → [Service] → [Repository] → [Banco]
              rate limit   authn/authz    validação    regra de    query
              básico       de token       de schema    negócio     parametrizada
```

Se o WAF for bypassado (e será), o Controller valida. Se o Controller falha, o Service aplica regra de negócio. Se o Service falha, a query parametrizada impede injeção.

**Regra:** um controle que depende de outro controle anterior para funcionar não é um controle — é uma suposição.

### 0.3 Identificar falsa sensação em code review

- "Se eu remover este controle, o que acontece?" — "nada, porque X já faz" → controle dependente e frágil
- "Pode ser bypassado mudando só o input?" — se sim, não é suficiente sozinho
- "Como eu saberia se falhou?" — sem log/alerta, é invisível em produção
- "Foi testado com inputs maliciosos, não só válidos?" — caminho feliz não valida segurança

---

## 1. Princípio fundamental: nunca confie no frontend

O backend **nunca** confia em dados do cliente — body, query, header, cookie, qualquer canal. Todo input externo é hostil até prova em contrário.

Inclui: valores que "parecem" config (URLs, nomes de templates, parâmetros de relatório); identificadores internos (UUIDs, IDs); filtros, ordenação, paginação; flags/enums enviados como string.

**Regra de ouro:** se o valor pode ser construído ou modificado pelo usuário, deve ser validado, sanitizado e/ou substituído por valor server-side antes de qualquer uso.
