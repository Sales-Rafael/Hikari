function AdicionarImpressão() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const abaOS = ss.getSheetByName("OS organizadas");
  const abaHistorico = ss.getSheetByName("Historico de Impressão");

  if (!abaOS || !abaHistorico) {
    SpreadsheetApp.getUi().alert('Verifique se as abas "OS organizadas" e "Historico de Impressão" existem.');
    return;
  }

  // Ler OS e impressora digitadas
  let ordemServicoRaw = abaOS.getRange("K3").getValue();
  let ordemServico = normalizeOS(ordemServicoRaw);
  if (!ordemServico) {
    SpreadsheetApp.getUi().alert("Digite a ordem de serviço antes de confirmar.");
    return;
  }

  let impressora = String(abaOS.getRange("L3").getValue() || "").trim().toUpperCase();
  const impressorasValidas = ["A", "B", "C", "D"];
  if (!impressora || !impressorasValidas.includes(impressora)) {
    SpreadsheetApp.getUi().alert("Impressora inválida! (use A, B, C ou D)");
    return;
  }

  // Procurar dados da OS na aba "OS organizadas"
  const orgData = abaOS.getRange(2, 1, abaOS.getLastRow() - 1, 9).getValues();
  let empresa = "";
  let tamanho = "";
  for (let i = 0; i < orgData.length; i++) {
    if (normalizeOS(orgData[i][0]) === ordemServico) {
      empresa = orgData[i][3]; // Coluna D: Empresa
      tamanho = orgData[i][7];  // Coluna H: Tamanho
      break;
    }
  }

  // Próxima linha realmente vazia na coluna A do histórico
  const colunaA = abaHistorico.getRange("A:A").getValues();
  let novaLinha = 0;
  for (let i = 0; i < colunaA.length; i++) {
    if (!colunaA[i][0]) {
      novaLinha = i + 1;
      break;
    }
  }
  if (novaLinha === 0) novaLinha = abaHistorico.getLastRow() + 1;

  // Limpar B..I da linha nova
  abaHistorico.getRange(novaLinha, 2, 1, 8).clearContent();

  // Verificar se a OS já existe no histórico
  const dadosHist = abaHistorico.getDataRange().getValues();
  for (let i = 1; i < dadosHist.length; i++) {
    if (normalizeOS(dadosHist[i][0]) === ordemServico) {
      SpreadsheetApp.getUi().alert(`OS "${ordemServicoRaw}" já existe no histórico!`);
      return;
    }
  }

  // Inserir registro com status "Enviada" e dados preenchidos
  const agora = new Date();
  abaHistorico.getRange(novaLinha, 1, 1, 9).setValues([[ 
    ordemServico, // A: OS
    impressora,   // B: Impressora
    agora,        // C: Data de envio
    agora,        // D: Hora
    "",           // E: (opcional)
    "",           // F: (opcional)
    empresa,      // G: Empresa
    tamanho,      // H: Tamanho
    "Enviada"     // I: Status
  ]]);

  // === Atualizar status na aba "OS organizadas" ===
  for (let i = 0; i < orgData.length; i++) {
    if (normalizeOS(orgData[i][0]) === ordemServico) {
      abaOS.getRange(i + 2, 9).setValue("Enviada"); // Coluna I
      break;
    }
  }

  SpreadsheetApp.getUi().alert("Registro adicionado com sucesso!");
  abaOS.getRange("K3:L3").clearContent();
}
