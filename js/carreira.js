/* =========================================================
   VIVA+ — carreira.js
   Seção "Carreira": incorpora o agente de IA de orientação
   de carreira (hospedado no Render) dentro de uma moldura
   no estilo do site.

   - O iframe só recebe o src quando a seção se aproxima da
     tela (não pesa no carregamento inicial da página).
   - O plano gratuito do Render "hiberna" o serviço; a primeira
     visita pode levar ~1 min. Por isso o loader troca a mensagem
     depois de alguns segundos e oferece abrir em nova aba.

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
