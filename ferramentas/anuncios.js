/**
 * Gera os anuncios 4:5 (1080x1350) para Instagram.
 *
 * Uso:  node ferramentas/anuncios.js belo-horizonte 1   (primeira rodada)
 *       node ferramentas/anuncios.js belo-horizonte     (todas as rodadas)
 *
 * Depois:  node ferramentas/anuncios-exportar.js belo-horizonte [1]
 *
 * As copies e os layouts daqui valem para todas as unidades. Quais fotos
 * entram em cada rodada fica em unidades/<slug>/anuncios.js.
 *
 * As fotos saem dos bancos originais em assets-originais/. As de
 * base/assets/img sao versoes comprimidas para o site e nao tem
 * resolucao para anuncio.
 *
 * Campos de cada anuncio:
 *   foto    caminho relativo a assets-originais/
 *   foco    object-position do recorte 4:5 ('center 22%' segura o rosto no alto)
 *   cortar  px de rodape a descartar; usa-se nas fotos cujo banco traz a
 *           marca d'agua do fotografo no pe da imagem
 *   layout  'base' texto embaixo, alinhado a esquerda
 *           'rodape-centro' texto embaixo, centralizado
 *           'topo' texto em cima - so use com foto de area limpa no alto
 *                  (teto, parede, ceu); em foto com gente o texto cobre o rosto
 *           'centro' texto no meio - so use em foto sem rosto
 */
const fs = require('fs');
const path = require('path');

const { raiz, listar, carregar } = require('./unidade');
const BARRA = String.fromCharCode(92);

const slug = process.argv[2];
if (!slug || !listar().includes(slug)) {
  console.error('Uso: node ferramentas/anuncios.js <unidade> [rodada]');
  console.error('Unidades: ' + (listar().join(', ') || 'nenhuma'));
  process.exit(1);
}
const { pasta } = carregar(slug);
const arquivoRodadas = path.join(pasta, 'anuncios.js');
if (!fs.existsSync(arquivoRodadas)) {
  console.error('Sem rodadas definidas: ' + arquivoRodadas);
  process.exit(1);
}
const RODADAS = require(arquivoRodadas);

// As fotos saem dos bancos originais; a saida fica junto da unidade.
const BANCOS = path.join(raiz, 'assets-originais');
const SAIDA = path.join(pasta, 'anuncios');

const COPIES = {
  'escolher-errado': {
    grupo: 'geral',
    headline: 'A turma inteira vai lembrar de quem escolheu a empresa da formatura.',
    sub: 'Escolha com segurança para transformar anos de faculdade em uma experiência inesquecível.',
    cta: 'Conheça a VIVA',
  },
  'pressao-comissao': {
    grupo: 'geral',
    headline: 'Entrou para a comissão? Agora uma turma inteira conta com você.',
    sub: 'Tenha apoio para transformar essa responsabilidade em uma formatura inesquecível.',
    cta: 'Conheça a VIVA Eventos',
  },
  'convencer-turma': {
    grupo: 'geral',
    headline: 'Gostou da empresa, mas ainda precisa convencer a turma?',
    sub: 'A escolha da formatura precisa fazer sentido para a comissão e para quem vai viver tudo isso com vocês.',
    cta: 'Conheça a VIVA',
  },
  adesao: {
    grupo: 'geral',
    headline: 'A melhor formatura começa com uma turma que acredita no projeto.',
    sub: 'Benefícios, experiências e uma jornada que faça o aluno querer participar desde o início.',
    cta: 'Descubra a experiência VIVA',
  },
  'medicina-comissao': {
    grupo: 'medicina',
    headline: 'Entrou para a comissão de Medicina? Agora uma turma inteira conta com vocês.',
    sub: 'Do Meio Médico ao Baile, tenha apoio para transformar cada etapa dessa jornada em uma experiência inesquecível.',
    cta: 'Analise sua turma',
  },
  'medicina-jornada': {
    grupo: 'medicina',
    headline: 'A formatura de Medicina começa muito antes do Baile.',
    sub: 'Meio Médico, Colação, Baile e uma jornada inteira de momentos que sua turma vai levar para sempre.',
    cta: 'Analise sua turma',
  },
};

