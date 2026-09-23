/**
 * Monta o site de uma unidade em publicado/<slug>/.
 *
 * Uso:
 *   node ferramentas/build.js belo-horizonte
 *   node ferramentas/build.js                 (todas as unidades)
 *
 * O que ele faz:
 *   1. copia base/assets (HTML, CSS, JS e as imagens da rede);
 *   2. copia por cima as imagens de unidades/<slug>/img/, quando existirem
 *      - e por isso que uma unidade sem banco proprio ja funciona: ela herda
 *        as fotos da rede e so troca as que tiver;
 *   3. leva unidades/<slug>/unidade.js para assets/js/unidade.js;
 *   4. troca os {{marcadores}} do index.html pelos dados da unidade.
 *
 * O resultado e uma pasta estatica: abra o index.html ou suba em qualquer
 * hospedagem. Para o WordPress, use depois: node ferramentas/wordpress.js <slug>
 */
const fs = require('fs');
const path = require('path');
const { raiz, BASE, listar, carregar, montarHtml } = require('./unidade');

const SAIDA = path.join(raiz, 'publicado');

function copiar(origem, destino) {
  if (!fs.existsSync(origem)) return 0;
  fs.mkdirSync(destino, { recursive: true });
  let n = 0;
  for (const item of fs.readdirSync(origem)) {
    if (item.endsWith('.md')) continue; // LEIA-ME das pastas, nao faz parte do site
    const de = path.join(origem, item);
    const para = path.join(destino, item);
    if (fs.statSync(de).isDirectory()) n += copiar(de, para);
    else {
      fs.copyFileSync(de, para);
      n++;
    }
  }
  return n;
}

function construir(slug) {
  const { dados, pasta } = carregar(slug);
  const destino = path.join(SAIDA, slug);

  fs.rmSync(destino, { recursive: true, force: true });
  fs.mkdirSync(destino, { recursive: true });

  const daRede = copiar(path.join(BASE, 'assets'), path.join(destino, 'assets'));
  const daUnidade = copiar(path.join(pasta, 'img'), path.join(destino, 'assets', 'img'));

  fs.copyFileSync(path.join(pasta, 'unidade.js'), path.join(destino, 'assets', 'js', 'unidade.js'));

  const { html, faltando } = montarHtml(dados);
  fs.writeFileSync(path.join(destino, 'index.html'), html);

  console.log('--- ' + slug + ' ---');
  console.log('  ' + daRede + ' arquivos da base' + (daUnidade ? ' + ' + daUnidade + ' imagens proprias' : ' (sem imagens proprias: usa as da rede)'));
  console.log('  publicado/' + slug + '/index.html');

  const pendencias = [];
  if (faltando.length) pendencias.push('faltou preencher em unidade.js: ' + [...new Set(faltando)].join(', '));
  if (!dados.whatsapp) pendencias.push('whatsapp vazio: o botao flutuante nao aparece');
  if (!dados.webhookUrl) pendencias.push('webhookUrl vazio: nenhum lead sera salvo');
  pendencias.forEach((p) => console.log('  ! ' + p));
  return pendencias.length;
}

const pedido = process.argv[2];
const alvos = pedido ? [pedido] : listar();
if (!alvos.length) {
  console.error('Nenhuma unidade em unidades/.');
  process.exit(1);
}

let pendentes = 0;
for (const slug of alvos) pendentes += construir(slug);

console.log('');
console.log(alvos.length + ' unidade(s) em publicado/' + (pendentes ? ' · ' + pendentes + ' pendencia(s) acima' : ''));
