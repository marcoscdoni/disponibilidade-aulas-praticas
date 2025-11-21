# CORREÇÕES FEITAS - QUALQUER HORÁRIO

## Problema Identificado
- O payload estava enviando `"available_anytime": 1` (number) em vez de `"available_anytime": "Sim"` (string)
- Isso causava a conversão incorreta para `false` em vez de `true`
- O `DisponibilidadeJson` estava sendo passado como `null`, causando erro de JSON na stored procedure

## Soluções Implementadas

### 1. Code Node N8N Atualizado (`code-node-prepare-sql-data-CORRIGIDO.js`)

**Conversão Flexível para `available_anytime`:**
```javascript
const availableAnytime = data.available_anytime === 1 || 
                        data.available_anytime === "1" || 
                        data.available_anytime === true || 
                        data.available_anytime === "Sim";
```

**Conversão Flexível para `has_balance`:**
```javascript
PossuiEquilibrio: (() => {
  if (data.has_balance === 1 || data.has_balance === "1" || data.has_balance === true || data.has_balance === "Sim") {
    return 'S';
  } else if (data.has_balance === 0 || data.has_balance === "0" || data.has_balance === false || data.has_balance === "Não") {
    return 'N';
  }
  return null;
})(),
```

**Lógica Corrigida:**
- Se `available_anytime = true`, então:
  - `DisponibilidadeQualquerHorario = true`
  - `DisponibilidadeJson = null`
  - Não processa horários específicos

- Se `available_anytime = false`, então:
  - `DisponibilidadeQualquerHorario = false`
  - `DisponibilidadeJson = JSON com horários específicos`
  - Processa horários por dia da semana

### 2. Stored Procedure Atualizada (`SP-FINAL-SEM-ERROS.sql`)

**Verificação Melhorada para JSON:**
```sql
ELSE IF @DisponibilidadeJson IS NOT NULL 
    AND LEN(@DisponibilidadeJson) > 0 
    AND @DisponibilidadeJson != 'null'
```

### 3. Debug Melhorado

Adicionado debug detalhado no `_metadata` para identificar tipos de dados:
```javascript
debug_disponibilidade: {
  available_anytime_input: data.available_anytime,
  available_anytime_type: typeof data.available_anytime,
  available_anytime_boolean: availableAnytime,
  has_balance_input: data.has_balance,
  has_balance_type: typeof data.has_balance,
  horarios_especificos_count: availabilityArray.length,
  json_gerado: disponibilidadeJson !== null
}
```

## Resultado Esperado

**Para "Qualquer Horário" (available_anytime: 1):**
```json
{
  "DisponibilidadeQualquerHorario": true,
  "DisponibilidadeJson": null
}
```

**Para Horários Específicos (available_anytime: 0):**
```json
{
  "DisponibilidadeQualquerHorario": false,
  "DisponibilidadeJson": "[{\"dia\":2,\"inicio\":\"08:00:00\",\"fim\":\"10:00:00\"}]"
}
```

## Próximos Passos

1. ✅ Atualizar o Code Node no N8N com o arquivo `code-node-prepare-sql-data-CORRIGIDO.js`
2. ✅ Executar a Stored Procedure atualizada no SQL Server
3. 🔄 Testar ambos os cenários:
   - Usuário escolhe "Qualquer Horário"
   - Usuário escolhe horários específicos
4. ✅ Verificar logs de debug no `_metadata` se necessário