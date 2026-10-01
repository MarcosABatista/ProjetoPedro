---
inclusion: fileMatch
fileMatchPattern: "**/package.json"
description: Cria projetos Nuxt não-interativamente evitando travamento do agente. Ativar ao rodar pnpm create nuxt.
---

# Criação de Projeto Nuxt — Modo Não-Interativo

## Problema

O comando `pnpm create nuxt@latest` é **interativo por padrão** — faz perguntas ao usuário durante a execução (módulos, gerenciador de pacotes, etc.). Isso trava a execução quando rodado por um agente de código.

## Regra

Ao criar um novo projeto Nuxt, **SEMPRE** passe flags para tornar o comando não-interativo:

```bash
# ✅ Correto — não-interativo, com Nuxt UI e pnpm
pnpm create nuxt@latest nome-projeto --packageManager pnpm --modules @nuxt/ui --gitInit

# ✅ Sem módulos — pula o prompt de módulos
pnpm create nuxt@latest nome-projeto --packageManager pnpm --no-modules --gitInit
```

## Flags obrigatórias

| Flag | Descrição |
|------|-----------|
| `--packageManager pnpm` | Define pnpm como gerenciador (evita prompt de escolha) |
| `--modules modulo1,modulo2` | Instala módulos sem perguntar (sem espaços entre itens) |
| `--no-modules` | Pula a etapa de módulos (usar quando não quiser nenhum) |

## Flags opcionais úteis

| Flag | Descrição |
|------|-----------|
| `--gitInit` | Inicializa repositório Git automaticamente |
| `--no-install` | Pula instalação de dependências (útil se quiser ajustar antes) |
| `-f, --force` | Sobrescreve diretório existente |
| `-t, --template` | Usa um template customizado |

## Exemplo completo para este ambiente

```bash
# Criar projeto com Nuxt UI, pnpm, e git
pnpm create nuxt@latest meu-app --packageManager pnpm --modules @nuxt/ui --gitInit
```

## Próximo passo — typecheck sem prompt

Criado o projeto, o comando `nuxt typecheck` tem o **mesmo tipo de bloqueio interativo** (pergunta `vue-tsc` vs `golar` quando nenhum checker está instalado). Para deixar o typecheck pronto de forma antecipada e não-interativa (instalar `golar`, criar `golar.config.ts` e `shims-vue.d.ts`, usar `--checker golar`), seguir o passo a passo em [nuxt-typecheck-golar](nuxt-typecheck-golar.md).

## Referência

Documentação oficial: https://nuxt.com/docs/api/commands/init
