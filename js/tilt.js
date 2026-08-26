/* =========================================================
   VIVA+ — tilt.js
   Efeitos de rolagem/mouse mais bonitos: tilt 3D + brilho nos
   cards e leve paralaxe no hero. Ativo apenas em telas de
   computador com mouse (não roda em tablet/celular/touch).
   ========================================================= */

(function () {
  var DESKTOP_QUERY = "(min-width: 1025px) and (hover: hover) and (pointer: fine)";
  var CARD_SELECTOR =
    ".pillar-card, .value-card, .sector-card, .team-card, .project-card, .goal-card, .org-item";

  function isDesktop() {
    return window.matchMedia(DESKTOP_QUERY).matches;
  }

  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  /* ---------- Tilt 3D + brilho nos cards ---------- */
  var activeCard = null;

  function updateCard(card, clientX, clientY) {
    var rect = card.getBoundingClientRect();
    var x = clientX - rect.left;
    var y = clientY - rect.top;
    var px = (x / rect.width) * 100;
    var py = (y / rect.height) * 100;
    var rotateY = (x / rect.width - 0.5) * 10;
    var rotateX = (y / rect.height - 0.5) * -10;

    card.style.setProperty("--mx", px + "%");
    card.style.setProperty("--my", py + "%");
    card.style.setProperty("--rx", rotateX.toFixed(2) + "deg");
    card.style.setProperty("--ry", rotateY.toFixed(2) + "deg");
    card.classList.add("tilt-active");
  }

  function resetCard(card) {
    if (!card) return;
    card.classList.remove("tilt-active");
    card.style.removeProperty("--rx");
    card.style.removeProperty("--ry");
  }

  function handlePointerMove(e) {
    if (!isDesktop() || prefersReducedMotion()) return;
    var card = e.target.closest ? e.target.closest(CARD_SELECTOR) : null;

    if (card !== activeCard) {
      resetCard(activeCard);
      activeCard = card;
    }
    if (card) updateCard(card, e.clientX, e.clientY);
  }

  function handlePointerLeaveDoc() {
    resetCard(activeCard);
    activeCard = null;
  }

  /* ---------- Leve paralaxe 3D no visual do hero ---------- */
  function initHeroParallax() {
    var hero = document.getElementById("inicio");
    var visual = hero ? hero.querySelector(".hero-visual") : null;
    if (!hero || !visual) return;

    hero.addEventListener("mousemove", function (e) {
      if (!isDesktop() || prefersReducedMotion()) return;
      var rect = hero.getBoundingClientRect();
      var relX = (e.clientX - rect.left) / rect.width - 0.5;
      var relY = (e.clientY - rect.top) / rect.height - 0.5;
      visual.style.setProperty("--hry", (relX * 10).toFixed(2) + "deg");
      visual.style.setProperty("--hrx", (relY * -10).toFixed(2) + "deg");
    });

    hero.addEventListener("mouseleave", function () {
      visual.style.setProperty("--hry", "0deg");
      visual.style.setProperty("--hrx", "0deg");
    });
  }

  function init() {
    // Delegação de eventos: funciona mesmo com cards renderizados
    // dinamicamente (pilares, valores, setores, equipe, projetos, metas).
    document.addEventListener("mousemove", handlePointerMove, { passive: true });
    document.addEventListener("mouseleave", handlePointerLeaveDoc);
    initHeroParallax();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
