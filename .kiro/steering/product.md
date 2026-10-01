---
inclusion: always
---

# Produto — Encurtador de URL

## Propósito

Serviço de encurtamento de URLs projetado para **links de alto volume de acesso**: campanhas,
comunicação em massa, materiais impressos e integrações entre sistemas. O produto entrega um
link curto, memorizável e **verificável**, e garante que o redirecionamento continue funcionando
mesmo sob picos de tráfego.

A promessa central é dupla:

1. **O link sempre resolve.** Indisponibilidade no redirecionamento é a falha mais cara do produto —
   ela quebra materiais já publicados, que não podem ser corrigidos depois.
2. **O link é o que diz ser.** Quem recebe o link deve conseguir perceber adulteração antes de clicar.

## Usuários-alvo

| Perfil | Como usa | O que espera |
|---|---|---|
| **Visitante anônimo** | Portal público, sem cadastro | Encurtar em segundos, ver/baixar o QR Code, zero fricção |
| **Quem clica no link** | Só o redirecionamento | Velocidade e confiança de que o destino é legítimo |
| **Usuário autenticado** (`usuario`) | Área privada | Controlar o ciclo de vida dos próprios links, escolher a expiração, acompanhar as estatísticas do que criou |
| **Administrador** (`admin`) | Área privada + administração | Enxergar e gerir todo o acervo — próprios links, links de usuários e links públicos — em listagens separadas |
| **Sistemas integradores** | API | Gerar links programaticamente dentro dos próprios fluxos |

## Anatomia do link curto

```
[BASE-URL]/[ESCOPO]/[ENTROPIA].[CHECKSUM]

el.com.br/lnk/pub/IuWHa6gFiR.8619
lnk.el.com.br/prv/IuWHa6gFiR.8619
lnk.el.com.br/api/IuWHa6gFiR.8619
localhost:8080/apr/IuWHa6gFiR.8619
```

O formato é uma decisão de produto, não um detalhe de implementação:

- **Base URL curta** — o link precisa caber em SMS, legendas e material impresso.
- **Escopo** — declara na própria URL por qual canal o link foi criado e até onde ele alcança,
  tornando o comportamento do link legível a olho nu antes do clique. Ver "Escopos".
- **Entropia (NanoID)** — identificador não sequencial, para que links não sejam enumeráveis
  nem adivinháveis por varredura.
- **Checksum (CRC-16)** — sufixo derivado da entropia. É o mecanismo de **verificabilidade**:
  um link com um caractere trocado é rejeitado como inválido em vez de cair em outro destino.
  Também protege contra erro de digitação e leitura ruim de QR Code.

O formato deve permanecer estável entre ambientes (produção, domínio alternativo, local) —
só a base muda.

### Escopos

Quatro escopos, sempre de três caracteres. Cada um combina **canal de criação** e **alcance**:

| Escopo | Nome | Canal de criação | Resolução | Gestão e estatísticas |
|---|---|---|---|---|
| `pub` | Público | Portal público, anônimo | Aberta a qualquer um | Ninguém — sem autor, só moderação do `admin` |
| `prv` | Privado | Portal, conta autenticada | Aberta a quem tem o link | Restrita ao autor (e ao `admin`) |
| `api` | API | Integração, credencial de serviço | Aberta a quem tem o link | Restrita à conta dona da credencial (e ao `admin`) |
| `apr` | API restrita | Integração, credencial de serviço | **Exige autorização no clique** | Restrita à conta dona da credencial (e ao `admin`) |

A distinção entre `prv` e `apr` é a mais importante e a mais fácil de confundir:

- Em `prv`, **privado descreve a gestão**. O link resolve para qualquer um que o receba — é isso
  que faz dele um link curto útil. O que é privado é o controle: listar, editar, expirar e ver
  estatísticas cabe só a quem criou.
- Em `apr`, **restrito descreve a resolução**. O clique é autorizado antes do redirecionamento,
  e o link simplesmente não funciona fora do contexto autorizado. Serve para o que não deveria
  vazar por encaminhamento: recursos internos, links entre sistemas, conteúdo sob contrato.

O escopo chamado de "API privada" recebeu o nome `apr` / **API restrita** justamente para não
sugerir que `prv` também barra o clique — ele não barra.

Regras que valem para todos os escopos:

- **O escopo é imutável.** Ele faz parte da URL publicada; mudá-lo seria emitir outro link.
  Não existe "promover" um `prv` para `api` nem "trancar" um `pub` em `apr`.
- **A entropia é única globalmente**, não por escopo. O escopo recebido na URL é conferido contra
  o escopo gravado no link, e divergência é tratada como link inválido — nunca como redirecionamento
  para o escopo correto. É a mesma regra do checksum: um link adulterado falha, não improvisa.
- **Escopos novos são aditivos** e códigos de escopo nunca são reciclados: URLs impressas
  sobrevivem a mudanças no produto.

## Capacidades do produto

### Encurtamento
- Criação de link curto a partir de uma URL de destino.
- **Expiração (TTL)** — definida no momento da criação:
  - o visitante anônimo recebe um TTL fixo, imposto pelo sistema;
  - o usuário autenticado escolhe o prazo livremente, **inclusive "sem expiração"**.
- **Tags** — classificação livre para organizar e filtrar links.
- Metadados de cada link: destino, data de criação, autor, expiração, tags e informações
  descritivas do próprio link encurtado.

