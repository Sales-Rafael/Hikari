// Remove acentos, espaços/zero-width e caracteres especiais; coloca em MAIÚSCULAS
function normalizeOS(val) {
  return String(val || "")
    .replace(/[\s\u200B]/g, "")
    .toUpperCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z0-9]/g, "");
}

// Normaliza cabeçalho para comparação
function normHeader(s) {
  return String(s || "")
    .toUpperCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s\W_]+/g, "");
}

// Detecta a linha do cabeçalho e os índices das colunas necessárias
function getOSOrganizadasLayout_(sheet) {
  const lastCol = sheet.getLastColumn();
  const lastRow = sheet.getLastRow();
  const rowsToScan = Math.min(10, lastRow);
  const block = sheet.getRange(1, 1, rowsToScan, lastCol).getValues();

  for (let r = 0; r < block.length; r++) {
    const headers = block[r].map(normHeader);

    const osCol = headers.indexOf("OS") + 1;
    const empresaCol = headers.indexOf("EMPRESA") + 1;
    const tamanhoCol = headers.indexOf("TAMANHOMETROS") + 1;

    if (osCol > 0 && empresaCol > 0 && tamanhoCol > 0) {
      const impressoraCol = headers.indexOf("IMPRESSORADESIGNADA") + 1;
      const tempoCol = headers.indexOf("TEMPOESTIMADO") + 1;
      return {
        headerRow: r + 1,
        osCol,
        empresaCol,
        tamanhoCol,
        impressoraCol: impressoraCol || null,
        tempoCol: tempoCol || null,
        lastCol,
        lastRow
      };
    }
  }

  throw new Error('Não encontrei os cabeçalhos na aba "OS organizadas". As colunas obrigatórias são: OS, Empresa e Tamanho (metros).');
}
