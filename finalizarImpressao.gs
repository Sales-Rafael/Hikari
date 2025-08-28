function finalizarImpressao() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const abaHistorico = ss.getSheetByName("Historico de Impressão");
  const abaIniciar = ss.getSheetByName("Iniciar Impressão");
  const abaOS = ss.getSheetByName("OS organizadas");

  let ordemServicoRaw = abaIniciar.getRange("B8").getValue();
  let ordemServico = normalizeOS(ordemServicoRaw);
  if (!ordemServico) { 
    SpreadsheetApp.getUi().alert("Digite a OS antes de finalizar."); 
    return; 
  }

  const hist = abaHistorico.getDataRange().getValues();
  let linha = -1;
  for (let i = 1; i < hist.length; i++) {
    const osHist = normalizeOS(hist[i][0]);
    if (osHist && osHist === ordemServico) {
      linha = i + 1; 
      break;
    }
  }
  if (linha === -1) { 
    SpreadsheetApp.getUi().alert(`OS "${ordemServicoRaw}" não encontrada no histórico.`); 
    return; 
  }

  const agora = new Date();
  abaHistorico.getRange(linha, 6).setValue(agora);
  abaHistorico.getRange(linha, 9).setValue("Finalizado");

  // === Atualizar status na aba "OS organizadas" ===
  if (abaOS) {
    const orgData = abaOS.getRange(2, 1, abaOS.getLastRow() - 1, 9).getValues();
    for (let i = 0; i < orgData.length; i++) {
      if (normalizeOS(orgData[i][0]) === ordemServico) {
        abaOS.getRange(i + 2, 9).setValue("Finalizado"); // Coluna I
        break;
      }
    }
  }

  abaIniciar.getRange("B8").clearContent();
  SpreadsheetApp.getUi().alert(`Impressão da OS "${ordemServicoRaw}" finalizada com sucesso!`);
}
