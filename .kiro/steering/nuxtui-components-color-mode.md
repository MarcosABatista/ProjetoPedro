---
inclusion: fileMatch
fileMatchPattern: ["app/**/*.vue", "app/components/**/*.vue", "app/pages/**/*.vue", "app/layouts/**/*.vue"]
name: nuxtui-color-mode
description: Componentes Nuxt UI v4 para alternar/adaptar tema light/dark (button, switch, select, avatar, image). Usar ao adicionar toggle de dark mode ou assets que mudam por color mode.
---
# Nuxt UI — Color Mode Components

Componentes para alternar entre light/dark mode e servir assets por tema: `ColorModeButton`, `ColorModeSwitch`, `ColorModeSelect`, `ColorModeAvatar`, `ColorModeImage`.

Ícones globais via `app.config.ts` (Nuxt) ou `vite.config.ts` (Vue) em `ui.icons`: `light`, `dark`, `system`.
```ts
// app.config.ts
export default defineAppConfig({
  ui: { icons: { system: 'i-ph-desktop', light: 'i-ph-sun', dark: 'i-ph-moon' } }
})
```

## ColorModeButton
Botão toggle light/dark. Estende [Button](https://ui.nuxt.com/docs/components/button). Defaults `color='neutral' variant='ghost'`. Props: `color`, `variant`, `size`, `as`, todos os props/atributos de Button.
```vue
<UColorModeButton />
```

## ColorModeSwitch
Switch toggle light/dark. Estende [Switch](https://ui.nuxt.com/docs/components/switch). Props: `color` (default `primary`), `size`, `disabled`, `highlight`, `label`, `description`, etc.
```vue
<UColorModeSwitch />
```

## ColorModeSelect
Select para escolher system/dark/light. Estende [SelectMenu](https://ui.nuxt.com/docs/components/select-menu). Props: `color` (default `primary`), `variant` (`ghost`|`outline`|`soft`|`subtle`|`none`, default `outline`), `size`, `trailingIcon` (`chevron-down`), `portal`, `content`, `arrow`, `highlight`, `disabled`.
```vue
<UColorModeSelect />
```

## ColorModeAvatar
Avatar com src diferente por tema. Estende [Avatar](https://ui.nuxt.com/docs/components/avatar). Props obrigatórios: `light`, `dark` (URLs). Também: `size`, `icon`, `text`, `color` (default `neutral`), `chip`, atributos nativos de `<img>` (`alt`, `loading`, etc.).
```vue
<UColorModeAvatar light="https://github.com/vuejs.png" dark="https://github.com/nuxt.png" />
```

## ColorModeImage
Imagem com src diferente por tema. Usa `<NuxtImg>` se @nuxt/image instalado, senão `<img>`. Props obrigatórios: `light`, `dark`. Também: `width`, `height`, `alt`, `loading`, `sizes`, `srcset`, atributos nativos de `<img>`.
```vue
<UColorModeImage light="/light.png" dark="/dark.png" :width="200" :height="200" />
```

Nota: os componentes só refletem a troca em runtime; alternar o modo via ColorModeButton/Switch/Select atualiza button/switch/select e as fontes de avatar/image.

## Referência

- [ColorModeButton](https://ui.nuxt.com/docs/components/color-mode-button)
- [ColorModeSwitch](https://ui.nuxt.com/docs/components/color-mode-switch)
- [ColorModeSelect](https://ui.nuxt.com/docs/components/color-mode-select)
- [ColorModeAvatar](https://ui.nuxt.com/docs/components/color-mode-avatar)
- [ColorModeImage](https://ui.nuxt.com/docs/components/color-mode-image)
- [Todos os componentes](https://ui.nuxt.com/docs/components)
