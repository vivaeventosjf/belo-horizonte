# Pixel do Meta (Facebook) nas landings

Um pixel por unidade. Cada arquivo aqui é o código base do pixel **mais** a
ponte que transforma os eventos da landing em conversões.

| Arquivo | Unidade | ID do pixel |
|---|---|---|
| `pixel-head-belo-horizonte.html` | VIVA Eventos BH | 1021388314287547 |
| `pixel-head-aracaju.html` | VIVA Eventos Aracaju | 1390583473232040 |

## Onde colar

No campo de scripts do `<head>` **da página da unidade** — no site da VIVA, o
campo "Scripts do RD Station (head)" da própria página.

⚠️ **Não coloque no head global do site.** Como cada unidade tem o seu pixel,
um código global faria toda página disparar o pixel errado (ou os dois).

Também não vai dentro do nosso bloco do Elementor: lá o `<script>` esbarra na
permissão `unfiltered_html` (ver ferramentas/WORDPRESS.md).

## O que é medido

| Evento no pixel | Dispara quando | Parâmetros |
|---|---|---|
| `PageView` | a página abre | — |
| `Lead` | formulário de 3 passos enviado com sucesso | `content_category` = curso, `content_name` = região |
| `Contact` | abriu a conversa pelo botão flutuante de WhatsApp | `content_category` = curso, `content_name` = região |

A ponte lê os eventos que a landing empurra para o `dataLayer`
(`analise_turma` e `whatsapp_flutuante`). Se esses nomes mudarem em
`base/assets/js/main.js`, os dois arquivos aqui precisam acompanhar.

## Conferir

Extensão **Meta Pixel Helper** no Chrome, na página publicada: deve aparecer
PageView ao abrir e Lead ao concluir o formulário. Confirme que o ID mostrado é
o da unidade certa.

Se o Autoptimize estiver otimizando JS naquela página, ele adia os scripts e a
ponte não pega — o checklist de publicação manda desmarcar, mantenha assim.
