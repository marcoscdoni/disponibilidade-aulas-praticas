// Configuration for the frontend to call our backend proxy.
// Backend endpoints hide the real n8n webhooks and control API key usage.

// Use explicit NPS_* frontend env vars (no legacy VITE_* fallbacks)
const surveyEndpoint = import.meta.env.BACKEND_SURVEY_URL || '/api/availability'
const validationEndpoint = import.meta.env.BACKEND_TOKEN_VALIDATION_URL || '/api/validate-token'
const instructorsEndpoint = import.meta.env.NPS_BACKEND_INSTRUCTORS_URL || '/api/instructors'
const requestHeaders = { 'Content-Type': 'application/json' }

const defaultLogoUrl = new URL('../assets/logo.svg', import.meta.url).href
const autoescolaName = import.meta.env.NPS_AUTOESCOLA_NAME || 'AutoEscola Modelo'
const autoescolaLogoUrl = import.meta.env.NPS_AUTOESCOLA_LOGO_URL || defaultLogoUrl
const autoescolaShowLogo = (() => {
  const envValue = import.meta.env.NPS_AUTOESCOLA_SHOW_LOGO
  if (typeof envValue === 'string') {
    return envValue.toLowerCase() !== 'false'
  }
  return true
})()

export const config = {
  surveyEndpoint,
  validationEndpoint,
  instructorsEndpoint,
  headers: requestHeaders,
  autoescola: {
    name: autoescolaName,
    showLogo: autoescolaShowLogo,
    logoUrl: autoescolaLogoUrl
  }
}

