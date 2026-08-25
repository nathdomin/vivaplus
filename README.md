# Viva+ — Site Institucional

Site institucional da Viva+, construído em **HTML5, CSS3 e JavaScript puro** (sem frameworks). Todo o conteúdo dinâmico (setores, colaboradores, projetos e valores) fica centralizado em arquivos de dados dentro de `js/`, então atualizar o site no dia a dia significa editar esses arquivos — não o HTML.

## Estrutura de pastas

```
viva-plus/
├── index.html
├── admin/
│   ├── index.html         → carrega o Decap CMS (painel de administração)
│   └── config.yml         → configuração do painel (coleções, campos, backend)
├── data/
│   └── colaboradores.json → lista de colaboradores, editável pelo painel /admin
├── css/
│   ├── style.css        → design system e layout
│   ├── responsive.css   → breakpoints (320px → 1920px)
│   └── animations.css   → animações e reveal ao rolar
├── js/
│   ├── data.js           → valores, setores e projetos
│   ├── colaboradores.js  → carrega data/colaboradores.json e renderiza o time
│   ├── setores.js        → organograma, cards de setores e modal
│   ├── projetos.js       → grid/timeline de projetos e filtros
│   └── main.js           → navbar, menu mobile, reveal, metas, contato
└── assets/
    ├── images/
    │   ├── logo.png            → logo principal (wordmark)
    │   ├── logo-v.png          → símbolo "V" (usado no favicon e no hero)
    │   ├── colaboradores/      → fotos dos colaboradores (enviadas pelo painel /admin)
    │   └── projetos/           → fotos dos projetos (a adicionar)
    └── icons/
```

---

## Como alterar as cores

Abra `css/style.css` e edite as variáveis no topo do arquivo (dentro de `:root`):

```css
:root {
  --color-green: #C0D21F;
  --color-orange: #EA713B;
  --color-blue: #2F3283;
}
```

Todo o site usa essas variáveis — não há cores "soltas" no meio do CSS, então alterar aqui atualiza tudo.

---

## Como trocar o logo

1. Substitua os arquivos `assets/images/logo.png` (logo completo) e `assets/images/logo-v.png` (símbolo).
2. Mantenha os mesmos nomes de arquivo — assim você não precisa editar o HTML.
3. Se quiser usar nomes diferentes, atualize as tags `<img src="...">` no `index.html` (aparecem no header, no hero e no footer).

---

## Como adicionar, editar ou remover um colaborador

