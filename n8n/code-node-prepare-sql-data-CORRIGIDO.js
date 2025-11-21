// N8N Code Node - Preparar dados para SpSalvarDisponibilidadeProcesso (CORRIGIDO)
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
  
  // ========================================
  // LÓGICA CORRIGIDA PARA "QUALQUER HORÁRIO"
  // ========================================
  
  // Verificar se o usuário escolheu "disponível qualquer horário"
  // Pode vir como 1/0 (number), "1"/"0" (string), ou "Sim"/"Não" (string)
  const availableAnytime = data.available_anytime === 1 || 
                          data.available_anytime === "1" || 
                          data.available_anytime === true || 
                          data.available_anytime === "Sim";
  
  let availabilityArray = [];
  let disponibilidadeJson = null;
  
  if (!availableAnytime) {
    // Se NÃO é qualquer horário, processar horários específicos
    
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
    
    // Só gerar JSON se houver horários específicos
    if (availabilityArray.length > 0) {
      disponibilidadeJson = JSON.stringify(availabilityArray);
    }
  }
  
  // ========================================
  // PREPARAR DADOS PARA STORED PROCEDURE
  // ========================================
  
  const procedureData = {
    // Parâmetros da stored procedure
    IdProcesso: data.procId || null,
    
    // Instrutores (converter string para int, ou null se vazio)
    InstrututorAuto: data.preferred_instructor_car ? parseInt(data.preferred_instructor_car, 10) : null,
    InstrutorMoto: data.preferred_instructor_moto ? parseInt(data.preferred_instructor_moto, 10) : null,
    
    // Níveis de habilidade (converter texto para ID numérico)
    NivelHabilidadeAuto: convertKnowledgeToId(data.knowledge_car),
    NivelHabilidadeMoto: convertKnowledgeToId(data.knowledge_moto),
    
    // Equilíbrio (converter diferentes formatos para "S"/"N")
    // Pode vir como 1/0 (number), "1"/"0" (string), ou "Sim"/"Não" (string)
    PossuiEquilibrio: (() => {
      if (data.has_balance === 1 || data.has_balance === "1" || data.has_balance === true || data.has_balance === "Sim") {
        return 'S';
      } else if (data.has_balance === 0 || data.has_balance === "0" || data.has_balance === false || data.has_balance === "Não") {
        return 'N';
      }
      return null;
    })(),
    
    // Observações (sempre string ou null)
    Observacoes: data.comments && data.comments.trim() ? data.comments.trim() : null,
    
    // CORRIGIDO: JSON só quando há horários específicos
    DisponibilidadeJson: disponibilidadeJson,
    
    // CORRIGIDO: Boolean correto para qualquer horário
    DisponibilidadeQualquerHorario: availableAnytime,
    
    // Dados adicionais para log/debug (opcional)
    _metadata: {
      timestamp: data.timestamp,
      autoescola: data.autoescola,
      token: data.token,
      ip_acesso: data.ip_acesso,
      name: data.name,
      category: data.category,
      debug_disponibilidade: {
        available_anytime_input: data.available_anytime,
        available_anytime_type: typeof data.available_anytime,
        available_anytime_boolean: availableAnytime,
        has_balance_input: data.has_balance,
        has_balance_type: typeof data.has_balance,
        horarios_especificos_count: availabilityArray.length,
        json_gerado: disponibilidadeJson !== null
      }
    }
  };
  
  processedData.push({
    json: procedureData
  });
}

// Retornar os dados processados
return processedData;