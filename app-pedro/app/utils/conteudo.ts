// app/utils/conteudo.ts — Conteúdo e constantes da landing (ficha de avaliação) do personal Pedro Moura.
// Centraliza contatos, trilhas de serviço, marcos ISAK, avaliação, método, etapas e depoimentos.
// Fonte única de verdade do copy pt-BR consumido pelos componentes de seção e da ficha.

export const CONTATO_WHATSAPP_NUMERO = '5598985721463'
export const CONTATO_WHATSAPP_MENSAGEM = 'Olá, Pedro! Vim pelo site e quero agendar uma avaliação.'
export const CONTATO_INSTAGRAM_URL = 'https://instagram.com/pedromourafilhoedf'
export const CONTATO_INSTAGRAM_USUARIO = '@pedromourafilhoedf'
export const CONTATO_TELEFONE = '(98) 9 8572-1463'
export const CONTATO_TELEFONE_URL = 'tel:+5598985721463'

/** Monta o link do WhatsApp do Pedro com a mensagem já preenchida. */
export function montarUrlWhatsapp(mensagem: string = CONTATO_WHATSAPP_MENSAGEM): string {
  return `https://api.whatsapp.com/send?phone=${CONTATO_WHATSAPP_NUMERO}&text=${encodeURIComponent(mensagem)}`
}

export const CONTATO_WHATSAPP_URL = montarUrlWhatsapp()

// ---------------------------------------------------------------- Trilhas

export type TrilhaId = 'presencial' | 'online'

export interface Trilha {
  readonly id: TrilhaId
  readonly titulo: string
  readonly local: string
  readonly descricao: string
  readonly inclui: readonly string[]
}

export const TRILHAS: readonly Trilha[] = [
  {
    id: 'presencial',
    titulo: 'Presencial',
    local: 'Santa Luzia do Paruá — MA',
    descricao:
      'Treino acompanhado de perto, com avaliação física completa antes da primeira série. Técnica corrigida na hora, carga ajustada no dia.',
    inclui: [
      'Avaliação antropométrica ISAK',
      'Avaliação postural e de flexibilidade',
      'Correção de técnica em tempo real',
      'Programa individual ajustado à sua evolução'
    ]
  },
  {
    id: 'online',
    titulo: 'Consultoria online',
    local: 'De qualquer cidade',
    descricao:
      'Programa individual montado a partir da sua anamnese e dos seus objetivos, com acompanhamento à distância pelo WhatsApp.',
    inclui: [
      'Anamnese e definição de objetivos',
      'Programa de treino individual',
      'Orientação de técnica e zona de esforço',
      'Acompanhamento e ajustes pelo WhatsApp'
    ]
  }
]

export const OBJETIVOS: readonly string[] = [
  'Emagrecimento',
  'Estética',
  'Performance',
  'Saúde',
  'Reabilitação'
]

/** Mensagem do WhatsApp a partir das escolhas feitas na ficha do topo da página. */
export function montarMensagemFicha(trilha: TrilhaId, objetivo: string | null, nome: string): string {
  const saudacao = nome.trim() ? `Olá, Pedro! Aqui é ${nome.trim()}.` : 'Olá, Pedro!'
  const servico = trilha === 'presencial'
    ? 'Tenho interesse no acompanhamento presencial em São Luís'
    : 'Tenho interesse na consultoria online'
  const meta = objetivo ? ` com foco em ${objetivo.toLowerCase()}` : ''
  return `${saudacao} ${servico}${meta}. Podemos marcar minha avaliação?`
}

// ---------------------------------------------------------------- Marcos ISAK (silhueta)

export interface MarcoAnatomico {
  readonly id: string
  readonly nome: string
  readonly descricao: string
  /** Coordenadas no viewBox 0 0 300 720 da silhueta. */
  readonly x: number
  readonly y: number
}

