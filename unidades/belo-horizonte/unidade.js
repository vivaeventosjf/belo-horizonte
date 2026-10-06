/* =========================================================
   UNIDADE · Belo Horizonte
   Este é o único arquivo com conteúdo desta unidade. O site
   (HTML, CSS e JS) fica em base/ e é o mesmo para todas.
   Para publicar:  node ferramentas/build.js belo-horizonte
   ========================================================= */

window.UNIDADE = {
  slug: 'belo-horizonte',

  // Endereco publico (Netlify). urlBase + caminho formam a URL final e
  // alimentam o <link rel="canonical">, o og:url e a imagem de compartilhamento.
  urlBase: 'https://franquia.vivaeventos.com.br',
  caminho: 'belo-horizonte',             // pasta no site publicado -> /belo-horizonte

  // Como a região aparece no site
  nome: 'Belo Horizonte e Região',      // selo do topo e títulos
  nomeFrase: 'Belo Horizonte e região', // dentro de frases
  nomeCurto: 'BH',                       // onde precisa ser curto
  cidadePrincipal: 'Belo Horizonte',
  uf: 'MG',

  unidade: 'VIVA Eventos BH',            // nome da unidade (rodapé, FAQ, lead)

  // Título e descrição da página. No site estático entram no <head>;
  // no WordPress quem manda é o plugin de SEO, isto aqui vira só o rascunho.
  seo: {
    titulo: 'Faça a formatura da sua turma com a VIVA | VIVA Eventos BH',
    descricao: 'Pré-eventos, sessões de fotos, colação e baile com a VIVA Eventos BH: fundo prestado à vista da comissão, consultor fixo do começo ao fim e uma festa com a cara da turma. Fale com um consultor. Belo Horizonte e região.',
    ogDescricao: 'A formatura inteira resolvida num lugar só. Fale com um consultor da VIVA Eventos BH e comece a formatura da sua turma.',
  },

  // Sufixo dos nomes de arquivo na Biblioteca de Mídia do WordPress
  slugWordpress: 'viva-festa-universitaria-bh',

  // Contatos da unidade (vazio = não aparece no site)
  endereco: '',                          // ex.: 'Av. do Contorno, 0000 · Savassi, Belo Horizonte/MG'
  whatsapp: '553193440051',              // só números com DDI e DDD. ex.: '5531900000000'
  email: '',                             // ex.: 'bh@vivaeventos.com.br'
  instagram: '',                         // ex.: 'vivaeventosbh' (sem @)

  // Para onde vão os leads (POST com JSON): Google Apps Script, Make, Zapier, RD Station...
  // Vídeo da seção "A VIVA por dentro". Só o id do YouTube, não a URL
  // inteira. Vazio = a seção não aparece.   <- VALIDAR com a unidade
  videoYoutube: 'WhaDLrO3HTc',

  // Meta Pixel desta unidade (vazio = sai sem pixel).   <- VALIDAR
  metaPixel: '',

  webhookUrl: 'https://script.google.com/macros/s/AKfycbxP5A_Cp6rRwerHG-4ROZVg9QMXodCvouYITZToyGo8E2r_X9YrJJ5IrKS6lOzpNMcoTw/exec',

  // Cidades atendidas pela unidade (aparecem no site e no formulário)
  cidades: [
    'Belo Horizonte',
    'Nova Lima',
    'Sabará',
    'Vespasiano',
    'Brumadinho',
    'Caeté',
    'Esmeraldas',
    'Florestal',
    'Ibirité',
    'Itabirito',
    'Lagoa Santa',
    'Mateus Leme',
    'Matozinhos',
    'Pedro Leopoldo',
    'Ribeirão das Neves',
    'Santa Luzia',
  ],

  // Sugestões no campo "Instituição" do formulário (não aparecem como clientes)
  instituicoes: [
    'UFMG',
    'PUC Minas',
    'CEFET-MG',
    'UEMG',
    'Faculdade Ciências Médicas de Minas Gerais',
    'UNIFENAS BH',
    'Centro Universitário de Belo Horizonte (UniBH)',
    'Centro Universitário UNA',
    'Centro Universitário Newton Paiva',
    'Faculdade de Minas (FAMINAS-BH)',
    'Faculdade da Saúde e Ecologia Humana (FASEH)',
    'Universidade FUMEC',
    'Faculdade Milton Campos',
    'Dom Helder Escola Superior',
    'Ibmec BH',
    'Faculdade Arnaldo',
    'Estácio BH',
    'Faculdade Pitágoras',
  ],
};
