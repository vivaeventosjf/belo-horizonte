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

const OUTRA_INSTITUICAO = 'Outra';
// Rótulo mostrado nas listas quando a pessoa quer escrever o nome
const OUTRA_INSTITUICAO_LABEL = 'Outra instituição (escrever)';

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
  fillDatalist($('[data-regiao-cidades-lista]'), SITE.cidades);
  fillDatalist($('[data-regiao-instituicoes]'), [OUTRA_INSTITUICAO_LABEL, ...SITE.instituicoes]);

  const instSelect = $('[data-regiao-instituicoes-select]');
  if (instSelect) {
    [OUTRA_INSTITUICAO, ...SITE.instituicoes].forEach((item) => {
      const opt = document.createElement('option');
      opt.value = item;
      opt.textContent = item === OUTRA_INSTITUICAO ? OUTRA_INSTITUICAO_LABEL : item;
      instSelect.append(opt);
    });
  }
  const cityInput = $('#f-cidade');
  if (cityInput && SITE.cidadePrincipal) cityInput.placeholder = `Ex.: ${SITE.cidadePrincipal}`;

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

/* ---------- Curso: Medicina x outros cursos ---------- */
function setCourse(course, { fromSelect = false } = {}) {
  if (course !== 'med' && course !== 'geral') return;
  root.dataset.course = course;
  storage.set('viva-course', course);

  $$('[data-set-course]').forEach((btn) => {
    btn.setAttribute('aria-pressed', String(btn.dataset.setCourse === course));
  });

  const select = $('#f-curso');
  if (select && !fromSelect) {
    if (course === 'med' && !select.value) select.value = 'Medicina';
    if (course === 'geral' && select.value === 'Medicina') select.value = '';
  }

  $$('.moments').forEach((list) => { list.scrollLeft = 0; });
  updateMomentArrows();
}

function initCourse() {
  const params = new URLSearchParams(location.search);
  const fromUrl = params.get('curso');
  const initial = fromUrl === 'medicina' || fromUrl === 'med' ? 'med' : (storage.get('viva-course') || 'geral');
  setCourse(initial);

  $$('[data-set-course]').forEach((btn) => {
    btn.addEventListener('click', () => setCourse(btn.dataset.setCourse));
  });
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

/* ---------- Contadores ---------- */
function initCounters() {
  const counters = $$('.count');
  const fmt = (n, dec) => n.toLocaleString('pt-BR', { minimumFractionDigits: dec, maximumFractionDigits: dec });
  if (reduceMotion) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const to = parseFloat(el.dataset.to);
      const dec = parseInt(el.dataset.decimals || '0', 10);
      const start = performance.now();
      const dur = 1400;
      const tick = (now) => {
        const t = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - t, 4);
        el.textContent = fmt(to * eased, dec);
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      io.unobserve(el);
    });
  }, { threshold: 0.6 });
  counters.forEach((el) => io.observe(el));
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

/* ---------- Carrossel de momentos ---------- */
function visibleMoments() {
  return $$('.moments').find((list) => list.offsetParent !== null);
}

function updateMomentArrows() {
  const list = visibleMoments();
  const [prev, next] = $$('[data-scroll]');
  if (!list || !prev) return;
  const max = list.scrollWidth - list.clientWidth - 4;
  prev.disabled = list.scrollLeft <= 4;
  next.disabled = list.scrollLeft >= max;
}