export const MARCOS_ISAK: readonly MarcoAnatomico[] = [
  { id: 'triceps', nome: 'Tríceps', descricao: 'Dobra vertical na face posterior do braço, no ponto médio acrômio-radial.', x: 243, y: 240 },
  { id: 'subescapular', nome: 'Subescapular', descricao: 'Dobra oblíqua logo abaixo do ângulo inferior da escápula (nas costas).', x: 184, y: 188 },
  { id: 'biceps', nome: 'Bíceps', descricao: 'Dobra vertical na face anterior do braço, na mesma altura do tríceps.', x: 72, y: 240 },
  { id: 'crista', nome: 'Crista ilíaca', descricao: 'Dobra logo acima da crista do osso do quadril, na linha axilar.', x: 195, y: 328 },
  { id: 'supraespinal', nome: 'Supraespinal', descricao: 'Dobra oblíqua acima da espinha ilíaca, na frente do quadril.', x: 176, y: 356 },
  { id: 'abdominal', nome: 'Abdominal', descricao: 'Dobra vertical a 5 cm do umbigo, lado direito.', x: 160, y: 300 },
  { id: 'coxa', nome: 'Coxa frontal', descricao: 'Dobra no ponto médio da face anterior da coxa.', x: 124, y: 452 },
  { id: 'panturrilha', nome: 'Panturrilha medial', descricao: 'Dobra vertical no maior perímetro da panturrilha, face interna.', x: 172, y: 590 }
]

// ---------------------------------------------------------------- Responsável técnico

export interface Credencial {
  readonly icone: string
  readonly texto: string
}

export const PEDRO_CREDENCIAIS: readonly Credencial[] = [
  { icone: 'i-lucide-graduation-cap', texto: 'Licenciatura e Bacharelado em Educação Física' },
  { icone: 'i-lucide-bone', texto: 'Pós-graduado em Biomecânica' },
  { icone: 'i-lucide-activity', texto: 'Especializando em Fisiologia do Exercício' },
  { icone: 'i-lucide-microscope', texto: 'Membro do LACE-UFMA' },
  { icone: 'i-lucide-ruler', texto: 'Antropometrista ISAK Nível 1' }
]

// ---------------------------------------------------------------- Método (três pilares)

export type DiagramaMetodo = 'angulo' | 'curva' | 'adipometro'

export interface PilarMetodo {
  readonly id: string
  readonly titulo: string
  readonly pergunta: string
  readonly descricao: string
  readonly destaques: readonly string[]
  readonly diagrama: DiagramaMetodo
}

export const METODO_PILARES: readonly PilarMetodo[] = [
  {
    id: 'biomecanica',
    titulo: 'Biomecânica',
    pergunta: 'Como você se move?',
    descricao:
      'Análise dos padrões de movimento para treinar com técnica limpa e sem lesão. Contrações concêntricas, excêntricas e isométricas usadas de propósito, para extrair o máximo de cada exercício.',
    destaques: ['Correção de padrões patológicos', 'Movimento estático e dinâmico', 'Técnica à prova de lesão'],
    diagrama: 'angulo'
  },
  {
    id: 'fisiologia',
    titulo: 'Fisiologia do exercício',
    pergunta: 'Como seu corpo responde?',
    descricao:
      'Programas baseados nas adaptações agudas e crônicas do corpo ao exercício, para emagrecimento, estética, performance, saúde ou reabilitação.',
    destaques: ['Taxa metabólica de repouso', 'Zona ideal de esforço (FC)', 'Avaliação de risco de lesão'],
    diagrama: 'curva'
  },
  {
    id: 'antropometria',
    titulo: 'Antropometria ISAK',
    pergunta: 'Do que seu corpo é feito?',
    descricao:
      'Medição precisa das dimensões e da composição corporal pelo padrão internacional ISAK. Dados reais para decisões reais sobre o seu treino.',
    destaques: ['Composição corporal completa', 'Proporção gordura x músculo', 'Simetria bilateral'],
    diagrama: 'adipometro'
  }
]

