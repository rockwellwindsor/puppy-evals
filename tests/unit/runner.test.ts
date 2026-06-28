import { describe, it, expect, vi, beforeEach } from 'vitest'
import { runEvals } from '../../src/runner'

const { mockChatbotResponse, mockGoldenSet } = vi.hoisted(() => ({
  mockChatbotResponse: {
    answer: 'Rockwell has over 10 years of Rails experience, indeed.',
    retrieved_chunks: [{ section: 'Core Technical Expertise', content: 'Rails 10+ years' }],
    model: 'gpt-3.5-turbo',
    latency_ms: 400,
    tokens: { input: 200, output: 40 },
  },
  mockGoldenSet: [
    {
      id: 'gus-001',
      category: 'factual' as const,
      question: 'How many years of Rails experience does Rockwell have?',
      expected_chunk_sections: ['Core Technical Expertise'],
      example_acceptable_answer: 'Over 10 years.',
    },
  ],
}))

beforeEach(() => {
  vi.clearAllMocks()
})

vi.mock('../../src/chatbotClient', () => ({
  callEvalEndpoint: vi.fn().mockResolvedValue(mockChatbotResponse),
}))

vi.mock('../../src/judges/retrieval', () => ({
  scoreRetrieval: vi.fn().mockReturnValue({ score: 1.0, matched: ['Core Technical Expertise'], missed: [] }),
}))

vi.mock('../../src/judges/grounding', () => ({
  scoreGrounding: vi.fn().mockResolvedValue({ score: 5, reason: 'Fully grounded.' }),
}))

vi.mock('../../src/judges/persona', () => ({
  scorePersona: vi.fn().mockResolvedValue({ score: 4, reason: 'Clearly in character.' }),
}))

vi.mock('../../src/db/client', () => ({
  db: {
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([{ id: 'run-123' }]),
      }),
    }),
  },
}))

describe('runEvals', () => {
  it('calls the chatbot and all three judges for each question', async () => {
    const { callEvalEndpoint } = await import('../../src/chatbotClient')
    const { scoreRetrieval } = await import('../../src/judges/retrieval')
    const { scoreGrounding } = await import('../../src/judges/grounding')
    const { scorePersona } = await import('../../src/judges/persona')

    await runEvals({ puppy: 'gus', label: 'test-run', goldenSet: mockGoldenSet })

    expect(callEvalEndpoint).toHaveBeenCalledWith('gus', mockGoldenSet[0].question, {})
    expect(scoreRetrieval).toHaveBeenCalledWith(
      mockGoldenSet[0].expected_chunk_sections,
      ['Core Technical Expertise']
    )
    expect(scoreGrounding).toHaveBeenCalledOnce()
    expect(scorePersona).toHaveBeenCalledWith('gus', mockGoldenSet[0].question, mockChatbotResponse.answer)
  })

  it('passes topK through to the chatbot client when provided', async () => {
    const { callEvalEndpoint } = await import('../../src/chatbotClient')

    await runEvals({ puppy: 'gus', label: 'test-run', goldenSet: mockGoldenSet, topK: 5 })

    expect(callEvalEndpoint).toHaveBeenCalledWith('gus', mockGoldenSet[0].question, { top_k: 5 })
  })

  it('returns aggregate scores for the run', async () => {
    const summary = await runEvals({ puppy: 'gus', label: 'test-run', goldenSet: mockGoldenSet })

    expect(summary.retrieval).toBe(1.0)
    expect(summary.grounding).toBe(5)
    expect(summary.persona).toBe(4)
    expect(summary.totalQuestions).toBe(1)
  })
})