function initMoments() {
  $$('.moments').forEach((list) => {
    $$('.moment', list).forEach((m, i) => m.style.setProperty('--k', i));
    list.addEventListener('scroll', updateMomentArrows, { passive: true });
  });
  $$('[data-scroll]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const list = visibleMoments();
      if (!list) return;
      const card = $('.moment', list);
      const step = card ? card.getBoundingClientRect().width + 14 : 300;
      list.scrollBy({ left: step * 2 * Number(btn.dataset.scroll), behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  });
  window.addEventListener('resize', updateMomentArrows, { passive: true });
  updateMomentArrows();
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
function applyPhoneMask(input) {
  if (!input) return;
  input.addEventListener('input', () => {
    const d = onlyDigits(input.value).slice(0, 11);
    const corte = d.length === 11 ? 7 : 6;
    let out = d;
    if (d.length > 2) out = `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length > 6) out = `(${d.slice(0, 2)}) ${d.slice(2, corte)}-${d.slice(corte)}`;
    input.value = out;
  });
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

  // Escolher "Outra…" na lista limpa o campo para a pessoa escrever o nome
  const inputInstituicao = form.elements.instituicao;
  inputInstituicao.addEventListener('input', () => {
    if (inputInstituicao.value !== OUTRA_INSTITUICAO_LABEL) return;
    inputInstituicao.value = '';
    inputInstituicao.placeholder = 'Digite o nome da faculdade';
  });

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

/* ---------- Formulário em etapas ---------- */
function initForm() {
  const form = $('#lead-form');
  if (!form) return;

  const steps = $$('.form-step', form);
  const btnPrev = $('[data-prev]', form);
  const btnNext = $('[data-next]', form);
  const btnSubmit = $('[data-submit]', form);
  const bar = $('.fp-bar span', form);
  const labels = $$('.fp-labels span', form);
  const announcer = $('#step-announcer');
  const formError = $('#form-error');
  const success = $('#form-success');
  let current = 0;

  // Previsão de formatura: próximos semestres
  const selFormatura = $('#f-formatura');
  const now = new Date();
  let year = now.getFullYear();
  let sem = now.getMonth() < 6 ? 1 : 2;
  for (let i = 0; i < 14; i++) {
    const opt = document.createElement('option');
    opt.textContent = `${year}.${sem} (${sem === 1 ? '1º' : '2º'} semestre)`;
    opt.value = `${year}.${sem}`;
    selFormatura.append(opt);
    if (sem === 2) { sem = 1; year++; } else { sem = 2; }
  }

  // Curso do select sincroniza com o site
  const selCurso = $('#f-curso');
  selCurso.addEventListener('change', () => {
    if (selCurso.value === 'Medicina') setCourse('med', { fromSelect: true });
    else if (selCurso.value && root.dataset.course === 'med') setCourse('geral', { fromSelect: true });
  });
  if (root.dataset.course === 'med' && !selCurso.value) selCurso.value = 'Medicina';

  // Instituição: "Outra" abre campo para digitar
  const selInst = $('#f-instituicao');
  const fieldOutra = $('#field-instituicao-outra');
  selInst.addEventListener('change', () => {
    const outra = selInst.value === OUTRA_INSTITUICAO;
    fieldOutra.hidden = !outra;
    if (outra) $('#f-instituicao-outra').focus();
    else showError('instituicao_outra', '');
  });

  // Máscara de telefone
  applyPhoneMask($('#f-whatsapp'));

  // UTMs e página de origem
  const params = new URLSearchParams(location.search);
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach((key) => {
    const stored = storage.get(`viva-${key}`);
    const value = params.get(key) || stored || '';
    if (params.get(key)) storage.set(`viva-${key}`, params.get(key));
    form.elements[key].value = value;
  });
  form.elements.pagina.value = location.href.split('#')[0];

  // Validação
  const rules = {
    nome: (v) => (v.trim().split(/\s+/).length >= 2 ? '' : 'Digite nome e sobrenome.'),
    whatsapp: (v) => {
      const d = onlyDigits(v);
      return d.length === 11 || d.length === 10 ? '' : 'Digite um WhatsApp com DDD.';
    },
    email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Digite um e-mail válido.'),
    papel: (v) => (v ? '' : 'Escolha uma opção.'),
    curso: (v) => (v ? '' : 'Selecione o curso.'),
    instituicao_lista: (v) => (v ? '' : 'Selecione a instituição.'),
    instituicao_outra: (v) => (
      form.elements.instituicao_lista.value === OUTRA_INSTITUICAO && v.trim().length < 2
        ? 'Digite o nome da instituição.'
        : ''
    ),
    cidade: (v) => (v.trim().length >= 2 ? '' : 'Informe a cidade.'),
    formatura: (v) => (v ? '' : 'Selecione a previsão.'),
    formandos: (v) => {
      const n = parseInt(v, 10);
      return Number.isFinite(n) && n >= 5 && n <= 3000 ? '' : 'Digite o número aproximado de formandos.';
    },
    comissao: (v) => (v ? '' : 'Escolha uma opção.'),
    fundo: (v) => (v ? '' : 'Escolha uma opção.'),
    empresas: (v) => (v ? '' : 'Escolha uma opção.'),
  };

  function fieldValue(name) {
    const el = form.elements[name];
    if (!el) return '';
    if (el instanceof RadioNodeList) return el.value;
    return el.value;
  }

  function showError(name, message) {
    const errEl = $(`#e-${name}`, form);
    const input = form.elements[name];
    const first = input instanceof RadioNodeList ? input[0] : input;
    const field = first && first.closest('.field');
    if (errEl) errEl.textContent = message;
    if (field) field.classList.toggle('has-error', Boolean(message));
    const targets = input instanceof RadioNodeList ? Array.from(input) : [input];
    targets.forEach((t) => {
      if (!t) return;
      t.setAttribute('aria-invalid', message ? 'true' : 'false');
      if (errEl) t.setAttribute('aria-describedby', errEl.id);
    });
  }

  function validateStep(index) {
    const names = new Set($$('[name]', steps[index]).map((el) => el.name).filter((n) => rules[n]));
    let firstInvalid = null;
    names.forEach((name) => {
      const el = form.elements[name];
      const msg = rules[name](fieldValue(name), el);
      showError(name, msg);
      if (msg && !firstInvalid) firstInvalid = el instanceof RadioNodeList ? el[0] : el;
    });
    if (firstInvalid) firstInvalid.focus({ preventScroll: false });
    return !firstInvalid;
  }

  // Limpa erro enquanto a pessoa corrige
  form.addEventListener('input', (e) => {
    const name = e.target.name;
    if (!rules[name]) return;
    const field = e.target.closest('.field');
    if (field && field.classList.contains('has-error')) {
      showError(name, rules[name](fieldValue(name), form.elements[name]));
    }
  });
  form.addEventListener('change', (e) => {
    const name = e.target.name;
    if (rules[name] && (e.target.type === 'radio' || e.target.type === 'checkbox' || e.target.tagName === 'SELECT')) {
      showError(name, rules[name](fieldValue(name), form.elements[name]));
    }
  });

  function goTo(index) {
    steps[current].classList.remove('is-active');
    steps[current].hidden = true;
    current = index;
    steps[current].hidden = false;
    steps[current].classList.add('is-active');

    btnPrev.hidden = current === 0;
    btnNext.hidden = current === steps.length - 1;
    btnSubmit.hidden = current !== steps.length - 1;
    bar.style.transform = `scaleX(${(current + 1) / steps.length})`;
    labels.forEach((l, i) => l.classList.toggle('is-active', i <= current));
    announcer.textContent = `Etapa ${current + 1} de ${steps.length}: ${$('legend', steps[current]).textContent}`;
    formError.hidden = true;

    const top = form.getBoundingClientRect().top;
    if (top < 80) form.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    const firstInput = $('input:not([type=hidden]), select, textarea', steps[current]);
    if (firstInput && firstInput.type !== 'radio') firstInput.focus({ preventScroll: true });
  }

  btnNext.addEventListener('click', () => {
    if (validateStep(current)) goTo(current + 1);
  });
  btnPrev.addEventListener('click', () => goTo(current - 1));

  // Enter avança de etapa em vez de enviar
  form.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.tagName === 'INPUT' && current < steps.length - 1) {
      e.preventDefault();
      btnNext.click();
    }
  });

  function collect() {
    const fd = new FormData(form);
    const data = {};
    fd.forEach((value, key) => {
      if (key === 'prioridades') (data.prioridades ||= []).push(value);
      else data[key] = value;
    });
    data.prioridades = data.prioridades || [];
    data.instituicao = data.instituicao_lista === OUTRA_INSTITUICAO
      ? (data.instituicao_outra || '').trim()
      : data.instituicao_lista;
    data.instituicao_digitada = data.instituicao_lista === OUTRA_INSTITUICAO;
    delete data.instituicao_lista;
    delete data.instituicao_outra;
    data.whatsapp_digitos = `55${onlyDigits(data.whatsapp)}`;
    data.unidade = SITE.unidade;
    data.regiao = SITE.nome;
    data.regiao_slug = SITE.slug || '';
    data.enviado_em = new Date().toISOString();
    data.origem = 'formulario_analise';
    return data;
  }

  function whatsappMessage(d) {
    return [
      `Olá, ${SITE.unidade}! Sou ${d.nome} e pedi a análise da formatura da minha turma pelo site.`,
      '',
      `Curso: ${d.curso}`,
      `Instituição: ${d.instituicao} (${d.cidade})`,
      `Formatura prevista: ${d.formatura}`,
      `Formandos: cerca de ${d.formandos}`,
      `Comissão: ${d.comissao}`,
      `Fundo: ${d.fundo}`,
      `Empresas: ${d.empresas}`,
      `Meu papel: ${d.papel}`,
      d.prioridades.length ? `Queremos resolver: ${d.prioridades.join(', ')}` : '',
    ].filter(Boolean).join('\n');
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateStep(current)) return;

    const data = collect();
    form.classList.add('is-loading');
    btnSubmit.setAttribute('aria-busy', 'true');
    formError.hidden = true;

    try {
      await sendLead(data);

      if (typeof window.dataLayer !== 'undefined') {
        window.dataLayer.push({
          event: 'analise_turma',
          curso: data.curso,
          comissao: data.comissao,
          fundo: data.fundo,
          regiao: data.regiao,
        });
      }

      $('#success-name').textContent = data.nome.trim().split(/\s+/)[0];
      const turma = `${data.curso} · ${data.instituicao}`;
      $('#success-text').textContent =
        `Recebemos as informações da turma de ${turma}. Um especialista da ${SITE.unidade} vai analisar o cenário de vocês e entrar em contato com as orientações.`;

      const waBtn = $('#success-whatsapp');
      if (SITE.whatsapp) {
        waBtn.href = `https://wa.me/${onlyDigits(SITE.whatsapp)}?text=${encodeURIComponent(whatsappMessage(data))}`;
        waBtn.hidden = false;
        $('#success-note').hidden = false;
      }

      form.hidden = true;
      success.hidden = false;
      success.focus();
    } catch (err) {
      console.error('[VIVA] erro ao enviar lead', err);
      formError.textContent = SITE.whatsapp
        ? 'Não conseguimos enviar agora. Tente de novo em instantes ou fale direto com a gente pelo WhatsApp.'
        : 'Não conseguimos enviar agora. Verifique sua conexão e tente de novo.';
      formError.hidden = false;
    } finally {
      form.classList.remove('is-loading');
      btnSubmit.removeAttribute('aria-busy');
    }
  });
}

/* ---------- Início ---------- */
bindSiteConfig();
initCourse();
initHeader();
initReveal();
initCounters();
initMagnetic();
initMoments();
initMobileCta();
initWhatsappWidget();
initForm();
