/* =========================================================
   VIVA+ — animacoes.js
   Marcador do menu, animações ao rolar a página, contagem dos
   percentuais de metas e leve movimento da figura do topo.
   As classes e os efeitos estão em css/animations.css.
   ========================================================= */

(function () {
  const raiz = document.documentElement;
  const reduzirMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Marcador do menu e seção atual ---------- */
  function iniciarMenu() {
    const nav = document.getElementById("navDesktop");
    const marcador = document.getElementById("navIndicator");
    if (!nav || !marcador) return;
    const links = [...nav.querySelectorAll("a")];
    // "inicio" e "contato" não têm link no menu: nelas o marcador some
    const secoes = ["inicio", ...links.map((a) => a.hash.slice(1)), "contato"]
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    let linkAtual = null;   // seção em que a página está
    let linkHover = null;   // link sob o mouse
    let linkFoco = null;    // link em foco pelo teclado
    let linkClicado = null; // destino do clique, enquanto a página rola até ele
    let timerClique = null;

    function mostrar() {
      const link = linkHover || linkFoco || linkAtual;
      links.forEach((a) => a.classList.toggle("is-current", a === link));
      marcador.classList.toggle("is-on", !!link);
      if (link) {
        marcador.style.setProperty("--x", link.offsetLeft + "px");
        marcador.style.setProperty("--w", link.offsetWidth + "px");
      }
    }

    function definirAtual(link) {
      if (link === linkAtual) return;
      links.forEach((a) => a.removeAttribute("aria-current"));
      if (link) link.setAttribute("aria-current", "true");
      linkAtual = link;
    }

    function atualizar() {
      // Durante a rolagem do clique, as seções do caminho não contam
      if (!linkClicado) {
        const limite = window.innerHeight * 0.4;
        let atual = null;
        secoes.forEach((s) => {
          if (s.getBoundingClientRect().top <= limite) atual = s;
        });
        definirAtual(atual ? links.find((a) => a.hash === "#" + atual.id) || null : null);
      }
      mostrar();
    }

    function soltarCliqueDepois(ms) {
      clearTimeout(timerClique);
      timerClique = setTimeout(() => {
        linkClicado = null;
        atualizar();
      }, ms);
    }

    let pendente = false;
    window.addEventListener("scroll", () => {
      if (linkClicado) soltarCliqueDepois(180);
      if (pendente) return;
      pendente = true;
      requestAnimationFrame(() => { pendente = false; atualizar(); });
    }, { passive: true });
    window.addEventListener("resize", atualizar);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(atualizar);

    links.forEach((a) => {
      a.addEventListener("mouseenter", () => { linkHover = a; mostrar(); });
      a.addEventListener("focus", () => {
        if (a.matches(":focus-visible")) { linkFoco = a; mostrar(); }
      });
      a.addEventListener("blur", () => {
        if (linkFoco === a) linkFoco = null;
        mostrar();
      });
      // O clique define a seção: com o mouse parado ali, o marcador continua nela e
      // volta a acompanhar a página quando a pessoa rola
      a.addEventListener("click", () => {
        linkClicado = a;
        linkHover = null;
        linkFoco = null;
        definirAtual(a);
        mostrar();
        soltarCliqueDepois(300);
      });
    });
    nav.addEventListener("mouseleave", () => { linkHover = null; mostrar(); });
    atualizar();
  }

  /* ---------- Links do menu do celular entram um a um ---------- */
  function escalonarMenuCelular() {
    document.querySelectorAll("#navMobile a").forEach((a, i) => a.style.setProperty("--n", i));
  }

  /* ---------- Contagem do percentual das metas ---------- */
  function contar(card) {
    const alvo = card.querySelector(".goal-percent");
    if (!alvo) return;
    const final = parseInt(alvo.textContent, 10) || 0;
    const texto = alvo.firstChild;
    const inicio = performance.now();
    const duracao = 1100;
    (function passo(agora) {
      const t = Math.min(1, (agora - inicio) / duracao);
      texto.nodeValue = Math.round(final * (1 - Math.pow(1 - t, 3))) + "%";
      if (t < 1) requestAnimationFrame(passo);
    })(inicio);
  }

  /* ---------- Revelar ao rolar ---------- */
  const REVELAR = [
    ".section-title", ".section-lead", ".about-text > *", ".pillar-card", ".mission-card", ".value-card",
    ".org-node", ".org-connector", ".org-item", ".sector-card", ".team-card", ".project-card", ".showcase",
    ".timeline-item", ".goal-card", ".month-spotlight-body", ".guidance-card", ".career-copy > *", ".career-frame",
    ".closing-quote", ".closing-author", ".contact-form", ".footer-grid > *"
  ].join(",");

  function dividirCitacao() {
    const frase = document.querySelector(".closing-quote");
    if (!frase) return;
    frase.innerHTML = frase.textContent
      .trim()
      .split(/\s+/)
      .map((palavra, i) => `<span class="palavra" style="--n:${i}">${palavra}</span>`)
      .join(" ");
  }

  function iniciarRevelacao() {
    if (reduzirMovimento || !("IntersectionObserver" in window)) return;
    raiz.classList.add("anima");
    dividirCitacao();

    const observador = new IntersectionObserver(
      (entradas) => {
        let ordem = 0;
        entradas.forEach((entrada) => {
          if (!entrada.isIntersecting) return;
          const el = entrada.target;
          // Quem entra junto aparece em sequência
          el.style.setProperty("--d", Math.min(ordem++ * 70, 490) + "ms");
          el.classList.add("is-visible");
          if (el.matches(".goal-card")) contar(el);
          observador.unobserve(el);
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -6% 0px" }
    );

    const observarPendentes = () =>
      document.querySelectorAll(REVELAR).forEach((el) => {
        if (!el.classList.contains("is-visible")) observador.observe(el);
      });
    observarPendentes();

    // Setores, pessoas, projetos e metas chegam depois, e os filtros recriam os cards
    let agendado = false;
    new MutationObserver(() => {
      if (agendado) return;
      agendado = true;
      requestAnimationFrame(() => { agendado = false; observarPendentes(); });
    }).observe(document.body, { childList: true, subtree: true });
  }

  /* ---------- A figura do topo acompanha o mouse, de leve ---------- */
  function iniciarFigura() {
    if (reduzirMovimento || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const hero = document.getElementById("inicio");
    const cabeca = hero && hero.querySelector(".hero-par-head");
    const mais = hero && hero.querySelector(".hero-par-plus");
    if (!cabeca || !mais) return;
    hero.addEventListener("pointermove", (e) => {
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;
      cabeca.style.transform = `translate(${x * 34}px, ${y * 22}px)`;
      mais.style.transform = `translate(${x * -52}px, ${y * -34}px)`;
    });
    hero.addEventListener("pointerleave", () => {
      cabeca.style.transform = "";
      mais.style.transform = "";
    });
  }

  function iniciar() {
    iniciarMenu();
    escalonarMenuCelular();
    iniciarRevelacao();
    iniciarFigura();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar);
  else iniciar();
})();