// Helper function to submit availability data through the backend proxy
export const submitToN8n = async (availabilityData, token = null) => {
  try {
    // Create availability payload structure
    const payload = {
      timestamp: new Date().toISOString(),
      autoescola: config.autoescola.name,
      token: token || null,
      
      // Availability settings (convert "Sim"/"Não" to 1/0 for SQL Server)
      available_anytime: availabilityData.availableAnytime === 'Sim' ? 1 : (availabilityData.availableAnytime === 'Não' ? 0 : null),
      
      // Weekly availability schedules
      monday_availability: Array.isArray(availabilityData.mondayAvailability) ? availabilityData.mondayAvailability : [],
      tuesday_availability: Array.isArray(availabilityData.tuesdayAvailability) ? availabilityData.tuesdayAvailability : [],
      wednesday_availability: Array.isArray(availabilityData.wednesdayAvailability) ? availabilityData.wednesdayAvailability : [],
      thursday_availability: Array.isArray(availabilityData.thursdayAvailability) ? availabilityData.thursdayAvailability : [],
      friday_availability: Array.isArray(availabilityData.fridayAvailability) ? availabilityData.fridayAvailability : [],
      saturday_availability: Array.isArray(availabilityData.saturdayAvailability) ? availabilityData.saturdayAvailability : [],
      
      // Knowledge levels
      knowledge_car: availabilityData.knowledgeCar || null,
      knowledge_moto: availabilityData.knowledgeMoto || null,
      
      // Instructor preferences
      preferred_instructor_car: availabilityData.instrutor_preferencia_carro || null,
      preferred_instructor_moto: availabilityData.instrutor_preferencia_moto || null,
      
      // Balance/coordination for motorcycles (convert "Sim"/"Não" to 1/0 for SQL Server)
      has_balance: availabilityData.hasBalance === 'Sim' ? 1 : (availabilityData.hasBalance === 'Não' ? 0 : null),
      
      // Additional comments
      comments: availabilityData.comments || '',
      
      // Convert arrays to semicolon-separated strings for easier storage/analysis
      monday_availability_list: Array.isArray(availabilityData.mondayAvailability) ? availabilityData.mondayAvailability.join('; ') : '',
      tuesday_availability_list: Array.isArray(availabilityData.tuesdayAvailability) ? availabilityData.tuesdayAvailability.join('; ') : '',
      wednesday_availability_list: Array.isArray(availabilityData.wednesdayAvailability) ? availabilityData.wednesdayAvailability.join('; ') : '',
      thursday_availability_list: Array.isArray(availabilityData.thursdayAvailability) ? availabilityData.thursdayAvailability.join('; ') : '',
      friday_availability_list: Array.isArray(availabilityData.fridayAvailability) ? availabilityData.fridayAvailability.join('; ') : '',
      saturday_availability_list: Array.isArray(availabilityData.saturdayAvailability) ? availabilityData.saturdayAvailability.join('; ') : '',
      
      // Student category (if available)
      student_category: availabilityData.studentCategory || null
    }

    console.log('Sending availability data through backend proxy:', payload)

    const response = await fetch(config.surveyEndpoint, {
      method: 'POST',
      headers: config.headers,
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    // Parse the webhook response
    const result = await response.json()
    console.log('N8N webhook response:', result)

    // Check if the webhook returned success/failure
    if (result && typeof result.success === 'boolean') {
      if (result.success) {
        return { 
          success: true, 
          message: result.message || 'Availability saved successfully',
          data: result 
        }
      } else {
        return { 
          success: false, 
          error: result.message || 'Failed to save availability data'
        }
      }
    }

    // If no success field, check for old format or assume success
    if (result && result.Sucesso !== undefined) {
      // Old stored procedure format
      const isSuccess = result.Sucesso === true || result.Sucesso === 1
      return {
        success: isSuccess,
        error: isSuccess ? null : (result.Mensagem || 'Unknown error'),
        data: result
      }
    }

    // If response has no clear success indicator, assume success
    // (for backwards compatibility with old webhooks)
    return { success: true, data: result }
  } catch (error) {
    console.error('Error submitting availability data to n8n:', error)
    return { success: false, error: error.message }
  }
}

// Validate an incoming token via the backend proxy.
const parseJsonOrRaw = async (response) => {
  const text = await response.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch (error) {
    return { __rawText: text }
  }
}

const isHtmlPayload = (text) => {
  if (!text) return false
  const normalized = text.trim().slice(0, 64)
  return /<!doctype html|<html/i.test(normalized)
}

export const validateTokenWithBackend = async (token) => {
  if (!token) {
    return { success: false, error: 'Token ausente' }
  }

  try {
    const url = `${config.validationEndpoint}?token=${encodeURIComponent(token)}`
    const response = await fetch(url, {
      method: 'GET',
      headers: config.headers
    })

    const payload = await parseJsonOrRaw(response)
    if (!response.ok) {
      const message = payload?.error || payload?.message || payload?.__rawText || `HTTP ${response.status}`
      return { success: false, error: message }
    }

    // If the backend returned an empty body (null payload), treat it as an error.
    if (payload == null) {
      return { success: false, error: 'Acesso inválido. Verifique o link de validação ou contate o suporte.' }
    }

    if (payload && payload.valid === false) {
      return { success: false, error: payload.error || 'Token inválido' }
    }

    // In case the backend returned raw text (HTML, etc), avoid exposing raw variables to the UI.
    if (payload && payload.__rawText) {
      if (isHtmlPayload(payload.__rawText)) {
        return {
          success: false,
          error:
      'A validação está retornando HTML (provavelmente a rota de backend não existe). Verifique `BACKEND_TOKEN_VALIDATION_URL` e garanta que ela encaminha a `/GetDadosProcesso` do n8n.'
        }
      }
      // Log raw text in dev for troubleshooting but return a generic message to the user
      try {
        if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV) {
          console.debug('n8n raw validation response:', payload.__rawText)
        }
      } catch (e) {
        // ignore in environments where import.meta is not available
      }
      return { success: false, error: 'Acesso inválido. Verifique o link de validação ou contate o suporte.' }
    }

    // Return the user/student data (payload can be the object itself)
    return { success: true, data: payload }
  } catch (error) {
    console.error('Error validating token:', error)
    return { success: false, error: error.message }
  }
}

// Fetch instructors list via the backend proxy
export const fetchInstructors = async () => {
  try {
    const response = await fetch(config.instructorsEndpoint, {
      method: 'GET',
      headers: config.headers
    })

    const payload = await parseJsonOrRaw(response)
    if (!response.ok) {
      const message = payload?.error || payload?.message || payload?.__rawText || `HTTP ${response.status}`
      return { success: false, error: message, instructors: [] }
    }

    // Se o backend retornou um payload vazio
    if (payload == null) {
      return { success: false, error: 'Erro ao buscar instrutores.', instructors: [] }
    }

    // Se retornou HTML ou texto não-JSON
    if (payload && payload.__rawText) {
      if (isHtmlPayload(payload.__rawText)) {
        return {
          success: false,
          error: 'Erro de configuração ao buscar instrutores.',
          instructors: []
        }
      }
      return { success: false, error: 'Formato inválido de resposta ao buscar instrutores.', instructors: [] }
    }

    // Verificar se é array de instrutores
    const instructors = Array.isArray(payload) ? payload : []
    
    console.log('Instrutores carregados:', instructors)
    return { success: true, data: instructors, instructors }
  } catch (error) {
    console.error('Error fetching instructors:', error)
    return { success: false, error: error.message, instructors: [] }
  }
}