/* =========================================================
   VIVA+ — main.js
   Comportamento geral do site: navbar, menu mobile,
   valores, pilares "Sobre", metas por
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

    // A rolagem só começa depois que a página sai do bloqueio feito pelo menu aberto:
    // feitas ao mesmo tempo, a URL mudava mas a página não saía do lugar no Android.
    function irParaSecao(e) {
      closeMenu();
      const link = e.currentTarget;
      const alvo = link.hash && document.getElementById(link.hash.slice(1));
      if (!alvo) return;
      e.preventDefault();
      requestAnimationFrame(() => requestAnimationFrame(() => {
        const inicio = window.scrollY;
        history.pushState(null, "", link.hash);
        alvo.scrollIntoView({ block: "start" });
        // Se a rolagem suave não tiver começado, vai direto até a seção.
        setTimeout(() => {
          if (window.scrollY === inicio) alvo.scrollIntoView({ block: "start", behavior: "instant" });
        }, 400);
      }));
    }

    nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", irParaSecao));

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });
  }

  /* ---------- PILARES (Sobre a Viva+) ---------- */
  const pilares = [
    { nome: "Saúde", desc: "Benefícios voltados ao cuidado físico e mental dos colaboradores." },
    { nome: "Lazer", desc: "Experiências que renovam energia e trazem leveza para o dia a dia." },
    { nome: "Cultura", desc: "Acesso a experiências culturais que ampliam o repertório de vida." },
    { nome: "Integração Social", desc: "Conexões reais entre pessoas dentro e fora do ambiente de trabalho." }
  ];

  function renderPilares() {
    const el = document.getElementById("pillarsGrid");
    if (!el) return;
    el.innerHTML = pilares
      .map(
        (p) => `
      <div class="pillar-card">
        <h3>${p.nome}</h3>
        <p>${p.desc}</p>
      </div>`
      )
      .join("");
  }

  /* ---------- VALORES ---------- */
  function renderValores() {
    const el = document.getElementById("valuesGrid");
    if (!el || typeof valores === "undefined") return;
    el.innerHTML = valores
      .map(
        (v) => `
      <div class="value-card">
        <h3>${v.nome}</h3>
        <p>${v.descricao}</p>
      </div>`
      )
      .join("");
  }

  /* ---------- METAS POR SETOR ---------- */
  const CAMINHO_METAS = "data/metas.json";
  const PERCENTUAL_PADRAO = 30; // usado se o setor ainda não tiver percentual cadastrado

  async function carregarProgressoMetas() {
    try {
      const resposta = await fetch(CAMINHO_METAS, { cache: "no-store" });
      if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
      const dados = await resposta.json();
      const lista = Array.isArray(dados.progresso) ? dados.progresso : [];
      const mapa = {};
      lista.forEach((item) => {
        const valor = Math.min(100, Math.max(0, Number(item.percentual) || 0));
        const metas = Array.isArray(item.metas)
          ? item.metas
              .filter((m) => m && typeof m.texto === "string" && m.texto.trim())
              .map((m) => ({ texto: m.texto.trim(), concluida: !!m.concluida }))
          : [];
        mapa[item.setor] = { percentual: valor, metas };
      });
      return mapa;
    } catch (erro) {
      console.error("Não foi possível carregar data/metas.json:", erro);
      return {};
    }
  }

  // Atualiza s.metas com a lista vinda de data/metas.json (editável em
  // /admin), com o texto de cada meta e se já foi concluída. setores.js
  // lê esse mesmo array no modal do organograma, então a mudança já
  // aparece nos dois lugares. Começa a carregar já na leitura do script
  // (não espera o DOMContentLoaded) para setores.js poder esperar por
  // window.metasProntas antes de abrir um modal pelo link ?setor=<id>.
  window.metasProntas = Promise.all([carregarProgressoMetas(), setoresProntos]).then(([progresso]) => {
    setores.forEach((s) => {
      const dados = progresso[s.id];
      if (dados && dados.metas.length) s.metas = dados.metas;
    });
    return progresso;
  });

  async function renderMetas() {
    const el = document.getElementById("goalsGrid");
    if (!el || typeof setores === "undefined") return;

    const progresso = await window.metasProntas;

    el.innerHTML = setores
      .map((s) => {
        const dados = progresso[s.id];
        const percentual = dados !== undefined ? dados.percentual : PERCENTUAL_PADRAO;
        return `
      <div class="goal-card">
        <div class="goal-head">
          <h3>${s.nome}</h3>
          <strong class="goal-percent">${percentual}%</strong>
        </div>
        <div class="goal-progress" role="img" aria-label="Progresso da meta de ${s.nome}: ${percentual}% concluído">
          <div class="goal-progress-bar" style="width:${percentual}%"></div>
        </div>
        <ul class="goal-list">
          ${s.metas.length ? s.metas.map((m) => `<li class="${m.concluida ? "is-done" : ""}">${m.texto}</li>`).join("") : `<li>Informações em breve.</li>`}
        </ul>
      </div>`;
      })
      .join("");
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

  function initAll() {
    initHeader();
    initMobileMenu();
    renderPilares();
    renderValores();
    renderMetas();
    setYear();
    initContactForm();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAll);
  } else {
    initAll();
  }
})();

