---
inclusion: fileMatch
fileMatchPattern: "**/package.json"
description: Substituto obrigatório de npx — usar vpx para executar binários de pacotes. Ativar sempre que for usar npx.
---
# vpx — Substituto de npx

## Regra principal

**SEMPRE** use `vpx` no lugar de `npx` ao executar comandos no terminal.

O `vpx` é um substituto global de `npx` configurado nesta máquina de desenvolvimento. Funciona de forma idêntica ao `npx`, mas é o binário correto a ser utilizado.

## Exemplos

```bash
# ✅ Correto
vpx eslint .
vpx tsc --noEmit
vpx vitest run

# ❌ Errado
npx eslint .
npx tsc --noEmit
npx vitest run
```

## Nota

Esta regra se aplica a **qualquer projeto** nesta máquina, não apenas ao projeto atual.
