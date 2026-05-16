import { timingSafeEqual } from 'crypto'

if (!process.env.N8N_API_KEY) {
  console.warn('[auth] N8N_API_KEY não configurada — rotas /api/n8n/* vão rejeitar todas as requisições')
}

export function validateApiKey(request: Request): boolean {
  const key = request.headers.get('X-API-Key')
  const expected = process.env.N8N_API_KEY
  if (!key || !expected) return false
  const keyBuf = Buffer.from(key)
  const expectedBuf = Buffer.from(expected)
  return keyBuf.length === expectedBuf.length && timingSafeEqual(keyBuf, expectedBuf)
}
