# Configuração do Nó SQL Server no N8N

## Opção 1: Query com Parâmetros (Recomendado)

### Query SQL:
```sql
DECLARE @Result TABLE (
    Sucesso BIT, 
    Mensagem NVARCHAR(500), 
    IdFicha INT
);

INSERT INTO @Result
EXEC SpSalvarDisponibilidadeProcesso
    @IdProcesso = ?,
    @InstrututorAuto = ?,
    @InstrutorMoto = ?,
    @NivelHabilidadeAuto = ?,
    @NivelHabilidadeMoto = ?,
    @PossuiEquilibrio = ?,
    @Observacoes = ?,
    @DisponibilidadeJson = ?,
    @DisponibilidadeQualquerHorario = ?;

SELECT * FROM @Result;
```

### Parâmetros (na ordem):
1. `{{ $json.IdProcesso }}`
2. `{{ $json.InstrututorAuto }}`
3. `{{ $json.InstrutorMoto }}`
4. `{{ $json.NivelHabilidadeAuto }}`
5. `{{ $json.NivelHabilidadeMoto }}`
6. `{{ $json.PossuiEquilibrio }}`
7. `{{ $json.Observacoes }}`
8. `{{ $json.DisponibilidadeJson }}`
9. `{{ $json.DisponibilidadeQualquerHorario }}`

---

## Opção 2: Query com Interpolação Direta

### Query SQL:
```sql
DECLARE @Result TABLE (
    Sucesso BIT, 
    Mensagem NVARCHAR(500), 
    IdFicha INT
);

INSERT INTO @Result
EXEC SpSalvarDisponibilidadeProcesso
    @IdProcesso = {{ $json.IdProcesso }},
    @InstrututorAuto = {{ $json.InstrututorAuto || 'NULL' }},
    @InstrutorMoto = {{ $json.InstrutorMoto || 'NULL' }},
    @NivelHabilidadeAuto = {{ $json.NivelHabilidadeAuto || 'NULL' }},
    @NivelHabilidadeMoto = {{ $json.NivelHabilidadeMoto || 'NULL' }},
    @PossuiEquilibrio = {{ $json.PossuiEquilibrio ? `'${$json.PossuiEquilibrio}'` : 'NULL' }},
    @Observacoes = {{ $json.Observacoes ? `N'${$json.Observacoes.replace(/'/g, "''")}'` : 'NULL' }},
    @DisponibilidadeJson = {{ $json.DisponibilidadeJson ? `N'${$json.DisponibilidadeJson.replace(/'/g, "''")}'` : 'NULL' }},
    @DisponibilidadeQualquerHorario = {{ $json.DisponibilidadeQualquerHorario ? 1 : 0 }};

SELECT * FROM @Result;
```

---

## Opção 3: Query Simplificada (Mais Segura)

### Query SQL:
```sql
EXEC SpSalvarDisponibilidadeProcesso
    @IdProcesso = {{ $json.IdProcesso }},
    @InstrututorAuto = {{ $json.InstrututorAuto }},
    @InstrutorMoto = {{ $json.InstrutorMoto }},
    @NivelHabilidadeAuto = {{ $json.NivelHabilidadeAuto }},
    @NivelHabilidadeMoto = {{ $json.NivelHabilidadeMoto }},
    @PossuiEquilibrio = '{{ $json.PossuiEquilibrio }}',
    @Observacoes = N'{{ $json.Observacoes }}',
    @DisponibilidadeJson = N'{{ $json.DisponibilidadeJson }}',
    @DisponibilidadeQualquerHorario = {{ $json.DisponibilidadeQualquerHorario }};
```

---

## Configuração no N8N:

1. **Adicione o nó "Microsoft SQL"**
2. **Configure a conexão** com seu SQL Server
3. **Operation**: Execute Query
4. **Query**: Cole uma das queries acima
5. **Parameters** (se usar Opção 1): Configure os parâmetros na ordem

## Troubleshooting:

### Se ainda der erro, teste primeiro uma query simples:
```sql
SELECT 
    {{ $json.IdProcesso }} as IdProcesso,
    {{ $json.InstrututorAuto }} as InstrututorAuto,
    '{{ $json.PossuiEquilibrio }}' as PossuiEquilibrio;
```

### Para debug, adicione antes da stored procedure:
```sql
PRINT 'IdProcesso: ' + CAST({{ $json.IdProcesso }} AS NVARCHAR);
PRINT 'InstrututorAuto: ' + CAST({{ $json.InstrututorAuto }} AS NVARCHAR);
```