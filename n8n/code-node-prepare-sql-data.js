// N8N Code Node - Preparar dados para SpSalvarDisponibilidadeProcesso
// Este código deve ser usado em um nó "Code" no N8N para transformar o payload
// recebido do formulário no formato correto para a stored procedure

const inputData = $input.all();
const processedData = [];

// Função para converter nível de conhecimento em ID numérico
function convertKnowledgeToId(knowledgeText) {
  if (!knowledgeText) return null;
  
  switch (knowledgeText.toLowerCase()) {
    case 'nunca dirigi':
      return 1;
    case 'noção básica':
      return 2;
    case 'já tenho experiência':
      return 3;
    default:
      return null;
  }
}

// Função para converter horário no formato "HH:MM às HH:MM" para objeto com início e fim
function parseTimeRange(timeRange) {
  if (!timeRange || typeof timeRange !== 'string') return null;
  
  const match = timeRange.match(/(\d{2}:\d{2})\s+às\s+(\d{2}:\d{2})/);
  if (match) {
    return {
      inicio: match[1],
      fim: match[2]
    };
  }
  return null;
}

// Função para agrupar horários consecutivos
function groupConsecutiveTimeSlots(timeRanges) {
  if (!timeRanges || timeRanges.length === 0) return [];
  
  // Parse e ordena os horários
  const parsedTimes = timeRanges
    .map(parseTimeRange)
    .filter(t => t !== null)
    .sort((a, b) => a.inicio.localeCompare(b.inicio));
  
  if (parsedTimes.length === 0) return [];
  
  const groups = [];
  let currentGroup = {
    inicio: parsedTimes[0].inicio,
    fim: parsedTimes[0].fim
  };
  
  for (let i = 1; i < parsedTimes.length; i++) {
    const current = parsedTimes[i];
    const previous = parsedTimes[i - 1];
    
    // Se o horário atual começa exatamente quando o anterior termina
    if (current.inicio === previous.fim) {
      // Estende o grupo atual
      currentGroup.fim = current.fim;
    } else {
      // Salva o grupo atual e inicia um novo
      groups.push({
        inicio: currentGroup.inicio + ':00',
        fim: currentGroup.fim + ':00'
      });
      currentGroup = {
        inicio: current.inicio,
        fim: current.fim
      };
    }
  }
  
  // Adiciona o último grupo
  groups.push({
    inicio: currentGroup.inicio + ':00',
    fim: currentGroup.fim + ':00'
  });
  
  return groups;
}

// Função para converter dia da semana para número (SQL Server format)
function getDayNumber(dayName) {
  const days = {
    'monday': 2,    // Segunda
    'tuesday': 3,   // Terça
    'wednesday': 4, // Quarta
    'thursday': 5,  // Quinta
    'friday': 6,    // Sexta
    'saturday': 7   // Sábado
  };
  return days[dayName] || null;
}

// Processar cada item do input
for (const item of inputData) {
  const data = item.json;
  
  // Preparar array de disponibilidade para JSON
  const availabilityArray = [];
  
  // Mapear dias da semana
  const daysMap = [
    { key: 'monday_availability', name: 'monday' },
    { key: 'tuesday_availability', name: 'tuesday' },
    { key: 'wednesday_availability', name: 'wednesday' },
    { key: 'thursday_availability', name: 'thursday' },
    { key: 'friday_availability', name: 'friday' },
    { key: 'saturday_availability', name: 'saturday' }
  ];
  
  // Processar cada dia da semana
  for (const day of daysMap) {
    const dayAvailability = data[day.key];
    const dayNumber = getDayNumber(day.name);
    
    if (Array.isArray(dayAvailability) && dayAvailability.length > 0 && dayNumber) {
      // Agrupar horários consecutivos para este dia
      const timeGroups = groupConsecutiveTimeSlots(dayAvailability);
      
      // Adicionar cada grupo agrupado
      for (const group of timeGroups) {
        availabilityArray.push({
          dia: dayNumber,
          inicio: group.inicio,
          fim: group.fim
        });
      }
    }
  }
  
  // Preparar dados para a stored procedure
  const procedureData = {
    // Parâmetros da stored procedure
    IdProcesso: data.procId || null,
    
    // Instrutores (converter string para int, ou null se vazio)
    InstrututorAuto: data.preferred_instructor_car ? parseInt(data.preferred_instructor_car, 10) : null,
    InstrutorMoto: data.preferred_instructor_moto ? parseInt(data.preferred_instructor_moto, 10) : null,
    
    // Níveis de habilidade (converter texto para ID numérico)
    NivelHabilidadeAuto: convertKnowledgeToId(data.knowledge_car),
    NivelHabilidadeMoto: convertKnowledgeToId(data.knowledge_moto),
    
    // Equilíbrio (converter "Sim"/"Não" para "S"/"N" - importante: sempre retorna string ou null)
    PossuiEquilibrio: data.has_balance === 'Sim' ? 'S' : (data.has_balance === 'Não' ? 'N' : null),
    
    // Observações (sempre string ou null)
    Observacoes: data.comments && data.comments.trim() ? data.comments.trim() : null,
    
    // Disponibilidade como JSON estruturado (sempre string ou null)
    DisponibilidadeJson: availabilityArray.length > 0 ? JSON.stringify(availabilityArray) : null,
    
    // Disponível qualquer horário (sempre boolean)
    DisponibilidadeQualquerHorario: data.available_anytime === 'Sim' ? true : false,
    
    // Dados adicionais para log/debug (opcional)
    _metadata: {
      timestamp: data.timestamp,
      autoescola: data.autoescola,
      token: data.token,
      ip_acesso: data.ip_acesso,
      name: data.name,
      category: data.category
    }
  };
  
  processedData.push({
    json: procedureData
  });
}

// Retornar os dados processados
return processedData;

/*
EXEMPLO DO OUTPUT ESPERADO (com agrupamento de horários):
{
  "IdProcesso": 1085,
  "InstrututorAuto": 49,
  "InstrutorMoto": 26,
  "NivelHabilidadeAuto": 3,
  "NivelHabilidadeMoto": 1,
  "PossuiEquilibrio": "S",
  "Observacoes": null,
  "DisponibilidadeJson": "[{\"dia\":2,\"inicio\":\"07:00:00\",\"fim\":\"21:20:00\"},{\"dia\":3,\"inicio\":\"07:00:00\",\"fim\":\"21:20:00\"},{\"dia\":4,\"inicio\":\"07:00:00\",\"fim\":\"08:40:00\"},{\"dia\":5,\"inicio\":\"12:00:00\",\"fim\":\"12:50:00\"},{\"dia\":6,\"inicio\":\"07:00:00\",\"fim\":\"08:40:00\"}]",
  "DisponibilidadeQualquerHorario": false,
  "_metadata": {
    "timestamp": "2025-11-21T02:44:00.844Z",
    "autoescola": "AutoEscola Modelo",
    "token": "2189D095-EFC9-4C73-80BC-4E712AD738AF",
    "ip_acesso": "::1",
    "name": "MARCOS CESAR DONI",
    "category": "AB"
  }
}

EXEMPLO DO AGRUPAMENTO:
Entrada: ["07:00 às 07:50", "07:50 às 08:40", "08:40 às 09:30", "13:00 às 13:50", "13:50 às 14:40"]
Saída: [
  {"dia": 2, "inicio": "07:00:00", "fim": "09:30:00"},  // 07:00 às 09:30 (agrupado)
  {"dia": 2, "inicio": "13:00:00", "fim": "14:40:00"}   // 13:00 às 14:40 (agrupado)
]
*/