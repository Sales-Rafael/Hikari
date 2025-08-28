function abrirHistorico() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const abaHistorico = ss.getSheetByName("Historico de Impressão");

  if (!abaHistorico) {
    SpreadsheetApp.getUi().alert('A aba "Historico de Impressão" não foi encontrada.');
    return;
  }

  ss.setActiveSheet(abaHistorico);
}
