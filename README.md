# VIVA Eventos · sites de captação das unidades

Site de captação para comissões de formatura. A página se posiciona como uma **análise da turma**: a pessoa responde algumas perguntas e um especialista da unidade devolve um diagnóstico do momento da formatura, antes de qualquer proposta.

Uma página só, usada por várias unidades. O site (HTML, CSS, JS) é o mesmo para todas; o que muda por unidade fica isolado em `unidades/<slug>/`.

Não tem build de front-end. As ferramentas rodam em Node; só a publicação no WordPress precisa também de Python com `tinycss2` e `pillow`.

## Estrutura

```
base/                     o site — igual para todas as unidades
  index.html              com {{marcadores}} do que varia
  assets/css/styles.css
  assets/js/main.js       formulário, widget, animações
  assets/img/             imagens da REDE (servem qualquer unidade)
  mapa-imagens.json       nomes dos arquivos na Biblioteca de Mídia

unidades/<slug>/          tudo que é de uma unidade só
  unidade.js              textos, contatos, cidades, instituições, SEO
  img/                    fotos próprias (opcional — o que faltar vem da rede)
  anuncios.js             quais fotos entram em cada rodada de anúncio
  anuncios/rodada-N/png/  os anúncios prontos
  mapa-imagens.json       opcional, só para corrigir nomes do WordPress

ferramentas/              scripts de linha de comando
publicado/                saída por unidade — não vai para o git
publicar/                 o site da franquia pronto p/ Netlify — não vai para o git
assets-originais/         bancos de imagem brutos — não vão para o git
integracoes/              Google Sheets (recebe os leads)
```

Unidades hoje: `belo-horizonte`, `aracaju`.

## Publicar uma unidade

```bash
node ferramentas/build.js belo-horizonte
```

Monta `publicado/belo-horizonte/` — uma pasta estática completa. Abra o `index.html` para conferir ou suba em qualquer hospedagem (GitHub Pages, Netlify, Vercel, S3).

Sem argumento, ele monta todas as unidades e avisa o que ainda falta preencher em cada uma.

### Netlify (franquia.vivaeventos.com.br)

```bash
node ferramentas/netlify.js
```

Reconstrói todas as unidades e monta `publicar/`, que é a pasta que vai para o Netlify:

```
publicar/
  index.html        lista as unidades (noindex) — quem cair na raiz vê isto
  _redirects        cada unidade resolve o próprio 404
  _headers          cache longo nos assets
  belohorizonte/    -> franquia.vivaeventos.com.br/belohorizonte
  aracaju/          -> franquia.vivaeventos.com.br/aracaju
```

O nome da pasta sai do campo `caminho` do `unidade.js`, **não do slug**: o slug organiza o repositório (`belo-horizonte`) e o caminho é a URL (`belohorizonte`). Com `urlBase` preenchido, o build ainda escreve `<link rel="canonical">`, `og:url` e a `og:image` em URL absoluta — sem isso o preview do link no WhatsApp e no Facebook sai sem imagem.

Passo a passo do deploy e do DNS: [ferramentas/NETLIFY.md](ferramentas/NETLIFY.md).

### WordPress / Elementor

```bash
node ferramentas/build.js aracaju
node ferramentas/wordpress.js aracaju
```

Gera `publicado/aracaju/wordpress/`:

- `imagens/` — as imagens já renomeadas e convertidas para `.jpg`, para subir na Biblioteca de Mídia;
- `conteudo-elementor.html` — o bloco para colar num widget **HTML** do Elementor, com CSS e JS embutidos;
- `previa-local.html` — o mesmo bloco apontando para a pasta local, para conferir antes de colar;
- `original/` — o bloco antes dos ajustes, só para comparação.

O bloco já sai com os ajustes que o WordPress exige (imagens em `.jpg`, markup em uma linha só, CSS isolado em `#viva-lp`). Eles vieram da primeira publicação real, a landing de BH em setembro de 2026, e estão explicados um a um no WORDPRESS.md. Para isso o gerador chama dois scripts Python — instale uma vez por máquina:

```bash
pip install tinycss2 pillow
```

Sem eles o gerador avisa e entrega só o bloco cru, que quebra o layout no Elementor.

O título e a descrição do `<head>` não vão no bloco: no WordPress quem manda é o plugin de SEO. O que está em `seo` no `unidade.js` é o rascunho desse texto.

Detalhes e a ordem do passo a passo: [ferramentas/WORDPRESS.md](ferramentas/WORDPRESS.md).

