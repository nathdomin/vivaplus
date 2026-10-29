/* =========================================================
   VIVA+ — setores.js
   Renderiza organograma, cards de setores e o modal com
   detalhes de cada setor, a partir de data/setores.json
   (carregado em js/data.js).

   O modal também pode ser aberto de fora:
   - pelo link ?setor=<id>#setores (usado pelo agente de
     carreira quando aberto em nova aba);
   - por uma mensagem do agente dentro do iframe da seção
     Carreira: { type: "vivaplus:abrir-setor", setorId }.
   ========================================================= */

(function () {
  const arrowIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`;

  /* ---------- Organograma ---------- */
  function renderOrgChart() {
    const el = document.getElementById("orgLevel");
    if (!el) return;
    el.innerHTML = setores
      .map(
        (s) => `
      <button class="org-item" data-sector="${s.id}" aria-haspopup="dialog">
        <span class="org-num">${s.numero}</span>${s.nome}
      </button>`
      )
      .join("");
  }

  /* ---------- Cards de setores ---------- */
  function renderSectorCards() {
    const el = document.getElementById("sectorsGrid");
    if (!el) return;
    el.innerHTML = setores
      .map(
        (s) => `
      <article class="sector-card reveal" data-sector="${s.id}" tabindex="0" role="button"
        aria-label="Ver detalhes do setor ${s.nome}">
        <div class="sector-top">
          <div class="sector-badge" style="background:${s.corAccent}">${iconeDoSetor(s)}</div>
          <span class="sector-num">${s.numero}</span>
        </div>
        <h3>${s.nome}</h3>
        <p>${s.resumo}</p>
        <span class="sector-cta">Ver detalhes ${arrowIcon}</span>
      </article>`
      )
      .join("");
  }

  /* ---------- Modal ---------- */
  function buildModalContent(setor) {
    const integrantes = typeof colaboradores !== "undefined"
      ? ordenarComGestorPrimeiro(colaboradores.filter((c) => c.setorId === setor.id))
      : [];

    const integrantesHtml = integrantes.length
      ? `<div class="modal-tags">${integrantes
          .map((c) => `<span class="modal-tag">${c.nome}${c.cargo && c.cargo !== "Informações em breve" ? " — " + c.cargo : ""}</span>`)
          .join("")}</div>`
      : `<p class="modal-empty">Informações em breve.</p>`;

    const objetivoHtml = setor.objetivo.length
      ? `<ul class="modal-list">${setor.objetivo.map((o) => `<li>${o}</li>`).join("")}</ul>`
      : `<p class="modal-empty">Informações em breve.</p>`;

    const atividadesHtml = setor.atividades.length
      ? `<ul class="modal-list">${setor.atividades.map((a) => `<li>${a}</li>`).join("")}</ul>`
      : `<p class="modal-empty">Informações em breve.</p>`;

    const metasHtml = setor.metas.length
      ? `<ul class="modal-list">${setor.metas
          .map((m) => `<li class="${m.concluida ? "is-done" : ""}">${m.texto}</li>`)
          .join("")}</ul>`
      : `<p class="modal-empty">Informações em breve.</p>`;

    return `
      <div class="modal-header">
        <div class="sector-badge" style="background:${setor.corAccent}">${iconeDoSetor(setor)}</div>
        <div>
          <span>Setor ${setor.numero}</span>
          <h3 id="sectorModalTitle">${setor.nome}</h3>
        </div>
      </div>
      <div class="modal-block">
        <h4>Integrantes</h4>
        ${integrantesHtml}
      </div>
      <div class="modal-block">
        <h4>Função / Objetivo</h4>
        ${objetivoHtml}
      </div>
      <div class="modal-block">
        <h4>Atividades</h4>
        ${atividadesHtml}
      </div>
      <div class="modal-block">
        <h4>Metas futuras</h4>
        ${metasHtml}
      </div>
    `;
  }

  function openSectorModal(sectorId) {
    const setor = setores.find((s) => s.id === sectorId);
    if (!setor) return;
    const overlay = document.getElementById("sectorModal");
    const panel = document.getElementById("sectorModalPanel");
    if (!overlay || !panel) return;
    panel.innerHTML = `
      <button class="modal-close" id="sectorModalClose" aria-label="Fechar detalhes do setor">✕</button>
      ${buildModalContent(setor)}
    `;
    overlay.classList.add("open");
    overlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    document.getElementById("sectorModalClose").addEventListener("click", closeSectorModal);
    panel.focus();
  }

  function closeSectorModal() {
    const overlay = document.getElementById("sectorModal");
    if (!overlay) return;
    overlay.classList.remove("open");
    overlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function bindSectorInteractions() {
    document.body.addEventListener("click", (e) => {
      const trigger = e.target.closest("[data-sector]");
      if (trigger) {
        openSectorModal(trigger.getAttribute("data-sector"));
        return;
      }
      if (e.target.id === "sectorModal") closeSectorModal();
    });

    document.body.addEventListener("keydown", (e) => {
      const trigger = e.target.closest("[data-sector]");
      if (trigger && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        openSectorModal(trigger.getAttribute("data-sector"));
      }
      if (e.key === "Escape") closeSectorModal();
    });
  }

  /* ---------- Abertura vinda do agente de carreira ---------- */
  async function abrirSetorDoLink() {
    const setorId = new URLSearchParams(window.location.search).get("setor");
    if (!setorId) return;
    // Integrantes e metas do modal vêm de outros JSONs; espera os dois.
    await Promise.all([
      typeof colaboradoresProntos !== "undefined" ? colaboradoresProntos : null,
      window.metasProntas
    ]);
    openSectorModal(setorId);
  }

  function origemDoAgente() {
    const frame = document.getElementById("careerFrame");
    try {
      return frame ? new URL(frame.dataset.agentUrl).origin : null;
    } catch (e) {
      return null;
    }
  }

  function bindMensagensDoAgente() {
    const origemPermitida = origemDoAgente();
    if (!origemPermitida) return;
    window.addEventListener("message", (e) => {
      if (e.origin !== origemPermitida) return;
      const dados = e.data;
      if (dados && dados.type === "vivaplus:abrir-setor" && typeof dados.setorId === "string") {
        openSectorModal(dados.setorId);
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    bindSectorInteractions();
    bindMensagensDoAgente();
    setoresProntos.then(() => {
      renderOrgChart();
      renderSectorCards();
      abrirSetorDoLink();
    });
  });
})();
