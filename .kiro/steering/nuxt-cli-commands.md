---
inclusion: auto
name: nuxt-cli-commands
description: Use as reference for Nuxt CLI commands — dev, build, generate, preview, add, module, init, prepare, analyze, cleanup, info, test, typecheck, upgrade, devtools, build-module, add-template.
---
# Nuxt v4 CLI — Commands Reference

Common global opts on most commands: `--cwd=<dir>` (overrides ROOTDIR positional), `--logLevel=<silent|info|verbose>`, `--dotenv=<path>`, `--envName`, `-e, --extends=<layer-name>`, `--profile[=verbose]`.

## dev
Starts dev server with HMR at http://localhost:3000. Sets `NODE_ENV=development`.
```bash
npx nuxt dev [ROOTDIR] [-p,--port] [-h,--host] [-o,--open] [--https] [--tunnel] [--qr] [--public] [--clear]
```
Key flags: `-p/--port` (env fallback `NUXT_PORT`/`NITRO_PORT`/`PORT`/`devServer.port`), `-h/--host`, `-o/--open` (open browser), `--https` (use `--https.cert`/`--https.key`; `--sslCert`/`--sslKey` deprecated), `--tunnel` (untun public URL), `--qr`/`--no-qr`, `--public` (all interfaces), `--clear`, `--no-fork`, `--clipboard`, `--publicURL`. Passes extra opts through to `listhen`. Self-signed cert in dev → set `NODE_TLS_REJECT_UNAUTHORIZED=0`.

## build
Creates `.output/` (app + server + deps) for production. Sets `NODE_ENV=production`.
```bash
npx nuxt build [ROOTDIR] [--prerender] [--preset]
```
`--prerender` prerenders static routes (always forces `preset=static`). `--preset` = Nitro server preset.

## generate
Pre-renders every route to plain HTML for static hosting. Alias of `nuxt build --prerender=true`.
```bash
npx nuxt generate [ROOTDIR] [--preset]
```

## preview
Serves the app after `build` (preview production). Alias: `start`. Sets `NODE_ENV=production`. Loads `.env` into `process.env` for convenience.
```bash
npx nuxt preview [ROOTDIR] [-p,--port]
```
Port fallback: `NUXT_PORT` → `NITRO_PORT` → `PORT`. Prod start example: `NODE_ENV=production node --env-file .env .output/server/index.mjs`.

## add (alias: `nuxt module add`)
Installs Nuxt module(s): installs dep via your PM, updates `package.json` + `nuxt.config`.
```bash
npx nuxt add <MODULENAME...> [--skipInstall] [--skipConfig] [--dev]
```
`--skipInstall`, `--skipConfig`, `--dev` (as devDependency). No name → interactive search/select. Example: `npx nuxt add pinia`.

## module
- `nuxt module remove [MODULENAME...] [--skipInstall] [--skipConfig]` — uninstalls + removes from `nuxt.config`. No name → prompt (name required if `--skipConfig`). `npx nuxt module remove pinia`.
- `nuxt module search <QUERY> [--nuxtVersion=<2|3>]` — search compatible modules. `npx nuxt module search pinia`.

## add-template (was `nuxt add <TEMPLATE> <NAME>`, now deprecated form)
Scaffolds an entity relative to `srcDir`.
```bash
npx nuxt add-template <TEMPLATE> <NAME> [--force]
```
TEMPLATE options: `api|app|app-config|component|composable|error|layer|layout|middleware|module|page|plugin|server-middleware|server-plugin|server-route|server-util`. `--force` overrides existing.
Modifiers add name suffixes:
- `component`/`plugin`: `--mode client|server` or `--client`/`--server` → e.g. `add-template plugin sockets --client` → `plugins/sockets.client.ts`.
- `middleware`: `--global`.
- `api`: `--method <connect|delete|get|head|options|patch|post|put|trace>` or `--get`/`--post` etc.
Examples: `add-template component TheHeader` → `components/TheHeader.vue`; `add-template page "category/[id]"` → `pages/category/[id].vue`; `add-template layer subscribe` → `layers/subscribe/nuxt.config.ts`.

