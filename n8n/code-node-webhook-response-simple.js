// N8N Code Node - Resposta Webhook (Versão Simples)
// Transforma resultado da SP em resposta padronizada: { success: boolean, message: string }

const input = $input.first().json;

// Verificar sucesso da stored procedure
const success = input.Sucesso === true || input.Sucesso === 1;

let message;
if (success) {
  message = "Availability saved successfully";
} else {
  // Traduzir mensagens de erro comuns para inglês
  const originalMessage = input.Mensagem || "Unknown error";
  
  if (originalMessage.includes("JSON")) {
    message = "Invalid data format";
  } else if (originalMessage.includes("timeout")) {
    message = "Request timeout";
  } else if (originalMessage.includes("connection")) {
    message = "Database connection error";
  } else {
    message = "Failed to save availability";
  }
}

// Retornar resposta padronizada
return [{
  json: {
    success: success,
    message: message
  }
}];