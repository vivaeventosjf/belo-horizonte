# Publicar a landing no WordPress + Elementor

Esta pasta contém tudo que é preciso para colocar a página no ar **sem acesso
por FTP**: as imagens vão pela Biblioteca de Mídia e o CSS/JS viajam embutidos
no próprio bloco HTML.

## Arquivos

Ferramentas (em `ferramentas/`):

| Arquivo | Para que serve |
|---|---|
| `wordpress.js` | Gera o pacote da unidade. Chama os dois scripts abaixo no fim |
| `wordpress-imagens.py` | Converte as imagens de `.webp` para `.jpg` |
| `wordpress-adaptar.py` | Aplica os ajustes que o WordPress exige (ver seção adiante) |
| `base/mapa-imagens.json` | De/para dos nomes de arquivo, com `{unidade}` no lugar do slug |

Saída, em `publicado/<unidade>/wordpress/`:

| Arquivo | Para que serve |
|---|---|
| `conteudo-elementor.html` | **É este que se cola** no widget HTML |
| `imagens/` | As 30 imagens renomeadas e já em `.jpg`, prontas para o upload |
| `previa-local.html` | O mesmo bloco apontando para `imagens/`, para conferir no navegador |
| `original/conteudo-elementor.html` | O bloco cru, antes dos ajustes. Serve para comparar; **não cole este** |

Dependências dos dois scripts Python (uma vez só, por máquina):

```
pip install tinycss2 pillow
```

Sem elas o `wordpress.js` avisa e entrega só o bloco cru — que quebra o layout.

Para regerar depois de mexer no site:

```
node ferramentas/build.js <unidade> && node ferramentas/wordpress.js <unidade>
```

## Por que um bloco HTML e não blocos nativos do Elementor

A página depende de JavaScript próprio que o Elementor não tem como reproduzir:
o formulário de 3 etapas com validação, o widget flutuante de WhatsApp, a
captura de UTMs, o envio para o Google Sheets e a troca entre Medicina e demais
cursos. Refazer com widgets nativos significaria perder tudo isso.

A contrapartida é honesta: **a página não fica editável clique-a-clique no
Elementor.** As alterações continuam no código, e você roda o `wordpress.js` de novo
e recola o bloco.

## Os ajustes que o `wordpress.js` aplica sozinho

Descobertos na primeira publicação real (BH, setembro de 2026). Cada um resolve
um problema concreto que apareceu no ar — não são precaução:

**1. Imagens `.webp` → `.jpg`** — o WordPress do cliente não aceitou os `.webp`.
A conversão é feita com qualidade 90; o pacote de imagens fica com cerca do
dobro do tamanho dos `.webp`, o que é a troca aceita para a página funcionar.

**2. Markup em uma linha só, sem comentários** — o `wpautop` do WordPress
transforma linha em branco em `<p>` vazio, e esses parágrafos fantasma viravam
colunas a mais nos grids. Há também uma regra escondendo qualquer `<p>` vazio.

**3. CSS isolado em `#viva-lp`** — o CSS da landing usa nomes genéricos
(`.container`, `.btn`, `h1`, `p`, `input`), iguais aos do tema e do Elementor,
e perdia a briga. Agora todo o conteúdo fica dentro de `<div id="viva-lp">`,
o que vem de fora é zerado ali dentro (`all: revert`) e cada regra da landing
ganha `#viva-lp#viva-lp` na frente — dois IDs para vencer qualquer CSS do tema.

**4. `::before` e `::after` do tema zerados** — esta era a causa das colunas
trocadas. O tema carrega o *clearfix* do Bootstrap (`.container::before {
content: " " }`), e esse elemento invisível ocupava a primeira coluna dos grids
de duas colunas, empurrando o texto para a direita e a foto para baixo.

**5. Faixa branca no topo** — resolvida zerando margem e padding do `body` e de
todos os blocos do Elementor que envolvem a landing, só nesta página.

**6. Botão "Pular para o formulário"** — aparecia visível no topo; agora só
aparece para quem navega pelo teclado.

## Passo a passo

### 1. Conferir a prévia

Abra `previa-local.html` no navegador. É a página completa com as imagens da
pasta `imagens/`. Se algo estiver errado aqui, vai estar errado no WordPress.

### 2. Subir as imagens

1. **Mídia › Adicionar nova**
2. Arraste os 30 arquivos de `imagens/` de uma vez
3. Abra uma imagem e confira a URL. Deve ser:
   `https://vivaeventos.com.br/wp-content/uploads/2026/09/adesao-viva-festa-universitaria-bh-1.jpg`

Dois detalhes que podem mudar a URL:

- **O mês vem do upload.** Subindo em outubro, o caminho vira `2026/10`.
- **Nome repetido ganha sufixo.** Se já existir um arquivo com o mesmo nome, o
  WordPress salva como `...-1-1.jpg`.

Se qualquer um dos dois acontecer, crie `unidades/<slug>/mapa-imagens.json` com
só as entradas a corrigir (ou passe a base
nova: `node ferramentas/wordpress.js <unidade> https://vivaeventos.com.br/wp-content/uploads/2026/10`)
e gere de novo.

### 3. Criar a página

1. **Páginas › Adicionar nova**, título `Análise da formatura`
2. Ajuste o permalink (ex.: `/bh`)
3. **Editar com Elementor**
4. No rodapé do painel, na engrenagem de **Configurações da página**, mude
   *Layout da página* para **Elementor Tela / Canvas**

O Canvas não é opcional. O CSS da landing estiliza `body`, `h1`, `p`, `a` e
`input` de forma global — com o cabeçalho e o rodapé do tema na tela, os dois
CSS brigam.

### 4. Colar o bloco

