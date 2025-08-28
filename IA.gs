/**
 * @OnlyCurrentDoc
 * Script para otimizar a distribuição de trabalhos de impressão
 * na aba "OS organizadas", atribuindo-os às impressoras A, B, C e D.
 * Cabeçalhos estão na linha 2 e dados começam na linha 3.
 */

const PRINTERS = {
  'A': { speed: (2.85/2) }, // metros por minuto
  'B': { speed: (2.22/2) },
  'C': { speed: (1.81/2) },
  'D': { speed: (1.53/2) }
};

const DAILY_WORK_LIMIT_MINUTES = 480; // 8 horas * 60 minutos

function onOpen() {
  SpreadsheetApp.getUi()
      .createMenu('Otimizador de Impressão')
      .addItem('1. Distribuir Tarefas Agora', 'assignJobsToPrinters')
      .addSeparator()
      .addItem('2. Limpar Distribuição', 'clearAssignments')
      .addToUi();
}

// Função para encontrar a coluna pelo nome, ignorando maiúsculas, minúsculas e espaços
function findColumnIndex(headers, name) {
  name = String(name).toLowerCase().replace(/\s+/g, '');
  for (let i = 0; i < headers.length; i++) {
    const h = String(headers[i] || "").toLowerCase().replace(/\s+/g, '');
    if (h === name) return i + 1;
  }
  return 0;
}

function assignJobsToPrinters() {
  const ui = SpreadsheetApp.getUi();
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("OS organizadas");
    if (!sheet) throw new Error('A aba "OS organizadas" não foi encontrada.');

    // Cabeçalhos na linha 2
    const headers = sheet.getRange(2, 1, 1, sheet.getLastColumn()).getValues()[0];

    const osCol = findColumnIndex(headers, "OS");
    const sizeCol = findColumnIndex(headers, "Tamanho (metros)");
    const printerCol = findColumnIndex(headers, "Impressora Designada");
    const timeCol = findColumnIndex(headers, "Tempo estimado(minutos)");

    if (osCol === 0 || sizeCol === 0 || printerCol === 0 || timeCol === 0) {
      throw new Error("Os cabeçalhos esperados não foram encontrados: 'OS', 'Tamanho (metros)', 'Impressora Designada', 'Tempo estimado(minutos)'.");
    }

    // Dados começam na linha 3
    const dataRange = sheet.getRange(3, 1, sheet.getLastRow() - 2, sheet.getLastColumn());
    const data = dataRange.getValues();

    // Coleta trabalhos não atribuídos
    let jobs = [];
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const os = row[osCol - 1];
      const size = parseFloat(row[sizeCol - 1]);
      const assignedPrinter = row[printerCol - 1];

      if (os && size > 0 && !assignedPrinter) {
        jobs.push({
          os: os,
          size: size,
          originalRowIndex: i
        });
      }
    }

    if (jobs.length === 0) {
      ui.alert("Nenhuma nova tarefa para distribuir.", "Todos os trabalhos já possuem impressora atribuída.", ui.ButtonSet.OK);
      return;
    }

    // Ordena do maior para o menor tamanho
    jobs.sort((a, b) => b.size - a.size);

    // Inicializa carga de cada impressora
    let printerWorkload = {};
    Object.keys(PRINTERS).forEach(key => printerWorkload[key] = 0);

    // Atribui trabalhos
    jobs.forEach(job => {
      let bestPrinter = '';
      let earliestFinishTime = Infinity;

      Object.keys(PRINTERS).forEach(printerKey => {
        const printerSpeed = PRINTERS[printerKey].speed;
        const jobDuration = job.size / printerSpeed;
        const prospectiveFinishTime = printerWorkload[printerKey] + jobDuration;

        if (prospectiveFinishTime < earliestFinishTime) {
          earliestFinishTime = prospectiveFinishTime;
          bestPrinter = printerKey;
        }
      });

      job.assignedPrinter = bestPrinter;
      job.estimatedTime = job.size / PRINTERS[bestPrinter].speed;
      printerWorkload[bestPrinter] += job.estimatedTime;
    });

    // Escreve resultados de volta na planilha (dados começam na linha 3)
    jobs.forEach(job => {
      sheet.getRange(job.originalRowIndex + 3, printerCol).setValue(job.assignedPrinter);
      // Converte para formato 00,00
      sheet.getRange(job.originalRowIndex + 3, timeCol).setValue(job.estimatedTime.toFixed(2).replace('.', ','));
    });

    // Mostra resumo
    let summary = "Distribuição concluída com sucesso!\n\nCarga de trabalho por impressora (minutos):\n";
    Object.keys(printerWorkload).forEach(key => {
      const load = printerWorkload[key];
      const percentage = (load / DAILY_WORK_LIMIT_MINUTES * 100).toFixed(1);
      summary += `Impressora ${key}: ${load.toFixed(0)} min (${percentage}% de 8h)\n`;
    });
    ui.alert("Relatório de Otimização", summary, ui.ButtonSet.OK);

  } catch (e) {
    ui.alert("Erro ao executar o script", e.message, ui.ButtonSet.OK);
  }
}

function clearAssignments() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("OS organizadas");
  if (!sheet) return;

  const headers = sheet.getRange(2, 1, 1, sheet.getLastColumn()).getValues()[0];
  const printerCol = findColumnIndex(headers, "Impressora Designada");
  const timeCol = findColumnIndex(headers, "Tempo estimado(minutos)");

  if (printerCol > 0) {
    sheet.getRange(3, printerCol, sheet.getLastRow() - 2, 1).clearContent();
  }
  if (timeCol > 0) {
    sheet.getRange(3, timeCol, sheet.getLastRow() - 2, 1).clearContent();
  }

  SpreadsheetApp.getUi().alert("Distribuição limpa. Pronto para nova otimização.");
}
