# Publicar em franquia.vivaeventos.com.br (Netlify)

Uma pasta por unidade, num site só:

```
https://franquia.vivaeventos.com.br/belohorizonte
https://franquia.vivaeventos.com.br/aracaju
```

O subdomínio `franquia` é independente do `vivaeventos.com.br`: o site principal
continua no WordPress, sem nenhuma mudança.

## Um site só, uma pasta por unidade

É assim que a franquia está publicada: **um** site no Netlify, ligado a **um**
repositório, servindo todas as unidades em subpastas. Adicionar unidade não
exige site novo nem repositório novo — basta criar a pasta em `unidades/` e
fazer o deploy.

O `netlify.toml` na raiz já traz o build command e o publish directory, então
não é preciso configurar nada no painel.

> O repositório também sabe publicar **uma unidade só na raiz** do site
> (`belohorizonte.vivaeventos.com.br`), definindo a variável de ambiente
> `UNIDADE` no Netlify. Não é o que usamos: com ela definida, o site deixa de
> servir `/belohorizonte` e `/aracaju`. Deixe a variável **em branco**.

## Gerar

```bash
node ferramentas/netlify.js
```

Monta `publicar/`. Confira antes de subir, servindo a pasta:

```bash
cd publicar && python -m http.server 8899
```

e abra `http://localhost:8899/belohorizonte/`.

## Primeiro deploy

1. Entre em [app.netlify.com](https://app.netlify.com) (crie a conta com o
   e-mail da empresa, não com pessoal).
2. **Add new site › Deploy manually**.
3. Arraste a pasta `publicar/` inteira para a área indicada.
4. O site sobe num endereço tipo `random-name-123.netlify.app`. Teste
   `/belohorizonte` e `/aracaju` por ali antes de mexer no domínio.

## Apontar o domínio

No Netlify, **Site configuration › Domain management › Add a domain**:
`franquia.vivaeventos.com.br`.

Ele vai pedir um registro no DNS de `vivaeventos.com.br` (onde o domínio está
registrado — Registro.br, Cloudflare, GoDaddy...):

| Tipo | Nome | Valor |
|---|---|---|
| CNAME | `franquia` | `<seu-site>.netlify.app` |

Só isso. **Não mexa no registro `@` nem no `www`** — são eles que mantêm o site
principal no ar.

Depois de criado, o Netlify emite o certificado HTTPS sozinho (Let's Encrypt).
Costuma levar de alguns minutos a uma hora, dependendo da propagação do DNS.

## Atualizar depois

Toda vez que mudar texto, foto ou configuração de unidade:

```bash
node ferramentas/netlify.js
```

e arraste `publicar/` de novo em **Deploys › Drag and drop**. O Netlify guarda
todas as versões: se algo sair errado, dá para voltar à anterior em um clique
(**Deploys › versão anterior › Publish deploy**).

### Se preferir automático

Conectando o repositório (**Add new site › Import an existing project**), cada
`git push` publica sozinho. Configure:

- **Build command**: `node ferramentas/netlify.js`
- **Publish directory**: `publicar`

Atenção: `publicar/` e `publicado/` estão no `.gitignore` de propósito — são
saída. No modo automático quem os gera é o Netlify, na hora do build.

## Netlify e WordPress ao mesmo tempo

Dá para manter as duas versões da mesma landing no ar por um tempo, mas **não
deixe assim**: duas páginas com o mesmo conteúdo em endereços diferentes
competem entre si no Google.

Quando o Netlify virar o endereço oficial, na página do WordPress:

- aponte o canonical dela para a URL do Netlify (Yoast/RankMath → Avançado →
  URL canônica); ou
- redirecione 301 a página antiga para a nova.

E lembre de trocar o link dos anúncios para o endereço novo.

## Por que isto resolve o problema do Elementor

No WordPress, salvar `<script>` e `<style>` depende da permissão
`unfiltered_html` — foi o que quebrou a landing de Aracaju (ver WORDPRESS.md).
No Netlify os arquivos vão como estão, sem sanitização, sem plugin de cache no
caminho e sem tema para brigar com o CSS. É por isso que a página local e a
publicada ficam idênticas.

## Checklist depois de publicar

- [ ] `/belohorizonte` e `/aracaju` abrem com estilo e fotos
- [ ] HTTPS ativo (cadeado, sem aviso de conteúdo misto)
- [ ] Formulário de 3 passos grava na planilha da unidade
- [ ] Botão de WhatsApp abre a conversa no número certo
- [ ] `?curso=medicina` troca o conteúdo
- [ ] Colar a URL no WhatsApp mostra título, descrição e imagem
      (se não mostrar, confira `urlBase` no `unidade.js` e regere)
- [ ] Pixel do Meta disparando na unidade certa (Meta Pixel Helper)
