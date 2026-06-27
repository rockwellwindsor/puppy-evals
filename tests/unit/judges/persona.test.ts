import { describe, it, expect, vi, beforeEach } from 'vitest'
import { scorePersona } from '../../../src/judges/persona'

const validJudgeResponse = JSON.stringify({ score: 4, reason: 'Gus used sophisticated vocabulary and stayed in character throughout.' })

function mockAnthropicWith(responseText: string) {
  return vi.fn().mockImplementation(function () {
    return {
      messages: {
        create: vi.fn().mockResolvedValue({
          content: [{ type: 'text', text: responseText }],
        }),
      },
    }
  })
}

beforeEach(() => {
  vi.clearAllMocks()
})

vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn().mockImplementation(function () {
    return {
      messages: {
        create: vi.fn().mockResolvedValue({
          content: [{ type: 'text', text: validJudgeResponse }],
        }),
      },
    }
  }),
}))

describe('scorePersona', () => {
  it('calls Claude Haiku and returns a parsed score and reason', async () => {
    const result = await scorePersona(
      'gus',
      'What makes Rockwell a great engineer?',
      'Rockwell is, indeed, a most distinguished engineer with splendid attention to detail.'
    )

    expect(result.score).toBe(4)
    expect(result.reason).toBe('Gus used sophisticated vocabulary and stayed in character throughout.')
  })

  it('throws when the response is missing the score field', async () => {
    const { default: Anthropic } = await import('@anthropic-ai/sdk')
    vi.mocked(Anthropic).mockImplementationOnce(mockAnthropicWith(
      JSON.stringify({ reason: 'missing score' })
    ) as any)

    await expect(
      scorePersona('gus', 'some question', 'some answer')
    ).rejects.toThrow()
  })

  it('throws when the response is not valid JSON', async () => {
    const { default: Anthropic } = await import('@anthropic-ai/sdk')
    vi.mocked(Anthropic).mockImplementationOnce(mockAnthropicWith('not json at all') as any)

    await expect(
      scorePersona('gus', 'some question', 'some answer')
    ).rejects.toThrow()
  })

  it('throws when the score is outside the 1-5 range', async () => {
    const { default: Anthropic } = await import('@anthropic-ai/sdk')
    vi.mocked(Anthropic).mockImplementationOnce(mockAnthropicWith(
      JSON.stringify({ score: 9, reason: 'out of range' })
    ) as any)

    await expect(
      scorePersona('gus', 'some question', 'some answer')
    ).rejects.toThrow()
  })
})
