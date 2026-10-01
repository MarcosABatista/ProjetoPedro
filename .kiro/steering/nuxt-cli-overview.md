---
inclusion: auto
name: nuxt-cli-overview
description: Use to understand the Nuxt CLI (nuxt/nuxi) — how to run commands, global options, project commands, shell completions, prereleases.
---
# Nuxt v4 CLI — Overview

`@nuxt/cli` is the `nuxt` command: runs dev server, builds for production, scaffolds files, manages modules. It's a dependency of `nuxt`, so any Nuxt project already has it. Binary also installed as `nuxi`, `nuxi-ng`, `nuxt-cli` (compat aliases).

Related packages:
- `nuxi` — standalone build, no runtime deps; for running commands outside a project or global install (`npx nuxi <cmd>`).
- `create-nuxt` — separate package to scaffold a new project (see `nuxt-cli-commands` → init).

## Running commands
Inside a project, your package manager runs the project's version:
```bash [Terminal]
pnpm nuxt dev
npm exec nuxt dev
yarn nuxt dev
bun nuxt dev
```
Outside a project: `npx nuxi <cmd>` runs from its bundled copy. Node.js 18+ required (older runs with an unsupported warning).

## Global options
- `--cwd` may go before OR after the command name (handy in monorepos): `npx nuxt --cwd apps/web dev`. For commands with a `ROOTDIR` positional, explicit `--cwd` overrides it.
- `--help` on any command prints its args/options.
- `--version` prints CLI version.

## Project (custom) commands
Any command the CLI doesn't provide is looked up as a `nuxt-<command>` binary in your project, so dependencies can add commands. Example: `nuxt build-module` runs the `nuxt-build-module` binary from `@nuxt/module-builder`.

## Shell completions
`nuxt complete <shell>` prints a completion script (powered by `@bomb.sh/tab`). Completes commands, flags, and some values (ports/hosts for `dev`, Nitro presets for `build --preset`, starter templates for `init --template`, log levels).
```bash [zsh]
npx nuxt complete zsh > "${fpath[1]}/_nuxt"
```
```bash [bash]
npx nuxt complete bash > /etc/bash_completion.d/nuxt
```
```bash [fish]
npx nuxt complete fish > ~/.config/fish/completions/nuxt.fish
```
`powershell` supported. `create-nuxt complete <shell>` has its own script (completes starter template names). Works through package managers (`pnpm nuxt <Tab>`) with tab's PM completions installed.

## Debugging the CLI
Set `DEBUG=nuxi` for extra diagnostics (dev server startup timings, cleanup paths).

## Prereleases
Every commit → nightly channel:
```bash [Terminal]
npm install -D @nuxt/cli-nightly
npx @nuxt/cli-nightly dev
```
`create-nuxt-nightly` scaffolds with it; `npm create nuxt@latest --nightly` scaffolds against Nuxt nightly. Per-PR builds published by pkg.pr.new (linked from the PR).

## Referência

- [Nuxt CLI — Overview](https://nuxt.com/docs/4.x/api/commands/overview)