A forma recomendada é pelo **painel de administração em `/admin`** — veja a seção
["Painel de administração"](#painel-de-administração-decap-cms) mais abaixo. Ele
não exige mexer em código nem em JSON na mão.

Se preferir editar diretamente, os colaboradores ficam em `data/colaboradores.json`
(não mais em `js/colaboradores.js`). Para adicionar um novo, inclua um objeto na
lista `colaboradores`:

```json
{
  "nome": "Nome Completo",
  "setorId": "rh",
  "cargo": "Cargo do colaborador",
  "foto": "assets/images/colaboradores/nome-do-arquivo.jpg"
}
```

`setorId` precisa ser um dos ids definidos em `js/data.js` (`diretoria`, `rh`,
`ted`, `4sma`, `comunicacao`, `comercial`). O card é gerado automaticamente na
seção **Colaboradores** e também aparece no modal do setor correspondente.

Para remover alguém, apague o objeto correspondente dentro do array. Como é um
arquivo JSON, tome cuidado com vírgulas e chaves — um erro de sintaxe impede o
site de carregar a lista.

---

## Como adicionar um projeto/atividade

Abra `js/data.js` e adicione um novo objeto dentro do array `projetos`:

```javascript
{
  titulo: "Nome do projeto",
  setor: "Nome do setor (texto livre, para exibição)",
  setorId: "ted", // usado para os filtros
  categoria: "Saúde",
  data: "Em breve", // ou uma data real, ex: "10/2026"
  imagem: "assets/images/projetos/nome-do-arquivo.jpg",
  descricao: "Descrição em breve.", // troque por uma descrição real quando disponível
  status: "Realizado" // ou "Em andamento"
}
```

## Como adicionar uma atividade a um setor

Ainda em `js/data.js`, localize o setor dentro do array `setores` e adicione um item no array `atividades` desse setor:

```javascript
atividades: [
  "Atividade já existente",
  "Nova atividade aqui"
]
```

---

## Como alterar a missão

Edite diretamente o texto dentro da seção "Missão e visão" no `index.html`, no bloco `<div class="mission-card mission-item">`.

## Como alterar a visão

Mesmo processo, no bloco `<div class="mission-card vision">` do `index.html`.

> Importante: a missão e a visão só devem ser alteradas se o conteúdo institucional oficial da Viva+ mudar — não altere o significado do texto sem uma atualização oficial.

---

## Como alterar os valores

Edite o array `valores` em `js/data.js`. Cada valor segue esta estrutura:

```javascript
{
  numero: "01",
  nome: "Nome do valor",
  icone: "chave-do-icone", // veja os ícones existentes em js/main.js (valueIcons)
  descricao: "Descrição curta do valor."
}
```

Para adicionar um novo valor com um ícone próprio, crie uma nova entrada em `valueIcons` dentro de `js/main.js` com um SVG simples.

---

## Painel de administração (Decap CMS)

O site usa o **[Decap CMS](https://decapcms.org/)** (antigo Netlify CMS) como
painel de administração, em `/admin`. Diferente do antigo `admin.html`, ele:

- não pede para baixar e reenviar nenhum arquivo manualmente;
- salva as alterações direto no repositório Git, como um commit normal;
- não usa banco de dados — o "banco de dados" é o próprio `data/colaboradores.json`
  versionado no Git;
- não roda nenhum servidor seu: é só HTML/JS estático (`admin/index.html` +
  `admin/config.yml`), como o resto do site.

Hoje ele gerencia apenas os **colaboradores** (`data/colaboradores.json`). Setores,
projetos e valores continuam em `js/data.js`, editados diretamente no código —
dá para estender o mesmo painel para eles depois, seguindo o mesmo padrão.

### O que precisa ser feito por fora (configuração única)

O Decap CMS só funciona com um "backend" que autentica você e grava os commits.
O caminho mais simples, sem precisar programar nada, é usar **Netlify + Git
Gateway**:

1. **Suba o projeto para um repositório Git** (GitHub, GitLab ou Bitbucket), se
   ainda não estiver em um.
2. **Crie um site no [Netlify](https://www.netlify.com/)** conectado a esse
   repositório (mesmo que o site final seja servido em outro domínio — dá para
   apontar seu domínio próprio para o site Netlify).
3. No painel do Netlify, ative **Identity** (aba *Identity* → *Enable Identity*).
4. Ainda em Identity, em *Services*, ative o **Git Gateway** (*Enable Git Gateway*).
   É isso que permite ao painel gravar commits sem cada pessoa precisar de uma
   conta no GitHub/GitLab.
5. Em *Identity* → *Registration*, defina se o cadastro é aberto ou só por
   convite (recomendado: **Invite only**), e convide os e-mails de quem vai
   administrar o conteúdo.
6. Confirme que `admin/config.yml` tem `branch: main` apontando para a branch
   que o Netlify publica (ajuste se o seu repositório usar outro nome, como
   `master`).
7. Acesse `seusite.com/admin`, faça login com o convite recebido por e-mail, e
   pronto — a tela de edição de colaboradores já aparece.

> **Alternativa sem Netlify:** dá para usar o backend `github` do Decap CMS
> apontando direto para o repositório, mas isso exige configurar um provedor de
> OAuth próprio (um pequeno serviço que troca o código do GitHub por um token).
> Para a maioria dos casos, Netlify + Git Gateway é o caminho com menos
> configuração — é gratuito para esse uso e não exige escrever nenhum código de
> servidor.

### Testando localmente antes de publicar

Com o [Node.js](https://nodejs.org/) instalado, dentro da pasta do projeto:

```bash
npx decap-server
```

Depois sirva o site normalmente (ex.: `npx serve .` em outra aba do terminal) e
acesse `/admin` — com `local_backend: true` já presente em `admin/config.yml`,
o painel detecta o ambiente local e grava as alterações direto nos arquivos do
seu computador, sem precisar de login nem de internet. Ótimo para testar antes
de configurar o Netlify.

### Se você criar um novo setor

Como `admin/config.yml` é um arquivo estático, o campo "Setor" do painel não lê
`js/data.js` automaticamente. Se adicionar um setor novo lá, adicione a opção
correspondente em `admin/config.yml` (campo `setorId`) e no array
`filtrosColaboradores`, em `js/colaboradores.js`.

## Como alterar as metas

Cada setor tem seu próprio array `metas` dentro de `js/data.js`. Edite a lista de metas do setor desejado — a seção "Onde queremos chegar" e o modal do setor são atualizados automaticamente.

---

## Como adicionar imagens (colaboradores e projetos)

1. Salve a imagem dentro de `assets/images/colaboradores/` ou `assets/images/projetos/`.
2. Aponte o campo `foto` (colaborador) ou `imagem` (projeto) para o caminho do arquivo.
3. Enquanto uma foto não existir, o site mostra automaticamente um fallback: iniciais do nome (colaboradores) ou o rótulo "Imagem em breve" (projetos) — nenhum link fica quebrado.

---

## Como criar um novo setor

1. Em `js/data.js`, adicione um novo objeto no array `setores`, seguindo a mesma estrutura dos existentes (`id`, `numero`, `nome`, `corAccent`, `resumo`, `objetivo`, `atividades`, `metas`).
2. Em `data/colaboradores.json`, use o novo `id` no campo `setorId` dos colaboradores desse setor (ou cadastre-os pelo painel `/admin`, depois de atualizar o passo 4).
3. Se quiser incluir o setor nos filtros de Colaboradores e Projetos, adicione uma entrada em `filtrosColaboradores` (`js/colaboradores.js`) e `filtrosProjetos` (`js/data.js`).
4. Para o novo setor aparecer como opção no painel `/admin`, adicione-o também em `admin/config.yml` (veja "Se você criar um novo setor" na seção do painel).

O organograma, os cards de setores e os modais são gerados automaticamente — não é necessário tocar no HTML.

---

## Boas práticas ao editar

- Sempre mantenha a formatação de vírgulas e chaves `{ }` dos arquivos `.js` — um erro de sintaxe pode impedir o site de carregar.
- Use aspas duplas `"..."` para textos, como no restante do arquivo.
- Depois de editar, abra o `index.html` no navegador e confira se a seção correspondente foi atualizada corretamente.
- Onde não houver informação disponível, mantenha o texto **"Informações em breve."** em vez de inventar conteúdo.
