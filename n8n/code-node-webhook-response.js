// N8N Code Node - Preparar Resposta do Webhook
// Este código deve ser usado em um nó "Code" no N8N para transformar 
// o resultado da stored procedure em uma resposta padronizada para o frontend

const inputData = $input.all();
const responseData = [];

// Processar cada item do input
for (const item of inputData) {
  const data = item.json;
  
  // Extrair informações da stored procedure (pode vir de diferentes fontes)
  let success = false;
  let message = "Unknown error occurred";
  
  // Verificar se temos resposta da stored procedure
  if (data.Sucesso !== undefined) {
    // Resposta direta da stored procedure
    success = data.Sucesso === true || data.Sucesso === 1;
    
    // Traduzir mensagens para inglês
    if (success) {
      message = "Availability saved successfully";
    } else {
      // Traduzir mensagens de erro comuns
      const errorMessage = data.Mensagem || "Unknown error";
      
      if (errorMessage.includes("JSON text is not properly formatted")) {
        message = "Invalid data format received";
      } else if (errorMessage.includes("Cannot insert")) {
        message = "Failed to save availability data";
      } else if (errorMessage.includes("timeout")) {
        message = "Request timeout - please try again";
      } else if (errorMessage.includes("connection")) {
        message = "Database connection error";
      } else if (errorMessage.includes("permission")) {
        message = "Permission denied";
      } else {
        message = "Failed to save availability";
      }
    }
  } 
  // Verificar se houve erro em etapas anteriores
  else if (data.error) {
    success = false;
    message = "Error processing request: " + data.error;
  }
  // Verificar token inválido/expirado
  else if (data.tokenStatus && data.tokenStatus !== 'valid') {
    success = false;
    if (data.tokenStatus === 'expired') {
      message = "Access token has expired";
    } else if (data.tokenStatus === 'used') {
      message = "Access token has already been used";
    } else if (data.tokenStatus === 'invalid') {
      message = "Invalid access token";
    } else {
      message = "Token validation failed";
    }
  }
  // Se chegou até aqui e não há indicação de erro, assumir sucesso
  else {
    success = true;
    message = "Availability saved successfully";
  }
  
  // Preparar resposta padronizada
  const response = {
    success: success,
    message: message
  };
  
  // Adicionar dados extras apenas para debug (não enviados ao frontend)
  const responseWithMeta = {
    json: {
      ...response,
      // Metadados para log interno (não expostos na API)
      _internal: {
        timestamp: new Date().toISOString(),
        originalSuccess: data.Sucesso,
        originalMessage: data.Mensagem,
        idFicha: data.IdFicha,
        procId: data.procId,
        tokenStatus: data.tokenStatus,
        processedBy: "n8n-webhook-response"
      }
    }
  };
  
  responseData.push(responseWithMeta);
}

// Se não há dados, retornar erro genérico
if (responseData.length === 0) {
  responseData.push({
    json: {
      success: false,
      message: "No data received for processing",
      _internal: {
        timestamp: new Date().toISOString(),
        processedBy: "n8n-webhook-response",
        error: "Empty input data"
      }
    }
  });
}

// Retornar apenas o primeiro item (webhook response deve ser único)
return [responseData[0]];