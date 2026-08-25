/* =========================================================
   VIVA+ — main.js
   Comportamento geral do site: navbar, menu mobile, reveal
   ao rolar a página, valores, pilares "Sobre", metas por
   setor e pequenos utilitários.
   ========================================================= */

(function () {
  /* ---------- NAVBAR DINÂMICA ---------- */
  function initHeader() {
    const header = document.getElementById("siteHeader");
    if (!header) return;
    const onScroll = () => {
      header.classList.toggle("scrolled", window.scrollY > 24);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- MENU MOBILE ---------- */
  function initMobileMenu() {
    const toggle = document.getElementById("menuToggle");
    const nav = document.getElementById("navMobile");
    if (!toggle || !nav) return;

    function closeMenu() {
      toggle.classList.remove("open");
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    }
    function openMenu() {
      toggle.classList.add("open");
      nav.classList.add("open");
      toggle.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
    }

    toggle.addEventListener("click", () => {
      const isOpen = nav.classList.contains("open");
      isOpen ? closeMenu() : openMenu();
    });

    nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });
  }

  /* ---------- SCROLL REVEAL (Intersection Observer) ---------- */
  let observer;
  function initReveal() {
    if (!("IntersectionObserver" in window)) {
      document.querySelectorAll(".reveal, .reveal-stagger").forEach((el) => el.classList.add("is-visible"));
      return;
    }
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    document.querySelectorAll(".reveal, .reveal-stagger").forEach((el) => observer.observe(el));
  }
  function refreshReveal() {
    if (!observer) return;
    document.querySelectorAll(".reveal:not(.is-visible), .reveal-stagger:not(.is-visible)").forEach((el) => observer.observe(el));
  }

  /* ---------- PILARES (Sobre a Viva+) ---------- */
  const pilares = [
    { nome: "Saúde", desc: "Benefícios voltados ao cuidado físico e mental dos colaboradores.", icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>` },
    { nome: "Lazer", desc: "Experiências que renovam energia e trazem leveza para o dia a dia.", icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>` },
    { nome: "Cultura", desc: "Acesso a experiências culturais que ampliam o repertório de vida.", icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h20v14H2z"/><path d="M8 21h8M12 17v4"/></svg>` },
    { nome: "Integração Social", desc: "Conexões reais entre pessoas dentro e fora do ambiente de trabalho.", icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="7" r="4"/><path d="M17 3.13a4 4 0 0 1 0 7.75M23 21v-2a4 4 0 0 0-3-3.87M1 21v-2a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2"/></svg>` }
  ];

  function renderPilares() {
    const el = document.getElementById("pillarsGrid");
    if (!el) return;
    el.innerHTML = pilares
      .map(
        (p) => `
      <div class="pillar-card reveal">
        <div class="pillar-icon">${p.icon}</div>
        <h3>${p.nome}</h3>
        <p>${p.desc}</p>
      </div>`
      )
      .join("");
  }

  /* ---------- VALORES ---------- */
  const valueIcons = {
    autenticidade: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9 12l2 2 4-4"/></svg>`,
    inovacao: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6M10 22h4M12 2a6 6 0 0 0-4 10.5c.6.6 1 1.4 1 2.5h6c0-1.1.4-1.9 1-2.5A6 6 0 0 0 12 2z"/></svg>`,
    comunidade: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
    sustentabilidade: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 11 13 11 11"/></svg>`,
    inclusao: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>`,
    cnv: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>`
  };

  function renderValores() {
    const el = document.getElementById("valuesGrid");
    if (!el || typeof valores === "undefined") return;
    el.innerHTML = valores
      .map(
        (v) => `
      <div class="value-card reveal">
        <span class="value-number">${v.numero}</span>
        <div class="value-icon">${valueIcons[v.icone] || ""}</div>
        <h3>${v.nome}</h3>
        <p>${v.descricao}</p>
      </div>`
      )
      .join("");
  }

  /* ---------- METAS POR SETOR ---------- */
  function renderMetas() {
    const el = document.getElementById("goalsGrid");
    if (!el || typeof setores === "undefined") return;
    el.innerHTML = setores
      .map((s, i) => {
        // Representação conceitual de progresso (não é percentual real de conclusão)
        const largura = [35, 55, 45, 60, 40, 50][i % 6];
        return `
      <div class="goal-card reveal" style="--accent:${s.corAccent}">
        <h3>${s.nome}</h3>
        <p class="goal-objective">${s.resumo}</p>
        <div class="goal-progress" role="img" aria-label="Representação conceitual do caminho de evolução do setor">
          <div class="goal-progress-bar" data-width="${largura}"></div>
        </div>
        <ul class="goal-list">
          ${s.metas.length ? s.metas.map((m) => `<li>${m}</li>`).join("") : `<li>Informações em breve.</li>`}
        </ul>
      </div>`;
      })
      .join("");

    // Aplica cor de destaque na barra lateral do card
    el.querySelectorAll(".goal-card").forEach((card) => {
      const accent = card.style.getPropertyValue("--accent");
      card.style.setProperty("--accent-bg", accent);
    });

    // Anima a barra de progresso quando entra na tela
    const bars = el.querySelectorAll(".goal-progress-bar");
    if ("IntersectionObserver" in window) {
      const barObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const bar = entry.target;
              bar.style.width = bar.getAttribute("data-width") + "%";
              barObserver.unobserve(bar);
            }
          });
        },
        { threshold: 0.4 }
      );
      bars.forEach((b) => barObserver.observe(b));
    } else {
      bars.forEach((b) => (b.style.width = b.getAttribute("data-width") + "%"));
    }
  }

  /* Cor da barra lateral esquerda dos cards de metas via CSS custom prop */
  function injectGoalAccentStyle() {
    const style = document.createElement("style");
    style.textContent = `.goal-card::before { background: var(--accent-bg, var(--color-orange)); }`;
    document.head.appendChild(style);
  }

  /* ---------- ANO ATUAL NO FOOTER ---------- */
  function setYear() {
    const el = document.getElementById("currentYear");
    if (el) el.textContent = new Date().getFullYear();
  }

  /* ---------- FORMULÁRIO DE CONTATO (fallback local) ---------- */
  function initContactForm() {
    const form = document.getElementById("contactForm");
    const toast = document.getElementById("toast");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = "Enviando...";

      const formData = new FormData(form);

      fetch("https://formsubmit.co/ajax/turma17079@gmail.com", {
        method: "POST",
        headers: { "Accept": "application/json" },
        body: formData
      })
        .then((response) => response.json())
        .then(() => {
          if (toast) {
            toast.textContent = "Mensagem recebida! Em breve nossa equipe entrará em contato.";
            toast.classList.add("show");
            setTimeout(() => toast.classList.remove("show"), 4000);
          }
          form.reset();
        })
        .catch((err) => {
          console.error("Erro ao enviar:", err);
          if (toast) {
            toast.textContent = "Não foi possível enviar. Tente novamente em instantes.";
            toast.classList.add("show");
            setTimeout(() => toast.classList.remove("show"), 4000);
          }
        })
        .finally(() => {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initHeader();
    initMobileMenu();
    renderPilares();
    renderValores();
    injectGoalAccentStyle();
    renderMetas();
    setYear();
    initContactForm();
    initReveal();
  });

  window.VivaMain = { refreshReveal };
})();
