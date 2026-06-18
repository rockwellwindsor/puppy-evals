import { describe, it, expect, vi, beforeEach } from 'vitest'
import { callEvalEndpoint } from '../../src/chatbotClient'

const mockResponse = {
  answer: 'Rockwell has over 10 years of Rails experience.',
  retrieved_chunks: [{ section: 'experience', content: 'Rails since 2013.' }],
  model: 'gpt-3.5-turbo',
  latency_ms: 342,
  tokens: { input: 210, output: 45 },
}

beforeEach(() => {
  vi.restoreAllMocks()
  process.env.EVAL_API_KEY = 'test-key'
  process.env.CHATBOT_BASE_URL = 'https://example.com'
})

describe('callEvalEndpoint', () => {
  it('posts to the eval endpoint and returns the parsed response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    }))

    const result = await callEvalEndpoint('gus', 'How much Rails experience does Rockwell have?')

    expect(fetch).toHaveBeenCalledWith(
      'https://example.com/api/chat/eval',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Authorization': 'Bearer test-key',
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({ puppy: 'gus', question: 'How much Rails experience does Rockwell have?' }),
      })
    )
    expect(result.answer).toBe(mockResponse.answer)
    expect(result.retrieved_chunks).toHaveLength(1)
    expect(result.tokens.input).toBe(210)
  })

  it('throws on 401 unauthorized', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ error: 'Unauthorized' }),
    }))

    await expect(callEvalEndpoint('gus', 'test question')).rejects.toThrow('Unauthorized')
  })

  it('throws on network failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')))

    await expect(callEvalEndpoint('gus', 'test question')).rejects.toThrow('Network error')
  })

  it('throws if response shape is invalid', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ unexpected: 'shape' }),
    }))

    await expect(callEvalEndpoint('gus', 'test question')).rejects.toThrow()
  })
})
