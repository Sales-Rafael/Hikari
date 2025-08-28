function iniciarImpressao() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const abaHistorico = ss.getSheetByName("Historico de Impressão");
  const abaOrganizadas = ss.getSheetByName("OS organizadas");
  const abaIniciar = ss.getSheetByName("Iniciar Impressão");

  let ordemServicoRaw = abaIniciar.getRange("B4").getValue();
  let ordemServico = normalizeOS(ordemServicoRaw);
  if (!ordemServico) { 
    SpreadsheetApp.getUi().alert("Digite a OS antes de iniciar a impressão."); 
    return; 
  }

  // === Atualizar aba "Historico de Impressão" ===
  const hist = abaHistorico.getDataRange().getValues();
  let linhaHist = -1;
  for (let i = 1; i < hist.length; i++) {
    const osHist = normalizeOS(hist[i][0]);
    if (osHist && osHist === ordemServico) {
      linhaHist = i + 1; 
      break;
    }
  }
  if (linhaHist === -1) { 
    SpreadsheetApp.getUi().alert(`OS "${ordemServicoRaw}" não encontrada no histórico.`); 
    return; 
  }

  const agora = new Date();
  abaHistorico.getRange(linhaHist, 5).setValue(agora);       // Coluna E: Hora de início
  abaHistorico.getRange(linhaHist, 9).setValue("Imprimindo"); // Coluna I: Status

  // === Atualizar aba "OS organizadas" ===
  const orgData = abaOrganizadas.getRange(2, 1, abaOrganizadas.getLastRow() - 1, 9).getValues();
  for (let i = 0; i < orgData.length; i++) {
    const osOrg = normalizeOS(orgData[i][0]);
    if (osOrg === ordemServico) {
      abaOrganizadas.getRange(i + 2, 9).setValue("Imprimindo"); // Coluna I
      break;
    }
  }

  // Limpar célula do formulário
  abaIniciar.getRange("B4").clearContent();
  SpreadsheetApp.getUi().alert(`Início da impressão da OS "${ordemServicoRaw}" registrado!`);
}
