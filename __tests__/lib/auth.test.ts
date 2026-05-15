/**
 * @jest-environment node
 */
import { validateApiKey } from '@/lib/auth'

describe('validateApiKey', () => {
  beforeEach(() => {
    process.env.N8N_API_KEY = 'test-key-123'
  })

  it('retorna true para chave correta', () => {
    const req = new Request('http://localhost', {
      headers: { 'X-API-Key': 'test-key-123' },
    })
    expect(validateApiKey(req)).toBe(true)
  })

  it('retorna false para chave incorreta', () => {
    const req = new Request('http://localhost', {
      headers: { 'X-API-Key': 'wrong-key' },
    })
    expect(validateApiKey(req)).toBe(false)
  })

  it('retorna false quando header ausente', () => {
    const req = new Request('http://localhost')
    expect(validateApiKey(req)).toBe(false)
  })
})
