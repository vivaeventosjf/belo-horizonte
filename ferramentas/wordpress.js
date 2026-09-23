/**
 * Gera o bloco HTML pronto para colar no widget "HTML" do Elementor.
 *
 * Uso:
 *   node ferramentas/wordpress.js belo-horizonte
 *   node ferramentas/wordpress.js aracaju https://vivaeventos.com.br/wp-content/uploads/2026/09
 *
 * Antes rode: node ferramentas/build.js <unidade>
 *
 * O que ele faz:
 *   1. copia as imagens da unidade ja renomeadas conforme base/mapa-imagens.json
 *      (nomes prontos para a Biblioteca de Midia, com o slug da unidade);
 *   2. embute o CSS e o JS no proprio bloco, para nao precisar de FTP;
 *   3. troca os caminhos assets/img/... pelas URLs da Biblioteca de Midia.
 *
 * Se o WordPress renomear algum arquivo no upload (ele acrescenta -1, -2
 * quando ja existe outro com o mesmo nome), crie o arquivo
 * unidades/<slug>/mapa-imagens.json com so as entradas a corrigir e rode de novo.
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { raiz, BASE, carregar, montarHtml } = require('./unidade');

const slug = process.argv[2];
const { dados, pasta } = carregar(slug);
const URL_BASE = (process.argv[3] || 'https://vivaeventos.com.br/wp-content/uploads/2026/09').replace(/[/]$/, '');

const publicado = path.join(raiz, 'publicado', slug);
if (!fs.existsSync(publicado)) {
  console.error('Rode antes: node ferramentas/build.js ' + slug);
  process.exit(1);
}

/* ---------- mapa de nomes da Biblioteca de Midia ---------- */
const slugWp = dados.slugWordpress || slug;
const mapa = {};
for (const [origem, destino] of Object.entries(JSON.parse(fs.readFileSync(path.join(BASE, 'mapa-imagens.json'), 'utf8')))) {
  mapa[origem] = destino.split('{unidade}').join(slugWp);
}
// correcoes especificas da unidade, quando existirem
const mapaUnidade = path.join(pasta, 'mapa-imagens.json');
if (fs.existsSync(mapaUnidade)) Object.assign(mapa, JSON.parse(fs.readFileSync(mapaUnidade, 'utf8')));

const css = fs.readFileSync(path.join(publicado, 'assets/css/styles.css'), 'utf8');
const jsUnidade = fs.readFileSync(path.join(publicado, 'assets/js/unidade.js'), 'utf8');
const jsMain = fs.readFileSync(path.join(publicado, 'assets/js/main.js'), 'utf8');

const saidaDir = path.join(raiz, 'publicado', slug, 'wordpress');
fs.rmSync(saidaDir, { recursive: true, force: true });

/* ---------- 1. pasta de imagens renomeadas ---------- */
const pastaImg = path.join(saidaDir, 'imagens');
fs.mkdirSync(pastaImg, { recursive: true });
const faltando = [];
for (const [origem, destino] of Object.entries(mapa)) {
  const de = path.join(publicado, 'assets/img', origem);
  if (!fs.existsSync(de)) {
    faltando.push(origem);
    continue;
  }
  fs.copyFileSync(de, path.join(pastaImg, destino));
}

/* ---------- 2. miolo do HTML, sem as tags de script ---------- */
const { html } = montarHtml(dados);
let corpo = html.slice(html.indexOf('<body>') + '<body>'.length, html.lastIndexOf('</body>'));
const corte = corpo.indexOf('<script src="assets/js/');
if (corte > -1) corpo = corpo.slice(0, corte);

/* ---------- 3. caminhos das imagens ---------- */
for (const [origem, destino] of Object.entries(mapa)) {
  corpo = corpo.split('assets/img/' + origem).join(URL_BASE + '/' + destino);
}

const sobraram = (corpo.match(/assets[/]/g) || []).length;

/* ---------- 4. montagem ---------- */
if (css.includes('</style') || jsMain.includes('</script') || jsUnidade.includes('</script')) {
  console.error('ERRO: CSS ou JS contem tag de fechamento e quebraria o bloco embutido.');
  process.exit(1);
}

