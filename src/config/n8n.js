// Configuration for n8n webhook integration
// This file reads configuration from Vite environment variables.
// Use a local `.env` file with variables prefixed by VITE_ (see .env.example).

const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL || 'https://your-n8n-instance.com/webhook/survey'
const apiKey = import.meta.env.VITE_N8N_API_KEY
// Optional: allow customizing the header name used for the API key (defaults to x-api-key)
const apiKeyHeader = import.meta.env.VITE_N8N_API_KEY_HEADER || 'x-api-key'

export const config = {
  n8nWebhookUrl: webhookUrl,
  headers: (() => {
    const h = { 'Content-Type': 'application/json' }
    if (apiKey) {
      // attach the api key to the configured header name
      h[apiKeyHeader] = apiKey
    }
    return h
  })(),
  autoescola: {
    name: import.meta.env.VITE_AUTOESCOLA_NAME || 'AutoEscola Modelo',
    showLogo: false,
    logoUrl: '/logo.png'
  }
}

// Helper function to submit survey data to n8n
export const submitToN8n = async (surveyData) => {
  try {
    const payload = {
      timestamp: new Date().toISOString(),
      autoescola: config.autoescola.name,
      ...surveyData
    }

    console.log('Sending survey data to n8n:', payload)

    const response = await fetch(config.n8nWebhookUrl, {
      method: 'POST',
      headers: config.headers,
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    // Try to parse JSON, but some webhooks may respond with empty body
    let result = null
    try {
      result = await response.json()
    } catch (err) {
      // ignore parse errors
      result = null
    }

    console.log('n8n response:', result)

    return { success: true, data: result }
  } catch (error) {
    console.error('Error submitting to n8n:', error)
    return { success: false, error: error.message }
  }
}