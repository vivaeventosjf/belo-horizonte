/* =========================================================
   VIVA Eventos · Landing de captação para comissões
   ========================================================= */

/* A configuração da unidade fica em assets/js/unidade.js (fonte: unidades/<slug>/unidade.js) */
const SITE = {
  nome: '',
  nomeFrase: '',
  nomeCurto: '',
  unidade: 'VIVA Eventos',
  endereco: '',
  whatsapp: '',
  email: '',
  instagram: '',
  webhookUrl: '',
  videoYoutube: '',
  cidades: [],
  instituicoes: [],
  ...(window.UNIDADE || window.REGIAO || {}),
};

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
const root = document.documentElement;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const storage = {
  get(key) { try { return localStorage.getItem(key); } catch { return null; } },
  set(key, value) { try { localStorage.setItem(key, value); } catch { /* sem storage */ } },
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// Rótulo mostrado nas listas quando a pessoa quer escrever o nome

const onlyDigits = (v) => String(v || '').replace(/\D/g, '');

function formatPhoneBR(digits) {
  const d = onlyDigits(digits).replace(/^55(?=\d{10,11}$)/, '');
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return digits;
}

/* ---------- Dados da unidade no HTML ---------- */
function bindSiteConfig() {
  const values = { ...SITE, whatsappFormatado: formatPhoneBR(SITE.whatsapp) };
  if (values.instagram) values.instagram = `@${values.instagram.replace(/^@/, '')}`;

  $$('[data-site]').forEach((el) => {
    const v = values[el.dataset.site];
    if (v) el.textContent = v;
  });

  $$('[data-site-hide-empty]').forEach((el) => {
    if (!SITE[el.dataset.siteHideEmpty]) el.hidden = true;
  });
  // Cidades e instituições da região
  const cityChips = $('[data-regiao-cidades]');
  if (cityChips) {
    if (SITE.cidades.length) {
      SITE.cidades.forEach((c) => {
        const li = document.createElement('li');
        li.textContent = c;
        cityChips.append(li);
      });
    } else {
      cityChips.closest('.region-cities').hidden = true;
    }
  }
  const fillDatalist = (el, items) => {
    if (!el) return;
    items.forEach((item) => {
      const opt = document.createElement('option');
      opt.value = item;
      el.append(opt);
    });
  };
  fillDatalist($('[data-regiao-instituicoes]'), SITE.instituicoes);


  const contacts = $('[data-footer-contacts]');
  if (contacts && !$$('li', contacts).some((li) => !li.hidden)) contacts.hidden = true;

  const links = {
    whatsapp: SITE.whatsapp && `https://wa.me/${onlyDigits(SITE.whatsapp)}`,
    email: SITE.email && `mailto:${SITE.email}`,
    instagram: SITE.instagram && `https://instagram.com/${SITE.instagram.replace(/^@/, '')}`,
  };
  $$('[data-site-link]').forEach((el) => {
    const href = links[el.dataset.siteLink];
    if (href) el.href = href;
  });

  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();
}

/* ---------- Header / navegação ---------- */
function initHeader() {
  const sentinel = document.createElement('div');
  sentinel.style.cssText = 'position:absolute;top:0;height:8px;width:1px;';
  document.body.prepend(sentinel);
  new IntersectionObserver(([entry]) => {
    document.body.classList.toggle('is-scrolled', !entry.isIntersecting);
  }).observe(sentinel);

  const toggle = $('.nav-toggle');
  const nav = $('#main-nav');
  const close = () => {
    document.body.classList.remove('nav-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menu');
  };
  toggle.addEventListener('click', () => {
    const open = !document.body.classList.contains('nav-open');
    document.body.classList.toggle('nav-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  });
  $$('a', nav).forEach((a) => a.addEventListener('click', close));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
}

/* ---------- Revelação no scroll ---------- */
function initReveal() {
  const items = $$('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-in'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      io.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
  items.forEach((el) => io.observe(el));
}

/* ---------- Botões magnéticos ---------- */
function initMagnetic() {
  if (reduceMotion || !window.matchMedia('(pointer: fine)').matches) return;
  $$('.magnetic').forEach((btn) => {
    let frame = 0;
    btn.addEventListener('pointermove', (e) => {
      const r = btn.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * 0.18;
      const y = (e.clientY - r.top - r.height / 2) * 0.28;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        btn.style.setProperty('--mx', `${x.toFixed(1)}px`);
        btn.style.setProperty('--my', `${y.toFixed(1)}px`);
      });
    });
    btn.addEventListener('pointerleave', () => {
      cancelAnimationFrame(frame);
      btn.style.setProperty('--mx', '0px');
      btn.style.setProperty('--my', '0px');
    });
  });
}

/* ---------- CTA fixo no mobile ---------- */
function initMobileCta() {
  const bar = $('.mobile-cta');
  const hero = $('.hero');
  const form = $('#proposta');
  if (!bar || !hero || !form) return;
  let pastHero = false;
  let formVisible = false;
  const update = () => bar.classList.toggle('is-visible', pastHero && !formVisible);
  new IntersectionObserver(([e]) => { pastHero = !e.isIntersecting; update(); }).observe(hero);
  new IntersectionObserver(([e]) => { formVisible = e.isIntersecting; update(); }, { threshold: 0.05 }).observe(form);
}

/* ---------- Máscara de telefone (formulário e botão flutuante) ---------- */

/** Formata o que foi digitado: (31) 98888-7777. Devolve a string, para quem
 *  controla o próprio campo poder aplicar sem depender de listener. */
function maskPhone(valor) {
  const d = onlyDigits(valor).slice(0, 11);
  if (d.length <= 2) return d;
  const corte = d.length === 11 ? 7 : 6;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, corte)}-${d.slice(corte)}`;
}

function applyPhoneMask(input) {
  if (!input) return;
  input.addEventListener('input', () => { input.value = maskPhone(input.value); });
}

/* ---------- Envio para o CRM ---------- */
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];

function getUtms() {
  const params = new URLSearchParams(location.search);
  const out = {};
  UTM_KEYS.forEach((key) => {
    const fromUrl = params.get(key);
    if (fromUrl) storage.set(`viva-${key}`, fromUrl);
    out[key] = fromUrl || storage.get(`viva-${key}`) || '';
  });
  return out;
}

/**
 * Evento do Meta Pixel. So dispara se a unidade tiver pixel configurado: sem
 * isso, uma unidade sem metaPixel geraria erro no console a cada envio.
 *
 * Nunca manda dado do formulario para o Meta. O Pixel do Facebook nao aceita
 * dado pessoal em parametro de evento, e o que o time precisa (nome, curso,
 * instituicao) ja vai para o CRM pelo webhook.
 */
function trackPixel(evento, parametros) {
  if (typeof window.fbq !== 'function') {
    /* Sem pixel na unidade, ou bloqueador de anuncios derrubando o fbevents.js.
       O aviso existe para nao confundir as duas causas na hora de conferir. */
    console.warn('[VIVA] Meta Pixel indisponivel: evento ' + evento + ' nao foi enviado.'
      + ' Se a unidade tem metaPixel configurado, provavelmente e bloqueador de anuncios.');
    return;
  }
  try {
    window.fbq('track', evento, parametros || {});
    console.info('[VIVA] Meta Pixel: ' + evento, parametros || {});
  } catch (err) {
    /* Bloqueador pode derrubar o fbq no meio: o envio do lead nao pode falhar
       por causa da medicao. */
    console.warn('[VIVA] Meta Pixel falhou no evento ' + evento, err);
  }
}

async function sendLead(data) {
  if (!SITE.webhookUrl) {
    console.warn('[VIVA] webhookUrl não configurado em unidades/<slug>/unidade.js. O lead não foi enviado a nenhum sistema.', data);
    return;
  }
  // text/plain evita preflight de CORS (compatível com Google Apps Script)
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    await fetch(SITE.webhookUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(data),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

/* ---------- WhatsApp flutuante ---------- */
function initWhatsappWidget() {
  const widget = $('#wa-widget');
  if (!widget || !SITE.whatsapp) return;
  widget.hidden = false;

  const fab = $('#wa-fab');
  const panel = $('#wa-panel');
  const form = $('#wa-form');
  const erro = $('#wa-erro');
  const closeBtn = $('#wa-close');

  const CAMPOS = ['nome', 'email', 'whatsapp', 'cidade', 'instituicao', 'curso'];
  applyPhoneMask(form.elements.whatsapp);

  // Se a pessoa já preencheu antes, não pedimos de novo
  let saved = {};
  try { saved = JSON.parse(storage.get('viva-wa') || '{}'); } catch { saved = {}; }
  CAMPOS.forEach((k) => { if (saved[k]) form.elements[k].value = saved[k]; });

  const checks = [
    ['nome', (v) => v.length >= 2, 'Preencha seu nome.'],
    ['email', (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v), 'Digite um e-mail válido.'],
    ['whatsapp', (v) => [10, 11].includes(onlyDigits(v).length), 'Digite o telefone com DDD.'],
    ['cidade', (v) => v.length >= 2, 'Preencha a cidade.'],
    ['instituicao', (v) => v.length >= 2, 'Preencha a faculdade.'],
    ['curso', (v) => v.length >= 2, 'Preencha o curso.'],
  ];

  const setOpen = (open) => {
    panel.hidden = !open;
    fab.setAttribute('aria-expanded', String(open));
    if (open) form.elements.nome.focus();
  };

  fab.addEventListener('click', () => setOpen(panel.hidden));
  closeBtn.addEventListener('click', () => { setOpen(false); fab.focus(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !panel.hidden) { setOpen(false); fab.focus(); }
  });
  document.addEventListener('click', (e) => {
    if (!panel.hidden && !widget.contains(e.target)) setOpen(false);
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const v = {};
    CAMPOS.forEach((k) => { v[k] = form.elements[k].value.trim(); });

    CAMPOS.forEach((k) => form.elements[k].closest('.field').classList.remove('has-error'));
    const invalido = checks.find(([k, ok]) => !ok(v[k]));
    if (invalido) {
      const [campo, , mensagem] = invalido;
      erro.textContent = mensagem;
      form.elements[campo].closest('.field').classList.add('has-error');
      form.elements[campo].focus();
      return;
    }
    erro.textContent = '';
    storage.set('viva-wa', JSON.stringify(v));

    const { nome, email, whatsapp, cidade, instituicao, curso } = v;
    const msg = `Olá, ${SITE.unidade}! Sou ${nome}, do curso de ${curso} (${instituicao}), de ${cidade}.`
      + ' Quero falar sobre a formatura da minha turma.';
    const url = `https://wa.me/${onlyDigits(SITE.whatsapp)}?text=${encodeURIComponent(msg)}`;

    /* Mesma regra do formulario de proposta: marca no envio das informacoes,
       nao no que vem depois. O content_name separa os dois caminhos no
       Gerenciador sem dividir a conversao que o algoritmo otimiza. */
    trackPixel('Lead', {
      content_name: 'WhatsApp flutuante',
      content_category: curso || '',
    });

    // abre antes do await para não ser bloqueado como popup
    const aba = window.open(url, '_blank', 'noopener');
    setOpen(false);

    try {
      await sendLead({
        origem: 'whatsapp_flutuante',
        nome,
        email,
        whatsapp,
        whatsapp_digitos: `55${onlyDigits(whatsapp)}`,
        cidade,
        instituicao,
        curso,
        unidade: SITE.unidade,
        regiao: SITE.nome,
        regiao_slug: SITE.slug || '',
        pagina: location.href.split('#')[0],
        enviado_em: new Date().toISOString(),
        ...getUtms(),
      });
    } catch (err) {
      console.error('[VIVA] erro ao registrar contato do WhatsApp', err);
    }

    if (typeof window.dataLayer !== 'undefined') {
      window.dataLayer.push({ event: 'whatsapp_flutuante', curso, regiao: SITE.nome });
    }
    if (!aba) location.href = url;
  });
}

