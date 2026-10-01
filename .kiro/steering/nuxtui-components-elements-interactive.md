---
inclusion: fileMatch
fileMatchPattern: ["app/**/*.vue", "app/components/**/*.vue", "app/pages/**/*.vue", "app/layouts/**/*.vue"]
name: Nuxt UI Elements — Button, Link, Icon, Avatar, AvatarGroup
description: Use ao construir Button, Link, Icon, Avatar ou AvatarGroup no Nuxt UI v4 — botões, links wrapper de NuxtLink, ícones Iconify e avatares.
---
# Nuxt UI — Elements (Button, Link, Icon, Avatar, AvatarGroup)

## Button — `UButton`
Botão / link estilizado. `A button element that can act as a link or trigger an action.`
```vue
<template>
  <UButton label="Salvar" color="primary" variant="solid" size="md" icon="i-lucide-check" />
  <UButton to="/docs" trailing-icon="i-lucide-arrow-right" variant="link">Docs</UButton>
  <UButton :loading-auto="true" @click="asyncFn">Enviar</UButton>
</template>
```
Props: `label` (ou slot default), `color` (`primary` default), `variant` (`solid` default | `outline` | `soft` | `subtle` | `ghost` | `link`), `size` (xs–xl), `icon`/`leadingIcon`/`trailingIcon`, `avatar`, `loading` + `loadingIcon` + `loadingAuto` (loading automático pela promise do `@click`), `disabled`, `square` (padding igual — botão só-ícone), `block` (largura total), `activeColor`/`activeVariant` (quando usado como link ativo), `as`, `ui`. Aceita todas as props de `ULink` (`to`, `target`, `type`...). Slots: `leading`, `default`/`label`, `trailing`. Emits: `click`.

## Link — `ULink`
Wrapper do NuxtLink/`<a>` com estados ativo. `A wrapper around <NuxtLink> with extra props.`
```vue
<template>
  <ULink to="/about" active-class="text-primary" inactive-class="text-muted">Sobre</ULink>
</template>
```
Props: `to`, `type` (`button` quando não é link), `disabled`, `active` (força ativo), `exact`, `exactQuery` (bool | `'partial'`), `exactHash`, `activeClass`, `inactiveClass`, `custom`, `as` (`button` default quando não link), + props do NuxtLink (`target`, `rel`, `prefetch`...). Slot: `default` (recebe `{ active }` no modo custom). Integra i18n (4.7+): links internos localizados via `$localePath` automaticamente. Base do sistema de links — Breadcrumb/NavigationMenu/DropdownMenu/Button aceitam essas props nos itens.

## Icon — `UIcon`
Ícone Iconify. `A component to display any icon from Iconify.`
```vue
<template>
  <UIcon name="i-lucide-lightbulb" class="size-5" />
</template>
```
Props: `name` (string `i-{coleção}-{nome}`, ex.: `i-lucide-x`, `i-simple-icons-github`; ou componente de ícone), `mode` (`svg` | `css`), `size`, `customize` (callback IconifyIconCustomizeCallback). Tamanho/cor via `class` (`size-5`, `text-primary`). Suporta componentes custom e `unplugin-icons` (`~icons/lucide/lightbulb`). Requer módulo `@nuxt/icon` (incluso no Nuxt UI).

## Avatar — `UAvatar`
Imagem/inicial de usuário. `An img element with fallback and Nuxt Image support.`
```vue
<template>
  <UAvatar src="https://github.com/nuxt.png" alt="Nuxt" loading="lazy" size="lg" />
  <UAvatar icon="i-lucide-user" />
  <UAvatar text="JP" color="primary" />
</template>
```
Props: `src`, `alt`, `icon` (fallback), `text` (fallback iniciais), `size` (3xs–3xl), `color` (`neutral` default — fallback), `chip` (bool | ChipProps — indicador de status), `loading` (`lazy` | `eager`), + atributos img nativos (`srcset`, `sizes`, `width`, `height`, `decoding`, `crossorigin`, `referrerpolicy`, `usemap`), `as`, `ui`. Fallback: imagem → ícone → texto. Máscara custom via CSS `mask-image` (`class="rounded-none squircle"`).

## AvatarGroup — `UAvatarGroup`
Pilha de avatares sobrepostos. `Stack multiple avatars in a group.`
```vue
<template>
  <UAvatarGroup :max="3" size="md">
    <UAvatar src="..." alt="A" loading="lazy" />
    <UAvatar src="..." alt="B" loading="lazy" />
    <UAvatar src="..." alt="C" loading="lazy" />
    <UAvatar src="..." alt="D" loading="lazy" />
  </UAvatarGroup>
</template>
```
Props: `max` (número máximo exibido — excedente vira `+N`), `size` (aplicado a todos), `color`, `as`, `ui`. Slot: `default` (avatares filhos). Nota: `chip` no avatar não funciona bem com máscara CSS.

## a11y
Button/Link: elementos semânticos (`<button>`/`<a>`), estados `disabled`/`loading`, foco visível. Avatar: sempre fornecer `alt`. Icon: decorativo por padrão — adicionar `aria-label` quando o ícone carrega significado sozinho.

## Referência

- [Button](https://ui.nuxt.com/docs/components/button)
- [Link](https://ui.nuxt.com/docs/components/link)
- [Icon](https://ui.nuxt.com/docs/components/icon)
- [Avatar](https://ui.nuxt.com/docs/components/avatar)
- [AvatarGroup](https://ui.nuxt.com/docs/components/avatar-group)
- [Todos os componentes](https://ui.nuxt.com/docs/components)