### QR Code
- Exibição e download do QR Code de qualquer link.
- O QR Code é **determinístico e estável** para um mesmo link: uma vez gerado, o mesmo código
  deve ser reaproveitado, nunca recriado com aparência diferente. Códigos já impressos ou
  distribuídos não podem mudar.

### Acesso e limites
- **Tier gratuito público**, sem cadastro, com TTL fixo e limite de requisições generoso —
  a barreira existe para conter abuso, não para frustrar uso legítimo.
- **Área privada autenticada** com dois perfis, `usuario` e `admin` — detalhados em
  "Perfis de acesso".

### Inteligência sobre os links
- **Estatísticas de acesso** por link, visíveis para quem criou o link — e para o `admin`.
- **Auditoria** — histórico de quem criou, alterou ou removeu cada link.

### Integração
- **API** para criação e consulta de links a partir de sistemas externos, nos escopos `api`
  (resolução aberta) e `apr` (resolução autorizada).

## Perfis de acesso

**O escopo de visibilidade é determinado pela autoria do link**, não pela navegação: nenhum
perfil alcança link de outro por acidente.

### Anônimo
- Cria links pelo portal público, sem cadastro.
- TTL fixo, definido pelo sistema — não é negociável.
- Não tem painel: link e QR Code são entregues no ato da criação, e depois não há como voltar
  para editar, listar ou consultar estatísticas.

### Perfil `usuario`
- Cria links no escopo `prv` com **expiração à sua escolha, inclusive sem expiração**.
- Sobre **os links que ele mesmo criou**, tem controle total: listar, consultar, editar
  (destino, tags, expiração), desativar e remover.
- Vê as **estatísticas de acesso dos próprios links**.
- Não enxerga links de outros usuários nem os links criados anonimamente no portal público.

### Perfil `admin`
Tem tudo o que o perfil `usuario` tem sobre os próprios links e, além disso:

- **Administração do sistema**: gestão de contas e perfis, políticas de TTL e de rate limit,
  moderação e remoção de links abusivos, acesso à trilha de auditoria completa.
- **Listagens separadas por origem**, nunca um acervo único e indistinto:
  1. **Meus links** — criados pelo próprio admin.
  2. **Links de usuários** — criados por contas autenticadas (`prv`, `api`, `apr`),
     identificados por autor e filtráveis por escopo.
  3. **Links públicos** — criados anonimamente no portal público (`pub`).

  A separação é intencional: cada origem tem volume, risco e critério de moderação diferentes,
  e misturá-las esconde justamente o que o admin precisa enxergar.

## Princípios de produto

- **Leitura vence escrita.** O caminho de redirecionamento é ordens de magnitude mais frequente
  que o de criação e recebe prioridade absoluta em desempenho e disponibilidade.
- **Degradação graciosa.** Se o painel, as estatísticas ou a criação de links ficarem
  indisponíveis, o redirecionamento continua atendendo.
- **Links são estáveis até expirarem — ou para sempre.** Uma vez publicado, o par
  link → destino não muda silenciosamente; alterações de destino são eventos auditáveis, nunca
  implícitas. Um link sem expiração é um compromisso de prazo indeterminado, e o produto trata
  essa escolha como tal.
- **Anonimato com responsabilidade.** O portal público não exige cadastro, mas expiração,
  rate limiting e (adiante) desafios anti-bot mantêm o serviço fora do circuito de spam e phishing.
- **Privacidade por padrão.** Estatísticas de acesso servem para medir alcance, não para
  perfilar quem clica.

## Métricas de sucesso

- Disponibilidade e latência do redirecionamento sob pico de tráfego.
- Taxa de acerto do cache no caminho de leitura.
- Tempo do visitante anônimo entre colar a URL e ter link + QR Code em mãos.
- Proporção de links criados via API (indicador de adoção por integradores).
- Volume de links maliciosos bloqueados ou removidos.
- Proporção de links sem expiração — mede o quanto do acervo cresce de forma permanente.

## Design System

Toda tela, formulário ou componente visual deve seguir o design system do sistema. Ver o steering [design-system](design-system.md).

## Fora de escopo

- Domínios curtos personalizados por cliente (vanity domains).
- Aliases escolhidos pelo usuário — a entropia é gerada pelo sistema, e o checksum depende dela.
- Landing pages intermediárias ou interstitials com publicidade antes do redirecionamento.
- Encurtador como plataforma de marketing (testes A/B, campanhas, automações).

## Glossário

- **Link curto** — a URL completa entregue ao usuário, incluindo escopo, entropia e checksum.
- **Destino** — a URL original para a qual o link curto redireciona.
- **Escopo** — segmento da URL que declara canal de criação e alcance do link:
  `pub`, `prv`, `api` ou `apr`.
- **Entropia** — a porção aleatória e não sequencial que identifica o link.
- **Checksum** — sufixo verificador derivado da entropia, usado para detectar links adulterados
  ou digitados incorretamente.
- **TTL** — prazo de validade após o qual o link deixa de resolver. Pode ser fixo (anônimo),
  escolhido pelo autor, ou ausente — link sem expiração.
- **Perfil** — nível de acesso de uma conta autenticada: `usuario` ou `admin`.
- **Link público** — link criado anonimamente pelo portal público, sem autor identificado.
- **Autoria** — a conta que criou o link; é o que define quem pode vê-lo e alterá-lo.
- **Resolução** — o ato de seguir o link curto até o destino. Aberta em `pub`, `prv` e `api`;
  autorizada em `apr`.
- **Gestão** — listar, editar, expirar e consultar estatísticas de um link. Sempre limitada pela
  autoria, em qualquer escopo.