// Os nomes no disco vem em NFD (acento como caractere separado) e o que
// escrevemos aqui esta em NFC. Comparar normalizado evita o falso negativo.
function acharArquivo(rel) {
  const completo = path.resolve(BANCOS, rel);
  if (fs.existsSync(completo)) return completo;
  const dir = path.dirname(completo);
  const alvo = path.basename(completo).normalize('NFC');
  if (!fs.existsSync(dir)) return null;
  const achado = fs.readdirSync(dir).find((f) => f.normalize('NFC') === alvo);
  return achado ? path.join(dir, achado) : null;
}

function paraUrl(p) {
  const abs = (acharArquivo(p) || path.resolve(BANCOS, p)).split(BARRA).join('/');
  const [drive, ...resto] = abs.split('/');
  return 'file:///' + drive + '/' + resto.map(encodeURIComponent).join('/');
}

// Headline longa precisa de corpo menor para nao virar parede de texto
function corpoHeadline(texto, layout) {
  const n = texto.length;
  const base = n <= 55 ? 86 : n <= 75 ? 76 : n <= 95 ? 68 : 62;
  return layout === 'centro' ? Math.round(base * 0.92) : base;
}

const LOGO = paraUrl(path.join(raiz, 'base/assets/img/logo-viva-branca.png'));

const VEUS = {
  base: 'linear-gradient(to top, rgba(12,9,7,.94) 0%, rgba(12,9,7,.88) 26%, rgba(12,9,7,.55) 46%, rgba(12,9,7,.12) 66%, rgba(12,9,7,.35) 100%)',
  topo: 'linear-gradient(to bottom, rgba(12,9,7,.95) 0%, rgba(12,9,7,.9) 32%, rgba(12,9,7,.52) 52%, rgba(12,9,7,.1) 72%, rgba(12,9,7,.5) 100%)',
  centro: 'linear-gradient(to bottom, rgba(12,9,7,.35) 0%, rgba(12,9,7,.72) 34%, rgba(12,9,7,.8) 70%, rgba(12,9,7,.5) 100%)',
  'rodape-centro': 'linear-gradient(to top, rgba(12,9,7,.95) 0%, rgba(12,9,7,.9) 30%, rgba(12,9,7,.55) 50%, rgba(12,9,7,.12) 68%, rgba(12,9,7,.35) 100%)',
};

const POSICOES = {
  base: 'left:72px;right:72px;bottom:76px;',
  topo: 'left:72px;right:72px;top:92px;',
  centro: 'left:72px;right:72px;top:50%;transform:translateY(-50%);text-align:center;',
  'rodape-centro': 'left:72px;right:72px;bottom:76px;text-align:center;',
};