## Criar uma unidade nova

1. `mkdir unidades/<slug>` e copie um `unidade.js` de outra unidade como ponto de partida.
2. Ajuste nome, contatos, cidades, instituições, `seo` e `slugWordpress`.
3. Se a unidade tiver fotos próprias, otimize para WebP e ponha em `unidades/<slug>/img/` **com os mesmos nomes de arquivo** de `base/assets/img/`. Só o que estiver lá é trocado; o resto continua vindo da rede.
4. `node ferramentas/build.js <slug>`.

Nenhum HTML, CSS ou JS precisa ser copiado — e por isso uma correção no `base/` chega em todas as unidades de uma vez.

### O que cada campo do `unidade.js` faz

| Campo | Para que serve |
|---|---|
| `nome`, `nomeFrase`, `nomeCurto` | como a região aparece nos textos |
| `unidade` | nome da unidade no rodapé, nas dúvidas e nos leads |
| `seo.titulo`, `seo.descricao`, `seo.ogDescricao` | `<title>` e metas da página |
| `slugWordpress` | sufixo dos nomes de arquivo na Biblioteca de Mídia |
| `whatsapp` | número com DDI e DDD, só números. **Enquanto estiver vazio, o botão flutuante e o botão de WhatsApp do fim do formulário não aparecem** |
| `email`, `instagram`, `endereco` | contatos do rodapé (vazio = não aparece) |
| `webhookUrl` | para onde os leads são enviados (Google Apps Script, Make, Zapier, RD Station). **Vazio = nenhum lead é salvo** |
| `cidades` | chips de "Atendemos turmas em" e sugestões no formulário |
| `instituicoes` | sugestões no campo Faculdade |

## Como os leads chegam

Os dois caminhos mandam JSON para o mesmo `webhookUrl`:

1. **Formulário de análise** (3 passos): turma, momento da turma e contato.
2. **Botão flutuante de WhatsApp**: pede nome, e-mail, telefone, cidade, faculdade e curso antes de abrir a conversa. Vai marcado com `origem: "whatsapp_flutuante"`.

Os dois enviam também a região e as UTMs do anúncio. Cada unidade deve ter a **sua** planilha: siga [integracoes/google-sheets/COMO-CONECTAR.md](integracoes/google-sheets/COMO-CONECTAR.md) e cole o `webhookUrl` no `unidade.js` da unidade.

## Duas versões de conteúdo

A página alterna entre **Medicina** e **outros cursos**, trocando textos, foto do topo e momentos da jornada. Para cair direto na versão de Medicina, use `?curso=medicina` no fim do endereço.

## Anúncios

```bash
node ferramentas/anuncios.js belo-horizonte        # monta os HTML 1080x1350
node ferramentas/anuncios-exportar.js belo-horizonte   # captura os PNG
```

As copies e os layouts ficam em `ferramentas/anuncios.js` e valem para a rede toda. Quais fotos entram em cada rodada é decisão da unidade, em `unidades/<slug>/anuncios.js`. As fotos saem de `assets-originais/` — `viva-brasil/` serve qualquer unidade, as demais pastas são o banco próprio de cada uma.

## O que não está no repositório

Os bancos de imagem originais (`assets-originais/`), os PDFs de persona e a saída das ferramentas (`publicado/`). No repositório ficam as versões otimizadas usadas no site e os PNG dos anúncios.

## Pendências

**Belo Horizonte** — preencher `email` e `endereco`; revisar os trechos marcados com `<!-- VALIDAR -->` no `base/index.html` (compromissos, respostas das dúvidas, cidades atendidas e eventos que a unidade organiza); os cartões ilustrativos do topo são exemplos.

**Aracaju** — no ar em [/viva-aracaju-analise](https://vivaeventos.com.br/viva-aracaju-analise/), mas **com o bloco quebrado**: quem salvou a página não tinha `unfiltered_html`, o WordPress removeu o `<style>` e o `<script>` e o CSS ficou como texto (ver a armadilha no WORDPRESS.md). Precisa recolar o bloco com um usuário que tenha a permissão. Falta também preencher `whatsapp`, `email`, `endereco` e `instagram`; conferir a lista de instituições (montada a partir da região, não validada); e decidir se a unidade terá fotos próprias em `unidades/aracaju/img/` — hoje usa as da rede, as mesmas de BH, e por isso aponta para as imagens `-bh-` já publicadas na Biblioteca.

O `webhookUrl` já está ligado à planilha "Leads VIVA Aracaju" e testado.
