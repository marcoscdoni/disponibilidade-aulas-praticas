# Sistema de Questões Dinâmicas

## Visão Geral

O sistema de questões foi refatorado para ser totalmente dinâmico, permitindo configuração via JSON sem necessidade de alterar código.

## Arquitetura

### Arquivos

- **`src/config/questions.json`**: Arquivo de configuração com todas as questões
- **`src/config/questionsHelper.js`**: Funções helper para carregar e processar questões
- **`src/components/NPSSurvey.vue`**: Componente principal (agora usa o sistema dinâmico)

## Estrutura do JSON

### Configuração Principal

```json
{
  "version": "1.0",
  "categories": { ... },
  "questions": [ ... ]
}
```

### Categorias

Definem grupos de questões condicionais:

```json
"categories": {
  "car": {
    "label": "Carro",
    "description": "Aulas práticas de carro"
  },
  "moto": {
    "label": "Moto",
    "description": "Aulas práticas de moto"
  }
}
```

### Estrutura de Questão

```json
{
  "key": "practicalCarClasses",
  "question": "Como você avalia a qualidade das aulas práticas de carro?",
  "type": "likert",
  "required": false,
  "order": 5,
  "description": "Texto de ajuda (opcional)",
  "category": "car",
  "conditional": true,
  "naOption": {
    "enabled": true,
    "label": "Não fiz essa categoria"
  },
  "options": ["Opção 1", "Opção 2"],
  "placeholder": "Texto do placeholder (para type=text)"
}
```

## Propriedades das Questões

### Obrigatórias

- **`key`** (string): Identificador único da questão. Usado para salvar no formData e localStorage
- **`question`** (string): Texto da pergunta exibido ao usuário
- **`type`** (string): Tipo da questão. Valores: `"nps"`, `"likert"`, `"multiple"`, `"text"`
- **`required`** (boolean): Se a pergunta é obrigatória
- **`order`** (number): Ordem de exibição (questões são ordenadas automaticamente)

### Opcionais

- **`description`** (string): Texto explicativo adicional abaixo da pergunta
- **`category`** (string): Categoria da questão (referência ao objeto categories)
- **`conditional`** (boolean): Se a questão é condicional (pode ser ocultada)
- **`naOption`** (object): Configuração da opção "Não Aplicável"
  - `enabled` (boolean): Se mostra o botão NA
  - `label` (string): Texto do botão NA
- **`options`** (array): Lista de opções (obrigatório para `type="multiple"`)
- **`placeholder`** (string): Placeholder do campo (para `type="text"`)

## Tipos de Questões

### NPS (Net Promoter Score)

```json
{
  "type": "nps",
  "key": "npsScore",
  "question": "De 0 a 10, quanto você nos indicaria?"
}
```

Exibe botões de 0-10 para pontuação.

### Likert Scale

```json
{
  "type": "likert",
  "key": "satisfaction",
  "question": "Como você avalia...?"
}
```

Exibe 5 opções: Totalmente insatisfeito → Totalmente satisfeito

### Múltipla Escolha

```json
{
  "type": "multiple",
  "key": "likes",
  "question": "O que você gostou?",
  "options": ["Opção 1", "Opção 2", "Opção 3"]
}
```

Permite selecionar múltiplas opções via checkboxes.

### Texto Livre

```json
{
  "type": "text",
  "key": "comments",
  "question": "Comentários",
  "placeholder": "Escreva aqui..."
}
```

Campo de texto textarea.

## Questões Condicionais

### Definindo uma Questão Condicional

```json
{
  "key": "practicalCarClasses",
  "conditional": true,
  "category": "car",
  "naOption": {
    "enabled": true,
    "label": "Não fiz aula de carro"
  }
}
```

### Comportamento

- Quando `naOption.enabled = true`, exibe botão "NA"
- Se usuário marca NA, a questão é pulada (não obrigatória)
- O valor é salvo como `"not_applicable"` no formData

## Validações

### Validação Automática

O sistema valida automaticamente:

- **NPS**: Valor de 0-10 deve ser selecionado se obrigatório
- **Likert**: Uma opção deve ser selecionada (ou marcada como NA)
- **Multiple**: Pelo menos uma opção se obrigatória
- **Text**: Campo não pode estar vazio se obrigatório

### Customizando Validações

Edite `src/config/questionsHelper.js` na função `validateQuestion()`:

```javascript
export const validateQuestion = (question, answer, naFlags = {}) => {
  // Sua lógica customizada aqui
  
  return { valid: true, error: '' }
}
```

## Funções Helper Disponíveis

### `loadQuestions()`

Carrega e ordena as questões do JSON.

```javascript
const { version, categories, questions } = loadQuestions()
```

### `getInitialFormData()`

Gera estrutura inicial do formData baseado nas questões.

```javascript
const formData = reactive(getInitialFormData())
```

### `getInitialNAFlags()`

Gera flags NA para questões condicionais.

```javascript
const naFlags = reactive(getInitialNAFlags())
```

### `validateQuestion(question, answer, naFlags)`

Valida uma resposta.

```javascript
const { valid, error } = validateQuestion(currentQuestion, formData[key], naFlags)
```

### `getQuestionTypeLabel(type)`

Retorna label do tipo de questão.

```javascript
const label = getQuestionTypeLabel('nps') // "Escala 0-10"
```

### `getQuestionsByCategory(category)`

Filtra questões por categoria.

```javascript
const carQuestions = getQuestionsByCategory('car')
```

## Adicionando Nova Questão

1. Abra `src/config/questions.json`
2. Adicione novo objeto no array `questions`:

```json
{
  "key": "newQuestion",
  "question": "Sua nova pergunta?",
  "type": "likert",
  "required": true,
  "order": 14
}
```

3. Atualize a função `submitSurvey` em `NPSSurvey.vue` se a nova questão requer campo especial no payload

## Compatibilidade com LocalStorage

O sistema mantém compatibilidade total:

- Questões antigas continuam funcionando
- Dados salvos anteriormente são carregados corretamente
- Chaves (keys) devem permanecer inalteradas para manter compatibilidade

## Exemplo Completo

### Adicionando Questão de Satisfação com Simulador

```json
{
  "key": "simulatorSatisfaction",
  "question": "Como você avalia o simulador de direção?",
  "description": "Avalie a qualidade e utilidade do simulador",
  "type": "likert",
  "required": false,
  "order": 10.5,
  "category": "simulator",
  "conditional": true,
  "naOption": {
    "enabled": true,
    "label": "Não usei o simulador"
  }
}
```

1. Adicione a categoria se não existir:

```json
"categories": {
  "simulator": {
    "label": "Simulador",
    "description": "Treinamento no simulador de direção"
  }
}
```

2. Atualize o payload de envio (se necessário) em `submitSurvey()`

3. Pronto! A questão aparecerá automaticamente na ordem 10.5

## Vantagens

✅ **Sem código**: Adicione/edite questões sem programar
✅ **Versionamento**: Histórico de mudanças via git
✅ **Reutilizável**: Mesma estrutura para diferentes pesquisas
✅ **Validação centralizada**: Uma função valida todas as questões
✅ **Condicional**: Questões aparecem/desaparecem baseado em respostas
✅ **Categorização**: Agrupe questões relacionadas
✅ **Ordem flexível**: Use decimais para inserir entre questões existentes
