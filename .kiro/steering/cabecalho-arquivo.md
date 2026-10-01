---
inclusion: fileMatch
fileMatchPattern: ['**/*.ts', '**/*.js', '**/*.mjs', '**/*.cjs', '**/*.vue', '**/*.py', '**/*.sql']
description: Exige cabeçalho estilo Go no topo de arquivos descrevendo propósito. Ativar ao criar/editar código.
---

# Cabeçalho de Arquivo — Estilo Go

## Regra

Todo arquivo de código **deve** começar com um comentário de cabeçalho nas primeiras linhas, descrevendo de forma **sucinta e densa**:

1. O caminho relativo do arquivo no projeto
2. O que o arquivo é / faz
3. Para que serve no contexto do projeto
4. Por que ele existe (qual problema resolve)

## Formato

- Use comentários de linha (`//`) — nunca blocos `/* */`
- Máximo de 4 linhas
- Primeira linha: caminho relativo + resumo principal (separados por ` — `)
- Linhas seguintes: detalhes complementares (tecnologias usadas, dependências-chave, formato de dados)
- Após o cabeçalho, uma linha em branco antes dos imports/código

## Exemplo

```typescript
// server/utils/criptografia.ts — Funções de criptografia simétrica AES-256-GCM para proteger
// dados sensíveis (credenciais de banco, tokens) em repouso. Utiliza o módulo crypto nativo
// do Node.js. A chave de 32 bytes é fornecida via runtimeConfig (NUXT_ENCRYPTION_KEY, base64).
// Formato de saída: "iv:tag:dadosCifrados" (tudo em hex).

import { createCipheriv } from 'node:crypto'
```

```python
# api/exporter.py — Exportação de dados do sistema para planilhas Excel (.xlsx).
# Consulta o banco de dados, formata os resultados e gera o arquivo para download.
# Utilizado pelo endpoint /api/exportar para atender requisições do frontend.

import openpyxl
```

```vue
<!-- app/pages/login.vue — Página de autenticação OAuth via Keycloak. -->
<!-- Redireciona o usuário para o fluxo de login e trata o callback com token. -->

<template>
```

## Extensões aplicáveis

A regra se aplica a arquivos com as seguintes extensões:

- `.ts`, `.js`, `.mjs`, `.cjs`
- `.py`
- `.vue`
- `.sql`

## Arquivos isentos

- `__init__.py` (quando vazio ou apenas com re-exports simples)
- Arquivos de configuração (`.json`, `.yml`, `.yaml`, `.toml`, `.env`)
- Arquivos gerados automaticamente (`.d.ts`, `.nuxt/`)
