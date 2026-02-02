
/**
 * DROGA VEGA - BACKEND CENTRAL (V4.1)
 * Gerencia Pedidos, Equipe e Exclusão Física de Registros
 */

function doPost(e) {
  var response = { status: "success", message: "Iniciado" };
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  try {
    var data = JSON.parse(e.postData.contents);
    var action = data._action;
    
    // --- AÇÃO: ADICIONAR PEDIDOS ---
    if (action === 'ADD_ORDERS') {
      var sheet = ss.getSheetByName('pedidos') || ss.insertSheet('pedidos');
      data.rows.forEach(function(row) {
        sheet.appendRow([
          row.data,           // A
          row.consultor,      // B
          row.produto,        // C
          row.quantity,       // D
          row.valorUnitario,  // E
          row.valorTotalManual, // F
          row.valorPMC,       // G
          row.custoUnitario,  // H
          row.codigo,         // I
          row.clienteInfo,    // J
          row.valorCustoTotal,// K
          row.clienteWhatsapp // L
        ]);
      });
      response.message = "Pedidos gravados com sucesso";
    }
    
    // --- AÇÃO: EXCLUSÃO FÍSICA ---
    else if (action === 'DELETE_ORDERS') {
      var sheet = ss.getSheetByName('pedidos');
      if (!sheet) {
        response.status = "error";
        response.message = "Aba 'pedidos' não encontrada";
      } else {
        var rawName = (data.consultantName || data.consultor || data.Consultor || "").toString().trim();
        var consultantToMatch = rawName.toLowerCase();

        if (!consultantToMatch) {
          response.status = "error";
          response.message = "Nome do consultor não identificado no payload";
        } else {
          var values = sheet.getDataRange().getValues();
          var rowsDeleted = 0;

          // Percorremos de baixo para cima para manter os índices corretos
          for (var i = values.length - 1; i >= 1; i--) {
            // Coluna B (índice 1) é o Consultor
            var cellValue = values[i][1];
            var rowConsultant = (cellValue ? cellValue.toString().trim().toLowerCase() : "");
            
            if (rowConsultant === consultantToMatch) {
              sheet.deleteRow(i + 1);
              rowsDeleted++;
            }
          }
          response.message = "Sucesso: " + rowsDeleted + " pedidos apagados para " + rawName;
          console.log("Liquidação concluída para: " + rawName + " | Linhas: " + rowsDeleted);
        }
      }
    }

    // --- AÇÃO: SOLICITAÇÃO DE AFILIADO ---
    else if (action === 'ADD_STAFF') {
      var sheet = ss.getSheetByName('Equipe') || ss.insertSheet('Equipe');
      var staff = data.rows[0];
      sheet.appendRow([
        staff.id, 
        staff.nome, 
        staff.chavePix, 
        staff.senha, 
        staff.acesso, 
        staff.status || 'PENDENTE'
      ]);
      response.message = "Cadastro de consultor recebido";
    }

    // --- AÇÃO: ATUALIZAR STATUS DE AFILIADO ---
    else if (action === 'UPDATE_STATUS') {
      var sheet = ss.getSheetByName('Equipe');
      if (sheet) {
        var update = data.rows[0];
        var values = sheet.getDataRange().getValues();
        for (var j = 1; j < values.length; j++) {
          if (values[j][0] == update.id) {
            sheet.getRange(j + 1, 6).setValue(update.status); // Coluna F
            break;
          }
        }
        response.message = "Status do consultor atualizado";
      }
    }

  } catch (err) {
    response.status = "error";
    response.message = err.toString();
    console.error("Erro no doPost: " + err.toString());
  }

  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}
