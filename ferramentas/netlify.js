/**
 * Monta em publicar/ o que vai para o Netlify.
 *
 * Dois modos, conforme a variavel de ambiente UNIDADE:
 *
 *   node ferramentas/netlify.js
 *     todas as unidades, uma pasta cada:
 *     franquia.vivaeventos.com.br/belohorizonte
 *
 *   UNIDADE=belo-horizonte node ferramentas/netlify.js
 *     so aquela unidade, na RAIZ do site:
 *     belohorizonte.vivaeventos.com.br
 *
 * No Netlify a variavel se define em Site configuration > Environment
 * variables. Sem ela, o site publica a franquia inteira.
 *
 * Resultado:
 *   publicar/
 *     index.html          lista as unidades (quem cair na raiz ve isto)
 *     _redirects          regras do Netlify
 *     belohorizonte/      -> https://franquia.vivaeventos.com.br/belohorizonte
 *     aracaju/            -> https://franquia.vivaeventos.com.br/aracaju
 *
 * A pasta de cada unidade vem do build.js e e autossuficiente (assets proprios),
 * por isso cada uma pode ser publicada, movida ou removida sem mexer nas outras.
 *
 * O nome da pasta sai do campo `caminho` do unidade.js, nao do slug: o slug
 * organiza o repositorio (belo-horizonte), o caminho e a URL (belohorizonte).
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { raiz, listar, carregar, calcular } = require('./unidade');

const SAIDA = path.join(raiz, 'publicar');

/**
 * Em subpasta, os caminhos relativos do HTML passam a ser absolutos:
 *   assets/css/styles.css  ->  /belo-horizonte/assets/css/styles.css
 *
 * Sem isto, quem abre a pagina SEM a barra final (/belo-horizonte) faz o
 * navegador resolver os assets a partir da raiz do dominio — e, como o
 * dominio pertence a outro site, a pagina carrega sem estilo nenhum.
 * Ancoras (#analise) continuam relativas, entao a navegacao interna nao muda.
 */
