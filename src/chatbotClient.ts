import { z } from 'zod'

const RetrievedChunkSchema = z.object({
  section: z.string(),
  content: z.string(),
})

const ChatbotResponseSchema = z.object({
  answer: z.string(),
  retrieved_chunks: z.array(RetrievedChunkSchema),
  model: z.string(),
  latency_ms: z.number(),
  tokens: z.object({
    input: z.number(),
    output: z.number(),
  }),
})

export type ChatbotResponse = z.infer<typeof ChatbotResponseSchema>

export async function callEvalEndpoint(
  puppy: 'gus' | 'mitch',
  question: string,
  opts: { top_k?: number } = {}
): Promise<ChatbotResponse> {
  const baseUrl = process.env.CHATBOT_BASE_URL
  const apiKey = process.env.EVAL_API_KEY

  if (!baseUrl) throw new Error('CHATBOT_BASE_URL is not set')
  if (!apiKey) throw new Error('EVAL_API_KEY is not set')

  const response = await fetch(`${baseUrl}/api/chat/eval`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ puppy, question, ...opts }),
  })

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.error ?? `Request failed with status ${response.status}`)
  }

  const data = await response.json()
  return ChatbotResponseSchema.parse(data)
}
