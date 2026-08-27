/* =========================================================
   VIVA+ — orientacoes.js
   Renderiza a seção "Orientações": o significado do mês
   atual em destaque e um grid de dicas rápidas filtráveis
   por categoria. Todo o conteúdo vem de data/orientacoes.json,
   editável pelo painel /admin (Decap CMS) — veja o README.
   ========================================================= */

const CAMINHO_DADOS_ORIENTACOES = "data/orientacoes.json";

(function () {
  let meses = [];
  let dicas = [];
  let categoriaAtiva = "todas";
  let erroAoCarregar = false;

  const NOMES_MES = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const CATEGORIAS = [
    { id: "todas", label: "Todas" },
    { id: "hidratacao", label: "Hidratação" },
    { id: "alimentacao", label: "Alimentação" },
    { id: "atividade-fisica", label: "Atividade física" },
    { id: "sono", label: "Sono" },
    { id: "postura", label: "Postura" },
    { id: "saude-mental", label: "Saúde mental" },
    { id: "outro", label: "Outros" }
  ];

  const ICONES_CATEGORIA = {
    hidratacao: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.5s6 7.2 6 11.5a6 6 0 0 1-12 0c0-4.3 6-11.5 6-11.5z"/></svg>`,
    alimentacao: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><path d="M6 1v3M10 1v3M14 1v3"/></svg>`,
    "atividade-fisica": `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 6.5l11 11M21 21l-1.5-1.5M3 3l1.5 1.5M18.5 5.5l-13 13M5 18l-1.5 1.5M20 5.5l-1.5-1.5"/><circle cx="5.5" cy="5.5" r="2"/><circle cx="18.5" cy="18.5" r="2"/></svg>`,
    sono: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`,
    postura: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="4" r="2"/><path d="M12 6v7M12 13l-4 8M12 13l4 8M8 9h8"/></svg>`,
    "saude-mental": `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
    outro: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/></svg>`
  };

  function labelCategoria(id) {
    const c = CATEGORIAS.find((c) => c.id === id);
    return c ? c.label : "Outros";
  }

  /* ---------- Destaque do mês atual ---------- */
  function renderMonthSpotlight() {
    const el = document.getElementById("monthSpotlight");
    if (!el) return;

    if (erroAoCarregar) {
      el.innerHTML = `<p class="team-empty">Não foi possível carregar as orientações agora. Tente recarregar a página.</p>`;
      return;
    }

    const numeroMesAtual = new Date().getMonth() + 1;
    const mesAtual =
      meses.find((m) => Number(m.mes) === numeroMesAtual) || null;

    const nomeFallback = NOMES_MES[numeroMesAtual - 1];

    el.innerHTML = `
      <div class="month-spotlight-glow" aria-hidden="true"></div>
      <div class="month-spotlight-badge">
        <span class="month-spotlight-number">${String(numeroMesAtual).padStart(2, "0")}</span>
        <span class="month-spotlight-name">${(mesAtual && mesAtual.nome) || nomeFallback}</span>
      </div>
      <div class="month-spotlight-body">
        <span class="month-spotlight-eyebrow">O significado deste mês</span>
        <h3>${(mesAtual && mesAtual.tema) || "Informações em breve"}</h3>
        <p>${(mesAtual && mesAtual.texto) || "Ainda não cadastramos o significado deste mês — em breve traremos essa informação por aqui."}</p>
      </div>`;
  }

  /* ---------- Filtros por categoria ---------- */
  function renderFiltros() {
    const el = document.getElementById("guidanceFilters");
    if (!el) return;

    const categoriasComConteudo = new Set(dicas.map((d) => d.categoria));
    const opcoes = CATEGORIAS.filter(
      (c) => c.id === "todas" || categoriasComConteudo.has(c.id)
    );

    el.innerHTML = opcoes
      .map(
        (c) =>
          `<button class="filter-btn${c.id === categoriaAtiva ? " active" : ""}" data-filter="${c.id}">${c.label}</button>`
      )
      .join("");
  }

  /* ---------- Grid de dicas ---------- */
  function dicasFiltradas() {
    if (categoriaAtiva === "todas") return dicas;
    return dicas.filter((d) => d.categoria === categoriaAtiva);
  }

  function renderGrid() {
    const el = document.getElementById("guidanceGrid");
    if (!el) return;

    if (erroAoCarregar) {
      el.innerHTML = `<p class="team-empty">Não foi possível carregar as dicas agora. Tente recarregar a página.</p>`;
      return;
    }

    const lista = dicasFiltradas();
    if (!lista.length) {
      el.innerHTML = `<p class="team-empty">Nenhuma orientação encontrada para esta categoria.</p>`;
      return;
    }

    el.innerHTML = lista
      .map(
        (d) => `
      <div class="guidance-card reveal">
        <div class="guidance-icon">${ICONES_CATEGORIA[d.categoria] || ICONES_CATEGORIA.outro}</div>
        <span class="guidance-tag">${labelCategoria(d.categoria)}</span>
        <h3>${d.titulo}</h3>
        <p>${d.texto}</p>
      </div>`
      )
      .join("");

    if (window.VivaMain && window.VivaMain.refreshReveal) window.VivaMain.refreshReveal();
  }

  function renderAll() {
    renderMonthSpotlight();
    renderFiltros();
    renderGrid();
  }

  function bindEvents() {
    const filtersEl = document.getElementById("guidanceFilters");
    if (!filtersEl) return;
    filtersEl.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-filter]");
      if (!btn) return;
      categoriaAtiva = btn.getAttribute("data-filter");
      renderFiltros();
      renderGrid();
    });
  }

  /* ---------- Carregamento do JSON ---------- */
  async function carregarOrientacoes() {
    try {
      const resposta = await fetch(CAMINHO_DADOS_ORIENTACOES, { cache: "no-store" });
      if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
      const dados = await resposta.json();
      meses = Array.isArray(dados.meses) ? dados.meses : [];
      dicas = Array.isArray(dados.dicas) ? dados.dicas : [];
    } catch (erro) {
      console.error("Não foi possível carregar data/orientacoes.json:", erro);
      erroAoCarregar = true;
    }
    renderAll();
    bindEvents();
  }

  document.addEventListener("DOMContentLoaded", carregarOrientacoes);
})();
