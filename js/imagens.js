/* =========================================================
   VIVA+ — imagens.js
   Entrega as fotos já no tamanho em que aparecem na tela,
   usando o redimensionamento do Netlify (Netlify Image CDN).
   Assim, mesmo que alguém envie pelo /admin um print de
   celular gigante, o visitante baixa só uma versão pequena
   (e em WebP/AVIF quando o navegador aceita).

   Fora do Netlify (ex.: rodando o site localmente) o
   endereço /.netlify/images não existe, então a função
   devolve o caminho original da imagem.
   ========================================================= */

const USAR_CDN_IMAGENS =
  location.protocol !== "file:" && !/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);

/* caminho: como está no JSON ("assets/..." ou "/assets/...")
   largura/altura: tamanho em pixels a entregar (use o dobro do
   tamanho exibido, para telas de alta densidade). */
function urlImagem(caminho, largura, altura) {
  if (!caminho) return "";
  if (!USAR_CDN_IMAGENS || /^https?:/i.test(caminho)) return caminho;
  const absoluto = caminho.startsWith("/") ? caminho : "/" + caminho;
  const params = new URLSearchParams({ url: absoluto, w: largura });
  if (altura) {
    params.set("h", altura);
    params.set("fit", "cover");
  }
  return `/.netlify/images?${params}`;
}

/* Se o CDN falhar, tenta uma vez o arquivo original antes de
   desistir (aí entra o fallback de cada card: iniciais ou
   "Imagem em breve"). Usado no onerror das <img>. */
function imagemComFallback(img, aoFalhar) {
  const original = img.dataset.original;
  if (original && img.getAttribute("src") !== original) {
    img.src = original;
    return;
  }
  aoFalhar(img);
}
