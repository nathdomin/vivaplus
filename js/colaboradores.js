/* =========================================================
   VIVA+ — colaboradores.js
   Os colaboradores vivem em data/colaboradores/ (um arquivo
   por pessoa, editado pelo painel /admin — Decap CMS). O script
   scripts/gerar-dados.js junta tudo em data/gerado/colaboradores.json
   a cada publicação. Veja o README para o passo a passo completo.

   Este arquivo só cuida de CARREGAR esse JSON e RENDERIZAR
   os cards, o filtro e os dados usados no modal de setor.
   ========================================================= */

const CAMINHO_DADOS_COLABORADORES = "data/gerado/colaboradores.json";

/* Preenchido de forma assíncrona por carregarColaboradores().
   Outros arquivos (ex.: setores.js) leem esta mesma variável
   global, então ela já existe aqui — só fica vazia até o
   JSON terminar de carregar. */
let colaboradores = [];

/* Resolvida quando o JSON termina de carregar (com ou sem erro) —
   setores.js espera por ela antes de abrir um modal pelo link
   ?setor=<id>, para a lista de integrantes já vir preenchida. */
let colaboradoresProntos = Promise.resolve();

/* Considera "gestor" quem tem Gestor(a) ou Diretor(a) no cargo —
   esses nomes aparecem primeiro quando o time é filtrado por setor
   e na lista de integrantes do modal (setores.js usa esta função). */
function ehGestor(cargo) {
  return /gestor|diretor/i.test(cargo || "");
}

function ordenarComGestorPrimeiro(lista) {
  return [...lista].sort((a, b) => (ehGestor(a.cargo) ? 0 : 1) - (ehGestor(b.cargo) ? 0 : 1));
}

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
    // Setor apagado no painel: o colaborador continua na lista até ser reatribuído.
    return s ? s.nome : "Sem setor";
  }

  function renderFiltros() {
    const el = document.getElementById("teamFilters");
    if (!el) return;
    el.innerHTML = filtrosColaboradores()
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

    const lista =
      filtroAtivo === "todos"
        ? colaboradores
        : ordenarComGestorPrimeiro(colaboradores.filter((c) => c.setorId === filtroAtivo));

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
          ${
            c.foto
              ? `<img src="${urlImagem(c.foto, 176, 176)}" data-original="${c.foto}" alt="Foto de ${c.nome}"
               width="88" height="88" loading="lazy"
               onerror="imagemComFallback(this, (img) => img.remove())" />`
              : ""
          }
        </div>
        <h3>${c.nome}</h3>
        <p class="role">${c.cargo}</p>
        <span class="dept-tag">${nomeSetor(c.setorId)}</span>
      </article>`
      )
      .join("");
  }

  /* ---------- Carregamento do JSON ---------- */
  async function carregarColaboradores() {
    try {
      const resposta = await fetch(CAMINHO_DADOS_COLABORADORES, { cache: "no-store" });
      if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
      const dados = await resposta.json();
      colaboradores = Array.isArray(dados.colaboradores) ? dados.colaboradores : [];
    } catch (erro) {
      console.error("Não foi possível carregar data/gerado/colaboradores.json:", erro);
      erroAoCarregar = true;
    }
    // Os botões de filtro e o nome do setor em cada card vêm de data/setores.json.
    await setoresProntos;
    renderFiltros();
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
    bindEvents();
    colaboradoresProntos = carregarColaboradores();
  });
})();
