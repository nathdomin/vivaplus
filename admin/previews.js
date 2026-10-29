/* =========================================================
   VIVA+ — previews.js
   Pré-visualização do painel /admin com o visual real do site:
   usa o mesmo css/style.css e os mesmos ícones de setor, então
   o card que você vê aqui é o card que aparece publicado.

   Cada modelo é registrado pelo "name" do arquivo em
   admin/config.yml (colaboradores, projetos, setores, metas,
   orientacoes). A pré-visualização é só leitura: nada daqui
   é gravado no repositório.
   ========================================================= */

(function () {
  const h = window.h;
  if (!window.CMS || !h) return;

  /* Os setores vêm de data/setores.json (o mesmo arquivo do site). A
     lista é carregada uma vez; as pré-visualizações já se atualizam
     a cada alteração feita no formulário, então pegam o valor novo. */
  const setores = [];
  fetch("/data/setores.json", { cache: "no-store" })
    .then((r) => r.json())
    .then((dados) => setores.push(...(Array.isArray(dados.setores) ? dados.setores : [])))
    .catch(() => {});

  const setorPorId = (id) => setores.find((s) => s.id === id);
  const nomeSetor = (id) => (setorPorId(id) ? setorPorId(id).nome : "Sem setor");

  function lista(entry, campo) {
    const valor = entry.getIn(["data", campo]);
    return valor && valor.toJS ? valor.toJS() : [];
  }

  /* Foto recém-enviada ainda não está no site: getAsset devolve o arquivo
     em memória. Para fotos já publicadas, cai no caminho salvo no JSON. */
  function urlImagem(props, caminho) {
    if (!caminho) return "";
    try {
      const url = String(props.getAsset(caminho) || "");
      return url && url !== "undefined" ? url : caminho;
    } catch (e) {
      return caminho;
    }
  }

  function iniciais(nome) {
    return (nome || "")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0])
      .join("")
      .toUpperCase();
  }

  function moldura(titulo, filhos) {
    return h(
      "div",
      { className: "prev" },
      h("p", { className: "prev-aviso" }, titulo),
      filhos
    );
  }

  /* ---------- Colaboradores: agrupados por setor ---------- */
  function ColaboradoresPreview(props) {
    const itens = lista(props.entry, "colaboradores");
    const grupos = setores.map((s) => ({ nome: s.nome, itens: itens.filter((c) => c.setorId === s.id) }));
    grupos.push({ nome: "Sem setor", itens: itens.filter((c) => !setorPorId(c.setorId)) });

    return moldura(
      "Pré-visualização agrupada por setor. No site, o filtro “Todos” segue a ordem da lista.",
      grupos
        .filter((g) => g.itens.length)
        .map((g) =>
          h(
            "section",
            { key: g.nome, className: "prev-grupo" },
            h("h3", { className: "prev-titulo" }, g.nome, h("span", null, g.itens.length)),
            h(
              "div",
              { className: "team-grid" },
              g.itens.map((c, i) =>
                h(
                  "article",
                  { key: i, className: "team-card" },
                  h(
                    "div",
                    { className: "team-avatar" },
                    h("span", null, iniciais(c.nome)),
                    c.foto ? h("img", { src: urlImagem(props, c.foto), alt: "" }) : null
                  ),
                  h("h3", null, c.nome || "Novo colaborador"),
                  h("p", { className: "role" }, c.cargo || "Informações em breve"),
                  h("span", { className: "dept-tag" }, nomeSetor(c.setorId))
                )
              )
            )
          )
        )
    );
  }

  /* ---------- Projetos ---------- */
  function ProjetosPreview(props) {
    const itens = lista(props.entry, "projetos");
    return moldura(
      "Pré-visualização dos cards da seção “Projetos & atividades”.",
      h(
        "div",
        { className: "prev-grid" },
        itens.map((p, i) =>
          h(
            "article",
            { key: i, className: "project-card" },
            h(
              "div",
              { className: "project-thumb" },
              h("span", { className: "project-status" }, p.status || ""),
              p.imagem
                ? h("img", { className: "project-thumb-img is-loaded", src: urlImagem(props, p.imagem), alt: "" })
                : h("span", { className: "project-thumb-placeholder" }, "Imagem em breve")
            ),
            h(
              "div",
              { className: "project-body" },
              h("div", { className: "project-cat" }, p.categoria || ""),
              h("h3", null, p.titulo || "Novo projeto"),
              h("p", { className: "project-desc" }, p.descricao || ""),
              h("div", { className: "project-meta" }, h("span", null, p.setor || ""), h("span", null, p.data || ""))
            )
          )
        )
      )
    );
  }

  /* ---------- Setores ---------- */
  function SetoresPreview(props) {
    const itens = lista(props.entry, "setores");
    return moldura(
      "Pré-visualização dos cards da seção “Setores”.",
      h(
        "div",
        { className: "prev-grid" },
        itens.map((s, i) =>
          h(
            "article",
            { key: i, className: "sector-card" },
            h(
              "div",
              { className: "sector-top" },
              h("div", {
                className: "sector-badge",
                style: { background: s.corAccent || "var(--color-blue)" },
                dangerouslySetInnerHTML: { __html: iconeDoSetor(s) }
              }),
              h("span", { className: "sector-num" }, s.numero || "")
            ),
            h("h3", null, s.nome || "Novo setor"),
            h("p", null, s.resumo || "Informações em breve.")
          )
        )
      )
    );
  }

  /* ---------- Metas ---------- */
  function MetasPreview(props) {
    const itens = lista(props.entry, "progresso");
    return moldura(
      "Pré-visualização dos cards da seção “Metas”.",
      h(
        "div",
        { className: "prev-grid" },
        itens.map((m, i) => {
          const setor = setorPorId(m.setor);
          const pct = Math.min(100, Math.max(0, Number(m.percentual) || 0));
          return h(
            "div",
            { key: i, className: "goal-card", style: { "--accent": setor ? setor.corAccent : "var(--color-orange)" } },
            h("h3", null, setor ? setor.nome : "Escolha o setor"),
            h("p", { className: "goal-objective" }, setor ? setor.resumo : ""),
            h(
              "div",
              { className: "goal-progress" },
              h("div", { className: "goal-progress-bar", style: { width: pct + "%" } })
            ),
            h("span", { className: "goal-progress-label" }, pct + "% concluído"),
            h(
              "ul",
              { className: "goal-list" },
              (m.metas || []).map((meta, j) =>
                h("li", { key: j, className: meta.concluida ? "is-done" : "" }, meta.texto || "")
              )
            )
          );
        })
      )
    );
  }

  /* ---------- Orientações ---------- */
  function OrientacoesPreview(props) {
    const meses = lista(props.entry, "meses");
    const dicas = lista(props.entry, "dicas");
    return moldura(
      "Pré-visualização do conteúdo da seção “Orientações”.",
      [
        h("h3", { key: "m", className: "prev-titulo" }, "Significado de cada mês", h("span", null, meses.length)),
        h(
          "div",
          { key: "mg", className: "prev-grid" },
          meses.map((m, i) =>
            h(
              "div",
              { key: i, className: "value-card" },
              h("span", { className: "value-number" }, String(m.mes || "").padStart(2, "0")),
              h("h3", null, m.tema || m.nome || ""),
              h("p", null, m.texto || "")
            )
          )
        ),
        h("h3", { key: "d", className: "prev-titulo" }, "Dicas rápidas", h("span", null, dicas.length)),
        h(
          "div",
          { key: "dg", className: "prev-grid" },
          dicas.map((d, i) =>
            h(
              "div",
              { key: i, className: "value-card" },
              h("h3", null, d.titulo || ""),
              h("p", null, d.texto || "")
            )
          )
        )
      ]
    );
  }

  CMS.registerPreviewStyle("/css/style.css");
  CMS.registerPreviewStyle("/admin/previews.css");

  CMS.registerPreviewTemplate("colaboradores", ColaboradoresPreview);
  CMS.registerPreviewTemplate("projetos", ProjetosPreview);
  CMS.registerPreviewTemplate("setores", SetoresPreview);
  CMS.registerPreviewTemplate("metas", MetasPreview);
  CMS.registerPreviewTemplate("orientacoes", OrientacoesPreview);
})();
