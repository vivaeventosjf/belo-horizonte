/**
 * Monta em publicar/ o site inteiro da franquia, com uma pasta por unidade,
 * pronto para o Netlify.
 *
 *   node ferramentas/netlify.js
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

const slugs = listar();
if (!slugs.length) {
  console.error('Nenhuma unidade em unidades/.');
  process.exit(1);
}

fs.rmSync(SAIDA, { recursive: true, force: true });
fs.mkdirSync(SAIDA, { recursive: true });

const unidades = [];
for (const slug of slugs) {
  // sempre reconstroi, para nao publicar sobra de um build antigo
  execFileSync(process.execPath, [path.join(__dirname, 'build.js'), slug], { stdio: 'pipe' });

  const dados = calcular(carregar(slug).dados);
  const origem = path.join(raiz, 'publicado', slug);
  const n = copiar(origem, path.join(SAIDA, dados.caminho));

  unidades.push(dados);
  console.log('  /' + dados.caminho.padEnd(16) + n + ' arquivos   ' + dados.unidade);
}

/* ---------- pagina da raiz ---------- */
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

console.log('');
console.log(unidades.length + ' unidade(s) em publicar/ — e esta a pasta que vai para o Netlify.');
