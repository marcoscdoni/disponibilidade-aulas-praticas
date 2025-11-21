# Configuração N8N - Webhook Response

## Fluxo Completo do Workflow

```
Webhook Trigger → Code Node (Prepare Data) → SQL Server → Code Node (Response) → Respond to Webhook
```

## Nó 1: Webhook Trigger
- **URL**: `/webhook/disponibilidade`
- **Method**: POST
- **Authentication**: None (validação por token interno)

## Nó 2: Code Node - Prepare Data
- **Arquivo**: `code-node-prepare-sql-data-CORRIGIDO.js`
- **Função**: Transforma payload do frontend para formato da stored procedure
- **Input**: JSON do formulário
- **Output**: Parâmetros para `SpSalvarDisponibilidadeProcesso`

## Nó 3: Microsoft SQL Server
- **Operation**: Execute Query
- **Query Type**: Stored Procedure
- **Query**: 
```sql
EXEC SpSalvarDisponibilidadeProcesso 
  @IdProcesso = {{ $json.IdProcesso }},
  @InstrututorAuto = {{ $json.InstrututorAuto }},
  @InstrutorMoto = {{ $json.InstrutorMoto }},
  @NivelHabilidadeAuto = {{ $json.NivelHabilidadeAuto }},
  @NivelHabilidadeMoto = {{ $json.NivelHabilidadeMoto }},
  @PossuiEquilibrio = '{{ $json.PossuiEquilibrio }}',
  @Observacoes = '{{ $json.Observacoes }}',
  @DisponibilidadeJson = '{{ $json.DisponibilidadeJson }}',
  @DisponibilidadeQualquerHorario = {{ $json.DisponibilidadeQualquerHorario }}
```

## Nó 4: Code Node - Webhook Response
- **Arquivo**: `code-node-webhook-response-simple.js` (recomendado)
- **Função**: Converte resultado da SP para resposta padronizada
- **Input**: Resultado da stored procedure
- **Output**: `{ success: boolean, message: string }`

## Nó 5: Respond to Webhook
- **Respond With**: JSON
- **Response Code**: `{{ $json.success ? 200 : 400 }}`
- **Response Body**: 
```json
{
  "success": "={{ $json.success }}",
  "message": "={{ $json.message }}"
}
```

## Exemplos de Resposta

### Sucesso
```json
{
  "success": true,
  "message": "Availability saved successfully"
}
```

### Erro - Token Inválido
```json
{
  "success": false,
  "message": "Invalid access token"
}
```

### Erro - Dados Inválidos
```json
{
  "success": false,
  "message": "Invalid data format"
}
```

### Erro - Banco de Dados
```json
{
  "success": false,
  "message": "Database connection error"
}
```

## Arquivo para Usar

**Recomendado**: `code-node-webhook-response-simple.js`
- Mais limpo e direto
- Foca apenas no essencial
- Menos código para debugar

**Alternativo**: `code-node-webhook-response.js`
- Versão mais robusta
- Inclui metadados para debug
- Tratamento de erro mais detalhado

## Configuração do Response Code

No nó "Respond to Webhook":
- **Status Code**: `{{ $json.success ? 200 : 400 }}`
- **Headers**: `Content-Type: application/json`
- **Body**: Use o JSON do nó anterior diretamente