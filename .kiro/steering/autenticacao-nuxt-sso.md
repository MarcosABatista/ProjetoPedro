---
inclusion: manual
name: autenticacao-nuxt-sso
description: Guia completo e portável para implementar autenticação OAuth/OIDC (SSO) em projetos Nuxt do zero usando nuxt-auth-utils, com padrão BFF, armazenamento server-side de tokens, refresh token opcional, proteção de rotas (server e client middleware), validação de input, autorização (nuxt-authorization) e alternativas (credenciais, password hashing, WebAuthn/passkeys). Ativar ao iniciar/implementar login, logout, sessão, proteção de rotas/páginas, SSO ou Keycloak em um projeto Nuxt.
---

# Autenticação Nuxt + SSO (OAuth/OIDC) com nuxt-auth-utils

Guia **portável e do-zero** para implementar autenticação em qualquer projeto Nuxt 3/4 que use um provedor de identidade (SSO) via OAuth/OIDC — Keycloak, Auth0, Zitadel, Okta, Azure, Google, ou o provider genérico OIDC.

A base é a lib **`nuxt-auth-utils`** (sessões em cookies selados/criptografados) somada ao padrão **BFF (Backend-for-Frontend)**: tokens grandes ficam server-side, o cookie carrega apenas o essencial.

