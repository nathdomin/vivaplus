/* =========================================================
   VIVA+ — data.js
   Fonte única de verdade para conteúdo institucional.
   Todo o conteúdo aqui reflete exatamente o material
   institucional fornecido. Nada foi inventado — onde a
   informação não estava disponível, usamos "Em breve" /
   "Informações em breve".
   ========================================================= */

/* ---------------------------------------------------------
   VALORES
   --------------------------------------------------------- */
const valores = [
  {
    numero: "01",
    nome: "Autenticidade",
    icone: "autenticidade",
    descricao: "Somos verdadeiros com as pessoas e com o nosso propósito, dentro e fora da Viva+."
  },
  {
    numero: "02",
    nome: "Inovação",
    icone: "inovacao",
    descricao: "Buscamos novas formas de cuidar de pessoas e de reinventar o bem-estar no trabalho."
  },
  {
    numero: "03",
    nome: "Comunidade",
    icone: "comunidade",
    descricao: "Acreditamos que o bem-estar se constrói em coletivo, entre equipes e entre empresas."
  },
  {
    numero: "04",
    nome: "Sustentabilidade",
    icone: "sustentabilidade",
    descricao: "Cuidamos de pessoas e do ambiente ao redor delas como responsabilidades que caminham juntas."
  },
  {
    numero: "05",
    nome: "Inclusão",
    icone: "inclusao",
    descricao: "Construímos espaços de trabalho onde diferentes histórias e pessoas têm lugar."
  },
  {
    numero: "06",
    nome: "Comunicação não violenta",
    icone: "cnv",
    descricao: "Falamos e ouvimos com respeito, empatia e clareza em cada relação que construímos."
  }
];

/* ---------------------------------------------------------
   SETORES
   id: usado para filtros, âncoras e vínculo com colaboradores
   cor: variável CSS que define o acento de identidade do setor
   --------------------------------------------------------- */
const setores = [
  {
    id: "diretoria",
    numero: "01",
    nome: "Diretoria",
    corAccent: "var(--color-blue)",
    resumo: "Direção estratégica, alinhamento de valores e representação da Viva+.",
    objetivo: [
      "Alinhamento e supervisão da equipe de acordo com os valores e a missão da Viva+.",
      "Gestão do cronograma e cumprimento das tarefas.",
      "Filtragem das demandas.",
      "Representação externa da empresa.",
      "Gestão de pessoas, riscos e crises."
    ],
    atividades: [],
    metas: [
      "Expandir os espaços físicos.",
      "Aumentar o número de clientes e parceiros.",
      "Tornar-se referência no mercado internacional."
    ]
  },
  {
    id: "rh",
    numero: "02",
    nome: "Recursos Humanos",
    corAccent: "var(--color-green)",
    resumo: "Cuidado com as pessoas, cultura organizacional e ambiente de trabalho saudável.",
    objetivo: [
      "Capacitar e desenvolver continuamente os colaboradores.",
      "Promover um ambiente de trabalho saudável, seguro e motivador.",
      "Fortalecer a cultura organizacional.",
      "Garantir alinhamento com os valores da empresa."
    ],
    atividades: [],
    metas: [
      "Promover integração entre colaboradores.",
      "Definir e alinhar melhor as funções.",
      "Implementar melhorias nos setores.",
      "Estruturar a integração de novos colaboradores."
    ]
  },
  {
    id: "ted",
    numero: "03",
    nome: "Treinamento & Desenvolvimento",
    corAccent: "linear-gradient(135deg, var(--color-blue), var(--color-green))",
    resumo: "Aprendizado contínuo, colaboração e crescimento das equipes.",
    objetivo: [
      "Desenvolver competências e desempenho dos colaboradores por meio de aprendizado contínuo, colaboração e inovação, fortalecendo equipes, cultura organizacional e marca empregadora."
    ],
    atividades: [
      "Dinâmica no Orquidário",
      "Janeiro Branco",
      "Apresentação dos dados do formulário",
      "Dinâmica sobre Saúde e Qualidade de Vida no Trabalho, em parceria com o 4SMA"
    ],
    metas: [
      "Fortalecer a colaboração entre setores.",
      "Aprimorar a comunicação.",
      "Tornar a integração mais acolhedora.",
      "Aplicar treinamentos sobre a cultura Viva+."
    ]
  },
  {
    id: "4sma",
    numero: "04",
    nome: "4SMA",
    corAccent: "var(--color-green)",
    resumo: "Segurança, saúde e sustentabilidade como responsabilidades compartilhadas.",
    objetivo: [
      "Cuidar de pessoas e promover um ambiente de trabalho seguro e sustentável por meio de palestras e iniciativas de conscientização, enfatizando prevenção e respeito ao meio ambiente como responsabilidades compartilhadas."
    ],
    atividades: [
      "Fevereiro Roxo e Laranja",
      "Saúde no Trabalho"
    ],
    metas: [
      "Campanhas de consciência ambiental.",
      "Treinamentos de segurança.",
      "Rodas de conversa sobre saúde mental.",
      "Calendários de saúde preventiva."
    ]
  },
  {
    id: "comunicacao",
    numero: "05",
    nome: "Comunicação",
    corAccent: "var(--color-orange)",
    resumo: "A voz da Viva+ — clara, criativa e próxima das pessoas.",
    objetivo: [
      "Divulgar de forma clara e atrativa os serviços e benefícios oferecidos e incentivar os colaboradores a participarem das atividades e cuidarem da saúde física e mental."
    ],
    atividades: [
      "Gerenciamento de redes sociais",
      "Identidade visual da marca",
      "Registro das atividades",
      "Cronograma das aulas"
    ],
    metas: [
      "Atrair mais clientes e audiência.",
      "Crescer a presença nas redes sociais.",
      "Fortalecer o trabalho em equipe.",
      "Aumentar a qualidade e a criatividade dos conteúdos."
    ]
  },
  {
    id: "comercial",
    numero: "06",
    nome: "Comercial",
    corAccent: "linear-gradient(135deg, var(--color-blue), var(--color-orange))",
    resumo: "A ponte entre a Viva+ e cada cliente.",
    objetivo: [
      "Atuar como ponte entre cliente e empresa, orientando sobre a empresa, seus objetivos e os valores dos serviços prestados."
    ],
    atividades: [
      "Site",
      "Crachá do colaborador",
      "Carteirinha dos clientes"
    ],
    metas: [
      "Consolidar serviços.",
      "Flexibilidade de atendimento.",
      "Conquistar clientes e parceiros.",
      "Ser referência em bem-estar."
    ]
  }
];

