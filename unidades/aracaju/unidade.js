/* =========================================================
   UNIDADE · Aracaju
   Este é o único arquivo com conteúdo desta unidade. O site
   (HTML, CSS e JS) fica em base/ e é o mesmo para todas.
   Para publicar:  node ferramentas/build.js aracaju

   VALIDAR com a unidade antes de ir ao ar: contatos, webhook,
   cidades atendidas e instituições. O que está aqui é um ponto
   de partida montado a partir da região, não uma lista conferida.
   ========================================================= */

window.UNIDADE = {
  slug: 'aracaju',

  // Endereco publico (Netlify). urlBase + caminho formam a URL final e
  // alimentam o <link rel="canonical">, o og:url e a imagem de compartilhamento.
  urlBase: 'https://franquia.vivaeventos.com.br',
  caminho: 'aracaju',                 // pasta no site publicado -> /aracaju

  // Como a região aparece no site
  nome: 'Aracaju e Região',      // selo do topo e títulos
  nomeFrase: 'Aracaju e região', // dentro de frases
  nomeCurto: 'Aracaju',          // onde precisa ser curto
  cidadePrincipal: 'Aracaju',
  uf: 'SE',

  unidade: 'VIVA Eventos Aracaju',       // nome da unidade (rodapé, FAQ, lead)

  // Nota exibida no bloco da pesquisa. Sem este campo, a unidade mostra a
  // nota da rede (4.6). Ver a nota de rodapé daquele bloco no index.html.
  nota: '4.9',

  // Título e descrição da página. No site estático entram no <head>;
  // no WordPress quem manda é o plugin de SEO, isto aqui vira só o rascunho.
  seo: {
    titulo: 'Análise da formatura da sua turma | VIVA Eventos Aracaju',
    descricao: 'Responda algumas perguntas sobre a sua turma e receba a análise de um especialista da VIVA Eventos Aracaju: em que ponto a formatura está, o que resolver agora e quais são os próximos passos. Aracaju e região.',
    ogDescricao: 'Responda algumas perguntas rápidas e a equipe da VIVA Eventos Aracaju analisa o cenário da formatura da sua turma.',
  },

  // Sufixo dos nomes de arquivo na Biblioteca de Mídia do WordPress.
  // Enquanto a unidade usa as fotos da rede (as mesmas de BH), aponta para o
  // conjunto que ja esta la: nada a subir e nenhuma imagem duplicada.
  // Quando Aracaju tiver fotos proprias em img/, trocar para
  // 'viva-festa-universitaria-aracaju' e subir as 30 na Biblioteca.
  slugWordpress: 'viva-festa-universitaria-bh',

  // Contatos da unidade (vazio = não aparece no site)   ← VALIDAR
  endereco: 'Av. Mário Jorge Menezes Vieira, 2375 · Coroa do Meio, Aracaju/SE',
  whatsapp: '5583998837821',             // +55 83 99883-7821
  email: '',                             // ex.: 'aracaju@vivaeventos.com.br'
  instagram: '',                         // ex.: 'vivaeventosaracaju' (sem @)

  // Para onde vão os leads (POST com JSON): Google Apps Script, Make, Zapier, RD Station...
  // Planilha "Leads VIVA Aracaju" (Apps Script) — criada em 22/09/2026
  webhookUrl: 'https://script.google.com/macros/s/AKfycbztJgefd0L9ep6Z3KjZEj3mGz--HHYIgnaDaWRZgioXrUe_AypEUxP6mKug2BxpjOWzeg/exec',

  // Momentos da jornada de Medicina diferentes dos da rede.
  // O que nao estiver aqui continua igual ao das outras unidades.
  momentos: {
    med2: {
      img: 'mom-med-jaleco.webp',            // fica em unidades/aracaju/img/
      titulo: 'Cerimônia do Jaleco',
      texto: 'O rito que marca a entrada na prática médica.',
      alt: 'Três estudantes de Medicina de jaleco branco sorrindo lado a lado',
    },
    med3: {
      img: 'mom-med-meio.webp',              // foto própria, mesmo nome da rede
      w: 640, h: 800,                        // retrato, e não a paisagem da rede
      alt: 'Formanda de Medicina de jaleco da turma MED XIII em retrato de estúdio',
    },
    med4: {
      img: 'mom-med-fotos.webp',             // foto própria, mesmo nome da rede
      alt: 'Formanda de Medicina de jaleco e estetoscópio em retrato de estúdio',
    },
  },

  // Cidades atendidas pela unidade (aparecem no site e no formulário)
  // Área de atuação conforme a tabela da rede:
  //   próprias : Aracaju, São Cristóvão
  //   cedidas  : Lagarto, Itabaiana
  // No site as quatro entram juntas — o que vale para a turma é se a
  // unidade atende, não de qual coluna a cidade veio.
  cidades: [
    'Aracaju',
    'São Cristóvão',
    'Lagarto',
    'Itabaiana',
  ],

  // Sugestões no campo "Instituição" do formulário (não aparecem como clientes)   ← VALIDAR
  instituicoes: [
    'Universidade Federal de Sergipe (UFS)',            // São Cristóvão (sede), Lagarto e Itabaiana
    'Universidade Tiradentes (UNIT)',                   // Aracaju
    'Instituto Federal de Sergipe (IFS)',               // Aracaju, Lagarto e Itabaiana
    'Faculdade AGES',                                   // Lagarto
    'Faculdade Pio Décimo',                             // Aracaju
    'FANESE',                                           // Aracaju
    'Estácio Sergipe',                                  // Aracaju
    'UNINASSAU Aracaju',
    'Faculdade Amadeus (FAMA)',                         // Aracaju
  ],

};
