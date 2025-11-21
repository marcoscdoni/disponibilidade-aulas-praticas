-- Query SQL corrigida para o nó SQL Server do N8N
-- Esta query deve ser usada no nó "Microsoft SQL" do N8N
-- Usar "Parameters" ao invés de interpolação direta

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