> Este steering descreve **o que a aplicação Nuxt implementa**. Ele **não** configura, sobe ou administra o servidor de identidade (Keycloak/etc.) — isso é pré-requisito de infraestrutura (ver [§1](#1-pré-requisito-provedor-de-identidade-sso)).

---

## Índice

1. [Pré-requisito: provedor de identidade (SSO)](#1-pré-requisito-provedor-de-identidade-sso)
2. [Instalação](#2-instalação)
3. [Configuração (runtimeConfig + env vars)](#3-configuração-runtimeconfig--env-vars)
4. [Tipagem da sessão](#4-tipagem-da-sessão)
5. [Login OAuth/OIDC](#5-login-oauthoidc)
6. [Armazenamento server-side de tokens (BFF)](#6-armazenamento-server-side-de-tokens-bff)
7. [Logout (com logout no SSO)](#7-logout-com-logout-no-sso)
8. [Consumo no frontend](#8-consumo-no-frontend)
9. [Refresh token opcional (sessão curta + UX contínua)](#9-refresh-token-opcional-sessão-curta--ux-contínua)
10. [Chamar backends externos (audience tokens)](#10-chamar-backends-externos-audience-tokens)
11. [Sincronização de logout entre abas (custo-zero)](#11-sincronização-de-logout-entre-abas-custo-zero)
12. [Autorização (permissões) com nuxt-authorization](#12-autorização-permissões-com-nuxt-authorization)
13. [Validação de env no boot](#13-validação-de-env-no-boot)
14. [Alternativas e complementos ao SSO](#14-alternativas-e-complementos-ao-sso)
15. [Checklist de implementação](#15-checklist-de-implementação)
16. [Referências](#16-referências)

---

## 1. Pré-requisito: provedor de identidade (SSO)

A aplicação Nuxt é apenas o **cliente OAuth**. Antes de implementar, é necessário ter um provedor de identidade **rodando e configurado** por quem cuida da infraestrutura. Oriente o desenvolvedor a garantir que exista:

- Um servidor SSO acessível (Keycloak, Auth0, Zitadel, Okta, etc.).
- Um **realm/tenant** e um **client OAuth** (confidential client — com `clientSecret`) criados.
- **Redirect URI** cadastrado no client apontando para a rota de callback da app: `<origem>/auth/<provider>` (ex.: `http://localhost:3000/auth/keycloak`).
- **Post-logout redirect URI** cadastrado (ex.: `http://localhost:3000`).
- O **scope `profile`** habilitado no client (necessário para receber `name`/`preferred_username` no userinfo — ver [§5](#5-login-oauthoidc)).

> **Fora de escopo deste guia:** subir, configurar ou administrar o Keycloak/SSO. Se o SSO não estiver pronto, o login não funciona — isso é responsabilidade da infra, não da app Nuxt.

---

## 2. Instalação

```bash
# adicionar o módulo
npx nuxi@latest module add auth-utils
# ou, com pnpm, instalar e registrar manualmente no nuxt.config
pnpm add nuxt-auth-utils
```

Registrar no `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  modules: ['nuxt-auth-utils']
})
```

**Requisitos da lib:**

- Requer servidor Nuxt em runtime (`nuxt build`). **Não funciona com `nuxt generate`** (SSG puro), porque usa rotas de API. Hybrid Rendering é suportado.
- Precisa de `NUXT_SESSION_PASSWORD` com **no mínimo 32 caracteres**. Em dev, a lib gera um se ausente; em produção, defina explicitamente.

---

## 3. Configuração (runtimeConfig + env vars)

Toda credencial e endpoint do SSO vem de **variáveis de ambiente** — nunca hardcode secrets no código. O `nuxt-auth-utils` lê `runtimeConfig.oauth.<provider>` automaticamente e o mapeia para env vars `NUXT_OAUTH_<PROVIDER>_*`.

`nuxt.config.ts` (exemplo com Keycloak — troque `keycloak` pelo seu provider):

```ts
export default defineNuxtConfig({
  modules: ['nuxt-auth-utils'],

  runtimeConfig: {
    // Sessão (cookie selado)
    session: {
      // NUXT_SESSION_PASSWORD (>= 32 chars)
      password: '',
      cookie: {
        // false apenas em dev local sem HTTPS; true em produção
        secure: true // NUXT_SESSION_COOKIE_SECURE
      },
      // Tempo de vida do cookie de sessão (ver §9 para estratégia de expiração)
      maxAge: 60 * 60 * 24 * 7 // 1 semana (NUXT_SESSION_MAX_AGE)
    },

    // Provider OAuth/OIDC — chave em lowercase
    oauth: {
      keycloak: {
        clientId: '',      // NUXT_OAUTH_KEYCLOAK_CLIENT_ID
        clientSecret: '',  // NUXT_OAUTH_KEYCLOAK_CLIENT_SECRET
        serverUrl: '',     // NUXT_OAUTH_KEYCLOAK_SERVER_URL — URL pública (browser vê)
        realm: ''          // NUXT_OAUTH_KEYCLOAK_REALM
        // serverUrlInternal — opcional, URL interna p/ chamadas server-to-server (Docker)
      }
    },

    // Flag opcional de refresh token (ver §9)
    authRefreshEnabled: false, // NUXT_AUTH_REFRESH_ENABLED

    public: {
      // Só o que o browser pode ver (nunca secrets)
      ssoBaseUrl: '',   // NUXT_PUBLIC_SSO_BASE_URL — para link "meu perfil" no SSO
      ssoRealm: ''      // NUXT_PUBLIC_SSO_REALM
    }
  }
})
```

`.env.example` (documente as variáveis; **nunca** commite `.env` real):

```bash
# Sessão
NUXT_SESSION_PASSWORD=troque-por-uma-string-com-32-ou-mais-caracteres
NUXT_SESSION_COOKIE_SECURE=true

# SSO / OAuth (secrets — obter da infra/SSO, jamais versionar)
NUXT_OAUTH_KEYCLOAK_CLIENT_ID=
NUXT_OAUTH_KEYCLOAK_CLIENT_SECRET=
NUXT_OAUTH_KEYCLOAK_SERVER_URL=http://localhost:8080
NUXT_OAUTH_KEYCLOAK_REALM=

# Refresh token opcional
NUXT_AUTH_REFRESH_ENABLED=false

# Públicas
NUXT_PUBLIC_SSO_BASE_URL=http://localhost:8080
NUXT_PUBLIC_SSO_REALM=
```

**Providers suportados nativamente** (chave lowercase em `oauth.<provider>` e handler `defineOAuth<Provider>EventHandler`): Keycloak, Auth0, Zitadel, Okta, Ory, Authentik, AWS Cognito, Azure B2C, Microsoft, Google, GitHub, GitLab, Discord, e o genérico **OIDC** (`defineOAuthOIDCEventHandler`), entre 40+. Para SSO corporativo genérico OIDC, use `oauth.oidc`.

**Dev sem HTTPS:** use environment override do Nuxt para relaxar `cookie.secure` só em dev:

```ts
$development: {
  runtimeConfig: {
    session: { cookie: { secure: false } }
  }
}
```

---

## 4. Tipagem da sessão

Crie `auth.d.ts` (ou `shared/types/auth.d.ts`) para tipar a sessão. Mantenha **enxuto** — o cookie tem limite de 4096 bytes (ver [§6](#6-armazenamento-server-side-de-tokens-bff)).

```ts
// auth.d.ts
declare module '#auth-utils' {
  interface User {
    name: string
    // adicione só o necessário para exibição/decisão de UI: roles, email, sub...
  }

  interface SecureSessionData {
    // dados privados, acessíveis apenas em server/ (nunca vão ao browser em claro)
    idToken?: string // necessário para logout limpo no SSO (id_token_hint)
  }
}

export {}
```

---

## 5. Login OAuth/OIDC

O handler `defineOAuth<Provider>EventHandler` redireciona para o SSO, troca o code por tokens, busca o userinfo e chama `onSuccess`. Crie a rota de callback em `server/routes/auth/<provider>.get.ts`.

```ts
// server/routes/auth/keycloak.get.ts
import { consola } from 'consola'

const logger = consola.withTag('auth:login')

export default defineOAuthKeycloakEventHandler({
  config: {
    // ⚠️ CRÍTICO: sem 'profile', o userinfo retorna só `sub` — user.name fica undefined
    scope: ['openid', 'profile']
  },
  async onSuccess(event, { user, tokens }) {
    logger.info('Login OK', user.name || user.preferred_username)

    // Cookie da sessão: SÓ dados leves + idToken (para logout)
    await setUserSession(event, {
      user: {
        name: user.name || user.preferred_username
      },
      secure: {
        idToken: tokens.id_token
      }
    })

    // Tokens grandes (access/refresh) NÃO cabem no cookie → storage server-side (§6)
    const sessao = await getUserSession(event)
    await armazenarTokens(event, sessao.id as string, {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiraEm: Date.now() + (tokens.expires_in ?? 300) * 1000,
      tipo: 'keycloak'
    })

    return sendRedirect(event, '/')
  },
  // Opcional: por padrão retorna 401 JSON
  onError(event, error) {
    logger.error('Erro no login OAuth', error)
    return sendRedirect(event, '/')
  }
})
```

**Por que `user.name` pode vir `undefined`:** o `nuxt-auth-utils` solicita apenas `openid` por padrão. Três condições precisam ser satisfeitas para receber o nome:

1. O handler solicitar `scope: ['openid', 'profile']`.
2. O scope `profile` existir no realm/tenant do SSO.
3. O client ter `profile` nos default scopes (condições 2 e 3 são de configuração da infra/SSO).

O objeto `user` é exatamente o JSON do endpoint `/protocol/openid-connect/userinfo` (Keycloak) ou equivalente do provider.

**Redirect URL:** cadastre `<origem>/auth/keycloak` no client do SSO. Se em produção a lib não adivinhar a URL correta, defina `NUXT_OAUTH_KEYCLOAK_REDIRECT_URL`.

---

## 6. Armazenamento server-side de tokens (BFF)

### O problema do cookie de 4096 bytes

`nuxt-auth-utils` criptografa a sessão e a guarda em cookie. Cookies têm limite rígido de **4096 bytes** e o browser **descarta silenciosamente** (sem erro, sem log) cookies acima disso. Um `accessToken` + `refreshToken` JWT do Keycloak facilmente estoura o limite.

**Regra de ouro:** o cookie carrega apenas dados leves (`user.name`, `secure.idToken`). Tokens de acesso/refresh vão para o **Nitro Storage** (key-value server-side), indexados pelo `session.id`.

### Utilitário `server/utils/tokenStorage.ts`

Auto-importado em todo `server/`:

```ts
// server/utils/tokenStorage.ts
import type { H3Event } from 'h3'

const STORAGE_BASE = 'tokens'

export interface TokensArmazenados {
  accessToken: string
  refreshToken?: string
  expiraEm?: number // timestamp em ms de expiração do accessToken
  tipo?: string
}

export async function armazenarTokens(event: H3Event, sessionId: string, tokens: TokensArmazenados): Promise<void> {
  await useStorage(STORAGE_BASE).setItem(sessionId, tokens)
}

export async function obterTokens(event: H3Event, sessionId: string): Promise<TokensArmazenados | null> {
  return await useStorage(STORAGE_BASE).getItem<TokensArmazenados>(sessionId)
}

export async function removerTokens(event: H3Event, sessionId: string): Promise<void> {
  await useStorage(STORAGE_BASE).removeItem(sessionId)
}

/**
 * Helper principal para rotas BFF: retorna o accessToken da sessão atual
 * ou lança 401. Use-o sempre que uma rota server precisar chamar um backend.
 */
export async function obterAccessTokenDaSessao(event: H3Event): Promise<string> {
  const sessao = await requireUserSession(event)
  const sessionId = sessao.id as string
  if (!sessionId) throw createError({ status: 401, statusText: 'Sessão inválida' })

  const tokens = await obterTokens(event, sessionId)
  if (!tokens?.accessToken) throw createError({ status: 401, statusText: 'Token não encontrado' })

  return tokens.accessToken
}
```

### Driver do storage

- **Dev:** driver `memory` (zero config). Configure via `$development` no `nuxt.config.ts`:

  ```ts
  $development: {
    nitro: { storage: { tokens: { driver: 'memory' } } }
  }
  ```

- **Produção com múltiplas réplicas:** o storage **precisa ser compartilhado** (Redis, KV), senão uma réplica não enxerga a sessão criada por outra. O Nitro congela `nitro.storage` no build, então monte o driver em runtime via plugin:

  ```ts
  // server/plugins/storage-redis.ts
  import redisDriver from 'unstorage/drivers/redis'

  export default defineNitroPlugin(() => {
    if (import.meta.dev) return
    const url = process.env.NITRO_STORAGE_TOKENS_URL
    if (!url) return
    useStorage().mount('tokens', redisDriver({ url }))
  })
  ```

### Padrão para rotas BFF

```ts
// server/api/meu-recurso.get.ts
export default defineEventHandler(async (event) => {
  const accessToken = await obterAccessTokenDaSessao(event)
  return await $fetch('https://api.backend.com/recurso', {
    headers: { Authorization: `Bearer ${accessToken}` }
  })
})
```

---

## 7. Logout (com logout no SSO)

Logout completo: limpar tokens server-side, limpar cookie de sessão e encerrar a sessão **no SSO** (senão o próximo login é automático via SSO ainda logado).

```ts
// server/routes/auth/logout.get.ts
export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const idToken = session?.secure?.idToken
  const sessionId = session?.id as string | undefined

  if (sessionId) await removerTokens(event, sessionId)
  await clearUserSession(event)

  const config = useRuntimeConfig(event)
  const { serverUrl, realm, clientId } = config.oauth.keycloak

  const logoutUrl = new URL(`${serverUrl}/realms/${realm}/protocol/openid-connect/logout`)
  logoutUrl.searchParams.set('post_logout_redirect_uri', getRequestURL(event).origin)
  logoutUrl.searchParams.set('client_id', clientId)
  if (idToken) logoutUrl.searchParams.set('id_token_hint', idToken)

  return sendRedirect(event, logoutUrl.toString())
})
```

> Use `getRequestURL(event).origin` em vez de hardcode `http://localhost:3000` para o redirect funcionar em qualquer ambiente. Garanta que a origem esteja na whitelist de post-logout do client no SSO.

---

## 8. Consumo no frontend

### Composable `useUserSession()` (auto-importado)

```vue
<script setup lang="ts">
const { loggedIn, user, session, fetch, clear, ready } = useUserSession()
</script>

<template>
  <div v-if="loggedIn">
    <p>Olá, {{ user.name }}</p>
    <button @click="() => navigateTo('/auth/logout', { external: true })">Sair</button>
  </div>
  <a v-else href="/auth/keycloak">Entrar</a>
</template>
```

### `<AuthState>` para páginas cacheadas/prerenderizadas

Quando a rota é cacheada/prerenderizada ou a sessão é carregada só no client, use `<AuthState>` para evitar flicker/hidratação incorreta:

```vue
<template>
  <AuthState v-slot="{ loggedIn }">
    <UserMenu v-if="loggedIn" />
    <a v-else href="/auth/keycloak">Entrar</a>
    <template #placeholder>
      <span>Carregando…</span>
    </template>
  </AuthState>
</template>
```

### Rebuscar a sessão no client (`fetch`)

Após qualquer mudança de estado de auth feita fora do fluxo OAuth (ex.: um endpoint próprio que alterou a sessão), rebusque a sessão no client para sincronizar o composable:

```ts
const { fetch: refreshSession } = useUserSession()
await refreshSession()
```

### Requisições autenticadas no SSR

`useFetch` encaminha cookies automaticamente no SSR. Com `useAsyncData`, use `useRequestFetch()`:

```ts
const { data } = await useFetch('/api/protegido')
// ou
const { data } = await useAsyncData('x', () => useRequestFetch()('/api/protegido'))
```

### Proteger rotas — server é obrigatório, client é UX

⚠️ **A proteção que realmente importa é a do servidor.** Middleware client-side melhora a experiência (redireciona para o login), mas **não protege dados**: uma requisição forjada (curl, fetch direto) ignora o client. Toda rota server com dado sensível **deve** validar a sessão.

**Server (obrigatório)** — `requireUserSession` lança 401 automaticamente:

```ts
// server/api/user/stats.get.ts
export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event) // 401 se não autenticado
  // ... usa user.name / user.sub
  return {}
})
```

**Client (UX)** — middleware + aplicação por página via `definePageMeta`:

```ts
// app/middleware/autenticado.ts
export default defineNuxtRouteMiddleware(() => {
  const { loggedIn } = useUserSession()
  if (!loggedIn.value) return navigateTo('/auth/keycloak', { external: true })
})
```

```vue
<!-- app/pages/painel.vue -->
<script setup lang="ts">
definePageMeta({ middleware: ['autenticado'] })
</script>
```

> Middleware client não é aplicado automaticamente a todas as rotas — aplique-o por página com `definePageMeta({ middleware: [...] })`, ou torne-o global com o sufixo `.global.ts`.

### Validar input em rotas server próprias

Rotas server que recebem body (login por credenciais, ações mutantes, BFF que repassa dados) devem validar a entrada. Use `readValidatedBody` com `zod` — nunca confie no formato vindo do client:

```ts
// server/api/exemplo.post.ts
import { z } from 'zod'

const schema = z.object({
  email: z.email(),
  password: z.string().min(8)
})

export default defineEventHandler(async (event) => {
  const { email, password } = await readValidatedBody(event, schema.parse)
  // ... entrada validada; erro de parse vira 400 automaticamente
})
```

---

## 9. Refresh token opcional (sessão curta + UX contínua)

**Objetivo (opcional, ativável por env var `NUXT_AUTH_REFRESH_ENABLED`):** ter um access token de vida curta (ex.: **15 min**) com um refresh token de vida longa (ex.: **5 dias**). Enquanto o usuário usa o sistema de forma contínua, o token é renovado transparentemente **antes de expirar** — o usuário final nunca é jogado para a tela de login nem perde trabalho. Só refaz login se ficar inativo além da validade do refresh token.

> **Segurança:** o refresh token **nunca** sai do servidor. Só o accessToken (e `expiresIn`) chega ao browser. Isso limita o dano de um vazamento no client — um accessToken de 15 min expira sozinho.

### 9.1 Endpoint de refresh (server)

```ts
// server/api/auth/refresh.post.ts
import { consola } from 'consola'
import type { TokensArmazenados } from '~/server/utils/tokenStorage'

const logger = consola.withTag('auth:refresh')

export default defineEventHandler(async (event) => {
  const sessao = await requireUserSession(event)
  const sessionId = sessao.id as string
  if (!sessionId) throw createError({ status: 401, statusText: 'Sessão inválida' })

  const tokens = await obterTokens(event, sessionId)
  if (!tokens?.refreshToken) throw createError({ status: 401, statusText: 'Refresh token ausente' })

  const config = useRuntimeConfig(event)
  const { serverUrlInternal, serverUrl, realm, clientId, clientSecret } = config.oauth.keycloak
  const baseUrl = serverUrlInternal || serverUrl
  const tokenEndpoint = `${baseUrl}/realms/${realm}/protocol/openid-connect/token`

  let resp: { access_token: string; refresh_token: string; expires_in: number }
  try {
    resp = await $fetch(tokenEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: tokens.refreshToken
      }).toString(),
      timeout: 5000
    })
  } catch (error: any) {
    // Refresh expirado/inválido → encerra sessão
    logger.warn('Falha ao renovar', error?.data?.error || error.message)
    await removerTokens(event, sessionId)
    await clearUserSession(event)
    throw createError({ status: 401, statusText: 'Sessão expirada — refaça login' })
  }

  const novos: TokensArmazenados = {
    accessToken: resp.access_token,
    refreshToken: resp.refresh_token, // Keycloak faz rotação — guarde o novo
    expiraEm: Date.now() + resp.expires_in * 1000,
    tipo: 'keycloak'
  }
  await armazenarTokens(event, sessionId, novos)

  // NUNCA retornar refreshToken ao browser
  return { accessToken: resp.access_token, expiresIn: resp.expires_in }
})
```

### 9.2 Endpoint que entrega o accessToken (renova inline se preciso)

```ts
// server/api/auth/token.get.ts
export default defineEventHandler(async (event) => {
  const sessao = await requireUserSession(event)
  const sessionId = sessao.id as string
  const tokens = await obterTokens(event, sessionId)
  if (!tokens?.accessToken) throw createError({ status: 401, statusText: 'Token não encontrado' })

  const MARGEM_MS = 30_000 // renova 30s antes de expirar
  if (tokens.expiraEm && Date.now() >= tokens.expiraEm - MARGEM_MS) {
    // reaproveitar a lógica do refresh.post (renovar e rearmazenar)
    // se não houver refreshToken ou refresh falhar → clearUserSession + 401
  }

  const expiresIn = tokens.expiraEm ? Math.max(0, Math.floor((tokens.expiraEm - Date.now()) / 1000)) : 300
  return { accessToken: tokens.accessToken, expiresIn }
})
```

### 9.3 Composable de token no client (em memória, nunca localStorage)

```ts
// app/composables/useAccessToken.ts
export function useAccessToken() {
  const accessToken = useState<string | null>('accessToken', () => null)
  const expiraEm = useState<number | null>('tokenExpiraEm', () => null)

  function definirToken(token: string, duracaoSegundos: number) {
    accessToken.value = token
    expiraEm.value = Date.now() + duracaoSegundos * 1000
  }
  function limparToken() { accessToken.value = null; expiraEm.value = null }

  function estaExpirandoEmBreve(): boolean {
    if (!expiraEm.value) return true
    return Date.now() >= expiraEm.value - 30_000
  }

  async function renovarToken(): Promise<void> {
    try {
      const r = await $fetch<{ accessToken: string; expiresIn: number }>('/api/auth/refresh', { method: 'POST' })
      definirToken(r.accessToken, r.expiresIn)
    } catch {
      limparToken()
      await navigateTo('/auth/keycloak', { external: true })
    }
  }

  return { accessToken: readonly(accessToken), definirToken, limparToken, estaExpirandoEmBreve, renovarToken }
}
```

> **Nunca** persista o accessToken em `localStorage`/`sessionStorage`/cookie do browser — apenas em memória reativa (`useState`). Após reload, rebusque via `GET /api/auth/token`.

### 9.4 Estratégia de expiração e como tornar opcional

- **Sessão curta (cookie) + refresh longo:** ajuste `session.maxAge` e a validade dos tokens no SSO. O refresh mantém a sessão viva enquanto usada.
- **Ativação por flag:** proteja a montagem das rotas/composables de refresh atrás de `useRuntimeConfig().authRefreshEnabled`. Se `false`, a app funciona com sessão simples (sem renovação) e o usuário refaz login quando o access token expira. Se `true`, ativa a renovação transparente descrita aqui.
- **Renovação proativa vs. reativa:** o `useFetchAutenticado` (§10) renova **proativamente** (antes de expirar, margem 30s) e faz **retry reativo** uma vez em caso de 401.

**Alternativa custo-zero à renovação por polling:** nunca use `setInterval` batendo em `/api/auth/refresh`. Renove sob demanda (antes de cada chamada autenticada) e no `visibilitychange` (quando o usuário volta à aba). Isso evita N requisições/minuto × N usuários (ver §11).

---

## 10. Chamar backends externos (audience tokens)

Quando o frontend chama backends que validam o JWT do SSO (audience tokens), obtenha o accessToken via BFF e injete `Bearer`. Renove proativamente e faça retry em 401.

```ts
// app/composables/useFetchAutenticado.ts
export function useFetchAutenticado() {
  const { accessToken, estaExpirandoEmBreve, renovarToken } = useAccessToken()

  async function fetchComToken<T>(url: string, opts?: Parameters<typeof $fetch>[1]): Promise<T> {
    if (estaExpirandoEmBreve()) await renovarToken()
    if (!accessToken.value) throw new Error('Não autenticado')

    const headers = { ...opts?.headers, Authorization: `Bearer ${accessToken.value}` }
    try {
      return await $fetch<T>(url, { ...opts, headers })
    } catch (error: any) {
      if (error?.response?.status === 401) {
        await renovarToken()
        if (!accessToken.value) throw error
        return await $fetch<T>(url, { ...opts, headers: { ...opts?.headers, Authorization: `Bearer ${accessToken.value}` } })
      }
      throw error
    }
  }

  return { fetchComToken }
}
```

> Se o backend for do mesmo domínio/BFF, prefira o padrão da §6 (token nunca chega ao browser). Exponha o accessToken ao client **apenas** quando houver chamada direta frontend→backend externo.

---

## 11. Sincronização de logout entre abas (custo-zero)

Quando o usuário faz logout em uma aba, as outras devem refletir isso sem polling. Use `BroadcastChannel` (+ fallback `storage` event) e verifique a sessão no `visibilitychange`.

```ts
// app/plugins/sincronizar-logout.client.ts
export default defineNuxtPlugin(() => {
  const { loggedIn, clear } = useUserSession()
  const canal = new BroadcastChannel('app:logout')

  canal.onmessage = async (e) => {
    if (e.data === 'logout' && loggedIn.value) {
      await clear()
      await navigateTo('/', { external: true })
    }
  }

  // fallback storage event
  window.addEventListener('storage', (e) => {
    if (e.key === 'app:logout-signal' && e.newValue === 'true' && loggedIn.value) {
      clear().then(() => navigateTo('/', { external: true }))
    }
  })

  // verifica sessão ao voltar à aba (1 request pontual, não contínuo)
  document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState !== 'visible' || !loggedIn.value) return
    try {
      const { autenticado } = await $fetch<{ autenticado: boolean }>('/api/sessao/status')
      if (!autenticado) { await clear(); await navigateTo('/', { external: true }) }
    } catch { /* rede: ignora, tenta na próxima */ }
  })
})
```

No botão de logout, sinalize as abas **antes** de redirecionar:

```ts
function encerrarSessao() {
  const canal = new BroadcastChannel('app:logout')
  canal.postMessage('logout'); canal.close()
  localStorage.setItem('app:logout-signal', 'true')
  localStorage.removeItem('app:logout-signal')
  navigateTo('/auth/logout', { external: true })
}
```

Endpoint leve de status (para o `visibilitychange`):

```ts
// server/api/sessao/status.get.ts
export default defineEventHandler(async (event) => {
  const sessao = await getUserSession(event)
  const sessionId = sessao?.id as string | undefined
  if (!sessao?.user || !sessionId) return { autenticado: false }

  const tokens = await obterTokens(event, sessionId)
  if (!tokens?.accessToken) { await clearUserSession(event); return { autenticado: false } }
  if (tokens.expiraEm && Date.now() > tokens.expiraEm) {
    await removerTokens(event, sessionId); await clearUserSession(event); return { autenticado: false }
  }
  return { autenticado: true }
})
```

> **Regra custo-zero:** proibido polling periódico (`setInterval` + `$fetch`), WebSocket/SSE só para isso, ou heartbeat. Multiplique qualquer request recorrente por centenas de usuários antes de aceitar. Prefira `BroadcastChannel`, `storage` event e `visibilitychange`.

---

## 12. Autorização (permissões) com nuxt-authorization

`nuxt-auth-utils` cuida da **autenticação** (quem é o usuário). Para **autorização** (o que ele pode fazer), use `nuxt-authorization` — provê primitivas para escrever regras uma vez e usá-las no client e no server. Não impõe RBAC/ACL; você modela a lógica.

```bash
npx nuxi module add nuxt-authorization
```

**Resolvers** (conectam a lib à sessão do nuxt-auth-utils):

```ts
// app/plugins/authorization-resolver.ts
export default defineNuxtPlugin({
  name: 'authorization-resolver',
  parallel: true,
  setup() {
    return { provide: { authorization: { resolveClientUser: () => useUserSession().user.value } } }
  }
})
```

```ts
// server/plugins/authorization-resolver.ts
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('request', (event) => {
    event.context.$authorization = {
      resolveServerUser: async () => (await getUserSession(event)).user ?? null
    }
  })
})
```

**Abilities** (em `shared/utils/abilities.ts` — auto-import no client, import simples no server):

```ts
export const editarPost = defineAbility((user: User, post: Post) => {
  if (user.id === post.authorId) return true
  return deny('Post não encontrado', 404) // esconde existência do recurso
})
```

**No server** (autoriza ou lança H3Error automaticamente):

```ts
export default defineEventHandler(async (event) => {
  const post = await buscarPost(event)
  await authorize(event, editarPost, post)
  // ... segue autorizado
})
```

**No client** (renderização condicional):

```vue
<Can :ability="editarPost" :args="[post]">
  <UButton label="Editar" />
</Can>
```

> **SecOps:** autorização **sempre** verificada no servidor. Ter o ID de um recurso não implica permissão (evite IDOR). O client usa `Can`/`allows` só para UX; a decisão que protege dados é a do `authorize(event, ...)` no handler.

---

## 13. Validação de env no boot

Falhe rápido em produção se faltar env obrigatória — evita a app subir "funcionando" e quebrar no primeiro login.

```ts
// server/plugins/validar-env.ts
import { consola } from 'consola'
const logger = consola.withTag('env:validacao')

export default defineNitroPlugin(() => {
  if (import.meta.dev) return
  const c = useRuntimeConfig()
  const k = c.oauth.keycloak as Record<string, string>

  const obrigatorias = [
    ['NUXT_SESSION_PASSWORD', c.session.password as string],
    ['NUXT_OAUTH_KEYCLOAK_CLIENT_ID', k.clientId],
    ['NUXT_OAUTH_KEYCLOAK_CLIENT_SECRET', k.clientSecret],
    ['NUXT_OAUTH_KEYCLOAK_SERVER_URL', k.serverUrl],
    ['NUXT_OAUTH_KEYCLOAK_REALM', k.realm]
  ]
  const faltando = obrigatorias.filter(([, v]) => !v).map(([nome]) => nome)

  if (faltando.length) {
    logger.fatal('Env obrigatórias ausentes:\n' + faltando.map(n => `  - ${n}`).join('\n'))
    throw new Error(`[env:validacao] Faltam ${faltando.length} variável(is) de ambiente.`)
  }
})
```

---

## 14. Alternativas e complementos ao SSO

Este guia foca em **SSO OAuth/OIDC**, mas `nuxt-auth-utils` também cobre outros modos de autenticação que podem coexistir com o SSO no mesmo app (a sessão é a mesma — muda só como o usuário prova identidade):

- **Login por credenciais (email/senha):** crie uma rota `server/api/login.post.ts` que valida o body (`readValidatedBody` + `zod`), confere as credenciais e chama `setUserSession`. No client, após o `$fetch('/api/login')`, chame `useUserSession().fetch()` e redirecione. Exige uma base de usuários (DB).
- **Password hashing:** a lib fornece `hashPassword`, `verifyPassword` e `passwordNeedsRehash` (scrypt) para armazenar senhas com segurança — nunca guarde senha em texto puro.
- **WebAuthn / Passkeys:** autenticação sem senha (biometria/chave física) via `defineWebAuthnRegisterEventHandler` / `defineWebAuthnAuthenticateEventHandler` (habilite `auth: { webAuthn: true }`). Recomendado usar challenges (`storeChallenge`/`getChallenge`) contra replay.
- **Persistência de usuários:** para credenciais/passkeys é preciso um banco. Considere Nitro SQL Database ou o storage já usado para tokens (§6).
- **`sessionHooks`** para estender/invalidar a sessão no servidor:

  ```ts
  // server/plugins/session.ts
  export default defineNitroPlugin(() => {
    sessionHooks.hook('fetch', async (session, event) => {
      // enriquecer a sessão (ex.: buscar roles atualizadas) ou invalidar via throw
    })
    sessionHooks.hook('clear', async (session, event) => {
      // cleanup/auditoria no logout
    })
  })
  ```

> Estes são caminhos alternativos/complementares. Para o cenário SSO puro deste guia, nada disso é obrigatório.

---

## 15. Checklist de implementação

Autenticação:

- [ ] `nuxt-auth-utils` instalado e no `modules`
- [ ] `NUXT_SESSION_PASSWORD` (>= 32 chars) definido; `cookie.secure=true` em produção
- [ ] `runtimeConfig.oauth.<provider>` com credenciais **via env var** (nenhum secret no código)
- [ ] Handler de login em `server/routes/auth/<provider>.get.ts` com `scope: ['openid','profile']`
- [ ] `auth.d.ts` tipando `User`/`SecureSessionData` — cookie enxuto (< 4096 bytes)
- [ ] Access/refresh tokens em Nitro Storage (nunca no cookie); helper `obterAccessTokenDaSessao`
- [ ] Storage compartilhado (Redis/KV) se houver múltiplas réplicas em produção
- [ ] Logout limpa storage + cookie + encerra sessão no SSO (`id_token_hint`, `post_logout_redirect_uri`)
- [ ] Redirect URI e post-logout URI cadastrados no client do SSO
- [ ] Validação de env no boot (produção)

Refresh token (se `NUXT_AUTH_REFRESH_ENABLED=true`):

- [ ] `refreshToken` **nunca** aparece em resposta HTTP
- [ ] Endpoint `/api/auth/refresh` renova e rearmazena; falha → `clearUserSession` + 401
- [ ] Access token no client apenas em memória (`useState`), nunca em storage do browser
- [ ] Renovação **proativa** (margem ~30s) + retry reativo único em 401
- [ ] Sem polling — renovação sob demanda + `visibilitychange` (custo-zero)

Autorização (se aplicável):

- [ ] `nuxt-authorization` com resolvers client/server ligados à sessão
- [ ] Abilities em `shared/utils/abilities.ts`
- [ ] `authorize(event, ...)` no servidor para todo recurso sensível (anti-IDOR)
- [ ] `Can`/`Cannot`/`Bouncer` só para UX no client (não é a proteção real)

---

## 16. Referências

- Nuxt — Sessions and Authentication (receita oficial): https://nuxt.com/docs/4.x/guide/recipes/sessions-and-authentication
- Nuxt — client-side middleware: https://nuxt.com/docs/4.x/directory-structure/app/middleware
- Nuxt — `definePageMeta`: https://nuxt.com/docs/4.x/api/utils/define-page-meta
- nuxt-auth-utils (README oficial): https://raw.githubusercontent.com/atinux/nuxt-auth-utils/refs/heads/main/README.md
- nuxt-auth-utils (npm): https://www.npmjs.com/package/nuxt-auth-utils
- nuxt-authorization (README oficial): https://raw.githubusercontent.com/Barbapapazes/nuxt-authorization/refs/heads/main/README.md
- Authorization in Nuxt (Estéban Soubiran): https://soubiran.dev/posts/nuxt-going-full-stack-how-to-handle-authorization
- Demo OAuth (atidone): https://github.com/atinux/atidone
- Nuxt — Hybrid Rendering: https://nuxt.com/docs/guide/concepts/rendering#hybrid-rendering

> Conteúdo dos READMEs oficiais foi resumido e reescrito para conformidade com licenciamento.