/* ---------- Formulário em perguntas ----------
   Uma tela por vez, como o formulário de candidatura da franqueadora. O
   formato troca um formulário longo, que a pessoa vê inteiro e desiste, por
   perguntas que cabem numa tela e mostram o progresso.

   Os nomes dos campos são os mesmos de antes de propósito: a planilha e o
   Kommo leem por esse nome, e renomear aqui quebraria os dois.               */
function initForm() {
  const start = $('#quiz-start');
  const card = $('#quiz-card');
  const body = $('#quiz-body');
  const foot = $('#quiz-foot');
  const conta = $('#quiz-count');
  const barra = $('#quiz-bar');
  const erroEl = $('#quiz-erro');
  const anuncio = $('#quiz-announcer');
  if (!start || !card || !body) return;

  /* Endereços que marcam o começo e o fim do formulário. Servem para montar
     conversão personalizada por URL no Gerenciador de Anúncios, sem depender
     de evento no pixel: /#formulario quando a pessoa começa a responder e
     /#obrigado quando ela envia. */
  const HASH_INICIO = '#formulario';
  const HASH_FIM = '#obrigado';

  function marcarUrl(hash) {
    try {
      if (window.history && window.history.pushState) {
        window.history.pushState({ etapa: hash }, '', hash);
      } else {
        location.hash = hash;
      }
    } catch (err) {
      /* Navegador antigo: segue sem mexer na URL. A medição se perde, o
         formulário não. */
    }
  }

  const resp = {};
  let atual = 0;
  let terminado = false;
  let parcialEnviado = false;

  /* Cada tela pode ter mais de um campo: agrupar o que a pessoa responde de
     uma vez só evita telas demais, que é o que faz abandonar. */
  const TELAS = [
    {
      titulo: 'Primeiro, como a gente fala com você?',
      dica: 'Sem ligação surpresa: o primeiro contato é no WhatsApp que você informar.',
      campos: [
        { id: 'nome', tipo: 'texto', rotulo: 'Seu nome', placeholder: 'Nome completo', autocomplete: 'name' },
        { id: 'whatsapp', tipo: 'telefone', rotulo: 'WhatsApp', placeholder: '(00) 00000-0000' },
        { id: 'email', tipo: 'email', rotulo: 'E-mail', placeholder: 'voce@email.com', autocomplete: 'email' },
      ],
    },
    {
      titulo: 'Qual é o seu papel na turma?',
      campos: [
        { id: 'papel', tipo: 'escolha', opcoes: [
          'Faço parte da comissão',
          'Estou ajudando a montar a comissão',
          'Sou formando(a)',
        ] },
      ],
    },
    {
      titulo: 'De qual curso e faculdade é a turma?',
      campos: [
        { id: 'curso', tipo: 'texto', rotulo: 'Curso', placeholder: 'Ex.: Enfermagem' },
        { id: 'instituicao', tipo: 'texto', rotulo: 'Faculdade', placeholder: 'Nome da faculdade' },
      ],
    },
    {
      titulo: 'Onde a turma estuda e quando se forma?',
      campos: [
        { id: 'cidade', tipo: 'texto', rotulo: 'Cidade',
          placeholder: () => `Ex.: ${SITE.cidadePrincipal || 'sua cidade'}` },
        { id: 'formatura', tipo: 'escolha', rotulo: 'Quando se formam', opcoes: [
          'Em menos de 6 meses',
          'Daqui a 6 meses a 1 ano',
          'Daqui a 1 a 2 anos',
          'Daqui a mais de 2 anos',
          'Ainda não sabemos',
        ] },
      ],
    },
    {
      titulo: 'Quantos formandos tem a turma?',
      dica: 'Uma estimativa já serve. O tamanho da turma muda bastante a proposta.',
      campos: [
        { id: 'formandos', tipo: 'numero', placeholder: 'Ex.: 90', min: 5, max: 3000 },
      ],
    },
    {
      titulo: 'Em que pé está a organização?',
      campos: [
        { id: 'comissao', tipo: 'escolha', rotulo: 'A turma já tem comissão?', opcoes: [
          'Sim, já temos comissão',
          'Estamos montando agora',
          'Ainda não temos comissão',
        ] },
        { id: 'empresas', tipo: 'escolha', rotulo: 'Já conversaram com outras empresas?', opcoes: [
          'Sim, já recebemos propostas',
          'Estamos começando a pesquisar',
          'Ainda não pesquisamos',
        ] },
      ],
    },
  ];

  /* ---------- campos visíveis ---------- */

  function camposDaTela(tela) {
    return tela.campos;
  }

  function respondido(campo) {
    const v = resp[campo.id];
    if (campo.opcional) return true;
    if (campo.tipo === 'varias') return Array.isArray(v) && v.length > 0;
    if (campo.tipo === 'numero') return v !== undefined && String(v).trim() !== '' && Number(v) >= (campo.min || 1);
    if (campo.tipo === 'email') return EMAIL_RE.test(String(v || '').trim());
    if (campo.tipo === 'telefone') return onlyDigits(v || '').length >= 10;
    return String(v || '').trim().length > 1;
  }

  function telaCompleta(i) {
    return camposDaTela(TELAS[i]).every(respondido);
  }

  /* ---------- desenho ---------- */

  function texto(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  }

  function valorOu(v) { return typeof v === 'function' ? v() : v; }

  function desenharCampo(campo) {
    const rot = campo.rotulo ? `<span class="quiz-rot">${texto(campo.rotulo)}</span>` : '';
    const v = resp[campo.id];

    if (campo.tipo === 'escolha' || campo.tipo === 'varias') {
      const varias = campo.tipo === 'varias';
      const opcoes = valorOu(campo.opcoes).map((op) => {
        const marcado = varias ? (Array.isArray(v) && v.indexOf(op) >= 0) : v === op;
        return `<button type="button" class="quiz-opt${marcado ? ' selected' : ''}"
          data-campo="${texto(campo.id)}" data-valor="${texto(op)}" data-varias="${varias}"
          aria-pressed="${marcado}"><span class="quiz-marca"></span><span>${texto(op)}</span></button>`;
      }).join('');
      return `<div class="quiz-campo">${rot}<div class="quiz-options${varias ? ' quiz-options-varias' : ''}">${opcoes}</div></div>`;
    }

    const tipos = { texto: 'text', numero: 'number', email: 'email', telefone: 'tel' };
    const extra = [
      campo.lista ? ` list="${texto(campo.lista)}"` : '',
      campo.autocomplete ? ` autocomplete="${texto(campo.autocomplete)}"` : ' autocomplete="off"',
      campo.tipo === 'numero' ? ` inputmode="numeric" min="${campo.min}" max="${campo.max}"` : '',
      campo.tipo === 'telefone' ? ' inputmode="numeric"' : '',
    ].join('');

    return `<div class="quiz-campo">${rot}<input class="quiz-input" type="${tipos[campo.tipo]}"
      data-campo="${texto(campo.id)}" placeholder="${texto(valorOu(campo.placeholder) || '')}"
      value="${texto(v || '')}"${extra}></div>`;
  }

  function desenhar(direcao) {
    if (terminado) return;
    const tela = TELAS[atual];

    let html = `<h3 class="quiz-q">${texto(tela.titulo)}</h3>`;
    if (tela.dica) html += `<p class="quiz-hint">${texto(tela.dica)}</p>`;
    html += camposDaTela(tela).map(desenharCampo).join('');
    body.innerHTML = html;

    body.classList.remove('quiz-anim', 'quiz-anim-back');
    void body.offsetWidth;
    body.classList.add(direcao === 'voltar' ? 'quiz-anim-back' : 'quiz-anim');

    ligarCampos();
    desenharRodape();
    atualizarProgresso();
    esconderErro();

    const primeiro = body.querySelector('.quiz-input');
    if (primeiro && atual > 0) {
      try { primeiro.focus({ preventScroll: true }); } catch (err) { /* navegador antigo */ }
    }
  }

  function ligarCampos() {
    $$('.quiz-input', body).forEach((el) => {
      const id = el.dataset.campo;
      const campo = TELAS[atual].campos.find((c) => c.id === id);

      el.addEventListener('input', () => {
        if (campo && campo.tipo === 'telefone') el.value = maskPhone(el.value);
        resp[id] = el.value;
        atualizarBotao();
      });

      el.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter') return;
        e.preventDefault();
        if (telaCompleta(atual)) avancar();
      });
    });

    $$('.quiz-opt', body).forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.campo;
        const val = btn.dataset.valor;

        if (btn.dataset.varias === 'true') {
          const lista = Array.isArray(resp[id]) ? resp[id] : [];
          const i = lista.indexOf(val);
          if (i >= 0) lista.splice(i, 1); else lista.push(val);
          resp[id] = lista;
          btn.classList.toggle('selected', lista.indexOf(val) >= 0);
          btn.setAttribute('aria-pressed', String(lista.indexOf(val) >= 0));
        } else {
          resp[id] = val;
          $$(`.quiz-opt[data-campo="${id}"]`, body).forEach((o) => {
            const marcado = o === btn;
            o.classList.toggle('selected', marcado);
            o.setAttribute('aria-pressed', String(marcado));
          });
        }
        atualizarBotao();
      });
    });
  }

  function desenharRodape() {
    const temVoltar = atual > 0;
    const ultima = atual === TELAS.length - 1;
    foot.className = temVoltar ? 'quiz-foot' : 'quiz-foot only-next';
    foot.innerHTML =
      (temVoltar ? '<button type="button" class="quiz-back">Voltar</button>' : '') +
      `<button type="button" class="quiz-next"${telaCompleta(atual) ? '' : ' disabled'}>
        <span class="btn-label">${ultima ? 'Falar com um consultor' : 'Continuar'}</span>
        <span class="btn-loading" aria-hidden="true"><i></i><i></i><i></i></span>
      </button>`;

    const voltar = foot.querySelector('.quiz-back');
    if (voltar) voltar.addEventListener('click', () => { if (atual) { atual--; desenhar('voltar'); } });
    foot.querySelector('.quiz-next').addEventListener('click', avancar);
  }

  function atualizarBotao() {
    const btn = foot.querySelector('.quiz-next');
    if (btn) btn.disabled = !telaCompleta(atual);
  }

  function atualizarProgresso() {
    if (terminado) {
      conta.textContent = 'Enviado';
      barra.style.width = '100%';
      return;
    }
    conta.textContent = `Pergunta ${atual + 1} de ${TELAS.length}`;
    barra.style.width = Math.max((atual / TELAS.length) * 100, 5) + '%';
    if (anuncio) anuncio.textContent = `Pergunta ${atual + 1} de ${TELAS.length}: ${TELAS[atual].titulo}`;
  }

  function mostrarErro(msg) { erroEl.textContent = msg; erroEl.hidden = false; }
  function esconderErro() { erroEl.hidden = true; }

  /* ---------- navegação ---------- */

  function avancar() {
    if (!telaCompleta(atual)) {
      const falta = camposDaTela(TELAS[atual]).find((c) => !respondido(c));
      mostrarErro(falta && falta.tipo === 'email'
        ? 'Confira o e-mail: parece incompleto.'
        : 'Preencha para continuar.');
      return;
    }
    if (atual === TELAS.length - 1) { enviar(); return; }
    atual++;
    desenhar();
  }

  /* ---------- dados ---------- */

  function montar() {
    const data = { ...resp };
    data.instituicao = (resp.instituicao || '').trim();
    data.whatsapp_digitos = `55${onlyDigits(resp.whatsapp || '')}`;
    data.unidade = SITE.unidade;
    data.regiao = SITE.nome;
    data.regiao_slug = SITE.slug || '';
    data.pagina = location.href.split('#')[0];
    data.enviado_em = new Date().toISOString();
    data.origem = 'formulario_consultor';
    return { ...data, ...getUtms() };
  }

  /* Quem começou a responder e foi embora não se perde: assim que o WhatsApp
     estiver completo, o lead parcial é gravado. É a mesma ideia do formulário
     da franqueadora, onde o parcial virou boa parte dos contatos. */
  function enviarParcial() {
    if (parcialEnviado || terminado) return;
    if (onlyDigits(resp.whatsapp || '').length < 10) return;
    parcialEnviado = true;
    const corpo = JSON.stringify({ ...montar(), origem: 'formulario_parcial' });
    try {
      if (navigator.sendBeacon && SITE.webhookUrl) {
        navigator.sendBeacon(SITE.webhookUrl, new Blob([corpo], { type: 'text/plain;charset=UTF-8' }));
      }
    } catch (err) { /* o envio completo ainda pode acontecer */ }
  }

  async function enviar() {
    const btn = foot.querySelector('.quiz-next');
    const data = montar();

    card.classList.add('is-loading');
    if (btn) { btn.disabled = true; btn.setAttribute('aria-busy', 'true'); }
    esconderErro();

    /* Antes do envio ao CRM: a conversão é a pessoa mandar as informações. */
    trackPixel('Lead', { content_name: 'Formulario da turma', content_category: data.curso || '' });

    try {
      await sendLead(data);
      parcialEnviado = true;
      concluir(data);
    } catch (err) {
      console.error('[VIVA] erro ao enviar o formulário', err);
      mostrarErro('Não conseguimos enviar agora. Tente de novo em instantes ou fale direto no WhatsApp.');
      if (btn) { btn.disabled = false; btn.removeAttribute('aria-busy'); }
    } finally {
      card.classList.remove('is-loading');
    }
  }

  function concluir(data) {
    terminado = true;
    marcarUrl(HASH_FIM);
    const primeiroNome = (data.nome || '').trim().split(/\s+/)[0] || 'tudo certo';
    const turma = [data.curso, data.instituicao].filter(Boolean).join(' · ');

    let html = `<div class="quiz-done">
      <span class="success-icon"><svg class="icon"><use href="#i-check"/></svg></span>
      <h3>Recebemos, ${texto(primeiroNome)}!</h3>
      <p>As informações da turma${turma ? ` de ${texto(turma)}` : ''} chegaram para a
         ${texto(SITE.unidade)}. Um consultor vai falar com você pelo WhatsApp
         <strong>${texto(data.whatsapp || '')}</strong>.</p>
      <div class="quiz-next-steps">
        <h4>O que acontece agora</h4>
        <ul>
          <li><b>1</b><span>Um consultor da unidade entra em contato para entender o que a turma quer.</span></li>
          <li><b>2</b><span>Vocês veem como a VIVA faz cada parte da formatura.</span></li>
          <li><b>3</b><span>A proposta sai conversada, por escrito, sem compromisso de fechar.</span></li>
        </ul>
      </div>`;

    if (SITE.whatsapp) {
      const msg = `Olá, ${SITE.unidade}! Sou ${data.nome}${turma ? `, da turma de ${turma}` : ''}.`
        + ' Acabei de enviar as informações da minha turma pelo site.';
      html += `<a class="btn btn-orange" href="https://wa.me/${onlyDigits(SITE.whatsapp)}?text=${encodeURIComponent(msg)}"
        target="_blank" rel="noopener"><svg class="icon"><use href="#i-chat"/></svg> Falar agora no WhatsApp</a>
        <p class="success-note">Já vai com o resumo da sua turma escrito. É só enviar.</p>`;
    }
    html += '</div>';

    body.innerHTML = html;
    body.classList.remove('quiz-anim', 'quiz-anim-back');
    void body.offsetWidth;
    body.classList.add('quiz-anim');
    foot.innerHTML = '';
    foot.className = 'quiz-foot';
    atualizarProgresso();
    esconderErro();

    if (typeof window.dataLayer !== 'undefined') {
      window.dataLayer.push({
        event: 'formulario_turma',
        curso: data.curso,
        comissao: data.comissao,
        fundo: data.fundo,
        regiao: data.regiao,
      });
    }
    if (card.scrollIntoView) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  /* ---------- abertura ---------- */

  function abrir() {
    if (!card.hidden) return;
    start.hidden = true;
    card.hidden = false;
    desenhar();
    marcarUrl(HASH_INICIO);

    /* InitiateCheckout é o evento que o Meta entende como "começou o
       preenchimento", e é o par natural do Lead lá no fim. */
    trackPixel('InitiateCheckout', { content_name: 'Formulario da turma' });

    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  $('#quiz-start-btn').addEventListener('click', abrir);

  /* Os botões da página que apontam para o formulário já abrem a primeira
     pergunta: um clique a menos entre a intenção e a resposta. */
  $$('a[href="#proposta"]').forEach((a) => {
    a.addEventListener('click', () => setTimeout(abrir, 320));
  });

  window.addEventListener('pagehide', enviarParcial);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') enviarParcial();
  });
}

/* ---------- Vídeo sob demanda ----------
   A seção só aparece se a unidade tiver vídeo. A fachada carrega apenas a
   imagem; o player do YouTube entra no clique, porque o embed direto traz
   centenas de KB que a maioria das visitas nunca usa. */
function initVideo() {
  const secao = $('#video');
  const capa = $('#video-capa');
  if (!secao || !capa) return;

  const id = (SITE.videoYoutube || '').trim();
  if (!id) return;
  secao.hidden = false;

  capa.addEventListener('click', () => {
    const frame = document.createElement('iframe');
    frame.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?rel=0&autoplay=1`;
    frame.title = `VIVA Eventos, conheça a ${SITE.unidade || 'VIVA'}`;
    frame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    frame.allowFullscreen = true;

    const caixa = document.createElement('div');
    caixa.className = 'video-frame';
    caixa.appendChild(frame);
    capa.parentNode.replaceChild(caixa, capa);
  });
}

/* ---------- Início ---------- */
bindSiteConfig();
initHeader();
initReveal();
initMagnetic();
initMobileCta();
initVideo();
initWhatsappWidget();
initForm();
