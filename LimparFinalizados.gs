function limparFinalizadosEClassificar() {
  const planilha = SpreadsheetApp.getActiveSpreadsheet();
  const abaDados = planilha.getSheetByName("OS organizadas");

  if (!abaDados) {
    SpreadsheetApp.getUi().alert('ERRO: A aba "OS organizadas" não foi encontrada.');
    return;
  }

  const ultimaLinha = abaDados.getLastRow();
  if (ultimaLinha < 3) {
    SpreadsheetApp.getUi().alert("Não há dados para processar.");
    return;
  }

  // Pegar valores da coluna I (Finalizado?), começando na linha 3
  const finalizados = abaDados.getRange(3, 9, ultimaLinha - 2).getValues();

  // Percorrer de baixo para cima e limpar apenas colunas A até I
  for (let i = finalizados.length - 1; i >= 0; i--) {
    if (finalizados[i][0] && finalizados[i][0].toString().toLowerCase() === "finalizado") {
      abaDados.getRange(i + 3, 1, 1, 9).clearContent(); // Limpa apenas A até I
    }
  }

  // Reaplicar o filtro apenas da coluna A até a I
  const intervaloFiltro = abaDados.getRange(2, 1, abaDados.getLastRow() - 1, 9);

  // Remover filtros anteriores
  if (abaDados.getFilter()) {
    abaDados.getFilter().remove();
  }

  // Criar novo filtro e classificar pela coluna E (5ª coluna) de A a Z
  intervaloFiltro.createFilter();
  abaDados.getFilter().sort(5, true);
}
