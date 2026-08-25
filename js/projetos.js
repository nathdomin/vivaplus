/* =========================================================
   VIVA+ — projetos.js
   Renderiza cards de projetos, filtros por setor e a
   visualização em timeline, a partir de js/data.js.
   ========================================================= */

(function () {
  let filtroAtivo = "todos";
  let visualizacao = "grid"; // "grid" | "timeline"

  function filtrarProjetos() {
    if (filtroAtivo === "todos") return projetos;
    return projetos.filter((p) => p.setorId === filtroAtivo);
  }

  function renderFiltros() {
    const el = document.getElementById("projectFilters");
    if (!el) return;
    el.innerHTML = filtrosProjetos
      .map(
        (f) => `<button class="filter-btn${f.id === filtroAtivo ? " active" : ""}" data-filter="${f.id}">${f.label}</button>`
      )
      .join("");
  }

  function renderGrid(lista) {
    const el = document.getElementById("projectsGrid");
    if (!el) return;
    if (!lista.length) {
      el.innerHTML = `<p class="team-empty">Nenhum projeto encontrado para este filtro.</p>`;
      return;
    }
    el.innerHTML = lista
      .map(
        (p) => `
      <article class="project-card reveal" tabindex="0">
        <div class="project-thumb" role="img" aria-label="Imagem do projeto ${p.titulo} — a ser adicionada">
          <span class="project-status">${p.status}</span>
          Imagem em breve
        </div>
        <div class="project-body">
          <div class="project-cat">${p.categoria}</div>
          <h3>${p.titulo}</h3>
          <p>${p.descricao}</p>
          <div class="project-meta">
            <span>${p.setor}</span>
            <span>${p.data}</span>
          </div>
        </div>
      </article>`
      )
      .join("");
  }

  function renderTimeline(lista) {
    const el = document.getElementById("projectsTimeline");
    if (!el) return;
    if (!lista.length) {
      el.innerHTML = `<p class="team-empty">Nenhum projeto encontrado para este filtro.</p>`;
      return;
    }
    el.innerHTML = lista
      .map(
        (p) => `
      <div class="timeline-item">
        <h4>${p.titulo}</h4>
        <div class="t-meta">${p.setor} · ${p.categoria} · ${p.data} · ${p.status}</div>
      </div>`
      )
      .join("");
  }

  function renderAll() {
    const lista = filtrarProjetos();
    renderGrid(lista);
    renderTimeline(lista);

    const grid = document.getElementById("projectsGrid");
    const timeline = document.getElementById("projectsTimeline");
    if (grid && timeline) {
      grid.classList.toggle("hidden-view", visualizacao !== "grid");
      timeline.classList.toggle("active", visualizacao === "timeline");
    }
    if (window.VivaMain && window.VivaMain.refreshReveal) window.VivaMain.refreshReveal();
  }

  function bindEvents() {
    const filtersEl = document.getElementById("projectFilters");
    if (filtersEl) {
      filtersEl.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-filter]");
        if (!btn) return;
        filtroAtivo = btn.getAttribute("data-filter");
        renderFiltros();
        renderAll();
      });
    }

    const toggleEl = document.getElementById("projectViewToggle");
    if (toggleEl) {
      toggleEl.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-view]");
        if (!btn) return;
        visualizacao = btn.getAttribute("data-view");
        toggleEl.querySelectorAll("button").forEach((b) => b.classList.toggle("active", b === btn));
        renderAll();
      });
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    renderFiltros();
    bindEvents();
    renderAll();
  });
})();
