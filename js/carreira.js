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
