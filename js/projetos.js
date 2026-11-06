/* =========================================================
   VIVA+ — projetos.js
   Renderiza cards de projetos, filtros por setor e a
   visualização em timeline. Os projetos vivem em data/projetos/
   (um arquivo por projeto, editado pelo painel /admin — Decap
   CMS) e são juntados em data/gerado/projetos.json por
   scripts/gerar-dados.js — veja o README. Os botões de filtro
   vêm de js/data.js.
   ========================================================= */

const CAMINHO_DADOS_PROJETOS = "data/gerado/projetos.json";

/* Preenchido de forma assíncrona por carregarProjetos(). */
let projetos = [];

(function () {
  let filtroAtivo = "todos";
  let visualizacao = "grid"; // "grid" | "timeline"
  let erroAoCarregar = false;

  /* ---------- Ordenação por data de realização ----------
     O campo "data" no CMS é texto livre (ex.: "29/01/2026",
     "10/2026", "2026" ou "Em breve"). Aqui a gente tenta
     interpretar esses formatos para poder ordenar; o que não
     for reconhecido (como "Em breve") fica sempre por último,
     já que ainda não tem uma data de realização definida. */
  function parseDataProjeto(str) {
    if (!str || typeof str !== "string") return null;
    const s = str.trim();

    let m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/); // DD/MM/YYYY
    if (m) return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1])).getTime();

    m = s.match(/^(\d{1,2})\/(\d{4})$/); // MM/YYYY
    if (m) return new Date(Number(m[2]), Number(m[1]) - 1, 1).getTime();

    m = s.match(/^(\d{4})$/); // YYYY
    if (m) return new Date(Number(m[1]), 0, 1).getTime();

    return null; // "Em breve" ou qualquer outro texto livre
  }

  function ordenarPorData(lista) {
    return [...lista].sort((a, b) => {
      const da = parseDataProjeto(a.data);
      const db = parseDataProjeto(b.data);
      if (da === null && db === null) return 0;
      if (da === null) return 1; // sem data reconhecida vai para o final
      if (db === null) return -1;
      return db - da; // mais recente primeiro
    });
  }

  /* ---------- Fotos do projeto ----------
     A galeria é a capa ("imagem") + as fotos extras ("galeria", lista
     de caminhos editada no /admin), sem repetir nenhuma. O botão
     "Ver fotos" só aparece quando há mais de uma. */
  function fotosDoProjeto(p) {
    const extras = Array.isArray(p.galeria) ? p.galeria : [];
    const todas = [p.imagem, ...extras].filter((f) => typeof f === "string" && f.trim());
    return [...new Set(todas)];
  }

  const iconeFotos = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>`;

  function filtrarProjetos() {
    let base;
    if (filtroAtivo === "todos") base = projetos;
    else if (filtroAtivo === FILTRO_PROJETOS_GERAIS) base = projetos.filter(ehProjetoGeral); // gerais da Viva+
    else base = projetos.filter((p) => setoresDoProjeto(p).includes(filtroAtivo)); // vale qualquer um dos setores do projeto
    return ordenarPorData(base);
  }

  function renderFiltros() {
    const el = document.getElementById("projectFilters");
    if (!el) return;
    el.innerHTML = filtrosProjetos(projetos)
      .map(
        (f) => `<button class="filter-btn${f.id === filtroAtivo ? " active" : ""}" data-filter="${f.id}">${f.label}</button>`
      )
      .join("");
  }

  function renderGrid(lista) {
    const el = document.getElementById("projectsGrid");
    if (!el) return;
    if (erroAoCarregar) {
      el.innerHTML = `<p class="team-empty">Não foi possível carregar os projetos agora. Tente recarregar a página.</p>`;
      return;
    }
    if (!lista.length) {
      el.innerHTML = `<p class="team-empty">Nenhum projeto encontrado para este filtro.</p>`;
      return;
    }
    el.innerHTML = lista
      .map((p) => {
        const fotos = fotosDoProjeto(p);
        const capa = fotos[0];
        const temGaleria = fotos.length > 1;
        return `
      <article class="project-card reveal" tabindex="0" data-projeto="${projetos.indexOf(p)}">
        <div class="project-thumb${temGaleria ? " has-gallery" : ""}">
          <span class="project-status">${p.status}</span>
          ${
            capa
              ? `<img class="project-thumb-img" src="${urlImagem(capa, 800, 500)}" data-original="${capa}"
               alt="Imagem do projeto ${p.titulo}" loading="lazy"
               onload="this.classList.add('is-loaded')" onerror="imagemComFallback(this, (img) => img.remove())" />`
              : ""
          }
          <span class="project-thumb-placeholder">Imagem em breve</span>
          ${
            temGaleria
              ? `<button type="button" class="project-photos" data-gallery="${projetos.indexOf(p)}"
                  aria-label="Ver as ${fotos.length} fotos do projeto ${p.titulo}">${iconeFotos} Ver fotos <b>${fotos.length}</b></button>`
              : ""
          }
        </div>
        <div class="project-body">
          <div class="project-cat">${p.categoria}</div>
          <h3>${p.titulo}</h3>
          <p class="project-desc">${p.descricao}</p>
          <button type="button" class="project-more" aria-expanded="false" hidden>Ler mais</button>
          <div class="project-meta">
            <span>${p.setor}</span>
            <span>${p.data}</span>
          </div>
        </div>
      </article>`;
      })
      .join("");
  }

  /* ---------- Galeria de fotos (lightbox) ----------
     Criada uma vez, sob demanda, com duas telas:
     - "grade": todas as fotos do projeto em miniaturas;
     - "foto": a foto ampliada, com setas (← →, ou deslizar o dedo) e o
       botão "Todas as fotos" para voltar à grade.
     Esc: na foto, volta para a grade; na grade, fecha. Ao fechar, o foco
     volta ao botão que abriu a galeria. */
  const galeria = { el: null, fotos: [], indice: 0, titulo: "", gatilho: null, toqueX: null };

  const iconeGrade = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>`;

  const modoDaGaleria = () => (galeria.el ? galeria.el.dataset.modo : null);

  function montarGaleria() {
    if (galeria.el) return galeria.el;
    const el = document.createElement("div");
    el.className = "lightbox";
    el.id = "projectLightbox";
    el.dataset.modo = "grade";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-modal", "true");
    el.setAttribute("aria-label", "Galeria de fotos do projeto");
    el.setAttribute("aria-hidden", "true");
    el.innerHTML = `
      <button type="button" class="lightbox-close" aria-label="Fechar galeria">✕</button>
      <section class="lightbox-view lightbox-grid-view" aria-label="Todas as fotos">
        <div class="lightbox-grid-wrap">
          <header class="lightbox-grid-head">
            <h3 class="lightbox-grid-title"></h3>
            <span class="lightbox-grid-count"></span>
          </header>
          <div class="lightbox-grid"></div>
        </div>
      </section>
      <section class="lightbox-view lightbox-photo-view" aria-label="Foto ampliada">
        <button type="button" class="lightbox-back">${iconeGrade}<span>Todas as fotos</span></button>
        <button type="button" class="lightbox-nav lightbox-prev" aria-label="Foto anterior">‹</button>
        <figure class="lightbox-stage">
          <img class="lightbox-img" alt="" />
          <figcaption class="lightbox-caption"></figcaption>
        </figure>
        <button type="button" class="lightbox-nav lightbox-next" aria-label="Próxima foto">›</button>
      </section>`;
    document.body.appendChild(el);

    el.addEventListener("click", (e) => {
      const alvo = e.target;
      if (alvo.closest(".lightbox-close") || alvo === el || alvo.classList.contains("lightbox-grid-view")) return fecharGaleria();
      if (alvo.closest(".lightbox-back")) return mostrarGrade();
      if (alvo.closest(".lightbox-prev")) return irParaFoto(galeria.indice - 1);
      if (alvo.closest(".lightbox-next")) return irParaFoto(galeria.indice + 1);
      const tile = alvo.closest("[data-foto]");
      if (tile) return mostrarFoto(Number(tile.getAttribute("data-foto")));
      // Clicar na área vazia ao redor da foto volta para a grade.
      if (alvo.classList.contains("lightbox-photo-view") || alvo.classList.contains("lightbox-stage")) mostrarGrade();
    });
    el.addEventListener("touchstart", (e) => { galeria.toqueX = e.changedTouches[0].clientX; }, { passive: true });
    el.addEventListener("touchend", (e) => {
      if (galeria.toqueX === null) return;
      const dx = e.changedTouches[0].clientX - galeria.toqueX;
      galeria.toqueX = null;
      if (modoDaGaleria() === "foto" && Math.abs(dx) > 50) irParaFoto(galeria.indice + (dx < 0 ? 1 : -1));
    }, { passive: true });
    document.addEventListener("keydown", (e) => {
      if (!el.classList.contains("open")) return;
      if (e.key === "Escape") {
        if (modoDaGaleria() === "foto" && galeria.fotos.length > 1) mostrarGrade();
        else fecharGaleria();
      } else if (modoDaGaleria() === "foto") {
        if (e.key === "ArrowLeft") irParaFoto(galeria.indice - 1);
        else if (e.key === "ArrowRight") irParaFoto(galeria.indice + 1);
      }
    });
    galeria.el = el;
    return el;
  }

  /* Troca a foto ampliada (dá a volta nas pontas). */
  function irParaFoto(i) {
    const total = galeria.fotos.length;
    if (!total) return;
    galeria.indice = (i + total) % total;
    const img = galeria.el.querySelector(".lightbox-img");
    const src = galeria.fotos[galeria.indice];
    img.classList.remove("is-loaded");
    img.dataset.original = src;
    img.onload = () => img.classList.add("is-loaded");
    img.onerror = () => imagemComFallback(img, () => img.classList.add("is-loaded"));
    img.src = urlImagem(src, 1600);
    img.alt = `${galeria.titulo} — foto ${galeria.indice + 1} de ${total}`;
    galeria.el.querySelector(".lightbox-caption").textContent = `${galeria.titulo} · ${galeria.indice + 1} / ${total}`;
    // Já deixa a próxima foto baixando para a troca ser instantânea.
    new Image().src = urlImagem(galeria.fotos[(galeria.indice + 1) % total], 1600);
  }

  function mostrarFoto(i) {
    galeria.el.dataset.modo = "foto";
    irParaFoto(i);
    const foco = galeria.fotos.length > 1 ? ".lightbox-back" : ".lightbox-close";
    galeria.el.querySelector(foco).focus();
  }

  function mostrarGrade() {
    galeria.el.dataset.modo = "grade";
    galeria.el.querySelector(".lightbox-img").removeAttribute("src");
    // Devolve o foco à miniatura da foto que estava aberta (e a traz para a vista).
    const tile = galeria.el.querySelector(`[data-foto="${galeria.indice}"]`);
    if (tile) tile.focus();
  }

  function abrirGaleria(indiceProjeto, gatilho) {
    const p = projetos[indiceProjeto];
    if (!p) return;
    const fotos = fotosDoProjeto(p);
    if (!fotos.length) return;
    const el = montarGaleria();
    galeria.fotos = fotos;
    galeria.titulo = p.titulo || "Projeto";
    galeria.gatilho = gatilho || null;
    galeria.indice = 0;
    const varias = fotos.length > 1;
    el.classList.toggle("is-single", !varias);
    el.querySelector(".lightbox-grid-title").textContent = galeria.titulo;
    el.querySelector(".lightbox-grid-count").textContent = `${fotos.length} fotos`;
    el.querySelector(".lightbox-grid").innerHTML = fotos
      .map(
        (f, i) => `<button type="button" class="lightbox-tile" data-foto="${i}" aria-label="Ampliar foto ${i + 1} de ${fotos.length}">
            <img src="${urlImagem(f, 480, 360)}" data-original="${f}" alt="" loading="lazy"
              onerror="imagemComFallback(this, (img) => img.remove())" /></button>`
      )
      .join("");
    el.querySelector(".lightbox-grid").scrollTop = 0;
    el.classList.add("open");
    el.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    if (varias) {
      el.dataset.modo = "grade";
      el.querySelector(".lightbox-close").focus();
    } else {
      mostrarFoto(0);
    }
  }

  function fecharGaleria() {
    const el = galeria.el;
    if (!el || !el.classList.contains("open")) return;
    el.classList.remove("open");
    el.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    el.querySelector(".lightbox-img").removeAttribute("src");
    if (galeria.gatilho && document.contains(galeria.gatilho)) galeria.gatilho.focus();
  }

  /* ---------- "Ler mais" nas descrições ----------
     O CSS corta a descrição em 4 linhas para os cards ficarem com
     altura parecida; o botão só aparece quando o texto foi cortado. */
  function atualizarBotoesLerMais() {
    document.querySelectorAll("#projectsGrid .project-card").forEach((card) => {
      const desc = card.querySelector(".project-desc");
      const btn = card.querySelector(".project-more");
      if (!desc || !btn || card.classList.contains("is-expanded")) return;
      btn.hidden = desc.scrollHeight <= desc.clientHeight + 1;
    });
  }

  function renderTimeline(lista) {
    const el = document.getElementById("projectsTimeline");
    if (!el) return;
    if (erroAoCarregar) {
      el.innerHTML = `<p class="team-empty">Não foi possível carregar os projetos agora. Tente recarregar a página.</p>`;
      return;
    }
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
    // Medido depois de mostrar o grid: escondido, as alturas dão 0.
    atualizarBotoesLerMais();
  }

  /* ---------- Carregamento do JSON ---------- */
  async function carregarProjetos() {
    try {
      const resposta = await fetch(CAMINHO_DADOS_PROJETOS, { cache: "no-store" });
      if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
      const dados = await resposta.json();
      projetos = Array.isArray(dados.projetos) ? dados.projetos : [];
    } catch (erro) {
      console.error("Não foi possível carregar data/gerado/projetos.json:", erro);
      erroAoCarregar = true;
    }
    // Os botões de filtro dependem de data/setores.json.
    await setoresProntos;
    renderFiltros();
    renderAll();
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

    const gridEl = document.getElementById("projectsGrid");
    if (gridEl) {
      gridEl.addEventListener("click", (e) => {
        // Selo "Ver fotos" ou clique na própria foto de um projeto com galeria.
        const abrir = e.target.closest(".project-photos") || e.target.closest(".project-thumb.has-gallery");
        if (abrir) {
          const card = abrir.closest(".project-card");
          abrirGaleria(Number(card.getAttribute("data-projeto")), card.querySelector(".project-photos") || card);
          return;
        }
        const btn = e.target.closest(".project-more");
        if (!btn) return;
        const card = btn.closest(".project-card");
        const aberto = card.classList.toggle("is-expanded");
        btn.textContent = aberto ? "Ler menos" : "Ler mais";
        btn.setAttribute("aria-expanded", String(aberto));
      });
    }

    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(atualizarBotoesLerMais, 150);
    });

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
    bindEvents();
    carregarProjetos();
  });
})();