## init (`create-nuxt`)
Scaffolds a fresh project (via unjs/giget).
```bash
npm create nuxt@latest [DIR] [-t,--template] [-f,--force] [--no-install] [--gitInit] [--packageManager] [-M,--modules] [--nightly]
```
`-t/--template`, `-f/--force` (override dir), `--offline`/`--preferOffline`, `--no-install`, `--gitInit`, `--shell`, `--packageManager <npm|pnpm|yarn|bun>`, `-M/--modules` (comma-separated, no spaces), `--no-modules`, `--nightly`. Env `NUXI_INIT_REGISTRY` sets custom template registry.
> **Setup não-interativo (create):** `pnpm create nuxt` é interativo por padrão (prompts de gerenciador/módulos) e trava o agente. Sempre passar `--packageManager pnpm` + `--modules`/`--no-modules` (e `--gitInit`) — ver [nuxt-create-nao-interativo](nuxt-create-nao-interativo.md).

## prepare
Creates `.nuxt/` and generates types. Useful in CI or as `postinstall`. Sets `NODE_ENV=production`.
```bash
npx nuxt prepare [ROOTDIR]
```

## analyze
Builds + analyzes the production bundle (experimental). Sets `NODE_ENV=production`.
```bash
npx nuxt analyze [ROOTDIR] [--name=<name>] [--no-serve]
```
`--name` (default `default`), `--no-serve` (skip serving results).

## cleanup
Removes generated files/caches: `.nuxt`, `.output`, `dist`, `node_modules/.vite`, `node_modules/.cache`.
```bash
npx nuxt cleanup [ROOTDIR]
```

## info
Logs info about the project (env, versions, modules).
```bash
npx nuxt info [ROOTDIR]
```

## test
Runs tests via `@nuxt/test-utils`. Sets `NODE_ENV=test` if unset.
```bash
npx nuxt test [ROOTDIR] [--dev] [--watch]
```

## typecheck
Runs `vue-tsc` or Golar to type-check the app (prompts to install if neither present). Sets `NODE_ENV=production`.
```bash
npx nuxt typecheck [ROOTDIR] [--checker <vue-tsc|golar>]
```
> **Setup não-interativo (Golar):** para configurar typecheck via Golar em projeto novo sem cair no prompt `vue-tsc vs golar` e sem `ERR_PACKAGE_PATH_NOT_EXPORTED` (instalação antecipada do checker, `golar.config.ts`, `shims-vue.d.ts`, `--checker golar`), ver [nuxt-typecheck-golar](nuxt-typecheck-golar.md).

## upgrade
Upgrades Nuxt to latest.
```bash
npx nuxt upgrade [ROOTDIR] [--dedupe] [-f,--force] [-ch,--channel=<stable|nightly|v3|v4|v4-nightly|v3-nightly>]
```
`--dedupe`, `-f/--force` (recreate lockfile + node_modules), `-ch/--channel` (default `stable`).

## build-module
Builds a Nuxt module before publishing (runs `@nuxt/module-builder`; runs `nuxt-build-module` binary). Generates `dist/`.
```bash
npx nuxt build-module [ROOTDIR] [--build] [--stub] [--sourcemap] [--prepare]
```
`--build` (dist build), `--stub` (stub dist for dev), `--sourcemap`, `--prepare` (prepare for local dev). All default `false`.

## devtools
Enable/disable Nuxt DevTools per project (saved in user-level `.nuxtrc`).
```bash
npx nuxt devtools <enable|disable> [ROOTDIR]
```

## Referência

- [nuxt dev](https://nuxt.com/docs/4.x/api/commands/dev)
- [nuxt build](https://nuxt.com/docs/4.x/api/commands/build)
- [nuxt generate](https://nuxt.com/docs/4.x/api/commands/generate)
- [nuxt preview](https://nuxt.com/docs/4.x/api/commands/preview)
- [nuxt add](https://nuxt.com/docs/4.x/api/commands/add)
- [nuxt module](https://nuxt.com/docs/4.x/api/commands/module)
- [nuxt init](https://nuxt.com/docs/4.x/api/commands/init)
- [nuxt prepare](https://nuxt.com/docs/4.x/api/commands/prepare)
- [nuxt analyze](https://nuxt.com/docs/4.x/api/commands/analyze)
- [nuxt cleanup](https://nuxt.com/docs/4.x/api/commands/cleanup)
- [nuxt info](https://nuxt.com/docs/4.x/api/commands/info)
- [nuxt test](https://nuxt.com/docs/4.x/api/commands/test)
- [nuxt typecheck](https://nuxt.com/docs/4.x/api/commands/typecheck)
- [nuxt upgrade](https://nuxt.com/docs/4.x/api/commands/upgrade)
- [nuxt devtools](https://nuxt.com/docs/4.x/api/commands/devtools)
- [nuxt build-module](https://nuxt.com/docs/4.x/api/commands/build-module)
- [nuxt add-template](https://nuxt.com/docs/4.x/api/commands/add-template)