const saida = [
  '<!-- VIVA Eventos | ' + slug + ' | gerado por ferramentas/wordpress.js -->',
  '<link rel="preconnect" href="https://fonts.googleapis.com">',
  '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
  '<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">',
  '<link rel="preload" as="image" href="' + URL_BASE + '/' + mapa['hero-geral-640.webp'] + '">',
  '<script>',
  '  // O CSS depende de marcadores no elemento raiz da pagina. No WordPress',
  '  // eles nao vem do markup, entao ligamos aqui antes da pagina pintar.',
  '  document.documentElement.classList.add("js");',
  '  if (!document.documentElement.dataset.course) document.documentElement.dataset.course = "geral";',
  '</script>',
  '<style>',
  css,
  '</style>',
  corpo,
  '<script>',
  jsUnidade,
  '</script>',
  '<script>',
  jsMain,
  '</script>',
  '',
].join('\n');

// O bloco cru fica guardado: e dele que a adaptacao parte, e serve para
// comparar quando algo mudar no site.
fs.mkdirSync(path.join(saidaDir, 'original'), { recursive: true });
fs.writeFileSync(path.join(saidaDir, 'original', 'conteudo-elementor.html'), saida);
fs.writeFileSync(path.join(saidaDir, 'conteudo-elementor.html'), saida);

console.log('Unidade          : ' + slug + ' (' + dados.unidade + ')');
console.log('Base das imagens : ' + URL_BASE);
console.log('Imagens copiadas : ' + (Object.keys(mapa).length - faltando.length) + ' -> publicado/' + slug + '/wordpress/imagens/');
console.log('Bloco gerado     : publicado/' + slug + '/wordpress/conteudo-elementor.html');
console.log('Tamanho do bloco : ' + (Buffer.byteLength(saida) / 1024).toFixed(1) + ' KB');

/* ---------- 5. previa local, para conferir antes de colar ---------- */
// Mesma saida, mas apontando para a pasta imagens/ ao lado do arquivo.
const previa = '<!DOCTYPE html>' +
  '<html lang="pt-BR" data-course="geral"><head><meta charset="utf-8">' +
  '<meta name="viewport" content="width=device-width, initial-scale=1">' +
  '<title>Previa local | ' + dados.unidade + '</title></head><body>' +
  saida.split(URL_BASE + '/').join('imagens/') +
  '</body></html>';
fs.writeFileSync(path.join(saidaDir, 'previa-local.html'), previa);
/* ---------- 6. ajustes que o WordPress exige ---------- */
// Vieram da primeira publicacao real (BH, set/2026): .jpg no lugar de .webp,
// markup em uma linha so, CSS isolado em #viva-lp. Ver ferramentas/WORDPRESS.md.
function python(script, args) {
  for (const exe of ['python', 'py', 'python3']) {
    try {
      return execFileSync(exe, [path.join(__dirname, script), ...args], { encoding: 'utf8' }).trim();
    } catch (e) {
      if (e.code === 'ENOENT') continue;
      throw e;
    }
  }
  return null;
}

let adaptado = false;
try {
  const img = python('wordpress-imagens.py', [pastaImg]);
  const bloco = path.join(saidaDir, 'conteudo-elementor.html');
  const ok = python('wordpress-adaptar.py', [path.join(saidaDir, 'original', 'conteudo-elementor.html'), bloco]);
  if (img === null || ok === null) throw new Error('python nao encontrado');
  adaptado = true;
  console.log('Ajustes do WP    : ' + img + ', markup em uma linha, CSS isolado em #viva-lp');
} catch (e) {
  console.log('');
  console.log('AVISO: nao deu para aplicar os ajustes do WordPress (' + e.message.split(String.fromCharCode(10))[0] + ').');
  console.log('       O bloco acima e o cru e VAI QUEBRAR o layout se for colado assim.');
  console.log('       Instale as dependencias e rode de novo:');
  console.log('         pip install tinycss2 pillow');
}

if (adaptado) {
  // a previa precisa ser do bloco final, nao do cru
  const finalHtml = fs.readFileSync(path.join(saidaDir, 'conteudo-elementor.html'), 'utf8');
  fs.writeFileSync(
    path.join(saidaDir, 'previa-local.html'),
    '<!DOCTYPE html>' +
      '<html lang="pt-BR" data-course="geral"><head><meta charset="utf-8">' +
      '<meta name="viewport" content="width=device-width, initial-scale=1">' +
      '<title>Previa local | ' + dados.unidade + '</title></head><body>' +
      finalHtml.split(URL_BASE + '/').join('imagens/') +
      '</body></html>'
  );
}

console.log('Previa local     : publicado/' + slug + '/wordpress/previa-local.html');
if (faltando.length) console.log('Imagens faltando : ' + faltando.join(', ') + '  <-- revisar!');
console.log('Caminhos "assets/" restantes: ' + sobraram + (sobraram ? '  <-- revisar!' : ''));
