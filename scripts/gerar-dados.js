/* =========================================================
   VIVA+ — gerar-dados.js
   Colaboradores e projetos são editados no painel /admin como
   UM ARQUIVO POR ITEM (data/colaboradores/ana-lia.json,
   data/projetos/dia-das-mulheres.json...). O site, porém, lê
   um único JSON de cada tipo, que este script monta:

     data/colaboradores/*.json → data/gerado/colaboradores.json
     data/projetos/*.json      → data/gerado/projetos.json

   Quando roda:
   - no Netlify, a cada publicação (veja netlify.toml);
   - no seu computador: `node scripts/gerar-dados.js`, ou
     `node scripts/gerar-dados.js --watch` para regenerar sozinho
     enquanto você edita pelo painel local.

   Não edite os arquivos de data/gerado/ à mão: são sobrescritos.
   Sem dependências — só o Node.
   ========================================================= */

const fs = require("fs");
const path = require("path");

const RAIZ = path.join(__dirname, "..");
const DADOS = path.join(RAIZ, "data");
const SAIDA = path.join(DADOS, "gerado");

function lerJson(caminho) {
  return JSON.parse(fs.readFileSync(caminho, "utf8"));
}

function lerPasta(nome) {
  const pasta = path.join(DADOS, nome);
  if (!fs.existsSync(pasta)) return [];
  return fs
    .readdirSync(pasta)
    .filter((arquivo) => arquivo.endsWith(".json"))
    .sort()
    .map((arquivo) => {
      try {
        return lerJson(path.join(pasta, arquivo));
      } catch (erro) {
        // Um arquivo com defeito não pode derrubar o site inteiro.
        console.error(`Ignorando data/${nome}/${arquivo}: ${erro.message}`);
        return null;
      }
    })
    .filter(Boolean);
}

function escrever(nome, chave, lista) {
  fs.mkdirSync(SAIDA, { recursive: true });
  const destino = path.join(SAIDA, nome);
  const conteudo = JSON.stringify({ [chave]: lista }, null, 2) + "\n";
  // Só regrava quando muda, para o modo --watch não entrar em loop.
  if (!fs.existsSync(destino) || fs.readFileSync(destino, "utf8") !== conteudo) {
    fs.writeFileSync(destino, conteudo);
  }
  console.log(`data/gerado/${nome}: ${lista.length} itens`);
}

/* Mesma regra do site (js/colaboradores.js): dentro do setor, primeiro
   Gestor(a)/Diretor(a), depois Co-Gestor(a), depois os demais. */
function pesoCargo(cargo) {
  const c = cargo || "";
  if (/co-?\s*(gestor|diretor)/i.test(c)) return 1;
  return /gestor|diretor/i.test(c) ? 0 : 2;
}
const porNome = (a, b) => String(a.nome || "").localeCompare(String(b.nome || ""), "pt-BR");

function gerar() {
  let ordemSetores = [];
  try {
    ordemSetores = lerJson(path.join(DADOS, "setores.json")).setores.map((s) => s.id);
  } catch (erro) {
    console.error(`Não foi possível ler data/setores.json: ${erro.message}`);
  }
  const posicao = (id) => {
    const i = ordemSetores.indexOf(id);
    return i === -1 ? ordemSetores.length : i; // setor apagado vai para o fim
  };

  // Colaboradores: por setor (na ordem de data/setores.json), gestores
  // e co-gestores primeiro, depois por nome — sem precisar arrastar nada no painel.
  const colaboradores = lerPasta("colaboradores").sort(
    (a, b) =>
      posicao(a.setorId) - posicao(b.setorId) ||
      pesoCargo(a.cargo) - pesoCargo(b.cargo) ||
      porNome(a, b)
  );
  escrever("colaboradores.json", "colaboradores", colaboradores);

  // Projetos: o site já ordena pela data; aqui só deixamos estável.
  const projetos = lerPasta("projetos").sort((a, b) =>
    String(a.titulo || "").localeCompare(String(b.titulo || ""), "pt-BR")
  );
  escrever("projetos.json", "projetos", projetos);
}

gerar();

if (process.argv.includes("--watch")) {
  console.log("Observando data/ — Ctrl+C para parar.");
  let espera;
  const regerar = () => {
    clearTimeout(espera);
    espera = setTimeout(gerar, 150);
  };
  ["colaboradores", "projetos"].forEach((nome) => {
    const pasta = path.join(DADOS, nome);
    if (fs.existsSync(pasta)) fs.watch(pasta, regerar);
  });
  fs.watch(path.join(DADOS, "setores.json"), regerar);
}
