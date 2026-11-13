/* =========================================================
   VIVA+ — projetos.js
   Renderiza a apresentação de projetos, os cards, os filtros
   por setor e a visualização em timeline. Os projetos vivem em data/projetos/
   (um arquivo por projeto, editado pelo painel /admin — Decap
   CMS) e são juntados em data/gerado/projetos.json por
   scripts/gerar-dados.js — veja o README. Os botões de filtro
   vêm de js/data.js.
   ========================================================= */

const CAMINHO_DADOS_PROJETOS = "data/gerado/projetos.json";

/* Preenchido de forma assíncrona por carregarProjetos(). */
let projetos = [];

(function () {
  let filtroAtivo = "todos";
  let visualizacao = "apresentacao"; // "apresentacao" | "grid" | "timeline"
  let erroAoCarregar = false;

  /* ---------- Ordenação por data de realização ----------
     O campo "data" no CMS é texto livre (ex.: "29/01/2026",
     "10/2026", "2026" ou "Em breve"). Aqui a gente tenta
     interpretar esses formatos para poder ordenar; o que não
     for reconhecido (como "Em breve") fica sempre por último,
     já que ainda não tem uma data de realização definida. */
  function parseDataProjeto(str) {
    if (!str || typeof str !== "string") return null;
    const s = str.trim();

    let m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/); // DD/MM/YYYY
    if (m) return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1])).getTime();

    m = s.match(/^(\d{1,2})\/(\d{4})$/); // MM/YYYY
    if (m) return new Date(Number(m[2]), Number(m[1]) - 1, 1).getTime();

    m = s.match(/^(\d{4})$/); // YYYY
    if (m) return new Date(Number(m[1]), 0, 1).getTime();

    return null; // "Em breve" ou qualquer outro texto livre
  }

  function ordenarPorData(lista) {
    return [...lista].sort((a, b) => {
      const da = parseDataProjeto(a.data);
      const db = parseDataProjeto(b.data);
      if (da === null && db === null) return 0;
      if (da === null) return 1; // sem data reconhecida vai para o final
      if (db === null) return -1;
      return db - da; // mais recente primeiro
    });
  }

  /* ---------- Fotos do projeto ----------
     A galeria é a capa ("imagem") + as fotos extras ("galeria", lista
     de caminhos editada no /admin), sem repetir nenhuma. O botão
     "Ver fotos" só aparece quando há mais de uma. */
  function fotosDoProjeto(p) {
    const extras = Array.isArray(p.galeria) ? p.galeria : [];
    const todas = [p.imagem, ...extras].filter((f) => typeof f === "string" && f.trim());
    return [...new Set(todas)];
  }

  const iconeFotos = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>`;

  /* ---------- Links nos projetos ----------
     A descrição é texto digitado no /admin: aqui ela é escapada e os
     endereços viram links clicáveis — tanto os soltos (https://… ou
     www.…) quanto os no formato [texto](https://…). Além disso, cada
     projeto pode ter uma lista "links" (botões com texto + endereço). */
  function escaparHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  // Só http(s) e mailto: — nunca javascript: ou similares.
  function urlSegura(url) {
    let u = String(url || "").trim();
    if (!u) return null;
    if (/^www\./i.test(u)) u = "https://" + u;
    return /^(https?:\/\/|mailto:)\S+$/i.test(u) ? u : null;
  }

  const abreEmNovaAba = (href) => (/^mailto:/i.test(href) ? "" : ' target="_blank" rel="noopener noreferrer"');

  function textoComLinks(texto) {
    const padrao = /\[([^\]]+)\]\(([^)\s]+)\)|((?:https?:\/\/|www\.)[^\s<]+)/gi;
    return escaparHtml(texto || "").replace(padrao, (trecho, rotulo, destino, solto) => {
      let alvo = destino || solto;
      let resto = "";
      if (solto) {
        // Pontuação colada no fim do endereço ("...com.") não faz parte dele.
        const fim = alvo.match(/[.,;:!?)\]]+$/);
        if (fim) { resto = fim[0]; alvo = alvo.slice(0, -resto.length); }
      }
      // O texto já foi escapado: desfaz só para validar o endereço, e re-escapa no href.
      const href = urlSegura(alvo.replace(/&amp;/g, "&"));
      if (!href) return trecho;
      return `<a class="inline-link" href="${escaparHtml(href)}"${abreEmNovaAba(href)}>${rotulo || alvo}</a>${resto}`;
    });
  }

  const iconeLink = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17L17 7M8 7h9v9"/></svg>`;

  function linksDoProjeto(p) {
    const lista = Array.isArray(p.links) ? p.links : [];
    const itens = lista
      .map((l) => ({ href: urlSegura(l && l.url), texto: l && l.texto && l.texto.trim() }))
      .filter((l) => l.href);
    if (!itens.length) return "";
    return `<div class="project-links">${itens
      .map((l) => `<a class="project-link" href="${escaparHtml(l.href)}"${abreEmNovaAba(l.href)}>${escaparHtml(l.texto || l.href.replace(/^https?:\/\/(www\.)?/i, ""))} ${iconeLink}</a>`)
      .join("")}</div>`;
  }

  function filtrarProjetos() {
    let base;
    if (filtroAtivo === "todos") base = projetos;
    else if (filtroAtivo === FILTRO_PROJETOS_GERAIS) base = projetos.filter(ehProjetoGeral); // gerais da Viva+
    else base = projetos.filter((p) => setoresDoProjeto(p).includes(filtroAtivo)); // vale qualquer um dos setores do projeto
    return ordenarPorData(base);
  }

  function renderFiltros() {
    const el = document.getElementById("projectFilters");
    if (!el) return;
    el.innerHTML = filtrosProjetos(projetos)
      .map(
        (f) => `<button class="filter-btn${f.id === filtroAtivo ? " active" : ""}" data-filter="${f.id}">${f.label}</button>`
      )
      .join("");
  }

  function renderGrid(lista) {
    const el = document.getElementById("projectsGrid");
    if (!el) return;
    if (erroAoCarregar) {
      el.innerHTML = `<p class="team-empty">Não foi possível carregar os projetos agora. Tente recarregar a página.</p>`;
      return;
    }
    if (!lista.length) {
      el.innerHTML = `<p class="team-empty">Nenhum projeto encontrado para este filtro.</p>`;
      return;
    }
    el.innerHTML = lista
      .map((p) => {
        const fotos = fotosDoProjeto(p);
        const capa = fotos[0];
        const temGaleria = fotos.length > 1;
        return `
      <article class="project-card" data-projeto="${projetos.indexOf(p)}">
        <div class="project-thumb${temGaleria ? " has-gallery" : ""}">
          <span class="project-status">${p.status}</span>
          ${
            capa
              ? `<img class="project-thumb-img" src="${urlImagem(capa, 800, 500)}" data-original="${capa}"
               alt="Imagem do projeto ${p.titulo}" loading="lazy"
               onload="this.classList.add('is-loaded')" onerror="imagemComFallback(this, (img) => img.remove())" />`
              : ""
          }
          <span class="project-thumb-placeholder">Imagem em breve</span>
          ${
            temGaleria
              ? `<button type="button" class="project-photos" data-gallery="${projetos.indexOf(p)}"
                  aria-label="Ver as ${fotos.length} fotos do projeto ${p.titulo}">${iconeFotos} Ver fotos <b>${fotos.length}</b></button>`
              : ""
          }
        </div>
        <div class="project-body">
          <div class="project-cat">${p.categoria}</div>
          <h3>${p.titulo}</h3>
          <p class="project-desc">${textoComLinks(p.descricao)}</p>
          <button type="button" class="project-more" aria-expanded="false" hidden>Ler mais</button>
          ${linksDoProjeto(p)}
          <div class="project-meta">
            <span>${rotuloSetorDoProjeto(p)}</span>
            <span>${p.data || "Em breve"}</span>
          </div>
        </div>
      </article>`;
      })
      .join("");
  }

  /* ---------- Galeria de fotos (lightbox) ----------
     Criada uma vez, sob demanda, com duas telas:
     - "grade": todas as fotos do projeto em miniaturas;
     - "foto": a foto ampliada, com setas (← →, ou deslizar o dedo) e o
       botão "Todas as fotos" para voltar à grade.
     Esc: na foto, volta para a grade; na grade, fecha. Ao fechar, o foco
     volta ao botão que abriu a galeria. */
  const galeria = { el: null, fotos: [], indice: 0, titulo: "", gatilho: null, toqueX: null };

  const iconeGrade = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>`;

  const modoDaGaleria = () => (galeria.el ? galeria.el.dataset.modo : null);

  function montarGaleria() {
    if (galeria.el) return galeria.el;
    const el = document.createElement("div");
    el.className = "lightbox";
    el.id = "projectLightbox";
    el.dataset.modo = "grade";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-modal", "true");
    el.setAttribute("aria-label", "Galeria de fotos do projeto");
    el.setAttribute("aria-hidden", "true");
    el.innerHTML = `
      <button type="button" class="lightbox-close" aria-label="Fechar galeria">✕</button>
      <section class="lightbox-view lightbox-grid-view" aria-label="Todas as fotos">
        <div class="lightbox-grid-wrap">
          <header class="lightbox-grid-head">
            <h3 class="lightbox-grid-title"></h3>
            <span class="lightbox-grid-count"></span>
          </header>
          <div class="lightbox-grid"></div>
        </div>
      </section>
      <section class="lightbox-view lightbox-photo-view" aria-label="Foto ampliada">
        <button type="button" class="lightbox-back">${iconeGrade}<span>Todas as fotos</span></button>
        <button type="button" class="lightbox-nav lightbox-prev" aria-label="Foto anterior">‹</button>
        <figure class="lightbox-stage">
          <img class="lightbox-img" alt="" />
          <figcaption class="lightbox-caption"></figcaption>
        </figure>
        <button type="button" class="lightbox-nav lightbox-next" aria-label="Próxima foto">›</button>
      </section>`;
    document.body.appendChild(el);

    el.addEventListener("click", (e) => {
      const alvo = e.target;
      if (alvo.closest(".lightbox-close") || alvo === el || alvo.classList.contains("lightbox-grid-view")) return fecharGaleria();
      if (alvo.closest(".lightbox-back")) return mostrarGrade();
      if (alvo.closest(".lightbox-prev")) return irParaFoto(galeria.indice - 1);
      if (alvo.closest(".lightbox-next")) return irParaFoto(galeria.indice + 1);
      const tile = alvo.closest("[data-foto]");
      if (tile) return mostrarFoto(Number(tile.getAttribute("data-foto")));
      // Clicar na área vazia ao redor da foto volta para a grade.
      if (alvo.classList.contains("lightbox-photo-view") || alvo.classList.contains("lightbox-stage")) mostrarGrade();
    });
    el.addEventListener("touchstart", (e) => { galeria.toqueX = e.changedTouches[0].clientX; }, { passive: true });
    el.addEventListener("touchend", (e) => {
      if (galeria.toqueX === null) return;
      const dx = e.changedTouches[0].clientX - galeria.toqueX;
      galeria.toqueX = null;
      if (modoDaGaleria() === "foto" && Math.abs(dx) > 50) irParaFoto(galeria.indice + (dx < 0 ? 1 : -1));
    }, { passive: true });
    document.addEventListener("keydown", (e) => {
      if (!el.classList.contains("open")) return;
      if (e.key === "Escape") {
        if (modoDaGaleria() === "foto" && galeria.fotos.length > 1) mostrarGrade();
        else fecharGaleria();
      } else if (modoDaGaleria() === "foto") {
        if (e.key === "ArrowLeft") irParaFoto(galeria.indice - 1);
        else if (e.key === "ArrowRight") irParaFoto(galeria.indice + 1);
      }
    });
    galeria.el = el;
    return el;
  }

  /* Troca a foto ampliada (dá a volta nas pontas). */
  function irParaFoto(i) {
    const total = galeria.fotos.length;
    if (!total) return;
    galeria.indice = (i + total) % total;
    const img = galeria.el.querySelector(".lightbox-img");
    const src = galeria.fotos[galeria.indice];
    img.classList.remove("is-loaded");
    img.dataset.original = src;
    img.onload = () => img.classList.add("is-loaded");
    img.onerror = () => imagemComFallback(img, () => img.classList.add("is-loaded"));
    img.src = urlImagem(src, 1600);
    img.alt = `${galeria.titulo} — foto ${galeria.indice + 1} de ${total}`;
    galeria.el.querySelector(".lightbox-caption").textContent = `${galeria.titulo} · ${galeria.indice + 1} / ${total}`;
    // Já deixa a próxima foto baixando para a troca ser instantânea.
    new Image().src = urlImagem(galeria.fotos[(galeria.indice + 1) % total], 1600);
  }

  function mostrarFoto(i) {
    galeria.el.dataset.modo = "foto";
    irParaFoto(i);
    const foco = galeria.fotos.length > 1 ? ".lightbox-back" : ".lightbox-close";
    galeria.el.querySelector(foco).focus();
  }

  function mostrarGrade() {
    galeria.el.dataset.modo = "grade";
    galeria.el.querySelector(".lightbox-img").removeAttribute("src");
    // Devolve o foco à miniatura da foto que estava aberta (e a traz para a vista).
    const tile = galeria.el.querySelector(`[data-foto="${galeria.indice}"]`);
    if (tile) tile.focus();
  }

  function abrirGaleria(indiceProjeto, gatilho) {
    const p = projetos[indiceProjeto];
    if (!p) return;
    const fotos = fotosDoProjeto(p);
    if (!fotos.length) return;
    const el = montarGaleria();
    galeria.fotos = fotos;
    galeria.titulo = p.titulo || "Projeto";
    galeria.gatilho = gatilho || null;
    galeria.indice = 0;
    const varias = fotos.length > 1;
    el.classList.toggle("is-single", !varias);
    el.querySelector(".lightbox-grid-title").textContent = galeria.titulo;
    el.querySelector(".lightbox-grid-count").textContent = `${fotos.length} fotos`;
    el.querySelector(".lightbox-grid").innerHTML = fotos
      .map(
        (f, i) => `<button type="button" class="lightbox-tile" data-foto="${i}" aria-label="Ampliar foto ${i + 1} de ${fotos.length}">
            <img src="${urlImagem(f, 480, 360)}" data-original="${f}" alt="" loading="lazy"
              onerror="imagemComFallback(this, (img) => img.remove())" /></button>`
      )
      .join("");
    el.querySelector(".lightbox-grid").scrollTop = 0;
    el.classList.add("open");
    el.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    if (varias) {
      el.dataset.modo = "grade";
      el.querySelector(".lightbox-close").focus();
    } else {
      mostrarFoto(0);
    }
  }

  function fecharGaleria() {
    const el = galeria.el;
    if (!el || !el.classList.contains("open")) return;
    el.classList.remove("open");
    el.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    el.querySelector(".lightbox-img").removeAttribute("src");
    if (galeria.gatilho && document.contains(galeria.gatilho)) galeria.gatilho.focus();
  }

  /* ---------- "Ler mais" nas descrições ----------
     O CSS corta a descrição em 4 linhas para os cards ficarem com
     altura parecida; o botão só aparece quando o texto foi cortado. */
  function atualizarBotoesLerMais() {
    document.querySelectorAll("#projectsGrid .project-card").forEach((card) => {
      const desc = card.querySelector(".project-desc");
      const btn = card.querySelector(".project-more");
      if (!desc || !btn || card.classList.contains("is-expanded")) return;
      btn.hidden = desc.scrollHeight <= desc.clientHeight + 1;
    });
  }

  function renderTimeline(lista) {
    const el = document.getElementById("projectsTimeline");
    if (!el) return;
    if (erroAoCarregar) {
      el.innerHTML = `<p class="team-empty">Não foi possível carregar os projetos agora. Tente recarregar a página.</p>`;
      return;
    }
    if (!lista.length) {
      el.innerHTML = `<p class="team-empty">Nenhum projeto encontrado para este filtro.</p>`;
      return;
    }
    el.innerHTML = lista
      .map(
        (p) => `
      <div class="timeline-item">
        <span class="t-date">${p.data || "Em breve"}</span>
        <div>
          <h4>${p.titulo}</h4>
          <div class="t-meta">${rotuloSetorDoProjeto(p)}, ${p.categoria}</div>
        </div>
        <span class="t-status">${p.status}</span>
      </div>`
      )
      .join("");
  }

  /* ---------- Apresentação ----------
     Uma foto grande por vez, com o texto ao lado e uma faixa com todos os
     projetos. A foto aparece inteira (sem corte), sobre uma versão desfocada
     dela mesma, porque há imagens verticais, horizontais e pequenas. "Apresentar"
     abre em tela cheia e avança sozinho; Esc sai. */
  const TEMPO_POR_PROJETO = 7000;
  const vitrine = { el: null, lista: [], indice: 0, apresentando: false, pausado: false, timer: null, toqueX: null, gatilho: null, espaco: null, rolagem: 0, saida: null };
  const iconeSeta = (d) => `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`;
  const ICONE_PAUSAR = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>`;
  const ICONE_CONTINUAR = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l11-6.5a1 1 0 0 0 0-1.72l-11-6.5A1 1 0 0 0 8 5.5z"/></svg>`;

  function renderVitrine(lista) {
    const el = document.getElementById("projectsShowcase");
    if (!el) return;
    vitrine.el = el;
    vitrine.lista = lista; // já vem do mais recente para o mais antigo
    vitrine.indice = 0;
    if (erroAoCarregar || !lista.length) {
      el.innerHTML = `<p class="team-empty">${erroAoCarregar ? "Não foi possível carregar os projetos agora. Tente recarregar a página." : "Nenhum projeto encontrado para este filtro."}</p>`;
      return;
    }
    const varios = vitrine.lista.length > 1;
    el.innerHTML = `
      <div class="showcase-progress" aria-hidden="true"><i></i></div>
      <button type="button" class="showcase-exit" data-acao="sair" aria-label="Sair da apresentação">✕</button>
      <div class="showcase-stage">
        <div class="showcase-photo">
          <span class="project-status"></span>
          <button type="button" class="showcase-photos" data-acao="fotos" hidden>${iconeFotos} Ver fotos</button>
        </div>
        <div class="showcase-info">
          <div class="showcase-text" aria-live="polite"></div>
          <div class="showcase-controls">
            ${varios ? `<button type="button" class="showcase-nav" data-acao="anterior" aria-label="Projeto anterior">${iconeSeta("M15 5l-7 7 7 7")}</button>
            <span class="showcase-count"></span>
            <button type="button" class="showcase-nav" data-acao="proximo" aria-label="Próximo projeto">${iconeSeta("M9 5l7 7-7 7")}</button>
            <button type="button" class="showcase-nav showcase-pause" data-acao="pausar" aria-label="Pausar apresentação">${ICONE_PAUSAR}</button>` : ""}
            <button type="button" class="btn btn-primary btn-sm showcase-present" data-acao="apresentar">Apresentar</button>
          </div>
        </div>
      </div>
      <div class="showcase-strip">
        ${vitrine.lista
          .map((p, i) => {
            const capa = fotosDoProjeto(p)[0];
            return `<button type="button" class="showcase-thumb" data-indice="${i}" aria-label="Ver ${p.titulo}">
              <span class="showcase-thumb-img">${capa ? `<img src="${urlImagem(capa, 320, 200)}" data-original="${capa}" alt="" loading="lazy" onerror="imagemComFallback(this, (img) => img.remove())" />` : ""}</span>
              <span class="showcase-thumb-title">${p.titulo}</span>
            </button>`;
          })
          .join("")}
      </div>`;
    mostrarNaVitrine(0, 1);
  }

  // A foto reduzida a poucos pixels e ampliada pelo navegador já fica desfocada.
  // Um filtro blur em CSS seria refeito a cada quadro enquanto a página rola.
  function desenharFundoDesfocado(camada, foto) {
    const tela = camada.querySelector(".showcase-backdrop");
    if (!tela || !foto.naturalWidth) return;
    tela.width = 48;
    tela.height = Math.max(1, Math.round((48 * foto.naturalHeight) / foto.naturalWidth));
    const g = tela.getContext("2d");
    g.imageSmoothingQuality = "high";
    g.filter = "blur(1.5px) saturate(1.15)"; // o Safari ignora, e o resultado continua desfocado
    g.drawImage(foto, -4, -4, tela.width + 8, tela.height + 8);
    g.filter = "none";
    g.fillStyle = "rgba(0, 0, 0, 0.45)";
    g.fillRect(0, 0, tela.width, tela.height);
  }

  function mostrarNaVitrine(i, direcao) {
    const { el, lista } = vitrine;
    if (!el || !lista.length) return;
    vitrine.indice = (i + lista.length) % lista.length;
    const p = lista[vitrine.indice];
    const fotos = fotosDoProjeto(p);
    const capa = fotos[0];

    // Foto: a nova entra por cima da anterior, que é removida depois da transição
    const palco = el.querySelector(".showcase-photo");
    const anteriores = [...palco.querySelectorAll(".showcase-layer")];
    const camada = document.createElement("div");
    camada.className = "showcase-layer";
    const entrar = () => {
      if (!camada.isConnected) return;
      camada.classList.add("is-in");
      anteriores.forEach((a) => setTimeout(() => a.remove(), 650));
    };
    if (capa) {
      camada.innerHTML = `<canvas class="showcase-backdrop" aria-hidden="true"></canvas>
        <img class="showcase-image" src="${urlImagem(capa, 1600)}" data-original="${capa}" alt="Imagem do projeto ${p.titulo}" />`;
      const foto = camada.querySelector(".showcase-image");
      foto.addEventListener("load", () => { desenharFundoDesfocado(camada, foto); entrar(); }, { once: true });
      foto.addEventListener("error", () => imagemComFallback(foto, () => { foto.remove(); entrar(); }));
    } else {
      camada.innerHTML = `<div class="showcase-empty">Imagem em breve</div>`;
      requestAnimationFrame(entrar);
    }
    palco.prepend(camada);

    palco.querySelector(".project-status").textContent = p.status || "";
    const botaoFotos = palco.querySelector(".showcase-photos");
    botaoFotos.hidden = fotos.length < 2;

    const texto = el.querySelector(".showcase-text");
    texto.style.setProperty("--dir", (direcao < 0 ? -28 : 28) + "px");
    texto.innerHTML = `
      <div class="showcase-cat">${p.categoria}</div>
      <h3>${p.titulo}</h3>
      <p class="showcase-desc">${textoComLinks(p.descricao)}</p>
      ${linksDoProjeto(p)}
      <div class="showcase-meta">${rotuloSetorDoProjeto(p)}, ${p.data || "Em breve"}</div>`;

    const contador = el.querySelector(".showcase-count");
    if (contador) contador.textContent = `${vitrine.indice + 1} de ${lista.length}`;

    const faixa = el.querySelector(".showcase-strip");
    faixa.querySelectorAll(".showcase-thumb").forEach((b, n) => {
      if (n === vitrine.indice) {
        b.setAttribute("aria-current", "true");
        faixa.scrollTo({ left: b.offsetLeft - faixa.offsetLeft - (faixa.clientWidth - b.offsetWidth) / 2, behavior: "smooth" });
      } else {
        b.removeAttribute("aria-current");
      }
    });

    // Já deixa a próxima foto baixando para a troca ser rápida
    const proxima = fotosDoProjeto(lista[(vitrine.indice + 1) % lista.length])[0];
    if (proxima) new Image().src = urlImagem(proxima, 1600);
    agendarAvanco();
  }

  function agendarAvanco() {
    clearTimeout(vitrine.timer);
    const barra = vitrine.el && vitrine.el.querySelector(".showcase-progress i");
    if (!barra) return;
    barra.getAnimations().forEach((a) => a.cancel());
    if (!vitrine.apresentando || vitrine.pausado || vitrine.lista.length < 2) return;
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      barra.animate([{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], { duration: TEMPO_POR_PROJETO, easing: "linear" });
    }
    vitrine.timer = setTimeout(() => mostrarNaVitrine(vitrine.indice + 1, 1), TEMPO_POR_PROJETO);
  }

  function definirPausa(pausado) {
    vitrine.pausado = pausado;
    const botao = vitrine.el.querySelector(".showcase-pause");
    if (botao) {
      botao.innerHTML = pausado ? ICONE_CONTINUAR : ICONE_PAUSAR;
      botao.setAttribute("aria-label", pausado ? "Continuar apresentação" : "Pausar apresentação");
    }
    agendarAvanco();
  }

  function iniciarApresentacao(gatilho) {
    const { el } = vitrine;
    if (vitrine.saida) concluirSaida(false);
    vitrine.gatilho = gatilho;
    vitrine.apresentando = true;
    // Em tela cheia a vitrine sai do fluxo da página: sem guardar o lugar dela, a
    // página encolhe e, ao sair, o navegador a deixa na seção seguinte (Metas).
    vitrine.rolagem = window.scrollY;
    vitrine.espaco = document.createElement("div");
    vitrine.espaco.style.height = `${el.offsetHeight}px`;
    vitrine.espaco.setAttribute("aria-hidden", "true");
    el.before(vitrine.espaco);
    el.classList.add("is-presenting");
    document.body.style.overflow = "hidden";
    // Onde o navegador não oferece tela cheia, a apresentação ocupa toda a janela
    if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
    // Quem pede menos movimento começa com a troca automática pausada
    definirPausa(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    el.querySelector(".showcase-exit").focus();
    mostrarNaVitrine(vitrine.indice, 1);
  }

  function restaurarRolagem() {
    window.scrollTo({ top: vitrine.rolagem, behavior: "instant" });
  }

  // Devolve a vitrine à página, no lugar exato de onde a apresentação começou.
  function concluirSaida(suave) {
    const { el } = vitrine;
    if (vitrine.saida) { vitrine.saida.cancel(); vitrine.saida = null; }
    el.classList.remove("is-presenting");
    if (vitrine.espaco) { vitrine.espaco.remove(); vitrine.espaco = null; }
    document.body.style.overflow = "";
    restaurarRolagem();
    if (suave) el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 260, easing: "ease" });
    if (vitrine.gatilho && document.contains(vitrine.gatilho)) vitrine.gatilho.focus({ preventScroll: true });
  }

  function sairDaApresentacao(imediato) {
    if (!vitrine.apresentando) return;
    vitrine.apresentando = false;
    vitrine.pausado = false;
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    agendarAvanco();
    const pausa = vitrine.el.querySelector(".showcase-pause");
    if (pausa) { pausa.innerHTML = ICONE_PAUSAR; pausa.setAttribute("aria-label", "Pausar apresentação"); }
    if (imediato || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return concluirSaida(false);
    vitrine.saida = vitrine.el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 220, easing: "ease", fill: "forwards" });
    vitrine.saida.onfinish = () => concluirSaida(true);
  }

  function ligarVitrine() {
    const el = document.getElementById("projectsShowcase");
    if (!el) return;
    el.addEventListener("click", (e) => {
      const miniatura = e.target.closest("[data-indice]");
      if (miniatura) {
        const novo = Number(miniatura.getAttribute("data-indice"));
        return mostrarNaVitrine(novo, novo < vitrine.indice ? -1 : 1);
      }
      const botao = e.target.closest("[data-acao]");
      if (!botao) return;
      const acao = botao.getAttribute("data-acao");
      if (acao === "anterior") mostrarNaVitrine(vitrine.indice - 1, -1);
      else if (acao === "proximo") mostrarNaVitrine(vitrine.indice + 1, 1);
      else if (acao === "apresentar") iniciarApresentacao(botao);
      else if (acao === "sair") sairDaApresentacao();
      else if (acao === "pausar") definirPausa(!vitrine.pausado);
      else if (acao === "fotos") {
        const projeto = vitrine.lista[vitrine.indice];
        sairDaApresentacao(true);
        abrirGaleria(projetos.indexOf(projeto), botao);
      }
    });
    el.addEventListener("keydown", (e) => {
      if (vitrine.apresentando || !["ArrowLeft", "ArrowRight"].includes(e.key)) return;
      mostrarNaVitrine(vitrine.indice + (e.key === "ArrowRight" ? 1 : -1), e.key === "ArrowRight" ? 1 : -1);
    });
    document.addEventListener("keydown", (e) => {
      if (!vitrine.apresentando) return;
      if (e.key === "Escape") sairDaApresentacao();
      else if (e.key === "ArrowRight") mostrarNaVitrine(vitrine.indice + 1, 1);
      else if (e.key === "ArrowLeft") mostrarNaVitrine(vitrine.indice - 1, -1);
      else if (e.key === " " && !e.target.closest("button")) { e.preventDefault(); definirPausa(!vitrine.pausado); }
    });
    document.addEventListener("fullscreenchange", () => {
      if (document.fullscreenElement) return;
      if (vitrine.apresentando) sairDaApresentacao();
      else if (!vitrine.saida) restaurarRolagem(); // a tela cheia pode terminar depois da saída
    });
    el.addEventListener("touchstart", (e) => { vitrine.toqueX = e.changedTouches[0].clientX; }, { passive: true });
    el.addEventListener("touchend", (e) => {
      if (vitrine.toqueX === null || !e.target.closest(".showcase-stage")) return;
      const dx = e.changedTouches[0].clientX - vitrine.toqueX;
      vitrine.toqueX = null;
      if (Math.abs(dx) > 50) mostrarNaVitrine(vitrine.indice + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
    }, { passive: true });
  }

  function renderAll() {
    const lista = filtrarProjetos();
    renderVitrine(lista);
    renderGrid(lista);
    renderTimeline(lista);

    const grid = document.getElementById("projectsGrid");
    const timeline = document.getElementById("projectsTimeline");
    const apresentacao = document.getElementById("projectsShowcase");
    if (apresentacao) apresentacao.classList.toggle("hidden-view", visualizacao !== "apresentacao");
    if (grid && timeline) {
      grid.classList.toggle("hidden-view", visualizacao !== "grid");
      timeline.classList.toggle("active", visualizacao === "timeline");
    }
    // Medido depois de mostrar o grid: escondido, as alturas dão 0.
    atualizarBotoesLerMais();
  }

  /* ---------- Carregamento do JSON ---------- */
  async function carregarProjetos() {
    try {
      const resposta = await fetch(CAMINHO_DADOS_PROJETOS, { cache: "no-store" });
      if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
      const dados = await resposta.json();
      projetos = Array.isArray(dados.projetos) ? dados.projetos : [];
    } catch (erro) {
      console.error("Não foi possível carregar data/gerado/projetos.json:", erro);
      erroAoCarregar = true;
    }
    // Os botões de filtro dependem de data/setores.json.
    await setoresProntos;
    renderFiltros();
    renderAll();
  }

  function bindEvents() {
    ligarVitrine();
    const filtersEl = document.getElementById("projectFilters");
    if (filtersEl) {
      filtersEl.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-filter]");
        if (!btn) return;
        filtroAtivo = btn.getAttribute("data-filter");
        renderFiltros();
        renderAll();
      });
    }

    const gridEl = document.getElementById("projectsGrid");
    if (gridEl) {
      gridEl.addEventListener("click", (e) => {
        // Selo "Ver fotos" ou clique na própria foto de um projeto com galeria.
        const abrir = e.target.closest(".project-photos") || e.target.closest(".project-thumb.has-gallery");
        if (abrir) {
          const card = abrir.closest(".project-card");
          abrirGaleria(Number(card.getAttribute("data-projeto")), card.querySelector(".project-photos") || card);
          return;
        }
        const btn = e.target.closest(".project-more");
        if (!btn) return;
        const card = btn.closest(".project-card");
        const aberto = card.classList.toggle("is-expanded");
        btn.textContent = aberto ? "Ler menos" : "Ler mais";
        btn.setAttribute("aria-expanded", String(aberto));
      });
    }

    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(atualizarBotoesLerMais, 150);
    });

    const toggleEl = document.getElementById("projectViewToggle");
    if (toggleEl) {
      // O marcador laranja acompanha a largura real do botão ativo, em qualquer tela
      const posicionarMarcador = () => {
        const ativo = toggleEl.querySelector("button.active");
        if (!ativo) return;
        const grupo = toggleEl.getBoundingClientRect();
        const botao = ativo.getBoundingClientRect();
        toggleEl.style.setProperty("--marca-x", `${botao.left - grupo.left}px`);
        toggleEl.style.setProperty("--marca-largura", `${botao.width}px`);
      };
      posicionarMarcador();
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(posicionarMarcador);
      if ("ResizeObserver" in window) {
        // Observa também os botões: a fonte pode chegar depois e mudar a largura de cada um
        const observador = new ResizeObserver(posicionarMarcador);
        [toggleEl, ...toggleEl.querySelectorAll("button")].forEach((el) => observador.observe(el));
      }
      else window.addEventListener("resize", posicionarMarcador);

      toggleEl.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-view]");
        if (!btn) return;
        visualizacao = btn.getAttribute("data-view");
        toggleEl.querySelectorAll("button").forEach((b) => b.classList.toggle("active", b === btn));
        posicionarMarcador();
        renderAll();
      });
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    bindEvents();
    carregarProjetos();
  });
})();
