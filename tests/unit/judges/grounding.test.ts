import { describe, it, expect, vi, beforeEach } from 'vitest'
import { scoreGrounding } from '../../../src/judges/grounding'

const validJudgeResponse = JSON.stringify({ score: 5, reason: 'Every claim in the answer is directly supported by the retrieved chunks.' })

const chunks = [
  { section: 'Core Technical Expertise', content: 'Ruby on Rails (10+ years production experience)' },
]

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

describe('scoreGrounding', () => {
  it('calls Claude Haiku and returns a parsed score and reason', async () => {
    const result = await scoreGrounding(
      'How many years of Rails experience does Rockwell have?',
      chunks,
      'Rockwell has over 10 years of production Rails experience, indeed.'
    )

    expect(result.score).toBe(5)
    expect(result.reason).toBe('Every claim in the answer is directly supported by the retrieved chunks.')
  })

  it('throws when the response is missing the score field', async () => {
    const { default: Anthropic } = await import('@anthropic-ai/sdk')
    vi.mocked(Anthropic).mockImplementationOnce(mockAnthropicWith(
      JSON.stringify({ reason: 'missing score' })
    ) as any)

    await expect(
      scoreGrounding('question', chunks, 'answer')
    ).rejects.toThrow()
  })

  it('throws when the response is not valid JSON', async () => {
    const { default: Anthropic } = await import('@anthropic-ai/sdk')
    vi.mocked(Anthropic).mockImplementationOnce(mockAnthropicWith('not json at all') as any)

    await expect(
      scoreGrounding('question', chunks, 'answer')
    ).rejects.toThrow()
  })

  it('handles a response wrapped in a markdown code fence', async () => {
    const { default: Anthropic } = await import('@anthropic-ai/sdk')
    vi.mocked(Anthropic).mockImplementationOnce(mockAnthropicWith(
      '```json\n' + validJudgeResponse + '\n```'
    ) as any)

    const result = await scoreGrounding('question', chunks, 'answer')
    expect(result.score).toBe(5)
  })

  it('throws when the score is outside the 1-5 range', async () => {
    const { default: Anthropic } = await import('@anthropic-ai/sdk')
    vi.mocked(Anthropic).mockImplementationOnce(mockAnthropicWith(
      JSON.stringify({ score: 0, reason: 'out of range' })
    ) as any)

    await expect(
      scoreGrounding('question', chunks, 'answer')
    ).rejects.toThrow()
  })
})
