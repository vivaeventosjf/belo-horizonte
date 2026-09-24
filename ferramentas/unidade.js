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
 * Momentos da jornada que variam de praca para praca: a tradicao de uma
 * faculdade nao e a da outra. A unidade sobrescreve o que quiser em
 * `momentos` no unidade.js; o resto continua sendo o da rede.
 *
 * `foco` e o object-position da foto dentro do cartao. O cartao quase nunca
 * tem a proporcao da imagem, entao com o padrao (center) o corte come topo e
 * base em partes iguais — e em retrato isso corta a cabeca de quem posa.
 */
const MOMENTOS_REDE = {
  med2: {
    foco: 'center',
    img: 'mom-med-caminhada.webp',
    w: 640, h: 427,
    titulo: 'Caminhada Etílica',
    texto: 'A tradição que coloca a turma inteira na rua.',
    alt: 'Turma de Medicina comemorando dentro de um ônibus decorado durante a caminhada',
  },
  med3: {
    foco: 'center',
    img: 'mom-med-meio.webp',
    w: 600, h: 400,
    titulo: 'Meio Médico',
    texto: 'O evento não oficial mais importante do curso.',
    alt: 'Turma de Medicina reunida em frente ao painel do Meio Médico',
  },
  med4: {
    foco: 'center',
    img: 'mom-med-fotos.webp',
    w: 640, h: 960,
    titulo: 'Sessões de fotos',
    texto: 'As recordações de cada fase.',
    alt: 'Formanda de Medicina posando diante de neon com a palavra Medicina',
  },
};

/**
 * Campos que o proprio build calcula a partir dos outros:
 *   caminho    pasta/URL da unidade no site publicado (default: o slug)
 *   urlPublica endereco final, quando a unidade tem urlBase
 *   ogImage    imagem de compartilhamento — o Facebook e o WhatsApp exigem
 *              URL absoluta, senao o preview do link sai sem imagem
 *   nota       nota da pesquisa; sem o campo na unidade, usa a da rede (4.6)
 *   tagsUrl    <link rel=canonical> e og:url, so quando ha urlBase
 *   tagsPixel  codigo do Meta Pixel, so quando a unidade tem metaPixel. Cada
 *              unidade tem o seu: o pixel de uma nao pode receber o trafego
 *              da outra, senao o publico e a otimizacao se misturam
 */
function calcular(dados) {
  const caminho = (dados.caminho || dados.slug || '').replace(/^\/+|\/+$/g, '');
  // nota da pesquisa: a da rede vale para quem nao informar a sua
  const nota = String(dados.nota || '4.6');

  // Momentos da jornada que a unidade pode trocar. O que nao vier do
  // unidade.js fica com o da rede. Ver MOMENTOS_REDE logo abaixo.
  const momentos = {};
  for (const [chave, padrao] of Object.entries(MOMENTOS_REDE)) {
    momentos[chave] = { ...padrao, ...((dados.momentos || {})[chave] || {}) };
  }
  const base = (dados.urlBase || '').replace(/\/+$/, '');
  const urlPublica = base ? base + '/' + caminho + '/' : '';
  return {
    ...dados,
    caminho,
    nota,
    momentos,
    notaTexto: nota.replace('.', ','),
    urlPublica,
    ogImage: urlPublica ? urlPublica + 'assets/img/og-image.jpg' : 'assets/img/og-image.jpg',
    tagsUrl: urlPublica
      ? [
          '  <link rel="canonical" href="' + urlPublica + '">',
          '  <meta property="og:url" content="' + urlPublica + '">',
        ].join(String.fromCharCode(10))
      : '  <!-- sem urlBase em unidade.js: canonical e og:url ficam de fora -->',
    tagsPixel: codigoPixel(dados.metaPixel),
  };
}

/**
 * Codigo do Meta Pixel da unidade. Sem o id, devolve um comentario: o
 * marcador precisa de algum valor, senao o build acusa campo faltando.
 *
 * O id vai escapado por seguranca de sintaxe, mesmo vindo de arquivo nosso:
 * um caractere solto aqui quebraria o <script> inteiro e derrubaria a pagina.
 */
function codigoPixel(id) {
  const limpo = String(id || '').replace(/[^0-9]/g, '');
  if (!limpo) {
    return '  <!-- sem metaPixel em unidade.js: esta unidade nao tem pixel -->';
  }
  const L = String.fromCharCode(10);
  return [
    '  <!-- Meta Pixel -->',
    '  <script>',
    "  !function(f,b,e,v,n,t,s)",
    "  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?",
    "  n.callMethod.apply(n,arguments):n.queue.push(arguments)};",
    "  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';",
    "  n.queue=[];t=b.createElement(e);t.async=!0;",
    "  t.src=v;s=b.getElementsByTagName(e)[0];",
    "  s.parentNode.insertBefore(t,s)}(window, document,'script',",
    "  'https://connect.facebook.net/en_US/fbevents.js');",
    "  fbq('init', '" + limpo + "');",
    "  fbq('track', 'PageView');",
    '  </' + 'script>',
    '  <noscript><img height="1" width="1" style="display:none" alt=""',
    '  src="https://www.facebook.com/tr?id=' + limpo + '&ev=PageView&noscript=1"></noscript>',
    '  <!-- Fim do Meta Pixel -->',
  ].join(L);
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
