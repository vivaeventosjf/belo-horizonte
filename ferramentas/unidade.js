/**
 * Funcoes que as duas ferramentas (build.js e wordpress.js) compartilham:
 * ler a configuracao de uma unidade e montar o index.html dela.
 */
const fs = require('fs');
const path = require('path');

const raiz = path.join(__dirname, '..');
const BASE = path.join(raiz, 'base');
const UNIDADES = path.join(raiz, 'unidades');

/** Lista os slugs disponiveis em unidades/ */
function listar() {
  if (!fs.existsSync(UNIDADES)) return [];
  return fs
    .readdirSync(UNIDADES)
    .filter((d) => fs.existsSync(path.join(UNIDADES, d, 'unidade.js')))
    .sort();
}

/**
 * Le unidades/<slug>/unidade.js. O arquivo e o mesmo que vai para o navegador
 * (`window.UNIDADE = {...}`), entao aqui so damos a ele um `window` de mentira.
 */
function carregar(slug) {
  if (!slug) {
    console.error('Informe a unidade. Disponiveis: ' + (listar().join(', ') || 'nenhuma'));
    process.exit(1);
  }
  const arquivo = path.join(UNIDADES, slug, 'unidade.js');
  if (!fs.existsSync(arquivo)) {
    console.error('Unidade "' + slug + '" nao encontrada. Disponiveis: ' + (listar().join(', ') || 'nenhuma'));
    process.exit(1);
  }
  const janela = {};
  new Function('window', fs.readFileSync(arquivo, 'utf8'))(janela);
  const dados = janela.UNIDADE || janela.REGIAO;
  if (!dados) {
    console.error(arquivo + ' nao define window.UNIDADE.');
    process.exit(1);
  }
  return { slug, dados, arquivo, pasta: path.join(UNIDADES, slug) };
}

/**
 * Campos que o proprio build calcula a partir dos outros:
 *   caminho    pasta/URL da unidade no site publicado (default: o slug)
 *   urlPublica endereco final, quando a unidade tem urlBase
 *   ogImage    imagem de compartilhamento — o Facebook e o WhatsApp exigem
 *              URL absoluta, senao o preview do link sai sem imagem
 *   tagsUrl    <link rel=canonical> e og:url, so quando ha urlBase
 */
function calcular(dados) {
  const caminho = (dados.caminho || dados.slug || '').replace(/^\/+|\/+$/g, '');
  const base = (dados.urlBase || '').replace(/\/+$/, '');
  const urlPublica = base ? base + '/' + caminho + '/' : '';
  return {
    ...dados,
    caminho,
    urlPublica,
    ogImage: urlPublica ? urlPublica + 'assets/img/og-image.jpg' : 'assets/img/og-image.jpg',
    tagsUrl: urlPublica
      ? [
          '  <link rel="canonical" href="' + urlPublica + '">',
          '  <meta property="og:url" content="' + urlPublica + '">',
        ].join(String.fromCharCode(10))
      : '  <!-- sem urlBase em unidade.js: canonical e og:url ficam de fora -->',
  };
}

/** Busca 'seo.titulo' dentro do objeto da unidade */
function valor(dados, caminho) {
  return caminho.split('.').reduce((o, k) => (o == null ? undefined : o[k]), dados);
}

/**
 * Troca os {{marcadores}} do base/index.html pelos dados da unidade e reescreve
 * os textos de fallback dos [data-site], para a pagina ficar correta mesmo
 * antes do JS rodar (e para o bloco do Elementor nao nascer com texto de BH).
 */
function montarHtml(entrada) {
  const dados = calcular(entrada);
  let html = fs.readFileSync(path.join(BASE, 'index.html'), 'utf8');
  const faltando = [];

  html = html.replace(/\{\{([\w.]+)\}\}/g, (todo, chave) => {
    const v = valor(dados, chave);
    if (v == null || v === '') {
      faltando.push(chave);
      return todo;
    }
    return String(v);
  });

  // <span data-site="unidade">VIVA Eventos BH</span>  ->  nome da unidade atual
  html = html.replace(
    /(<([a-z0-9]+)\b[^>]*\bdata-site="([\w.]+)"[^>]*>)([^<>]*)(<\/\2>)/gi,
    (todo, abre, tag, chave, miolo, fecha) => {
      const v = valor(dados, chave);
      return v == null || v === '' ? todo : abre + v + fecha;
    }
  );

  return { html, faltando };
}

module.exports = { raiz, BASE, UNIDADES, listar, carregar, valor, calcular, montarHtml };
