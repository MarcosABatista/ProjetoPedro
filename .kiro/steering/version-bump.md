---
inclusion: fileMatch
fileMatchPattern: "package.json"
description: Procedimento para version bump em projetos JS/TS com package.json na raiz.
---

# Version Bump — Projetos JavaScript/TypeScript

## Pré-condição

Projeto tem `package.json` na raiz com campo `"version"`.

## Comando

Usar **sempre** `pnpm version` — nunca editar `package.json` manualmente.

```bash
pnpm version <nova-versao>
# Exemplo: pnpm version 1.2.1
```

## Quando usar cada tipo

| Situação | Comando | Exemplo |
|----------|---------|---------|
| Bugfix ou refinamento de funcionalidade existente | `pnpm version patch` | 1.2.0 → 1.2.1 |
| Funcionalidade nova (do zero) | `pnpm version minor` | 1.2.1 → 1.3.0 |
| Breaking change (mudança de API/contrato) | `pnpm version major` | 1.3.0 → 2.0.0 |
| Versão exata específica | `pnpm version X.Y.Z` | qualquer → X.Y.Z |

## O que faz automaticamente

1. Atualiza `"version"` no `package.json`
2. Cria commit com mensagem `v<versao>` (ex: `v1.2.1`)
3. Cria tag git `v<versao>`

## Flags úteis

| Flag | Efeito |
|------|--------|
| `--no-git-tag-version` | Altera package.json sem criar commit/tag |
| `--allow-same-version` | Permite "bumpar" para mesma versão (útil para re-tag) |
| `--preid <id>` | Identificador de prerelease (alpha, beta, rc) |

## Vite+ (vp)

`vp` **não possui** comando `version`. Usar `pnpm version` diretamente.

## Regra para agentes

Nunca editar campo `"version"` do `package.json` via str_replace ou fs_write. Sempre executar `pnpm version`.