/* ---------------------------------------------------------
   PROJETOS & ATIVIDADES
   Conteúdo inicial extraído da apresentação. Datas e
   descrições não detalhadas no material original aparecem
   como "Em breve" / "Descrição em breve.", conforme instruído.
   --------------------------------------------------------- */
const projetos = [
  {
    titulo: "Janeiro Branco",
    setor: "Treinamento & Desenvolvimento",
    setorId: "ted",
    categoria: "Saúde",
    data: "Em breve",
    imagem: "assets/images/projetos/janeiro-branco.jpg",
    descricao: "Descrição em breve.",
    status: "Realizado"
  },
  {
    titulo: "Dinâmica no Orquidário",
    setor: "Treinamento & Desenvolvimento",
    setorId: "ted",
    categoria: "Integração",
    data: "Em breve",
    imagem: "assets/images/projetos/dinamica-orquidario.jpg",
    descricao: "Descrição em breve.",
    status: "Realizado"
  },
  {
    titulo: "Saúde e Qualidade de Vida no Trabalho",
    setor: "Treinamento & Desenvolvimento",
    setorId: "ted",
    categoria: "Saúde",
    data: "Em breve",
    imagem: "assets/images/projetos/saude-qualidade-vida.jpg",
    descricao: "Dinâmica realizada em parceria com o setor 4SMA.",
    status: "Realizado"
  },
  {
    titulo: "Fevereiro Roxo e Laranja",
    setor: "4SMA",
    setorId: "4sma",
    categoria: "Conscientização",
    data: "Em breve",
    imagem: "assets/images/projetos/fevereiro-roxo-laranja.jpg",
    descricao: "Descrição em breve.",
    status: "Realizado"
  },
  {
    titulo: "Saúde no Trabalho",
    setor: "4SMA",
    setorId: "4sma",
    categoria: "Saúde",
    data: "Em breve",
    imagem: "assets/images/projetos/saude-no-trabalho.jpg",
    descricao: "Descrição em breve.",
    status: "Realizado"
  },
  {
    titulo: "Dia das Mulheres",
    setor: "Viva+",
    setorId: "comunicacao",
    categoria: "Comunidade",
    data: "Em breve",
    imagem: "assets/images/projetos/dia-das-mulheres.jpg",
    descricao: "Descrição em breve.",
    status: "Realizado"
  },
  {
    titulo: "Inclusão de Pessoas no Trabalho",
    setor: "Viva+",
    setorId: "rh",
    categoria: "Inclusão",
    data: "Em breve",
    imagem: "assets/images/projetos/inclusao-pessoas-trabalho.jpg",
    descricao: "Descrição em breve.",
    status: "Realizado"
  },
  {
    titulo: "Cronograma de conteúdos e atividades",
    setor: "Comunicação",
    setorId: "comunicacao",
    categoria: "Comunicação",
    data: "Em breve",
    imagem: "assets/images/projetos/atividades-comunicacao.jpg",
    descricao: "Registro e divulgação das atividades da Viva+ nas redes sociais e canais oficiais.",
    status: "Em andamento"
  },
  {
    titulo: "Site Viva+",
    setor: "Comercial",
    setorId: "comercial",
    categoria: "Institucional",
    data: "Em breve",
    imagem: "assets/images/projetos/site.jpg",
    descricao: "Desenvolvimento do site institucional da Viva+.",
    status: "Em andamento"
  },
  {
    titulo: "Crachá do colaborador",
    setor: "Comercial",
    setorId: "comercial",
    categoria: "Institucional",
    data: "Em breve",
    imagem: "assets/images/projetos/cracha-colaborador.jpg",
    descricao: "Descrição em breve.",
    status: "Em andamento"
  },
  {
    titulo: "Carteirinha dos clientes",
    setor: "Comercial",
    setorId: "comercial",
    categoria: "Institucional",
    data: "Em breve",
    imagem: "assets/images/projetos/carteirinha-clientes.jpg",
    descricao: "Descrição em breve.",
    status: "Em andamento"
  }
];

/* Filtros disponíveis para a seção de Projetos */
const filtrosProjetos = [
  { id: "todos", label: "Todos" },
  { id: "rh", label: "RH" },
  { id: "ted", label: "T&D" },
  { id: "4sma", label: "4SMA" },
  { id: "comunicacao", label: "Comunicação" },
  { id: "comercial", label: "Comercial" }
];