// ---------------------------------------------------------------- Avaliação

export interface ItemAvaliacao {
  readonly item: string
  /** Como o resultado aparece na ficha (unidade ou forma de registro). */
  readonly registro: string
}

export const AVALIACAO_FISIOLOGICA: readonly ItemAvaliacao[] = [
  { item: 'Anamnese e risco cardíaco', registro: 'questionário' },
  { item: 'Antropometria: dimensões corporais e simetria bilateral', registro: 'cm' },
  { item: 'Composição corporal: gordura, massa muscular, óssea e residual', registro: '% · kg' },
  { item: 'Proporção entre gordura e músculo', registro: 'razão' },
  { item: 'Projeção da taxa metabólica de repouso', registro: 'kcal/dia' },
  { item: 'Zona ideal de esforço: FC de repouso, reserva e treino', registro: 'bpm' },
  { item: 'Avaliação postural e identificação de desvios', registro: 'desvios' },
  { item: 'Flexibilidade e encurtamentos musculares', registro: 'cm · °' },
  { item: 'Possíveis riscos de lesão', registro: 'fatores' },
  { item: 'Fitness Score: sua aptidão física comparada à média', registro: 'pontos' }
]

// ---------------------------------------------------------------- Como funciona

export interface EtapaProcesso {
  readonly titulo: string
  readonly texto: string
}

export const ETAPAS_PROCESSO: readonly EtapaProcesso[] = [
  { titulo: 'Conversa', texto: 'Você chama no WhatsApp, conta seu objetivo e escolhe entre presencial e online.' },
  { titulo: 'Avaliação', texto: 'Anamnese e risco cardíaco; no presencial, também antropometria ISAK, postura e flexibilidade.' },
  { titulo: 'Prescrição', texto: 'Com os dados na mão, o Pedro monta um programa só seu: exercícios, volume, carga e zona de esforço.' },
  { titulo: 'Acompanhamento', texto: 'Treino acompanhado, técnica corrigida e ajustes conforme você evolui.' }
]

// ---------------------------------------------------------------- Depoimentos

export interface Depoimento {
  readonly nome: string
  readonly usuario: string
  readonly foto: string
  readonly contexto: string
  readonly texto: string
}

export const DEPOIMENTOS: readonly Depoimento[] = [
  {
    nome: 'Francimária Portela',
    usuario: '@francimaria.Portela',
    foto: '/img/alunos/francimaria.jpg',
    contexto: '7 anos de acompanhamento',
    texto:
      'Há uns 7 anos iniciei minha vida na musculação, sempre com acompanhamento do Pedro. Com seus incentivos fui criando uma rotina com mais objetivo. Hoje vejo com precisão o quanto mudei com a ajuda do instrutor particular — é notório o avanço que conquistei com essa parceria!'
  },
  {
    nome: 'Jéssica Lacerda',
    usuario: '@jessicalacerdaa',
    foto: '/img/alunos/jessica.jpg',
    contexto: 'Saiu do sedentarismo',
    texto:
      'Nunca fui pessoa de exercício físico, não sabia o quanto estava acomodada no sedentarismo. Essa versão anterior não existe mais graças ao Pedro. Dia após dia aprendi a amar como meu corpo se sentia vivo e disposto. Com seu jeito profissional me ensinou o quanto é importante ter o hábito.'
  },
  {
    nome: 'Luanna Mendes',
    usuario: '@luanna_mendes_',
    foto: '/img/alunos/luanna.jpg',
    contexto: 'Começou após a primeira gestação',
    texto:
      'Comecei a musculação após minha primeira gestação e hoje não me vejo sem praticar esportes. O Pedro é dedicado, responsável e sempre atualizado. Com seu acompanhamento tive a melhor evolução em meses do que não tive em anos com outros profissionais. É um investimento que vale a pena.'
  }
]
