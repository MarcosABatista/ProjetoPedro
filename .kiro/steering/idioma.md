---
inclusion: always
description: REQUISITO MANDATÓRIO: Impõe português do Brasil (pt-BR) estrito em código, documentação, commits e respostas, preservando convenções reservadas de frameworks.
---

# IDIOMA E LOCALIZAÇÃO

REGRA CRÍTICA: Você DEVE utilizar EXCLUSIVAMENTE português do Brasil (pt-BR) em artefatos gerados e interações, exceto onde a convenção técnica do framework exigir inglês para funcionamento.

**DIRETRIZES OBRIGATÓRIAS (MUST)**

* **Comunicação e Documentos**: Chat, specs, skills e arquivos de steering DEVEM ser 100% em pt-BR.
* **Identificadores de Código**: Nomes de variáveis, funções, classes, composables e endpoints DEVEM ser em pt-BR.
* **Estrutura de Domínio**: Nomes de arquivos e diretórios próprios da aplicação DEVEM ser criados em pt-BR.
* **Versionamento**: Mensagens de commit e pull requests DEVEM ser escritas em pt-BR.
* **Interface e UX**: Comentários de código e mensagens de erro visíveis ao usuário final DEVEM ser em pt-BR.

**PROIBIÇÕES ESTRITAS (NEVER)**

* NUNCA crie identificadores em inglês para lógica de negócio ou código próprio.
* NUNCA alterne idiomas no mesmo identificador (proibido misturar inglês e português).
* NUNCA traduza nomes reservados de arquivos ou pastas exigidos por convenções de arquitetura de frameworks.

**EXCEÇÕES TÉCNICAS MANDATÓRIAS**

* **Convenções de Framework**: Diretórios e arquivos reservados obrigatórios para funcionamento técnico DEVEM permanecer em inglês (ex.: `app`, `server`, `shared`, `components`, `nuxt.config.ts`, `app.config.ts`).
* **Sintaxe Externa**: Palavras-chave da linguagem, tipos nativos e métodos de bibliotecas externas DEVEM seguir a assinatura original.
