/* =========================================================
   ANUNCIOS · Belo Horizonte
   As rodadas desta unidade: qual foto entra em cada copy,
   como e o recorte e onde o texto fica.
   As copies e os layouts sao da rede: ferramentas/anuncios.js

   Fotos: caminho relativo a assets-originais/
     viva-brasil/...  banco da rede, serve qualquer unidade
     belo-horizonte/  banco proprio da unidade

   Gerar:  node ferramentas/anuncios.js belo-horizonte
   ========================================================= */

const BAILE = 'viva-brasil/1. BAILE-20260911T150508Z-1-001/1. BAILE/';
const PRE = 'viva-brasil/3. PRÉ-EVENTOS-20260911T150431Z-1-001/3. PRÉ-EVENTOS/';
const PROD = 'viva-brasil/Produção VIVA-20260911T150419Z-1-001/Produção VIVA/';
// Banco proprio da unidade
const BH = 'belo-horizonte/BANCO DE IMAGENS/';
const BH_CAMINHADA = BH + 'CAMINHADA ETÍLICA MED 43 UNIFENAS/';
const BH_COLACAO = BH + 'COLAÇÃO e CULTO 33 UNIFENAS/';
const BH_MED34 = BH + 'MED 34 UNIFENAS/';

const MEDLAND_A = 'O MEDLAND foi o jeito perfeito de marcar o início dessa jornada… E esses sorrisos já dizem tudo,.jpg';
const MEDLAND_B = 'O MEDLAND foi o jeito perfeito de marcar o início dessa jornada… E esses sorrisos já dizem tudo, (1).jpg';
const MEIO_MEDICO = 'A @medmetro_t5 transformou o Meio Médico em uma verdadeira obra de arte, digna de Van Gogh! 🌌✨E (3).jpg';
const TARDEZINHA = 'Tardezinha da @atm29.2unisinos com a @vivaeventospoa ❤️_🔥❤️_🔥 (1).jpg';
const GRUPO_COPOS = 'Cópia de 93D1F8A7-8B4F-41B0-A246-B15F70D4A642.jpeg';

const RODADAS = {
  1: [
    // Salao montado; o recorte a esquerda tira a placa 'MEDICINA' que fica na direita
    { copy: 'escolher-errado', foto: BAILE + 'Cópia de Cópia de _DU_2528.jpg', foco: '22% 45%', layout: 'base' },
    // 'conta com voce' funciona melhor com gente olhando para a camera
    { copy: 'pressao-comissao', foto: PRE + MEDLAND_A, foco: 'center 30%', layout: 'base' },
    // 'a turma' pede varias pessoas no quadro; ainda por cima tem copo da VIVA na foto
    { copy: 'convencer-turma', foto: PRE + GRUPO_COPOS, foco: '42% 38%', layout: 'base' },
    { copy: 'adesao', foto: BAILE + 'Cópia de _JOA8910.jpg', foco: 'center 20%', layout: 'base' },
    { copy: 'medicina-comissao', foto: BAILE + 'Cópia de _F017912.jpg', foco: 'center 40%', layout: 'base' },
    { copy: 'medicina-jornada', foto: PRE + MEIO_MEDICO, foco: 'center 35%', layout: 'base' },
  ],
  2: [
    // Segunda rodada: fotos do banco de BH e o texto em outra posicao, para testar contra a primeira
    // Salao da MED 34 sem marca d'agua: o topo so tem lustre e teto, entao o texto cabe em cima
    { copy: 'escolher-errado', foto: BH_MED34 + 'MED 34 UNIFENAS - EXPOMINAS BH -  Kathyana Garcia (7).png', foco: 'center 50%', layout: 'topo' },
    // 'conta com voce' funciona melhor com gente olhando para a camera
    { copy: 'pressao-comissao', foto: BH_CAMINHADA + '9b2a42ba1f1692fe31a4a780bd7ad37b499f5e90040bb78c79abf98ab0fa4906.jpg', foco: 'center 25%', layout: 'rodape-centro' },
    // 'a turma' pede varias pessoas no quadro
    { copy: 'convencer-turma', foto: BH_CAMINHADA + 'bff2b4d981f531e0948d972f0228b507c3d31c98ed6b9dfe3c50399675f75192.jpg', foco: 'center 35%', cortar: 200, layout: 'rodape-centro' },
    // Layout 'centro' exige foto sem rosto no meio: lounge montado da MED 34
    { copy: 'adesao', foto: BH_MED34 + 'MED 34 UNIFENAS - EXPOMINAS BH -  Kathyana Garcia (4).png', foco: 'center 50%', layout: 'centro' },
    { copy: 'medicina-comissao', foto: BH_COLACAO + 'IMG_7217.PNG', foco: 'center 22%', layout: 'rodape-centro' },
    // Colacao com capelos no ar: a 'jornada' antes do Baile
    { copy: 'medicina-jornada', foto: BH_COLACAO + 'IMG_7211.PNG', foco: 'center 25%', layout: 'rodape-centro' },
  ],
};

module.exports = RODADAS;