function caminhosAbsolutos(arquivo, prefixo) {
  const antes = fs.readFileSync(arquivo, 'utf8');
  const depois = antes.replace(/(["'\s])assets\//g, '$1/' + prefixo + '/assets/');
  fs.writeFileSync(arquivo, depois);
  return (antes.match(/(["']|\s)assets\//g) || []).length;
}

function copiar(origem, destino) {
  fs.mkdirSync(destino, { recursive: true });
  let n = 0;
  for (const item of fs.readdirSync(origem)) {
    const de = path.join(origem, item);
    const para = path.join(destino, item);
    if (fs.statSync(de).isDirectory()) {
      if (item === 'wordpress') continue; // o pacote do Elementor nao vai para o ar
      n += copiar(de, para);
    } else {
      fs.copyFileSync(de, para);
      n++;
    }
  }
  return n;
}

const soUma = (process.env.UNIDADE || '').trim();
const slugs = soUma ? [soUma] : listar();

if (!slugs.length) {
  console.error('Nenhuma unidade em unidades/.');
  process.exit(1);
}
if (soUma && !listar().includes(soUma)) {
  console.error('UNIDADE="' + soUma + '" nao existe. Disponiveis: ' + listar().join(', '));
  process.exit(1);
}
if (soUma) console.log('Modo: uma unidade so, na raiz do site.');

fs.rmSync(SAIDA, { recursive: true, force: true });
fs.mkdirSync(SAIDA, { recursive: true });

const unidades = [];
for (const slug of slugs) {
  // sempre reconstroi, para nao publicar sobra de um build antigo
  execFileSync(process.execPath, [path.join(__dirname, 'build.js'), slug], { stdio: 'pipe' });

  const dados = calcular(carregar(slug).dados);
  const origem = path.join(raiz, 'publicado', slug);
  // no modo de uma unidade so, ela vai para a raiz e nao para uma subpasta
  const pastaDestino = soUma ? SAIDA : path.join(SAIDA, dados.caminho);
  const n = copiar(origem, pastaDestino);
  // no modo de unidade unica a pagina ja esta na raiz, os relativos bastam
  if (!soUma) caminhosAbsolutos(path.join(pastaDestino, 'index.html'), dados.caminho);

  unidades.push(dados);
  console.log('  ' + (soUma ? '/' : '/' + dados.caminho).padEnd(17) + n + ' arquivos   ' + dados.unidade);
}

/* ---------- pagina da raiz (so no modo franquia) ---------- */
if (!soUma) {
// Quem abrir franquia.vivaeventos.com.br sem caminho cai aqui.
const itens = unidades
  .map((u) => '      <li><a href="/' + u.caminho + '/">' + u.unidade + ' · ' + u.nomeFrase + '</a></li>')
  .join('\n');

fs.writeFileSync(
  path.join(SAIDA, 'index.html'),
  [
    '<!DOCTYPE html>',
    '<html lang="pt-BR"><head><meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    '<meta name="robots" content="noindex">',
    '<title>VIVA Eventos · unidades</title>',
    '<style>',
    '  body{margin:0;min-height:100vh;display:grid;place-items:center;background:#FAF7F3;',
    '    color:#1D1A17;font-family:system-ui,-apple-system,"Segoe UI",sans-serif}',
    '  main{padding:32px;max-width:520px}',
    '  h1{font-size:1.25rem;font-weight:600;margin:0 0 4px}',
    '  p{margin:0 0 24px;color:#7A7169}',
    '  ul{list-style:none;padding:0;margin:0;display:grid;gap:8px}',
    '  a{display:block;padding:16px 20px;background:#fff;border-radius:12px;',
    '    text-decoration:none;color:inherit;box-shadow:0 1px 3px rgba(70,38,14,.12)}',
    '  a:hover{box-shadow:0 4px 12px rgba(70,38,14,.18)}',
    '</style></head><body><main>',
    '  <h1>VIVA Eventos</h1>',
    '  <p>Análise da formatura, por unidade.</p>',
    '  <ul>',
    itens,
    '  </ul>',
    '</main></body></html>',
  ].join('\n')
);

/* ---------- regras do Netlify ---------- */
// /belohorizonte  ->  /belohorizonte/  (o Netlify ja resolve, isto so garante)
// 404 de cada unidade volta para a propria landing, para link velho nao morrer.
const redirects = unidades
  .map((u) => '/' + u.caminho + '/*   /' + u.caminho + '/index.html   200')
  .join('\n');
fs.writeFileSync(path.join(SAIDA, '_redirects'), redirects + '\n');
}

fs.writeFileSync(
  path.join(SAIDA, '_headers'),
  [
    '/*',
    '  X-Content-Type-Options: nosniff',
    '  Referrer-Policy: strict-origin-when-cross-origin',
    '/assets/*',
    '  Cache-Control: public, max-age=31536000, immutable',
    '',
  ].join('\n')
);

/* ---------- regras para o site que ja tem o dominio ---------- */
// O dominio franquia.vivaeventos.com.br pertence a outro projeto do Netlify
// (a landing de socio-operador), e o Netlify nao deixa dois projetos usarem o
// mesmo dominio. A saida e aquele site repassar estes caminhos para este aqui:
// com status 200 o conteudo aparece sob o dominio dele, sem mudar a URL.
if (!soUma) {
  const NL = String.fromCharCode(10);
  const SITE = process.env.SITE_NETLIFY || 'belo-horizonte.netlify.app';
  const proxy = unidades
    .map((u) => '/' + u.caminho + '/*  https://' + SITE + '/' + u.caminho + '/:splat  200')
    .concat(unidades.map((u) => '/' + u.caminho + '  /' + u.caminho + '/  301!'))
    .join(NL);

  fs.writeFileSync(path.join(SAIDA, '..', 'regras-para-o-site-da-franquia.txt'),
    [
      '# Cole estas linhas no _redirects do repositorio que serve',
      '# franquia.vivaeventos.com.br (a landing de socio-operador).',
      '# Sem elas, /' + unidades[0].caminho + ' devolve 404 naquele site.',
      '#',
      '# Gerado por ferramentas/netlify.js — refaca quando entrar unidade nova.',
      '',
      proxy,
      '',
    ].join(NL));
  console.log('');
  console.log('Regras de proxy  : regras-para-o-site-da-franquia.txt');
}

console.log('');
console.log(unidades.length + ' unidade(s) em publicar/ — e esta a pasta que vai para o Netlify.');