1. Arraste o widget **HTML** para a seção
2. Cole o conteúdo inteiro de `conteudo-elementor.html`
3. Na seção que recebeu o widget: largura **Tela cheia**, conteúdo **Largura
   total**, e zere *padding* e *margin*
4. **Publicar**

> No editor do Elementor a prévia pode aparecer quebrada, porque o widget é
> injetado via JavaScript e o script da página roda antes da hora. Valide sempre
> na página publicada, não no editor.

### 5. Configurar cache e otimização

- Caixa do **Autoptimize** na página: desmarcar *Otimizar JS*, *Otimizar CSS* e
  *CSS crítico em linha*.
- **Autoptimize › Extra › Google Fonts**: deixar como está — se otimizar, a
  fonte Outfit não carrega.
- Campo "Scripts do RD Station" (head): não pode ter preload nem CSS de versões
  antigas da página.
- Depois de qualquer mudança: **Elementor › Ferramentas › Regenerar arquivos e
  dados**, limpar **Purge Cache**, **Autoptimize** e **WP Rocket**, e testar em
  aba anônima com Ctrl+F5.

### 6. Conferir na página publicada

- [ ] Fontes e cores certas (sem sobra do tema)
- [ ] Botão flutuante de WhatsApp abre o painel e a conversa
- [ ] Formulário de 3 etapas envia e grava na planilha
- [ ] `?curso=medicina` no fim da URL troca o conteúdo para Medicina
- [ ] `?utm_source=teste` aparece na coluna utm_source da planilha
- [ ] Layout no celular
- [ ] Grids de duas colunas na ordem certa (texto à esquerda, foto à direita)
- [ ] Sem faixa branca no topo e sem parágrafos vazios entre as seções

## Armadilhas conhecidas

**Plugins de cache e otimização** (LiteSpeed, WP Rocket, Autoptimize, SiteGround
Optimizer) podem minificar ou adiar o JavaScript embutido e quebrar a página.
Se algo parar de funcionar só no site publicado, desative a otimização de JS
para esta página e teste de novo.

**Cloudflare Rocket Loader** muda a ordem de execução dos scripts e quebra a
inicialização. Desligue para este domínio.

**Permissão de HTML — a armadilha que mais custa tempo.** Salvar `<script>` e
`<style>` no widget exige a capacidade `unfiltered_html`. Administrador tem em
instalação normal; em multisite, só Super Admin. Plugins de segurança
(Wordfence, iThemes, Sucuri) e a constante `DISALLOW_UNFILTERED_HTML` também
tiram.

Aconteceu de verdade com Aracaju (set/2026): a página subiu com o CSS
aparecendo como **texto** no meio do conteúdo. O WordPress não escapa as tags,
ele **remove**, e o que estava dentro delas fica solto na página.

Como confirmar em 10 segundos, sem abrir o painel:

```bash
curl -s https://SEU-SITE/a-pagina/ | grep -c '&lt;style'   # 0 = nao foi escapado
curl -s https://SEU-SITE/a-pagina/ | grep -o '#viva-lp#viva-lp' | wc -l
```

Se o segundo número for alto (~500) mas a página estiver sem estilo, o CSS está
lá como texto: é falta de `unfiltered_html`. Compare com uma página que
funciona — se numa as regras estão dentro de `<style>` e na outra não, o bloco
não tem culpa, a diferença é quem salvou.

⚠️ **Não reabra e salve uma página que já está funcionando** com um usuário sem
essa permissão: ela passa pelo filtro e quebra igual.

**SEO.** Título, descrição e imagem de compartilhamento estavam no `<head>` do
`index.html` e não vão no bloco. Configure pelo Yoast/RankMath. A imagem de
compartilhamento é `base/assets/img/og-image.jpg`, que também precisa ser enviada
pela Biblioteca de Mídia.

## Pixel do Facebook, Google Analytics e afins

Vão no **`<head>` do site** (campo de scripts do tema, ou um plugin tipo Insert
Headers and Footers / PixelYourSite), **nunca dentro do nosso bloco** — ali o
`<script>` de terceiro esbarra na mesma permissão descrita acima.

A landing empurra dois eventos para o `dataLayer`, que é por onde qualquer
ferramenta de medição se liga nela:

| Evento | Quando dispara | Campos |
|---|---|---|
| `analise_turma` | formulário de 3 passos enviado com sucesso | `curso`, `comissao`, `fundo`, `regiao` |
| `whatsapp_flutuante` | abriu a conversa pelo botão flutuante | `curso`, `regiao` |

Ponte para o pixel do Meta, colada junto do código base dele no `<head>`:

```html
<script>
window.dataLayer = window.dataLayer || [];
(function () {
  var _push = window.dataLayer.push;
  window.dataLayer.push = function (o) {
    try {
      if (o && o.event === 'analise_turma') fbq('track', 'Lead', { content_category: o.curso });
      if (o && o.event === 'whatsapp_flutuante') fbq('track', 'Contact', { content_category: o.curso });
    } catch (e) {}
    return _push.apply(window.dataLayer, arguments);
  };
})();
</script>
```

Com o Google Tag Manager não precisa disso: basta criar gatilhos de evento
personalizado com esses dois nomes.

Confira com a extensão **Meta Pixel Helper**, na página publicada. Se o
Autoptimize estiver otimizando JS nessa página, ele adia os scripts e a ponte
não pega — o checklist manda desmarcar, mantenha assim.

## Atualizar depois

| O que mudou | O que fazer |
|---|---|
| Texto, CSS ou JS | `node ferramentas/build.js <unidade> && node ferramentas/wordpress.js <unidade>` e recolar o bloco |
| Uma imagem | Substituir pela Biblioteca de Mídia, mantendo o nome |
| Imagem nova | Adicionar ao `mapa-imagens.json`, subir e regerar |
