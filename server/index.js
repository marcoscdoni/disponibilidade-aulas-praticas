import express from 'express'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { createServer as createViteServer } from 'vite'

dotenv.config()

const app = express()
const isProduction = process.env.NODE_ENV === 'production'
const port = Number(process.env.PORT || 3000)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Prefer new NPS_* env names, fall back to legacy N8N_ and VITE_ names for compatibility
// Use only the explicit NPS_* env variables (no legacy fallbacks in dev)
const n8nSurveyUrl = process.env.NPS_SURVEY_WEBHOOK_URL
const n8nValidationUrl = process.env.NPS_VALIDATION_WEBHOOK_URL
const n8nApiKey = process.env.NPS_API_KEY
const n8nApiKeyHeader = process.env.NPS_API_KEY_HEADER || 'x-api-key'

if (!n8nSurveyUrl || !n8nValidationUrl) {
  console.warn('Warning: NPS webhook URLs are not fully configured. Set NPS_SURVEY_WEBHOOK_URL / NPS_VALIDATION_WEBHOOK_URL in your .env')
}

const proxyHeaders = {
  'Content-Type': 'application/json',
  ...(n8nApiKey ? { [n8nApiKeyHeader]: n8nApiKey } : {})
}

app.use(express.json({ limit: '1mb' }))

app.get('/api/validate-token', async (req, res) => {
  const { token } = req.query
  if (!token) {
    return res.status(400).json({ success: false, error: 'Token ausente' })
  }

  if (!n8nValidationUrl) {
    return res.status(500).json({ success: false, error: 'NPS_VALIDATION_WEBHOOK_URL ausente no servidor.' })
  }

  try {
    const url = new URL(n8nValidationUrl)
    url.searchParams.set('token', token)
    const response = await fetch(url.toString(), { headers: proxyHeaders })
    const text = await response.text()
    const contentType = response.headers.get('content-type')
    if (contentType) {
      res.setHeader('content-type', contentType)
    }
    res.status(response.status)
    res.send(text || '')
  } catch (error) {
    console.error('validate-token proxy error', error)
    res.status(502).json({ success: false, error: error.message })
  }
})

app.post('/api/pesquisa', async (req, res) => {
  if (!n8nSurveyUrl) {
    return res.status(500).json({ success: false, error: 'NPS_SURVEY_WEBHOOK_URL ausente no servidor.' })
  }

  try {
    // Captura o IP do cliente
    const clientIp = req.headers['x-forwarded-for']?.split(',')[0].trim() || 
                     req.headers['x-real-ip'] || 
                     req.socket.remoteAddress || 
                     req.ip || 
                     null

    // Adiciona o IP ao payload
    const payloadWithIp = {
      ...req.body,
      ip_acesso: clientIp
    }

    // Log the incoming payload for debugging (dev only)
    try {
      console.log('proxy /api/pesquisa - forwarding payload:', JSON.stringify(payloadWithIp))
    } catch (e) {
      console.log('proxy /api/pesquisa - forwarding payload: [unserializable]')
    }
    const response = await fetch(n8nSurveyUrl, {
      method: 'POST',
      headers: proxyHeaders,
      body: JSON.stringify(payloadWithIp)
    })
    const text = await response.text()
    // Log proxied response for debugging (dev only)
    try {
      console.log('proxy /api/pesquisa - n8n response status=', response.status, 'body=', text)
    } catch (e) {
      console.log('proxy /api/pesquisa - n8n response status=', response.status)
    }
    const contentType = response.headers.get('content-type')
    if (contentType) {
      res.setHeader('content-type', contentType)
    }
    res.status(response.status)
    res.send(text || '')
  } catch (error) {
    console.error('pesquisa proxy error', error)
    res.status(502).json({ success: false, error: error.message })
  }
})

const startServer = async () => {
  if (!isProduction) {
    const vite = await createViteServer({
      root: process.cwd(),
      server: {
        middlewareMode: true
      }
    })
    app.use(vite.middlewares)
  } else {
    const distPath = path.join(__dirname, '../dist')
    app.use(express.static(distPath))
    // Fallback para SPA - todas as rotas não encontradas servem o index.html
    app.use((req, res) => {
      res.sendFile(path.join(distPath, 'index.html'))
    })
  }

  app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port} [${isProduction ? 'production' : 'development'}]`)
  })
}

startServer()