function pagina(a) {
  const c = COPIES[a.copy];
  const corpo = corpoHeadline(c.headline, a.layout);
  const selo = c.grupo === 'medicina' ? 'Medicina' : 'Formatura';
  const centrado = a.layout === 'centro' || a.layout === 'rodape-centro';
  // No layout 'topo' o texto ocupa o alto, entao a marca desce para o rodape
  const marcaEmbaixo = a.layout === 'topo';

  return [
    '<!DOCTYPE html>',
    '<html lang="pt-BR"><head><meta charset="utf-8">',
    '<link rel="preconnect" href="https://fonts.googleapis.com">',
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
    '<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">',
    '<style>',
    '  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}',
    '  html,body{width:1080px;height:1350px;overflow:hidden;background:#1A1613}',
    '  .arte{position:relative;width:1080px;height:1350px;overflow:hidden;',
    '    font-family:"Outfit","Segoe UI",system-ui,sans-serif;color:#fff}',
    '  .foto{position:absolute;left:0;top:0;width:100%;height:calc(100% + ' + (a.cortar || 0) + 'px);',
    '    object-fit:cover;object-position:' + a.foco + '}',
    '  .veu{position:absolute;inset:0;background:' + VEUS[a.layout] + '}',
    '  .marca{position:absolute;left:72px;right:72px;display:flex;align-items:center;',
    '    justify-content:space-between;' + (marcaEmbaixo ? 'bottom:70px;' : 'top:64px;') + '}',
    '  .marca img{width:190px;height:auto;display:block}',
    '  .selo{font-size:23px;font-weight:500;letter-spacing:.14em;text-transform:uppercase;',
    '    color:rgba(255,255,255,.92);border:2px solid rgba(255,255,255,.45);border-radius:999px;padding:11px 24px}',
    '  .texto{position:absolute;' + POSICOES[a.layout] + '}',
    '  .risco{width:92px;height:7px;background:#FF6A1F;border-radius:999px;margin-bottom:34px;'
      + (centrado ? 'margin-left:auto;margin-right:auto;' : '') + '}',
    '  h1{font-size:' + corpo + 'px;line-height:1.06;font-weight:700;letter-spacing:-.022em;',
    '    text-wrap:balance;text-shadow:0 3px 26px rgba(0,0,0,.6)}',
    '  p{margin-top:28px;font-size:34px;line-height:1.38;font-weight:300;color:rgba(255,255,255,.93);',
    '    max-width:880px;text-shadow:0 2px 18px rgba(0,0,0,.55)'
      + (centrado ? ';margin-left:auto;margin-right:auto' : '') + '}',
    '  .cta{margin-top:46px;display:inline-flex;align-items:center;gap:18px;background:#FF6A1F;color:#1D1A17;',
    '    font-size:33px;font-weight:600;padding:26px 46px;border-radius:999px;',
    '    box-shadow:0 22px 46px -18px rgba(0,0,0,.8)}',
    '  .cta svg{width:30px;height:30px;stroke:#1D1A17;stroke-width:2.6;fill:none;',
    '    stroke-linecap:round;stroke-linejoin:round}',
    '</style></head>',
    '<body>',
    '  <div class="arte">',
    '    <img class="foto" src="' + paraUrl(a.foto) + '" alt="">',
    '    <div class="veu"></div>',
    '    <div class="marca"><img src="' + LOGO + '" alt="VIVA Eventos"><span class="selo">' + selo + '</span></div>',
    '    <div class="texto">',
    '      <div class="risco"></div>',
    '      <h1>' + c.headline + '</h1>',
    '      <p>' + c.sub + '</p>',
    '      <span class="cta">' + c.cta,
    '        <svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    '      </span>',
    '    </div>',
    '  </div>',
    '</body></html>',
  ].join('\n');
}

const pedido = process.argv[3];
const rodadas = pedido ? [pedido] : Object.keys(RODADAS);
let erros = 0;

for (const r of rodadas) {
  const lista = RODADAS[r];
  if (!lista) {
    console.error('Rodada desconhecida: ' + r);
    process.exit(1);
  }

  const pastaHtml = path.join(SAIDA, 'rodada-' + r, 'html');
  fs.rmSync(pastaHtml, { recursive: true, force: true });
  fs.mkdirSync(pastaHtml, { recursive: true });

  console.log('--- ' + slug + ' · rodada ' + r + ' ---');
  lista.forEach((a, i) => {
    if (!acharArquivo(a.foto)) {
      console.error('  FOTO NAO ENCONTRADA: ' + a.foto);
      erros++;
      return;
    }
    const id = (i + 1) + '-' + a.copy;
    fs.writeFileSync(path.join(pastaHtml, id + '.html'), pagina(a));
    console.log('  ' + id.padEnd(22) + a.layout.padEnd(8) + path.basename(a.foto).slice(0, 44));
  });
}

console.log('');
console.log(erros ? erros + ' FOTO(S) FALTANDO' : 'HTML gerado. Rode: node ferramentas/anuncios-exportar.js ' + slug);
