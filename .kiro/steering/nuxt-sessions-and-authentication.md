---
inclusion: fileMatch
fileMatchPattern: ["server/**/*.ts", "app/middleware/**/*.ts"]
name: nuxt-sessions-and-authentication
description: Use when implementing user registration, login, sessions, or protecting server/app routes in a full-stack Nuxt v4 app with nuxt-auth-utils.
---
# Sessions and Authentication (nuxt-auth-utils)

Uses [`nuxt-auth-utils`](https://github.com/atinux/nuxt-auth-utils): sealed, encrypted cookies for session data — no database required for sessions.

## Install

```bash [Terminal]
npx nuxt module add auth-utils
```

Adds `nuxt-auth-utils` to deps and to `modules` in `nuxt.config.ts`.

## Cookie encryption key

Session cookies are encrypted with `NUXT_SESSION_PASSWORD` (min 32 chars). Auto-added to `.env` in dev if unset; **must** be set in production before deploy.

```ini [.env]
NUXT_SESSION_PASSWORD=a-random-password-with-at-least-32-characters
```

## Login API route

Validate the body with `zod` (install `zod`), set the session with the auto-imported `setUserSession`:

```ts [server/api/login.post.ts]
import { z } from 'zod'

const bodySchema = z.object({
  email: z.email(),
  password: z.string().min(8),
})

export default defineEventHandler(async (event) => {
  const { email, password } = await readValidatedBody(event, bodySchema.parse)

  if (email === 'admin@admin.com' && password === 'iamtheadmin') {
    await setUserSession(event, { user: { name: 'John Doe' } })
    return {}
  }
  throw createError({ status: 401, message: 'Bad credentials' })
})
```

## Login page

`useUserSession()` exposes `{ loggedIn, session, user, clear, fetch }`. POST credentials, refresh session, redirect:

```vue [app/pages/login.vue]
<script setup lang="ts">
const { fetch: refreshSession } = useUserSession()
const credentials = reactive({ email: '', password: '' })

async function login () {
  try {
    await $fetch('/api/login', { method: 'POST', body: credentials })
    await refreshSession()
    await navigateTo('/')
  } catch {
    alert('Bad credentials')
  }
}
</script>

<template>
  <form @submit.prevent="login">
    <input v-model="credentials.email" type="email" placeholder="Email">
    <input v-model="credentials.password" type="password" placeholder="Password">
    <button type="submit">Login</button>
  </form>
</template>
```

## Protect API routes (critical)

Server-side protection is mandatory for sensitive data — client middleware alone is not enough. Use `requireUserSession` (throws 401 if no valid session):

```ts [server/api/user/stats.get.ts]
export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  // fetch stats for user
  return {}
})
```

## Protect app routes (client)

Client middleware is not auto-applied — specify where. Redirect unauthenticated users:

```ts [app/middleware/authenticated.ts]
export default defineNuxtRouteMiddleware(() => {
  const { loggedIn } = useUserSession()
  if (!loggedIn.value) {
    return navigateTo('/login')
  }
})
```

Apply via `definePageMeta` on the protected page; `clear()` logs out:

```vue [app/pages/index.vue]
<script setup lang="ts">
definePageMeta({ middleware: ['authenticated'] })
const { user, clear: clearSession } = useUserSession()
async function logout () {
  await clearSession()
  await navigateTo('/login')
}
</script>

<template>
  <div>
    <h1>Welcome {{ user.name }}</h1>
    <button @click="logout">Logout</button>
  </div>
</template>
```

## Next steps
20+ OAuth providers; database via Nitro SQL or NuxtHub SQL; email/password with password hashing; WebAuthn/Passkeys. Full example: the [atidone](https://github.com/atinux/atidone) repo.

## Referência

- [Sessions and Authentication](https://nuxt.com/docs/4.x/guide/recipes/sessions-and-authentication) — doc oficial Nuxt v4
