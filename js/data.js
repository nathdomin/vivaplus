/* =========================================================
   VIVA+ — data.js
   Fonte de verdade para valores e filtros (Colaboradores
   e Projetos). Os setores são carregados de
   data/setores.json (veja abaixo).
   Colaboradores (data/colaboradores.json) e projetos
   (data/projetos.json) ficam em arquivos separados, editáveis
   pelo painel /admin (Decap CMS) sem tocar em código.
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
   Os setores vivem em data/setores.json, editável pelo painel
   /admin (Decap CMS). O mesmo arquivo é lido pelo agente de
   carreira (VivAIplus), então o site e a recomendação da IA
   usam sempre os mesmos ids e textos.

   id: usado para filtros, âncoras, vínculo com colaboradores
       e na recomendação do agente — não renomeie um id existente
   corAccent: valor CSS que define o acento de identidade do setor
   competencias / requisitos: usados só pelo agente de carreira

   `setores` começa vazio e é preenchido quando o JSON carrega;
   quem precisa dos setores espera `setoresProntos`.
   --------------------------------------------------------- */
const CAMINHO_DADOS_SETORES = "data/setores.json";

const setores = [];

const setoresProntos = fetch(CAMINHO_DADOS_SETORES, { cache: "no-store" })
  .then((resposta) => {
    if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
    return resposta.json();
  })
  .then((dados) => {
    const lista = Array.isArray(dados.setores) ? dados.setores : [];
    lista
      .filter((s) => s && s.id && s.nome)
      .forEach((s) => {
        setores.push({
          id: s.id,
          numero: s.numero || "",
          nome: s.nome,
          corAccent: s.corAccent || "var(--color-blue)",
          resumo: s.resumo || "Informações em breve.",
          objetivo: Array.isArray(s.objetivo) ? s.objetivo : [],
          atividades: Array.isArray(s.atividades) ? s.atividades : [],
          metas: [] // preenchido em runtime a partir de data/metas.json (editável em /admin)
        });
      });
    return setores;
  })
  .catch((erro) => {
    console.error("Não foi possível carregar data/setores.json:", erro);
    return setores;
  });

/* ---------------------------------------------------------
   FILTROS
   Rótulos curtos dos botões de filtro. Ao criar um setor
   novo acima, adicione-o aqui também.
   --------------------------------------------------------- */
const filtrosColaboradores = [
  { id: "todos", label: "Todos" },
  { id: "diretoria", label: "Diretoria" },
  { id: "rh", label: "RH" },
  { id: "ted", label: "T&D" },
  { id: "4sma", label: "4SMA" },
  { id: "comunicacao", label: "Comunicação" },
  { id: "comercial", label: "Comercial" }
];

/* ---------------------------------------------------------
   PROJETOS & ATIVIDADES
   Os projetos em si agora vivem em data/projetos.json,
   editável pelo painel /admin (Decap CMS). Aqui fica só a
   lista de filtros por setor, usada na seção de Projetos.
   --------------------------------------------------------- */
const filtrosProjetos = [
  { id: "todos", label: "Todos" },
  { id: "rh", label: "RH" },
  { id: "ted", label: "T&D" },
  { id: "4sma", label: "4SMA" },
  { id: "comunicacao", label: "Comunicação" },
  { id: "comercial", label: "Comercial" }
];
