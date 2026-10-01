---
inclusion: auto
name: Nuxt UI Working with AI (MCP, Skills, LLMs.txt)
description: Use ao integrar Nuxt UI com assistentes AI — servidor MCP, skills e arquivos LLMs.txt para dar contexto de componentes/theming aos agentes.
---
# Nuxt UI — Trabalhando com AI

Três formas de dar contexto de Nuxt UI a agentes AI: MCP (tools em tempo real), Skills (conhecimento no contexto), LLMs.txt (docs estruturadas).

## MCP Server

Servidor MCP HTTP em `https://ui.nuxt.com/mcp`. Dá acesso estruturado a componentes, código-fonte e exemplos.

### Resources (acessar via `@`)

`resource://nuxt-ui/components`, `.../composables`, `.../examples`, `.../templates`, `.../documentation-pages`.

### Tools (kebab-case)

- `search-components` — busca por nome/categoria/intenção (nomes alternativos como "segmented control", "combobox"). Sem params lista todos.
- `search-composables`, `search-icons` (Iconify, default `lucide`, formato `i-{prefix}-{name}`).
- `get-component` — docs; param `sections`: `usage|examples|api|theme|changelog`.
- `get-component-metadata` — props/slots/events (leve); `full: true` p/ schemas recursivos.
- `search-documentation` (param `section`), `get-documentation-page` (param `headings` = h2 titles).
- `list-templates`/`get-template`, `list-examples`/`get-example`, `get-migration-guide`.

### Limitar tools

Header HTTP `X-MCP-Tools` = lista separada por vírgula dos tool names (kebab-case). Sem header = todos; header vazio = nenhum; tool desconhecido = erro.

### Configuração por assistente

```bash [Claude Code]
claude mcp add --transport http nuxt-ui https://ui.nuxt.com/mcp
```

```json [.cursor/mcp.json]
{ "mcpServers": { "nuxt-ui": { "type": "http", "url": "https://ui.nuxt.com/mcp" } } }
```

```json [.vscode/mcp.json]
{ "servers": { "nuxt-ui": { "type": "http", "url": "https://ui.nuxt.com/mcp", "headers": { "X-MCP-Tools": "search-components,get-component" } } } }
```

```json [opencode.json]
{ "$schema": "https://opencode.ai/config.json", "mcp": { "nuxt-ui": { "type": "remote", "url": "https://ui.nuxt.com/mcp", "enabled": true } } }
```

```json [Claude Desktop]
{ "mcpServers": { "nuxt-ui": { "command": "npx", "args": ["mcp-remote", "https://ui.nuxt.com/mcp"] } } }
```

Outros: Gemini CLI (`~/.gemini/settings.json` chave `httpUrl`), Windsurf/Google Antigravity/Le Chat (`serverUrl`), Zed (`context_servers` chave `url`), GitHub Copilot Agent/CLI (`mcpServers` + `"tools": ["*"]`), ChatGPT (Connector: URL `https://ui.nuxt.com/mcp`, auth None). VS Code/Copilot usam chave `servers`; Copilot Agent usa `mcpServers`.

### Prompts (via `/`)

`find-component-for-usecase`, `implement-component-with-props`, `setup-project-with-template`.

## Skills

Arquivos de conhecimento carregados no contexto do agente (não são tools em tempo real como MCP). Nuxt UI provê uma **usage skill** cobrindo instalação (Nuxt/Vue/Laravel/AdonisJS), theming, 125+ componentes, composables, forms (Standard Schema), layouts e templates. Carrega referências extras sob demanda.

```bash
npx skills add nuxt/ui                       # todos agentes detectados
npx skills add nuxt/ui --agent cursor        # agente específico
npx skills add nuxt/ui --agent claude-code
npx skills add nuxt/ui --global              # todos projetos
npx skills add https://ui.nuxt.com           # instalar via site (rede lenta)
```

```bash [Claude Code]
claude skill add https://github.com/nuxt/ui/tree/v4/skills/nuxt-ui
```

CLI `skills` (skills.sh) suporta 35+ agentes. Após instalada, invocar com `/nuxt-ui`. Cursor: Settings > Skills > Add skill com URL `https://github.com/nuxt/ui/tree/v4/skills/nuxt-ui`. Entry point: `skills/nuxt-ui/SKILL.md`.

## LLMs.txt

Docs estruturadas para LLMs:

- `/llms.txt` — overview de componentes + links (~5K tokens). **Recomendado** — cabe em contextos padrão.
- `/llms-full.txt` — docs completas: implementação, exemplos, theming, composables, migração (~1M+ tokens). Só p/ contextos 200K+.

Cursor/Windsurf: referenciar URLs via `@docs`. O símbolo `@` deve ser **digitado à mão** (copy-paste quebra o reconhecimento). Prompt exemplo: "Using Nuxt UI documentation from https://ui.nuxt.com/llms.txt".

## Referência

- https://ui.nuxt.com/docs/getting-started/ai/llms-txt
- https://ui.nuxt.com/docs/getting-started/ai/mcp
- https://ui.nuxt.com/docs/getting-started/ai/skills
