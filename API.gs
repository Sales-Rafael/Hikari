function doGet(e) {
  const aba = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Historico de Impressão");
  const dados = aba.getDataRange().getValues();
  const status = { "A": "Finalizado", "B": "Finalizado", "C": "Finalizado", "D": "Finalizado" };

  for (let imp of ["A","B","C","D"]) {
    let temEnviada = false;
    let temImprimindo = false;

    for (let i = 1; i < dados.length; i++) {
      const impAtual = String(dados[i][1] || "").trim().toUpperCase();
      const stat = String(dados[i][8] || "").trim().toUpperCase();
      if (impAtual === imp) {
        if (stat === "IMPRIMINDO") temImprimindo = true;
        if (stat === "ENVIADA") temEnviada = true;
      }
    }

    if (temImprimindo && temEnviada) status[imp] = "Imprimindo+Fila"; 
    else if (temImprimindo) status[imp] = "Imprimindo";
    else if (temEnviada) status[imp] = "Enviada";
    else status[imp] = "Finalizado";
  }

  return ContentService.createTextOutput(JSON.stringify(status))
    .setMimeType(ContentService.MimeType.JSON);
}
