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
 * @param {Object} tokenData - Token/student data (includes category)
 * @param {Object} formData - Current form responses
 * @returns {boolean} Whether the question should be shown
 */
export const shouldShowQuestion = (question, tokenData = null, formData = null) => {
  // If question has no conditions, always show
  if (!question.conditional) {
    return true
  }
  
  // Check showIf conditions
  if (question.showIf) {
    // Check student category condition
    if (question.showIf.studentCategory && tokenData) {
      const studentCategory = tokenData.category || tokenData.studentCategory || ''
      const allowedCategories = question.showIf.studentCategory
      
      // If student has a category, check if it matches allowed categories
      if (studentCategory) {
        const matches = allowedCategories.includes(studentCategory.toUpperCase())
        // If this condition doesn't match, question should not be shown
        if (!matches) {
          return false
        }
      }
    }
    
    // Check form data conditions (e.g., availableAnytime)
    if (formData) {
      for (const [fieldKey, allowedValues] of Object.entries(question.showIf)) {
        // Skip studentCategory as it's handled above
        if (fieldKey === 'studentCategory') continue
        
        const userAnswer = formData[fieldKey]
        
        // For multiple choice questions, userAnswer is an array
        if (Array.isArray(userAnswer)) {
          // Check if any of the user's selections match the allowed values
          const hasMatch = userAnswer.some(answer => allowedValues.includes(answer))
          if (!hasMatch) {
            return false
          }
        } else {
          // For single value answers
          if (!allowedValues.includes(userAnswer)) {
            return false
          }
        }
      }
    }
  }
  
  // Default: show conditional questions if all conditions pass
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
    likert: 'Escala de avaliação',
    multiple: 'Múltipla escolha',
    radio: 'Escolha única',
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
    } else if (question.type === 'radio') {
      if (!answer || answer.trim() === '') {
        return { valid: false, error: 'Por favor, selecione uma opção.' }
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
/**
 * Filter instructors by category
 * @param {Array} instructors - Array of instructor objects with 'idInstrutor', 'instrutor' and 'categoria' properties
 * @param {string} category - Category to filter by ('A' or 'B')
 * @returns {Array} Filtered array of instructor objects with id and name
 */
export const filterInstructorsByCategory = (instructors, category) => {
  if (!Array.isArray(instructors) || !category) return []
  
  return instructors
    .filter(inst => inst.categoria === category)
    .map(inst => ({
      id: inst.idInstrutor,
      name: inst.instrutor
    }))
    .sort((a, b) => a.name.localeCompare(b.name)) // Alphabetical order by name
}

/**
 * Get all unique categories from instructors list
 * @param {Array} instructors - Array of instructor objects
 * @returns {Array} Array of unique categories
 */
export const getInstructorCategories = (instructors) => {
  if (!Array.isArray(instructors)) return []
  
  const categories = instructors.map(inst => inst.categoria)
  return [...new Set(categories)].sort()
}

export default {
  loadQuestions,
  getInitialFormData,
  getInitialNAFlags,
  shouldShowQuestion,
  getQuestionTypeLabel,
  validateQuestion,
  getQuestionsByCategory,
  filterInstructorsByCategory,
  getInstructorCategories
}
