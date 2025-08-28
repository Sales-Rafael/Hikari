function incluirOS() {
  const planilha = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();

  const abaFormulario = planilha.getSheetByName("Adicionar OS");
  const abaDados = planilha.getSheetByName("OS organizadas");

  if (!abaFormulario || !abaDados) {
    ui.alert('ERRO: Uma ou ambas as abas não foram encontradas.');
    return;
  }

  // Pegando os dados do formulário (B3:E3)
  const dadosEntrada = abaFormulario.getRange("B3:E3").getValues()[0];
  if (!dadosEntrada.some(item => item !== "")) {
    ui.alert("O formulário está vazio.");
    return;
  }

  const osFormulario = dadosEntrada[0] || "";
  const dataEntrega = dadosEntrada[1] || "";
  const empresa = dadosEntrada[2] || "";
  const tamanho = dadosEntrada[3] || "";

  // === Encontrar a primeira célula vazia na coluna A ===
  const colA = abaDados.getRange("A:A").getValues();
  let proximaLinha = colA.findIndex(row => !row[0]); // primeira célula vazia

  if (proximaLinha === -1) {
    // se não encontrar (coluna cheia), coloca após a última
    proximaLinha = colA.length + 1;
  } else {
    proximaLinha += 1; // ajustar porque o índice do array começa em 0
  }

  // Calcular prioridade
  let prioridade = "BAIXA";
  if (dataEntrega && osFormulario) {
    const hoje = new Date();
    const dataEntregaObj = new Date(dataEntrega);
    const diasDiff = Math.floor((dataEntregaObj - hoje) / (1000 * 60 * 60 * 24));

    if (diasDiff === 1 || diasDiff === 2) {
      prioridade = "ALTA";
    } else if (diasDiff === 3) {
      prioridade = "MÉDIA";
    } else {
      prioridade = "BAIXA";
    }
  }

  // Inserir os dados nas colunas corretas
  abaDados.getRange(proximaLinha, 1, 1, 9).setValues([[
    osFormulario,          // A: OS
    new Date(),            // B: Data de entrada
    dataEntrega,           // C: Data de entrega
    empresa,               // D: Empresa
    prioridade,            // E: Prioridade
    "",                    // F: Impressora Designada
    "",                    // G: Tempo estimado
    tamanho,               // H: Tamanho (metros)
    "Não enviada"          // I: Finalizado?
  ]]);

  // Limpar formulário
  abaFormulario.getRange("B3:E3").clearContent();
  planilha.toast("OS adicionada com sucesso!", "Sucesso");
}
