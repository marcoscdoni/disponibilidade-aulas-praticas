# Otimização de Horários - Agrupamento Automático

## 🎯 Objetivo
Reduzir drasticamente o número de registros no banco de dados agrupando horários consecutivos em blocos contínuos.

## 📊 Comparação Antes vs Depois

### ❌ **ANTES (sem agrupamento):**
```json
// Segunda-feira: 17 registros individuais
{"dia": 2, "inicio": "07:00:00", "fim": "07:50:00"}
{"dia": 2, "inicio": "07:50:00", "fim": "08:40:00"}
{"dia": 2, "inicio": "08:40:00", "fim": "09:30:00"}
{"dia": 2, "inicio": "09:30:00", "fim": "10:20:00"}
{"dia": 2, "inicio": "10:20:00", "fim": "11:10:00"}
{"dia": 2, "inicio": "11:10:00", "fim": "12:00:00"}
{"dia": 2, "inicio": "12:00:00", "fim": "12:50:00"}
{"dia": 2, "inicio": "13:00:00", "fim": "13:50:00"}
// ... mais 9 registros
```

### ✅ **DEPOIS (com agrupamento):**
```json
// Segunda-feira: apenas 2 registros agrupados
{"dia": 2, "inicio": "07:00:00", "fim": "12:50:00"}  // Manhã inteira
{"dia": 2, "inicio": "13:00:00", "fim": "21:20:00"}  // Tarde/Noite inteira
```

## 🔄 Exemplo Real de Agrupamento

### Entrada do Usuário:
```javascript
monday_availability: [
  "07:00 às 07:50",  // ─┐
  "07:50 às 08:40",  // ─┤ GRUPO 1: 07:00 às 12:50
  "08:40 às 09:30",  // ─┤
  "09:30 às 10:20",  // ─┤
  "10:20 às 11:10",  // ─┤
  "11:10 às 12:00",  // ─┤
  "12:00 às 12:50",  // ─┘
  // GAP de 10 minutos (12:50 - 13:00)
  "13:00 às 13:50",  // ─┐
  "13:50 às 14:40",  // ─┤ GRUPO 2: 13:00 às 21:20
  "14:40 às 15:30",  // ─┤
  // ... horários consecutivos
  "20:30 às 21:20"   // ─┘
]
```

### Saída Agrupada:
```json
[
  {"dia": 2, "inicio": "07:00:00", "fim": "12:50:00"},
  {"dia": 2, "inicio": "13:00:00", "fim": "21:20:00"}
]
```

## 🚀 Benefícios

### Performance:
- **Antes**: 39 registros no banco (exemplo do payload original)
- **Depois**: 5 registros no banco
- **Redução**: ~87% menos registros

### Vantagens:
✅ **Consultas mais rápidas** - menos registros para processar
✅ **Menor uso de espaço** - banco mais limpo
✅ **Melhor performance** - índices mais eficientes
✅ **Lógica simplificada** - mais fácil para entender/reportar
✅ **Compatibilidade total** - stored procedure recebe o mesmo formato

## 🔧 Como Funciona

### Algoritmo de Agrupamento:
1. **Parse** dos horários individuais
2. **Ordenação** por horário de início
3. **Detecção** de horários consecutivos
4. **Agrupamento** em blocos contínuos
5. **Formatação** para SQL Server

### Critério para Agrupamento:
```javascript
// Se horário atual INICIA exatamente quando o anterior TERMINA
if (current.inicio === previous.fim) {
  // AGRUPA: estende o bloco atual
  currentGroup.fim = current.fim;
} else {
  // SEPARA: inicia novo bloco
  groups.push(currentGroup);
  currentGroup = new Group(current);
}
```

## 📈 Casos de Uso

### Caso 1: Dia Inteiro
```
Entrada: ["07:00 às 07:50", ..., "20:30 às 21:20"] (17 horários)
Saída: [{"inicio": "07:00:00", "fim": "21:20:00"}] (1 registro)
Redução: 94%
```

### Caso 2: Manhã + Tarde Separadas
```
Entrada: ["07:00 às 12:00", "14:00 às 18:00"] (não consecutivos)
Saída: [
  {"inicio": "07:00:00", "fim": "12:00:00"},
  {"inicio": "14:00:00", "fim": "18:00:00"}
] (2 registros)
```

### Caso 3: Horários Esparsos
```
Entrada: ["07:00 às 07:50", "10:00 às 10:50", "15:00 às 15:50"]
Saída: [
  {"inicio": "07:00:00", "fim": "07:50:00"},
  {"inicio": "10:00:00", "fim": "10:50:00"},
  {"inicio": "15:00:00", "fim": "15:50:00"}
] (3 registros - sem agrupamento possível)
```

## 🎯 Resultado no SQL Server

No banco, ao invés de dezenas de linhas como:
```
SEGUNDA | 07:00 | 07:50
SEGUNDA | 07:50 | 08:40
SEGUNDA | 08:40 | 09:30
...
```

Teremos apenas:
```
SEGUNDA | 07:00 | 12:50
SEGUNDA | 13:00 | 21:20
```

Muito mais eficiente e organizado! 🚀