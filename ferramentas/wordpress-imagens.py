#!/usr/bin/env python3
"""
Converte para .jpg as imagens .webp de uma pasta, no lugar.

    pip install pillow
    python ferramentas/wordpress-imagens.py <pasta> [qualidade]

Por que: na primeira publicacao real (BH, set/2026) o WordPress do cliente
nao aceitou os .webp, e todas as referencias do bloco tiveram de virar .jpg.
O ferramentas/wordpress.js chama este script sozinho; os .png (as logos)
ficam como estao.
"""
import sys, os, glob
from PIL import Image

pasta = sys.argv[1] if len(sys.argv) > 1 else sys.exit(__doc__)
q = int(sys.argv[2]) if len(sys.argv) > 2 else 90

n = 0
for origem in sorted(glob.glob(os.path.join(pasta, '*.webp'))):
    destino = origem[:-5] + '.jpg'
    with Image.open(origem) as im:
        im.convert('RGB').save(destino, 'JPEG', quality=q, optimize=True, progressive=True)
    os.remove(origem)
    n += 1

print(f'{n} imagens .webp -> .jpg (qualidade {q})')
