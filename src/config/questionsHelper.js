import questionsData from './questions.json'

/**
 * Load and process survey questions from JSON configuration
 * @returns {Object} Processed questions configuration
 */
export const loadQuestions = () => {
  // Sort questions by order
  const sortedQuestions = [...questionsData.questions].sort((a, b) => a.order - b.order)
  
  return {
    version: questionsData.version,
    categories: questionsData.categories,
    questions: sortedQuestions
  }
}

/**
 * Get initial form data structure based on questions
 * @returns {Object} Initial form data with null/empty values
 */
export const getInitialFormData = () => {
  const { questions } = loadQuestions()
  const formData = {}
  
  questions.forEach(q => {
    if (q.type === 'multiple') {
      formData[q.key] = []
    } else if (q.type === 'nps') {
      formData[q.key] = null
    } else {
      formData[q.key] = null
    }
  })
  
  return formData
}

/**
 * Get initial NA (Not Applicable) flags for conditional questions
 * @returns {Object} NA flags object
 */
export const getInitialNAFlags = () => {
  const { questions } = loadQuestions()
  const naFlags = {}
  
  questions.forEach(q => {
    if (q.conditional && q.naOption?.enabled) {
      naFlags[q.key] = false
    }
  })
  
  return naFlags
}

/**
 * Check if a question should be displayed based on conditions
 * @param {Object} question - Question configuration
 * @param {Object} formData - Current form data
 * @param {Object} naFlags - Current NA flags
 * @returns {boolean} Whether the question should be shown
 */
export const shouldShowQuestion = (question, formData, naFlags) => {
  // If question has no conditions, always show
  if (!question.conditional) {
    return true
  }
  
  // Add custom conditional logic here if needed
  // For now, all conditional questions are shown
  return true
}

/**
 * Get question type label for display
 * @param {string} type - Question type
 * @returns {string} Type label
 */
export const getQuestionTypeLabel = (type) => {
  const labels = {
    nps: 'Escala 0-10',
    likert: 'Escala de satisfação',
    multiple: 'Múltipla escolha',
    text: 'Texto livre'
  }
  return labels[type] || ''
}

/**
 * Validate a question answer
 * @param {Object} question - Question configuration
 * @param {*} answer - Answer value
 * @param {Object} naFlags - NA flags
 * @returns {Object} Validation result { valid: boolean, error: string }
 */
export const validateQuestion = (question, answer, naFlags = {}) => {
  // Check if question is marked as NA
  if (question.naOption?.enabled && naFlags[question.key]) {
    return { valid: true, error: '' }
  }
  
  // Required field validation
  if (question.required) {
    if (question.type === 'nps') {
      if (answer === null || answer === undefined) {
        return { valid: false, error: 'Por favor, selecione uma pontuação de 0 a 10.' }
      }
    } else if (question.type === 'likert') {
      if (!answer && answer !== 'not_applicable') {
        return { valid: false, error: 'Por favor, selecione uma opção.' }
      }
    } else if (question.type === 'multiple') {
      if (!Array.isArray(answer) || answer.length === 0) {
        return { valid: false, error: 'Por favor, selecione pelo menos uma opção.' }
      }
    } else if (question.type === 'text') {
      if (!answer || answer.trim() === '') {
        return { valid: false, error: 'Por favor, preencha este campo.' }
      }
    }
  }
  
  return { valid: true, error: '' }
}

/**
 * Get questions by category
 * @param {string} category - Category name
 * @returns {Array} Questions in the category
 */
export const getQuestionsByCategory = (category) => {
  const { questions } = loadQuestions()
  return questions.filter(q => q.category === category)
}

/**
 * Export questions configuration for external use
 */
export default {
  loadQuestions,
  getInitialFormData,
  getInitialNAFlags,
  shouldShowQuestion,
  getQuestionTypeLabel,
  validateQuestion,
  getQuestionsByCategory
}
