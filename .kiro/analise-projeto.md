# Análise do Projeto — Site Pedro Moura (Personal Trainer)

## Visão geral

Site institucional de página única (landing page) para divulgação dos serviços
do personal trainer **Pedro Moura Filho**. O objetivo principal é apresentar o
profissional, mostrar depoimentos de alunos, explicar as áreas de atuação
(biomecânica, fisiologia do exercício e antropometria) e direcionar o visitante
para contato via WhatsApp.

- **Tipo:** site estático (HTML + CSS + JavaScript puro)
- **Idioma:** português (`lang="pt-br"`)
- **Público-alvo:** potenciais alunos/clientes buscando acompanhamento físico

## Estrutura de arquivos

```
ProjetoPedro/
├── index.html                      # Página única com todas as seções
├── stile.css                       # Estilos principais
├── script.js                       # Inicialização do carrossel (Swiper)
├── fotopedro1.jfif / fotopedro2.jfif   # Fotos do profissional
├── anastase-maragos-...jpg         # Imagem (não referenciada no HTML)
├── fotos alunos/                   # Fotos usadas nos depoimentos
│   ├── francimaria.jfif
│   ├── jessica.jfif
│   └── luanna.jfif
└── icones/                         # Pacote de ícones (IcoMoon)
    ├── style.css
    ├── demo.html
    ├── fonts/ (icomoon.eot/.svg/.ttf/.woff)
    └── selection.json
```

## Tecnologias utilizadas

- **HTML5** semântico (`header`, `main`, `section`, `footer`).
- **CSS3** com variáveis customizadas (`:root`), modelo de cor HSL,
  `clip-path`, `linear-gradient` e `scroll-behavior: smooth`.
- **JavaScript** com a biblioteca **Swiper** (carrossel de depoimentos),
  carregada via CDN unpkg.
- **IcoMoon** — fonte de ícones local (WhatsApp, telefone, e-mail, redes sociais).

## Seções da página

1. **Header** — logo "PedroMoura" com link para o rodapé.
2. **Home (#home)** — nome, profissão, foto, formação acadêmica e botão de
   WhatsApp.
3. **Depoimentos (#testimonials)** — carrossel com 3 depoimentos de alunas.
4. **Resumo (#resumo)** — textos sobre Biomecânica, Fisiologia do Exercício
   (com lista de itens avaliados) e Antropometria/ISAK.
5. **Contato (#contact)** — chamada para contato + telefone, e-mail e endereço.
6. **Rodapé (#rodape)** — redes sociais (Instagram, Facebook, LinkedIn).

## Pontos positivos

- Código HTML limpo e organizado, com comentários separando as seções.
- Bom uso de **variáveis CSS**, facilitando a manutenção de cores e fontes.
- Uso de biblioteca consolidada (Swiper) para o carrossel.
- Links de WhatsApp com mensagem pré-preenchida (boa conversão).
- Estrutura semântica adequada para SEO básico.

## Pontos de atenção e melhorias sugeridas

### Correções / bugs
- **Erro de digitação em seletor CSS:** o HTML usa a seção `#testimonials`,
  mas há uma regra `#testimanials` (com "a") em `stile.css` — ela nunca é aplicada.
- **Classe `selection` vs `section`:** a seção de contato usa
  `class="selection"` em vez de `class="section"`, o que pode quebrar o padrão
  de espaçamento esperado.
- **`target="_blanck"`** aparece em vários links; o valor correto é `target="_blank"`.
- **Fontes não carregadas:** as variáveis `--title-font` (Poppins) e
  `--body-font` (DM Sans) referenciam fontes que **não são importadas**
  (não há `<link>` do Google Fonts nem `@font-face`). Além disso, há
  `font-family: 'popins'` escrito errado (deveria ser `'Poppins'`).
- **Seletor `.swiper slide`** deveria ser `.swiper-slide` (classe única).
- **`font: var(--subtitle-font-size)`** em `#resumo .text p` é uma declaração
  `font` inválida (falta família/estilo); provavelmente deveria ser `font-size`.
- **HTML inválido:** há `<h2>` e `<ul>` dentro de um `<p>` na seção de resumo,
  o que não é permitido pela especificação HTML.

### Conteúdo
- Campos de **endereço e e-mail** ainda estão como placeholder (`xxxxxxxxxxx`).
- Os links de **Facebook e LinkedIn** apontam para `#` (sem destino real).
- A imagem `anastase-maragos-...jpg` e `fotopedro1.jfif` não são usadas.
- Alguns depoimentos parecem estar **cortados** no meio da frase.

### Boas práticas
- **Responsividade:** não há `@media queries`; o layout é essencialmente
  mobile e pode não se adaptar bem a telas maiores.
- **Acessibilidade:** garantir textos `alt` descritivos (alguns estão como
  `foto_jessica`) e contraste adequado.
- **Performance:** fixar a versão do Swiper no CDN (hoje usa `swiper/` sem
  versão, o que pode quebrar com atualizações da lib).
- **Organização:** considerar renomear `stile.css` para `style.css` por
  convenção.

## Conclusão

É um projeto de landing page simples, funcional e com propósito claro de
captação de clientes via WhatsApp. A base está bem estruturada, mas há vários
pequenos bugs (seletores/typos de CSS, fontes não importadas, HTML inválido) e
conteúdo pendente (contatos e links sociais) que valem a correção para deixar o
site profissional e consistente. Adicionar responsividade com media queries é a
melhoria de maior impacto.
