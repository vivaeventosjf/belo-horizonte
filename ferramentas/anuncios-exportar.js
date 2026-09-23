/**
 * Captura cada HTML de unidades/<slug>/anuncios/rodada-N/html/ como
 * PNG 1080x1350, usando o Chrome em modo headless.
 *
 * Uso:  node ferramentas/anuncios-exportar.js belo-horizonte 1
 *       node ferramentas/anuncios-exportar.js belo-horizonte
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { listar, carregar } = require('./unidade');

const slug = process.argv[2];
if (!slug || !listar().includes(slug)) {
  console.error('Uso: node ferramentas/anuncios-exportar.js <unidade> [rodada]');
  console.error('Unidades: ' + (listar().join(', ') || 'nenhuma'));
  process.exit(1);
}
const PASTA = path.join(carregar(slug).pasta, 'anuncios');

const BARRA = String.fromCharCode(92);
const CHROME = [
  process.env.ProgramFiles + BARRA + 'Google' + BARRA + 'Chrome' + BARRA + 'Application' + BARRA + 'chrome.exe',
  process.env['ProgramFiles(x86)'] + BARRA + 'Google' + BARRA + 'Chrome' + BARRA + 'Application' + BARRA + 'chrome.exe',
  process.env.LOCALAPPDATA + BARRA + 'Google' + BARRA + 'Chrome' + BARRA + 'Application' + BARRA + 'chrome.exe',
].find((p) => fs.existsSync(p));

if (!CHROME) {
  console.error('Chrome nao encontrado.');
  process.exit(1);
}

function paraUrl(abs) {
  const [drive, ...resto] = abs.split(BARRA).join('/').split('/');
  return 'file:///' + drive + '/' + resto.map(encodeURIComponent).join('/');
}

const pedido = process.argv[3];
const rodadas = pedido
  ? [pedido]
  : fs.readdirSync(PASTA)
      .filter((d) => d.startsWith('rodada-'))
      .map((d) => d.replace('rodada-', ''))
      .sort();

if (!rodadas.length) {
  console.error('Nenhuma rodada encontrada. Rode antes: node ferramentas/anuncios.js ' + slug);
  process.exit(1);
}

let total = 0;
for (const r of rodadas) {
  const pastaHtml = path.join(PASTA, 'rodada-' + r, 'html');
  if (!fs.existsSync(pastaHtml)) {
    console.error('Rodada ' + r + ' sem HTML gerado.');
    continue;
  }

  const pastaPng = path.join(PASTA, 'rodada-' + r, 'png');
  fs.rmSync(pastaPng, { recursive: true, force: true });
  fs.mkdirSync(pastaPng, { recursive: true });

  console.log('--- ' + slug + ' · rodada ' + r + ' ---');
  for (const f of fs.readdirSync(pastaHtml).filter((x) => x.endsWith('.html')).sort()) {
    const destino = path.join(pastaPng, f.replace('.html', '.png'));
    execFileSync(CHROME, [
      '--headless', '--disable-gpu', '--hide-scrollbars',
      '--force-device-scale-factor=1',
      '--window-size=1080,1350',
      // tempo para a fonte do Google e as fotos de ate 6000px carregarem
      '--virtual-time-budget=30000',
      '--screenshot=' + destino,
      paraUrl(path.join(pastaHtml, f)),
    ], { stdio: 'pipe' });

    const b = fs.readFileSync(destino);
    const dim = b.readUInt32BE(16) + 'x' + b.readUInt32BE(20);
    console.log('  ' + f.replace('.html', '.png').padEnd(28) + dim.padEnd(11) + (b.length / 1024).toFixed(0) + ' KB');
    total++;
  }
}

console.log('');
console.log(total + ' anuncios exportados.');
