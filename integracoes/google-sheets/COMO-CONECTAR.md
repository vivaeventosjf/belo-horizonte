# Como ligar o formulário a uma planilha do Google

Leva uns 10 minutos e não precisa programar. No fim, cada envio do site vira uma linha na planilha.

A planilha terá duas abas, criadas sozinhas no primeiro envio:

- **Análises da turma**: formulário de 3 passos, com nome, WhatsApp, e-mail, curso, instituição, cidade, formatura, formandos, comissão, fundo, empresas, prioridades, região e UTMs. Tem também uma coluna **Abrir conversa** com link direto para o WhatsApp da pessoa.
- **WhatsApp flutuante**: botão flutuante, com nome, WhatsApp, e-mail, cidade, instituição, curso, região e UTMs. Também tem a coluna **Abrir conversa**.

---

## 1. Criar a planilha

1. Entre em [sheets.new](https://sheets.new) com a conta Google da empresa.
2. Dê um nome, por exemplo **Leads VIVA BH**.

## 2. Colar o script

1. Na planilha, clique em **Extensões → Apps Script**.
2. Apague o código que aparece no editor.
3. Copie todo o conteúdo do arquivo `Codigo.gs` desta pasta e cole.
4. Clique no ícone de disquete (**Salvar**).

## 3. Autorizar e testar

1. No topo do editor, na lista de funções, escolha **testarGravacao**.
2. Clique em **Executar**.
3. O Google vai pedir autorização. Clique em **Revisar permissões**, escolha sua conta e depois **Avançado → Acessar (não seguro) → Permitir**.
   - O aviso de "não seguro" aparece porque o script é seu e não passou por verificação do Google. É normal.
4. Volte para a planilha. Devem aparecer as duas abas, cada uma com uma linha começando por **TESTE**. Pode apagar essas linhas.

## 4. Publicar como endereço

1. No editor do Apps Script, clique em **Implantar → Nova implantação**.
2. Na engrenagem ao lado de "Selecionar tipo", escolha **App da Web**.
3. Preencha:
   - **Executar como:** Eu
   - **Quem pode acessar:** Qualquer pessoa
4. Clique em **Implantar** e copie a **URL do app da Web**. Ela termina em `/exec`.

Para conferir, abra a URL no navegador. Deve aparecer `{"ok":true,"mensagem":"Webhook da VIVA ativo."}`.

## 5. Colocar a URL no site

Em `unidades/<slug>/unidade.js` (cada unidade tem a sua planilha), cole a URL no campo `webhookUrl`:

```js
webhookUrl: 'https://script.google.com/macros/s/XXXXXXXX/exec',
```

Pronto. Os próximos envios do site já caem na planilha.

---

## Se precisar mudar o script depois

Editar e salvar **não basta**: a URL continua rodando a versão antiga. Para publicar a mudança sem trocar a URL:

1. **Implantar → Gerenciar implantações**.
2. Clique no lápis da implantação ativa.
3. Em **Versão**, escolha **Nova versão** e clique em **Implantar**.

Se criar uma **Nova implantação**, a URL muda e precisa ser trocada no `unidade.js`.

## Dúvidas comuns

**A URL fica visível no código do site. Tem problema?**
É o normal para esse tipo de integração. A URL só aceita gravar linhas; ninguém consegue ler a planilha por ela. O script também ignora envios sem nome e impede que um texto enviado vire fórmula na planilha.

**O site mostra "Recebemos" mesmo se a planilha falhar?**
Mostra. Por segurança do navegador, o site não consegue ler a resposta do Google. Por isso vale fazer um envio de teste pelo site depois de configurar e conferir se a linha apareceu.

**Quero avisar a equipe quando chegar lead.**
Dá para ligar notificações na própria planilha, em **Ferramentas → Configurações de notificação**, ou evoluir o script para mandar e-mail.
