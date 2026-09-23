#!/usr/bin/env python3
"""
Adapta o HTML gerado (ferramentas/wordpress.js) para colar no widget HTML
do Elementor sem que o WordPress/tema quebre o layout.

Normalmente nao se chama isto a mao: o ferramentas/wordpress.js ja roda
este script no fim. Direto, se precisar:

    pip install tinycss2
    python ferramentas/wordpress-adaptar.py original.html saida.html

Os ajustes vieram da primeira publicacao real (landing de BH, set/2026) e
estao explicados em ferramentas/WORDPRESS.md.
"""
import re, sys
import tinycss2

WRAP = '#viva-lp#viva-lp'  # dois IDs = prioridade maior que qualquer CSS do tema

RESET = '''/* Isola a landing do tema, do Elementor e de plugins:
   zera tudo que vem de fora (volta ao padrão do navegador) e
   as regras abaixo, com #viva-lp#viva-lp, sempre vencem. */
#viva-lp { display: block; width: 100%; max-width: none; margin: 0; padding: 0; text-align: left; }
#viva-lp :not(svg):not(svg *):not(img) { all: revert; }
#viva-lp :not(svg):not(svg *)::before, #viva-lp :not(svg):not(svg *)::after, #viva-lp ::placeholder, #viva-lp ::marker { all: revert; }
#viva-lp img { border: 0; box-shadow: none; }
html { font-size: 100%; }
'''

GUARD = '''<style>
/* Proteção contra o WordPress/tema */
/* Remove espaços que o tema/Elementor colocam em volta da landing */
body:has(#viva-lp) { margin: 0 !important; padding: 0 !important; background: #FAF7F3 !important; }
body:has(#viva-lp)::before { content: none !important; display: none !important; }
:is(.elementor, .elementor-section, .elementor-container, .elementor-column, .elementor-widget-wrap, .elementor-element, .elementor-widget-container, .e-con, .e-con-inner):has(#viva-lp) {
  margin: 0 !important; padding: 0 !important; max-width: none !important; width: 100% !important;
  min-height: 0 !important; gap: 0 !important; border: 0 !important; background: none !important;
}
#viva-lp#viva-lp p:empty, #viva-lp#viva-lp br { display: none !important; }
#viva-lp#viva-lp .skip-link { position: absolute; top: auto; left: 16px; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
#viva-lp#viva-lp .skip-link:focus { position: fixed; top: 12px; width: auto; height: auto; overflow: visible; clip-path: none; }
</style>
'''

# Seletores cujo 1º pedaço está no <html>/<body>, não dentro da landing
ANCESTRAL = re.compile(r'^(html\S*|\.js|\.is-scrolled|\.nav-open)$')

def escopar(sel):
    sel = sel.strip()
    if sel == ':root':
        return ':root, #viva-lp'
    if sel == 'html':
        return 'html'
    if sel.startswith('body'):
        return WRAP + sel[4:]
    partes = sel.split(None, 1)
    if ANCESTRAL.match(partes[0]) and len(partes) > 1:
        return f'{partes[0]} {WRAP} {partes[1]}'
    return f'{WRAP} {sel}'

def css_escopado(regras, ind=''):
    out = []
    for r in regras:
        if r.type == 'qualified-rule':
            sels = [escopar(x) for x in tinycss2.serialize(r.prelude).split(',')]
            corpo = tinycss2.serialize(r.content).strip()
            if sels == [WRAP]:  # antigo body: hidden quebraria o header sticky
                corpo = corpo.replace('overflow-x: hidden', 'overflow-x: clip')
            out.append(f"{ind}{', '.join(sels)} {{ {corpo} }}")
        elif r.type == 'at-rule':
            pre = tinycss2.serialize(r.prelude).strip()
            if r.content is None:
                out.append(f'{ind}@{r.at_keyword} {pre};')
            elif r.at_keyword in ('media', 'supports'):
                dentro = tinycss2.parse_rule_list(r.content, skip_whitespace=True, skip_comments=True)
                out.append(f'{ind}@{r.at_keyword} {pre} {{\n{css_escopado(dentro, ind + "  ")}\n{ind}}}')
            else:  # @keyframes etc. ficam como estão
                out.append(f'{ind}@{r.at_keyword} {pre} {{{tinycss2.serialize(r.content)}}}')
    return '\n'.join(out)

def adaptar(s):
    # 1. quebras de linha padronizadas + imagens em .jpg
    s = s.replace('\r\n', '\n').replace('\r', '\n').replace('.webp', '.jpg')

    # 2. o 1º <style> (CSS da landing) ganha reset + escopo
    m = re.search(r'<style>\n?(.*?)</style>', s, re.S)
    regras = tinycss2.parse_stylesheet(m.group(1), skip_whitespace=True, skip_comments=True)
    s = s[:m.start()] + '<style>\n' + RESET + css_escopado(regras) + '\n</style>' + s[m.end():]

    # 3. markup numa linha só, sem comentários (evita <p> do wpautop);
    #    <script>/<style> só perdem linhas em branco
    partes = re.split(r'(<(script|style)\b.*?</\2>)', s, flags=re.S)
    blocos, i = [], 0
    while i < len(partes):
        if i % 3 == 0:
            t = re.sub(r'<!--.*?-->', '', partes[i], flags=re.S)
            blocos.append(' '.join(l.strip() for l in t.split('\n') if l.strip()))
            i += 1
        else:
            blocos.append('\n'.join(l for l in partes[i].split('\n') if l.strip()))
            i += 2
    s = ''.join(b + '\n' for b in blocos if b)

    # 4. envolve o conteúdo visível em #viva-lp (do skip-link até o 1º script depois dele)
    a = s.index('<a class="skip-link"')
    b = s.index('<script>', a)
    return s[:a] + GUARD + '<div id="viva-lp" class="viva-lp">' + s[a:b].rstrip('\n') + '</div>\n' + s[b:]

if __name__ == '__main__':
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    src = open(sys.argv[1], encoding='utf-8').read()
    open(sys.argv[2], 'w', encoding='utf-8').write(adaptar(src))
    print('OK ->', sys.argv[2])
