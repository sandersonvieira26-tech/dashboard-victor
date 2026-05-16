if (!process.env.N8N_API_KEY) {
  console.warn('[auth] N8N_API_KEY não configurada — rotas /api/n8n/* vão rejeitar todas as requisições')
}

export function validateApiKey(request: Request): boolean {
  const key = request.headers.get('X-API-Key')
  return key !== null && key === process.env.N8N_API_KEY
}
