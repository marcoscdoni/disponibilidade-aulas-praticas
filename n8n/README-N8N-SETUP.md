# N8N Code Node - Instruções de Uso

## Como configurar o nó Code no N8N

1. **Adicionar nó Code** após receber o payload do webhook
2. **Copiar o código** do arquivo `code-node-prepare-sql-data.js`
3. **Configurar o nó Code**:
   - Mode: `Run Once for All Items`
   - Language: `JavaScript`

## Fluxo N8N recomendado:

```
Webhook (Recebe dados do formulário)
    ↓
Code Node (Prepara dados para SQL Server)
    ↓
SQL Server Node (Chama a stored procedure)
    ↓
Response (Retorna sucesso/erro)
```

## Configuração da Stored Procedure no SQL Server Node:

**Operation:** Execute Query
**Query:**
```sql
EXEC [dbo].[SpSalvarDisponibilidadeProcesso]
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

## Mapeamento de Dados:

### Níveis de Conhecimento:
- "Nunca dirigi" → 1
- "Noção Básica" → 2  
- "Já tenho experiência" → 3

### Dias da Semana:
- Segunda-feira → 2
- Terça-feira → 3
- Quarta-feira → 4
- Quinta-feira → 5
- Sexta-feira → 6
- Sábado → 7

### Equilíbrio:
- "Sim" → "S"
- "Não" → "N"

### Disponibilidade Qualquer Horário:
- "Sim" → true
- "Não" → false

## Exemplo do JSON de Disponibilidade:

```json
[
  {
    "dia": 2,
    "inicio": "07:00:00",
    "fim": "07:50:00"
  },
  {
    "dia": 2,
    "inicio": "07:50:00", 
    "fim": "08:40:00"
  },
  {
    "dia": 4,
    "inicio": "07:00:00",
    "fim": "07:50:00"
  }
]
```

## Tratamento de Erros:

O Code Node inclui validações para:
- ✅ Valores nulos/undefined
- ✅ Arrays vazios
- ✅ Formatos de horário inválidos
- ✅ Conversões de tipos
- ✅ Dados opcionais

## Testing:

Para testar o nó Code, use o payload de exemplo fornecido e verifique se o output contém todos os parâmetros necessários para a stored procedure.