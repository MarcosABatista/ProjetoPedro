// app/utils/conteudo.ts — Conteúdo e constantes da landing page do personal trainer Pedro Moura.
// Centraliza contatos, depoimentos, especialidades e credenciais consumidos pelos componentes de seção.
// Fonte única de verdade do copy pt-BR; evita literais duplicados espalhados pelos componentes.

export const CONTATO_WHATSAPP_NUMERO = '5598985721463'
export const CONTATO_WHATSAPP_MENSAGEM = 'Olá, gostaria de agendar uma avaliação física!'
export const CONTATO_WHATSAPP_URL = `https://api.whatsapp.com/send?phone=${CONTATO_WHATSAPP_NUMERO}&text=${encodeURIComponent(CONTATO_WHATSAPP_MENSAGEM)}`
export const CONTATO_INSTAGRAM_URL = 'https://instagram.com/pedromourafilhoedf'
export const CONTATO_TELEFONE = '(98) 9 8572-1463'

export interface Credencial {
  readonly icone: string
  readonly texto: string
}

export const PEDRO_CREDENCIAIS: readonly Credencial[] = [
  { icone: 'i-lucide-graduation-cap', texto: 'Licenciatura e Bacharelado em Educação Física' },
  { icone: 'i-lucide-activity', texto: 'Especializando em Fisiologia do Exercício' },
  { icone: 'i-lucide-bone', texto: 'Pós-graduado em Biomecânica' },
  { icone: 'i-lucide-microscope', texto: 'Membro do LACE-UFMA' },
  { icone: 'i-lucide-ruler', texto: 'Antropometrista ISAK Nível 1' }
]

export interface Numero {
  readonly valor: string
  readonly rotulo: string
}

export const PEDRO_NUMEROS: readonly Numero[] = [
  { valor: '7+', rotulo: 'Anos de experiência' },
  { valor: '100%', rotulo: 'Treino individualizado' },
  { valor: 'ISAK', rotulo: 'Certificação internacional' }
]

export interface Especialidade {
  readonly icone: string
  readonly titulo: string
  readonly descricao: string
  readonly destaques: readonly string[]
}

export const ESPECIALIDADES: readonly Especialidade[] = [
  {
    icone: 'i-lucide-bone',
    titulo: 'Biomecânica',
    descricao:
      'Análise dos padrões de movimento para treinar com técnica perfeita e sem lesões. Identificamos contrações concêntricas, excêntricas e isométricas para extrair o máximo de cada exercício.',
    destaques: ['Correção de padrões patológicos', 'Movimento estático e dinâmico', 'Técnica à prova de lesão']
  },
  {
    icone: 'i-lucide-activity',
    titulo: 'Fisiologia do Exercício',
    descricao:
      'Programas baseados nas adaptações agudas e crônicas do corpo ao exercício, para emagrecimento, estética, performance, saúde ou reabilitação.',
    destaques: ['Taxa metabólica de repouso', 'Zona ideal de esforço (FC)', 'Avaliação de risco de lesão']
  },
  {
    icone: 'i-lucide-ruler',
    titulo: 'Antropometria ISAK',
    descricao:
      'Medição precisa das dimensões e composição corporal segundo o padrão internacional ISAK. Dados reais para decisões reais sobre o seu treino.',
    destaques: ['Composição corporal completa', 'Proporção gordura x músculo', 'Padrão internacional ISAK']
  }
]

export interface ItemAvaliacao {
  readonly texto: string
}

export const AVALIACAO_FISIOLOGICA: readonly string[] = [
  'Antropometria (dimensões corporais e simetria bilateral)',
  'Composição corporal (gordura, massa muscular, óssea e residual)',
  'Proporção entre gordura e músculo no corpo',
  'Projeção da taxa metabólica de repouso',
  'Zona ideal de esforço (FC repouso, reserva e treino)',
  'Avaliação postural e identificação de desvios',
  'Avaliação da flexibilidade e encurtamentos musculares',
  'Avaliação de possíveis riscos de lesões',
  'Fitness Score — sua aptidão física comparada à média',
  'Anamnese e risco cardíaco'
]

export interface Depoimento {
  readonly nome: string
  readonly usuario: string
  readonly foto: string
  readonly texto: string
}

export const DEPOIMENTOS: Depoimento[] = [
  {
    nome: 'Francimária Portela',
    usuario: '@francimaria.Portela',
    foto: '/img/alunos/francimaria.jpg',
    texto:
      'Há uns 7 anos iniciei minha vida na musculação, sempre com acompanhamento do Pedro. Com seus incentivos fui criando uma rotina com mais objetivo. Hoje vejo com precisão o quanto mudei com a ajuda do instrutor particular — é notório o avanço que conquistei com essa parceria!'
  },
  {
    nome: 'Jéssica Lacerda',
    usuario: '@jessicalacerdaa',
    foto: '/img/alunos/jessica.jpg',
    texto:
      'Nunca fui pessoa de exercício físico, não sabia o quanto estava acomodada no sedentarismo. Essa versão anterior não existe mais graças ao Pedro. Dia após dia aprendi a amar como meu corpo se sentia vivo e disposto. Com seu jeito profissional me ensinou o quanto é importante ter o hábito.'
  },
  {
    nome: 'Luanna Mendes',
    usuario: '@luanna_mendes_',
    foto: '/img/alunos/luanna.jpg',
    texto:
      'Comecei a musculação após minha primeira gestação e hoje não me vejo sem praticar esportes. O Pedro é dedicado, responsável e sempre atualizado. Com seu acompanhamento tive a melhor evolução em meses do que não tive em anos com outros profissionais. É um investimento que vale a pena.'
  }
]
