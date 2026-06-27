import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'

const GroundingResultSchema = z.object({
  score: z.number().int().min(1).max(5),
  reason: z.string(),
})

export type GroundingResult = z.infer<typeof GroundingResultSchema>

export async function scoreGrounding(
  question: string,
  chunks: Array<{ section: string; content: string }>,
  answer: string
): Promise<GroundingResult> {
  const chunkText = chunks
    .map(c => `[${c.section}]\n${c.content}`)
    .join('\n\n')

  const prompt = `You are evaluating whether a chatbot answer is grounded in the retrieved context or contains hallucinated information.

RETRIEVED CONTEXT:
${chunkText}

SCORING RUBRIC:
5 - Every claim in the answer is directly supported by the context.
4 - Mostly grounded with one minor unsupported detail.
3 - Partially grounded but contains notable unsupported claims.
2 - Mostly hallucinated with only occasional grounded facts.
1 - Answer invents facts not present in the context at all.

QUESTION ASKED: ${question}
ANSWER TO EVALUATE: ${answer}

Respond with JSON only, no other text:
{"score": <integer 1-5>, "reason": "<one sentence explaining the score>"}`

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const response = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 256,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  const parsed = JSON.parse(text)
  return GroundingResultSchema.parse(parsed)
}
