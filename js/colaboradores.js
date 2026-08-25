/* =========================================================
   VIVA+ — colaboradores.js
   Os colaboradores agora vivem em data/colaboradores.json —
   não mais neste arquivo. Isso permite editar a lista pelo
   painel de administração (Decap CMS, em /admin) sem tocar
   em código. Veja o README para o passo a passo completo.

   Este arquivo só cuida de CARREGAR esse JSON e RENDERIZAR
   os cards, o filtro e os dados usados no modal de setor.
   ========================================================= */

const CAMINHO_DADOS_COLABORADORES = "data/colaboradores.json";

/* Preenchido de forma assíncrona por carregarColaboradores().
   Outros arquivos (ex.: setores.js) leem esta mesma variável
   global, então ela já existe aqui — só fica vazia até o
   JSON terminar de carregar. */
let colaboradores = [];

/* Rótulos amigáveis para os botões de filtro do time.
   Se você criar um novo setor em js/data.js, adicione o
   filtro correspondente aqui também. */
const filtrosColaboradores = [
  { id: "todos", label: "Todos" },
  { id: "diretoria", label: "Diretoria" },
  { id: "rh", label: "RH" },
  { id: "ted", label: "T&D" },
  { id: "4sma", label: "4SMA" },
  { id: "comunicacao", label: "Comunicação" },
  { id: "comercial", label: "Comercial" }
];

/* =========================================================
   RENDERIZAÇÃO — cards de colaboradores, filtro e modal
   ========================================================= */
(function () {
  let filtroAtivo = "todos";
  let erroAoCarregar = false;

  function iniciais(nome) {
    return nome
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0])
      .join("")
      .toUpperCase();
  }

  function nomeSetor(setorId) {
    const s = typeof setores !== "undefined" ? setores.find((s) => s.id === setorId) : null;
    return s ? s.nome : setorId;
  }

  function renderFiltros() {
    const el = document.getElementById("teamFilters");
    if (!el) return;
    el.innerHTML = filtrosColaboradores
      .map(
        (f) => `<button class="filter-btn${f.id === filtroAtivo ? " active" : ""}" data-filter="${f.id}">${f.label}</button>`
      )
      .join("");
  }

  function renderGrid() {
    const el = document.getElementById("teamGrid");
    if (!el) return;

    if (erroAoCarregar) {
      el.innerHTML = `<p class="team-empty">Não foi possível carregar os colaboradores agora. Tente recarregar a página.</p>`;
      return;
    }

    const lista = filtroAtivo === "todos" ? colaboradores : colaboradores.filter((c) => c.setorId === filtroAtivo);

    if (!lista.length) {
      el.innerHTML = `<p class="team-empty">Nenhum colaborador encontrado para este filtro.</p>`;
      return;
    }

    el.innerHTML = lista
      .map(
        (c) => `
      <article class="team-card reveal" tabindex="0" aria-label="${c.nome}, ${nomeSetor(c.setorId)}">
        <div class="team-avatar">
          <span>${iniciais(c.nome)}</span>
          <img src="${c.foto}" alt="Foto de ${c.nome}" loading="lazy"
               onerror="this.style.display='none'" />
        </div>
        <h3>${c.nome}</h3>
        <p class="role">${c.cargo}</p>
        <span class="dept-tag">${nomeSetor(c.setorId)}</span>
      </article>`
      )
      .join("");

    if (window.VivaMain && window.VivaMain.refreshReveal) window.VivaMain.refreshReveal();
  }

  /* ---------- Carregamento do JSON ---------- */
  async function carregarColaboradores() {
    try {
      const resposta = await fetch(CAMINHO_DADOS_COLABORADORES, { cache: "no-store" });
      if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
      const dados = await resposta.json();
      colaboradores = Array.isArray(dados.colaboradores) ? dados.colaboradores : [];
    } catch (erro) {
      console.error("Não foi possível carregar data/colaboradores.json:", erro);
      erroAoCarregar = true;
    }
    renderGrid();
  }

  function bindEvents() {
    const filtersEl = document.getElementById("teamFilters");
    if (!filtersEl) return;
    filtersEl.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-filter]");
      if (!btn) return;
      filtroAtivo = btn.getAttribute("data-filter");
      renderFiltros();
      renderGrid();
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    renderFiltros();
    bindEvents();
    carregarColaboradores();
  });
})();
