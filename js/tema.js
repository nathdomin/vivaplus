/* =========================================================
   VIVA+ — tema.js
   Alterna entre o modo claro e o escuro (botão #themeToggle no
   cabeçalho). O modo escuro é o bloco "MODO ESCURO" de css/style.css,
   ligado por <html data-theme="dark">.

   Como o tema é escolhido:
   1. se o visitante já clicou no botão, vale a escolha dele (guardada
      no navegador, em localStorage);
   2. senão, segue o tema do sistema (prefers-color-scheme) e acompanha
      se ele mudar.

   Um pequeno script no <head> do index.html aplica o tema salvo antes
   da página aparecer, para não piscar branco ao abrir no modo escuro.
   ========================================================= */

(function () {
  const CHAVE = "vivaplus-tema"; // "claro" | "escuro"
  const raiz = document.documentElement;
  const consultaSistema = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;

  function lerEscolha() {
    try {
      const v = localStorage.getItem(CHAVE);
      return v === "claro" || v === "escuro" ? v : null;
    } catch (e) {
      return null; // modo privado / armazenamento bloqueado
    }
  }

  function guardarEscolha(valor) {
    try {
      localStorage.setItem(CHAVE, valor);
    } catch (e) {
      /* sem armazenamento: o tema vale só até recarregar */
    }
  }

  const ehEscuro = () => raiz.getAttribute("data-theme") === "dark";

  /* Cor da barra do navegador no celular, só no modo escuro. */
  function atualizarMetaCor(escuro) {
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!escuro) {
      if (meta) meta.remove();
      return;
    }
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "theme-color";
      document.head.appendChild(meta);
    }
    meta.content = "#12142C";
  }

  function atualizarBotao(escuro) {
    const botao = document.getElementById("themeToggle");
    if (!botao) return;
    botao.setAttribute("aria-pressed", String(escuro));
    const rotulo = escuro ? "Ativar modo claro" : "Ativar modo escuro";
    botao.setAttribute("aria-label", rotulo);
    botao.setAttribute("title", rotulo);
  }

  function aplicar(escuro, animar) {
    if (animar && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      raiz.classList.add("tema-trocando");
      setTimeout(() => raiz.classList.remove("tema-trocando"), 450);
    }
    if (escuro) raiz.setAttribute("data-theme", "dark");
    else raiz.removeAttribute("data-theme");
    atualizarBotao(escuro);
    atualizarMetaCor(escuro);
  }

  document.addEventListener("DOMContentLoaded", () => {
    // Estado inicial: o <head> já aplicou o tema; aqui só sincroniza botão e meta.
    const escolha = lerEscolha();
    const escuroInicial = escolha ? escolha === "escuro" : !!(consultaSistema && consultaSistema.matches);
    aplicar(escuroInicial, false);

    const botao = document.getElementById("themeToggle");
    if (botao) {
      botao.addEventListener("click", () => {
        const proximo = !ehEscuro();
        aplicar(proximo, true);
        guardarEscolha(proximo ? "escuro" : "claro");
      });
    }

    // Sem escolha do visitante, acompanha o tema do sistema em tempo real.
    if (consultaSistema) {
      const aoMudar = (e) => {
        if (!lerEscolha()) aplicar(e.matches, true);
      };
      if (consultaSistema.addEventListener) consultaSistema.addEventListener("change", aoMudar);
      else if (consultaSistema.addListener) consultaSistema.addListener(aoMudar);
    }
  });
})();
