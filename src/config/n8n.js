// Configuration for n8n webhook integration
export const config = {
  // Replace this URL with your actual n8n webhook endpoint
  n8nWebhookUrl: 'https://your-n8n-instance.com/webhook/survey',
  
  // Optional: Add authentication headers if needed
  headers: {
    'Content-Type': 'application/json',
    // 'Authorization': 'Bearer your-token-here', // Uncomment if using authentication
  },
  
  // Survey configuration
  autoescola: {
    name: 'AutoEscola Modelo', // Change this to your driving school name
    showLogo: false, // Set to true if you want to add a logo
    logoUrl: '/logo.png' // Path to your logo file
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
    
    const result = await response.json()
    console.log('n8n response:', result)
    
    return { success: true, data: result }
  } catch (error) {
    console.error('Error submitting to n8n:', error)
    return { success: false, error: error.message }
  }
}