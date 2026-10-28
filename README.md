# Diagnóstico de IA na Advocacia

Portal: https://rafaelmsp.github.io/diagnostico-ia-advocacia/

- Formulário público: `/formulario/`
- Coordenação: `/coordenacao/`
- Resumo estatístico anônimo: `/data/resumo-anonimo.json`

## Atualização do acesso anônimo

O perfil **Master** lê a API da pesquisa diretamente. O perfil **Anônimo** usa um JSON público com **somente estatísticas consolidadas**, sem respostas, nomes ou OAB de participantes. A planilha original não é modificada.

A atualização automática usa **GitHub Actions** a cada aproximadamente cinco minutos (a execução pode atrasar). Para ativar, faça uma única configuração:

1. Abra **Settings → Secrets and variables → Actions** deste repositório.
2. Escolha **New repository secret**.
3. Nome exato: `GOOGLE_SHEETS_COORD_TOKEN`.
4. Valor: **token da API do Google Apps Script** que aparece na constante `ACCESS_TOKEN` do **HTML original do painel** (não utilize a senha Master nem a senha Anônima da tela).
5. Salve. Não publique o token em arquivos, Issues ou mensagens.
6. Abra **Actions → Atualizar estatisticas anonimas → Run workflow**, aguarde uma execução com sucesso.
7. Na página de Coordenação, entre com a senha **Anônima** e clique em **Verificar atualização**.

**Diagnóstico:** se os indicadores anônimos não acompanharem o Master, verifique a última execução da Action e a data no topo do painel. Sem o segredo configurado, a rotina não consegue acessar o Google Sheets e o resumo permanece antigo.

## Privacidade

O GitHub Pages é público. O JSON do resumo estatístico pode ser acessado mesmo sem entrar no painel. Ele contém somente indicadores agregados — nenhum registro individual é publicado por esse processo. A senha de entrada **não substitui autenticação de servidor**; o acesso à API nominal deve continuar restrito e validado pelo próprio Google Apps Script.
