export function validateApiKey(request: Request): boolean {
  const key = request.headers.get('X-API-Key')
  return key !== null && key === process.env.N8N_API_KEY
}
