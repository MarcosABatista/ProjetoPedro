---
inclusion: fileMatch
fileMatchPattern: ["layers/**", "nuxt.config.ts"]
name: nuxt-layers-overview
description: Nuxt v4 layers — reuse components/utils/config via ~~/layers auto-registration and the extends config (local/npm/git), layer aliases, and override priority rules. Use when sharing code across projects, building themes, or structuring DDD/monorepo apps.
---

# Nuxt v4 — Layers

Extend a base Nuxt app to reuse components, utils, composables, and config. Layer structure mirrors a normal Nuxt app.

Use cases: shared config presets, component/composable/util libraries, module presets, themes, DDD modular architecture.

## Usage

Any dir in `~~/layers` is auto-registered as a layer (since v3.12). Named aliases auto-created: `~~/layers/test` → `#layers/test` (since v3.16).

Extend external layers via `extends`:

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  extends: [
    '../base',                     // local
    '@my-themes/awesome',          // npm package
    'github:my-themes/awesome#v1', // git repo (branch/tag after #; defaults to main)
  ],
})
```

Private repo auth + alias override:

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  extends: [
    ['github:my-themes/private-awesome', { auth: process.env.GITHUB_TOKEN }],
    ['github:my-themes/awesome', { meta: { name: 'my-awesome-theme' } }],
  ],
})
```

Uses unjs/c12 + unjs/giget. (Nuxt 5: `giget` is an optional peer dep — install it for remote `extends`, or prefer a git URL in `package.json` for lockfile pinning.)

## Priority (highest → lowest)

1. **Your project files** — always highest.
2. **Auto-scanned `~~/layers`** — alphabetical, Z > A.
3. **`extends` entries** — first entry > later entries.

Control order by numeric prefixes (`1.base/`, `2.theme/`, `3.admin/`) or by listing in `extends` (first = highest among listed; unlisted keep alphabetical below listed):

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  extends: [
    '~~/layers/admin',    // highest
    '~~/layers/features',
    '~~/layers/base',     // lowest of listed
  ],
})
```

Both `~~/...` (recommended) and `~/...` and relative (`./layers/admin`) paths work.

When to use which: `~~/layers` for local project layers; `extends` for external deps (npm/remote) or layers outside the project dir.

Gotcha (v4): module load order corrected — layer modules load before project modules (project = highest priority).

## Referência

- [Layers](https://nuxt.com/docs/4.x/getting-started/layers) — doc oficial Nuxt v4
