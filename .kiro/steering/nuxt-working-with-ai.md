---
inclusion: auto
name: nuxt-working-with-ai
description: Use when configuring AI assistants to access Nuxt docs via LLMs.txt or the Nuxt MCP server (Claude, Cursor, VS Code, Copilot, etc.).
---
# Working with AI: Nuxt LLMs.txt & MCP Server

## LLMs.txt

Structured docs format for LLMs. Nuxt provides two routes:
- **`/llms.txt`** — structured overview of all doc pages + links (~5K tokens). Start here; fits standard context windows.
- **`/llms-full.txt`** — comprehensive docs incl. getting-started, API refs, blog, deploy guides (~1M+ tokens). Only for tools with 200K+ token contexts.

Usage:
- **Cursor**: reference the URLs directly or add via `@docs`.
- **Windsurf**: `@docs` with the LLMs.txt URLs; create persistent workspace rules.
- **ChatGPT/Claude/others**: prompt "Using Nuxt documentation from https://nuxt.com/llms.txt".

Gotcha: in Cursor/Windsurf the `@` symbol must be **typed manually** — copy-pasting breaks context recognition.

## MCP Server

Model Context Protocol server at **`https://nuxt.com/mcp`** (HTTP transport) gives AI assistants structured access to docs, blog posts, deploy guides, modules, changelog.

### Resources
- `resource://nuxt-com/documentation-pages` (defaults to v4.x)
- `resource://nuxt-com/blog-posts`
- `resource://nuxt-com/deploy-providers`

### Tools (kebab-case)
- Documentation: `list-documentation-pages` (version filter 3.x/4.x/5.x/all), `get-documentation-page`, `get-getting-started-guide`
- Blog: `list-blog-posts`, `get-blog-post`
- Deployment: `list-deploy-providers`, `get-deploy-provider`
- Modules: `list-modules` (filter/sort by downloads/stars/date), `get-module`
- Changelog: `get-changelog`

### Limit tools
Set the `X-MCP-Tools` HTTP header to a comma-separated list of exact kebab-case tool names to reduce tool context. No header = all tools; empty = none; unknown name = config error.

```json
{ "X-MCP-Tools": "list-documentation-pages,get-documentation-page" }
```

### Prompts (via `/`)
`find-documentation-for-topic`, `deployment-guide`, `migration-help`.

### Setup snippets

**Claude Code:**
```bash
claude mcp add --transport http nuxt https://nuxt.com/mcp
```

**Cursor** (`.cursor/mcp.json`):
```json
{ "mcpServers": { "nuxt": { "type": "http", "url": "https://nuxt.com/mcp" } } }
```

**VS Code** (`.vscode/mcp.json`):
```json
{ "servers": { "nuxt": { "type": "http", "url": "https://nuxt.com/mcp" } } }
```

**GitHub Copilot Agent / CLI** (`~/.copilot/mcp-config.json`) — use `mcpServers` key + `tools`:
```json
{ "mcpServers": { "nuxt": { "type": "http", "url": "https://nuxt.com/mcp", "tools": ["*"] } } }
```

**Claude Desktop** (`claude_desktop_config.json`) uses `mcp-remote`:
```json
{ "mcpServers": { "nuxt": { "command": "npx", "args": ["mcp-remote", "https://nuxt.com/mcp"] } } }
```

**Windsurf / Google Antigravity** use `serverUrl`; **Gemini CLI** uses `httpUrl`; **Zed** uses `context_servers` with `url`; **Opencode** uses `mcp` with `type: "remote"`. **ChatGPT** (Pro/Plus): Settings → Connectors → Developer mode → new connector, URL `https://nuxt.com/mcp`, Auth None.

## Referência

- [llms.txt](https://nuxt.com/docs/4.x/guide/ai/llms-txt) — doc oficial Nuxt v4
- [MCP](https://nuxt.com/docs/4.x/guide/ai/mcp) — doc oficial Nuxt v4
