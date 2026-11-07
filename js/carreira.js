/* =========================================================
   VIVA+ — carreira.js
   Seção "Carreira": incorpora o agente de IA de orientação
   de carreira (hospedado no Render) dentro de uma moldura
   no estilo do site.

   - O iframe só recebe o src quando a seção se aproxima da
     tela (não pesa no carregamento inicial da página).
   - O plano gratuito do Render "hiberna" o serviço; a primeira
     visita pode levar ~1 min. Por isso, assim que a página termina
     de carregar, o site chama /health do agente para "acordá-lo"
     antes de o visitante chegar à seção. Se mesmo assim demorar,
     o loader troca a mensagem e oferece abrir em nova aba.

   Para trocar a URL do agente, edite o atributo
   data-agent-url de #careerFrame no index.html.
   ========================================================= */
(function () {
  "use strict";

  const frame = document.getElementById("careerFrame");
  const iframe = document.getElementById("careerIframe");
  if (!frame || !iframe) return;

  const loaderText = document.getElementById("careerLoaderText");
  const loaderLink = document.getElementById("careerLoaderLink");
  const url = frame.dataset.agentUrl;

  const SLOW_AFTER_MS = 6000;   // mostra aviso de "acordando o servidor"
  const FALLBACK_AFTER_MS = 25000; // oferece abrir em nova aba

  let started = false;
  const timers = [];

  function carregar() {
    if (started || !url) return;
    started = true;

    iframe.addEventListener("load", () => {
      timers.forEach(clearTimeout);
      frame.classList.add("is-loaded");
    }, { once: true });

    timers.push(setTimeout(() => {
      if (loaderText) {
        loaderText.textContent = "Acordando o agente… o primeiro acesso pode levar até 1 minuto.";
      }
    }, SLOW_AFTER_MS));

    timers.push(setTimeout(() => {
      if (loaderLink) loaderLink.hidden = false;
    }, FALLBACK_AFTER_MS));

    iframe.src = url;
  }

  /* Acorda o agente em segundo plano. "no-cors" porque só importa a
     requisição chegar ao servidor — a resposta não é lida. */
  function acordarAgente() {
    if (!url) return;
    try {
      fetch(new URL("/health", url), { mode: "no-cors", cache: "no-store" }).catch(() => {});
    } catch (e) {
      /* URL inválida: o iframe também não carregaria, nada a fazer aqui */
    }
  }

  /* ---------- Mensagens do agente (static/embed.js lá) ----------
     - vivaplus:altura     → a moldura cresce/encolhe com o conteúdo
     - vivaplus:etapa      → destaca o passo 01/02/03 ao lado
     - vivaplus:rolar-topo → ao enviar um formulário, mostra o topo da moldura
     - vivaplus:pedir-tema → responde com o tema atual (claro/escuro)
     (vivaplus:abrir-setor é tratado por js/setores.js)
     E o site manda para o agente { type: "vivaplus:tema", tema }, para ele
     acompanhar o botão de tema (js/tema.js). */
  const ALTURA_MIN = 560;
  const ALTURA_MAX = 6000;
  const corpo = frame.querySelector(".career-frame-body");
  const passos = document.querySelectorAll("#careerSteps [data-step]");
  let origemAgente = null;
  let etapaAtual = 0;
  try { origemAgente = new URL(url).origin; } catch (e) { /* URL inválida */ }

  function mostrarTopoDaMoldura() {
    const topo = frame.getBoundingClientRect().top;
    const cabecalho = document.querySelector(".site-header");
    const folga = (cabecalho ? cabecalho.offsetHeight : 0) + 16;
    // Só rola se o topo da moldura estiver fora da tela
    if (topo < folga || topo > window.innerHeight * 0.6) {
      window.scrollTo({ top: window.scrollY + topo - folga, behavior: "smooth" });
    }
  }

  window.addEventListener("message", (e) => {
    if (!origemAgente || e.origin !== origemAgente || e.source !== iframe.contentWindow) return;
    const dados = e.data || {};

    if (dados.type === "vivaplus:altura" && Number.isFinite(dados.altura) && corpo) {
      const altura = Math.min(ALTURA_MAX, Math.max(ALTURA_MIN, Math.ceil(dados.altura)));
      corpo.style.height = altura + "px";
    }

    if (dados.type === "vivaplus:etapa" && [1, 2, 3].includes(dados.etapa)) {
      passos.forEach((li) => li.classList.toggle("is-active", Number(li.dataset.step) === dados.etapa));
      // Mudou de tela (ex.: foi da revisão ao resultado): mostra o começo dela
      if (etapaAtual && dados.etapa !== etapaAtual) mostrarTopoDaMoldura();
      etapaAtual = dados.etapa;
    }

    if (dados.type === "vivaplus:rolar-topo") mostrarTopoDaMoldura();
    if (dados.type === "vivaplus:pedir-tema") enviarTema();
  });

  /* Tema: o agente segue o claro/escuro do site */
  function enviarTema() {
    if (!origemAgente || !iframe.contentWindow) return;
    const tema = document.documentElement.getAttribute("data-theme") === "dark" ? "escuro" : "claro";
    try {
      iframe.contentWindow.postMessage({ type: "vivaplus:tema", tema }, origemAgente);
    } catch (e) { /* iframe ainda sem página */ }
  }

  iframe.addEventListener("load", enviarTema);
  if ("MutationObserver" in window) {
    new MutationObserver(enviarTema).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"]
    });
  }

  if (document.readyState === "complete") {
    acordarAgente();
  } else {
    window.addEventListener("load", acordarAgente, { once: true });
  }

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        carregar();
        observer.disconnect();
      }
    }, { rootMargin: "600px 0px" });
    observer.observe(frame);
  } else {
    carregar();
  }
})();
