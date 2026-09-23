/**
 * VIVA Eventos · Recebe os leads do site e grava no Google Sheets
 *
 * Cole este código em: Planilha > Extensões > Apps Script.
 * O passo a passo completo está em COMO-CONECTAR.md.
 *
 * Cada tipo de lead vai para uma aba própria, criada automaticamente
 * na primeira vez, já com cabeçalho:
 *   - "Análises da turma"   formulário de 3 passos
 *   - "WhatsApp flutuante"  botão flutuante de WhatsApp
 */

const FUSO = 'America/Sao_Paulo';

const UTMS = [
  ['utm_source', (d) => d.utm_source],
  ['utm_medium', (d) => d.utm_medium],
  ['utm_campaign', (d) => d.utm_campaign],
  ['utm_content', (d) => d.utm_content],
  ['utm_term', (d) => d.utm_term],
];

const ABAS = {
  formulario_analise: {
    nome: 'Análises da turma',
    colunas: [
      ['Recebido em', () => agora()],
      ['Nome', (d) => d.nome],
      ['WhatsApp', (d) => d.whatsapp],
      ['Abrir conversa', (d) => (d.whatsapp_digitos ? 'https://wa.me/' + d.whatsapp_digitos : '')],
      ['E-mail', (d) => d.email],
      ['Papel na formatura', (d) => d.papel],
      ['Curso', (d) => d.curso],
      ['Instituição', (d) => d.instituicao],
      ['Instituição digitada à mão', (d) => (d.instituicao_digitada ? 'Sim' : 'Não')],
      ['Cidade', (d) => d.cidade],
      ['Previsão de formatura', (d) => d.formatura],
      ['Formandos', (d) => numero(d.formandos)],
      ['Comissão', (d) => d.comissao],
      ['Fundo', (d) => d.fundo],
      ['Conversa com empresas', (d) => d.empresas],
      ['Quer resolver', (d) => (d.prioridades || []).join(', ')],
      ['Região', (d) => d.regiao],
      ['Unidade', (d) => d.unidade],
      ...UTMS,
      ['Página', (d) => d.pagina],
    ],
  },

  whatsapp_flutuante: {
    nome: 'WhatsApp flutuante',
    colunas: [
      ['Recebido em', () => agora()],
      ['Nome', (d) => d.nome],
      ['WhatsApp', (d) => d.whatsapp],
      ['Abrir conversa', (d) => (d.whatsapp_digitos ? 'https://wa.me/' + d.whatsapp_digitos : '')],
      ['E-mail', (d) => d.email],
      ['Cidade', (d) => d.cidade],
      ['Instituição', (d) => d.instituicao],
      ['Curso', (d) => d.curso],
      ['Região', (d) => d.regiao],
      ['Unidade', (d) => d.unidade],
      ...UTMS,
      ['Página', (d) => d.pagina],
    ],
  },
};

/* ---------- Recebe o envio do site ---------- */
function doPost(e) {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(20000)) {
    return resposta({ ok: false, erro: 'Planilha ocupada, tente de novo.' });
  }

  try {
    const bruto = (e && e.postData && e.postData.contents) || '{}';
    const dados = JSON.parse(bruto);

    if (!dados.nome) {
      return resposta({ ok: false, erro: 'Envio sem nome ignorado.' });
    }

    const origem = ABAS[dados.origem] ? dados.origem : 'formulario_analise';
    const config = ABAS[origem];
    const aba = obterAba(config);

    aba.appendRow(config.colunas.map(([, valor]) => limpar(valor(dados))));
    return resposta({ ok: true, aba: config.nome });
  } catch (err) {
    console.error(err);
    return resposta({ ok: false, erro: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/* ---------- Abrir o endereço no navegador mostra se está no ar ---------- */
function doGet() {
  return resposta({ ok: true, mensagem: 'Webhook da VIVA ativo.' });
}

/* ---------- Rode esta função uma vez no editor para autorizar e testar ---------- */
function testarGravacao() {
  const exemplos = [
    {
      origem: 'formulario_analise',
      nome: 'TESTE Ana Clara Ribeiro',
      whatsapp: '(31) 98888-7777',
      whatsapp_digitos: '5531988887777',
      email: 'ana@teste.com',
      papel: 'Faço parte da comissão',
      curso: 'Medicina',
      instituicao: 'TESTE Universidade',
      instituicao_digitada: false,
      cidade: 'TESTE Cidade',
      formatura: '2029.1',
      formandos: '90',
      comissao: 'Sim, já temos comissão',
      fundo: 'Está começando agora',
      empresas: 'Ainda não pesquisamos',
      prioridades: ['Organizar o fundo', 'Comparar propostas'],
      regiao: 'TESTE Região',
      unidade: 'TESTE Unidade',
      utm_source: 'teste',
      pagina: 'teste manual no Apps Script',
    },
    {
      origem: 'whatsapp_flutuante',
      nome: 'TESTE Bruno',
      email: 'bruno@teste.com',
      whatsapp: '(31) 97777-6666',
      whatsapp_digitos: '5531977776666',
      cidade: 'TESTE Cidade',
      instituicao: 'TESTE Universidade',
      curso: 'Direito',
      regiao: 'TESTE Região',
      unidade: 'TESTE Unidade',
      utm_source: 'teste',
      pagina: 'teste manual no Apps Script',
    },
  ];

  exemplos.forEach((dados) => {
    const retorno = doPost({ postData: { contents: JSON.stringify(dados) } });
    console.log(retorno.getContent());
  });
}

/* ---------- Auxiliares ---------- */
function obterAba(config) {
  const planilha = SpreadsheetApp.getActiveSpreadsheet();
  const cabecalho = config.colunas.map(([titulo]) => titulo);
  let aba = planilha.getSheetByName(config.nome);

  if (!aba) {
    aba = planilha.insertSheet(config.nome);
    aba.appendRow(cabecalho);
    formatarCabecalho(aba, cabecalho.length);
    aba.setFrozenRows(1);
    return aba;
  }

  // Se uma versão nova do script mudou as colunas, atualiza o cabeçalho existente
  const ultima = aba.getLastColumn();
  const atual = ultima > 0 ? aba.getRange(1, 1, 1, ultima).getValues()[0] : [];
  if (atual.join('|') !== cabecalho.join('|')) {
    if (ultima > cabecalho.length) {
      aba.getRange(1, cabecalho.length + 1, 1, ultima - cabecalho.length).clearContent();
    }
    aba.getRange(1, 1, 1, cabecalho.length).setValues([cabecalho]);
    formatarCabecalho(aba, cabecalho.length);
    aba.setFrozenRows(1);
  }
  return aba;
}

function formatarCabecalho(aba, colunas) {
  aba.getRange(1, 1, 1, colunas)
    .setFontWeight('bold')
    .setBackground('#FF6A1F')
    .setFontColor('#1D1A17');
}

function agora() {
  return Utilities.formatDate(new Date(), FUSO, 'yyyy-MM-dd HH:mm:ss');
}

function numero(v) {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : v;
}

// Evita que um texto enviado pelo site vire fórmula na planilha
function limpar(v) {
  if (v === null || v === undefined) return '';
  if (typeof v !== 'string') return v;
  const texto = v.trim().slice(0, 500);
  return /^[=+\-@\t\r]/.test(texto) ? "'" + texto : texto;
}

function resposta(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
