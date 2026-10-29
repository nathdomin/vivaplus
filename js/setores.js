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
  /* Ícones simples em SVG inline (sem libs externas), escolhidos pelo
     campo "icone" de cada setor em data/setores.json. Setor sem ícone
     (ou com nome desconhecido) usa "geral". */
  const sectorIcons = {
    geral: `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>`,
    estrela: `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3 6 7 1-5 5 1.5 7L12 17.5 5.5 21 7 14 2 9l7-1z"/></svg>`,
    pessoas: `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
    capelo: `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5-10-5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`,
    escudo: `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4.5 8-11V5l-8-3-8 3v6c0 6.5 8 11 8 11z"/><path d="M9 12l2 2 4-4"/></svg>`,
    balao: `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>`,
    monitor: `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>`,
    aperto: `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="m17 11 2 2 4-4"/></svg>`
  };

  function iconeDoSetor(s) {
    return sectorIcons[s.icone] || sectorIcons.geral;
  }

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
