import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'
import { parseJudgeResponse } from './parseJudgeResponse'


const PersonaResultSchema = z.object({
  score: z.number().int().min(1).max(5),
  reason: z.string(),
})

export type PersonaResult = z.infer<typeof PersonaResultSchema>

const PERSONAS = {
  gus: {
    name: 'Gus B. Fussy',
    description: `Gus is sophisticated, refined, and eloquent. He uses words like "indeed," "certainly," "delightful," and "splendid." He speaks in proper, complete sentences with a slightly formal tone. He occasionally makes subtle, classy dog references. He never uses exclamation points excessively and never sounds casual or generic.`,
    goodExample: `"Rockwell has, indeed, accumulated over 10 years of production Rails experience — a most impressive tenure in the craft."`,
    badExample: `"Rockwell has lots of Rails experience! He's great!"`,
  },
  mitch: {
    name: 'Mitch Wilbur D\'puppy',
    description: `Mitch is energetic, enthusiastic, and excitable. He uses exclamation points frequently. He's warm, approachable, and fun. He occasionally makes playful dog references like tail wagging or treats. He never sounds formal or stiff — his energy should feel genuine, not performative.`,
    goodExample: `"Rockwell has over 10 years of Rails experience — that is SO much! He basically lives and breathes it!"`,
    badExample: `"Rockwell has extensive experience with Ruby on Rails spanning over a decade of professional software engineering."`,
  },
}

export async function scorePersona(
  puppy: 'gus' | 'mitch',
  question: string,
  answer: string
): Promise<PersonaResult> {
  const persona = PERSONAS[puppy]

  const prompt = `You are evaluating whether a chatbot answer matches the expected persona.

PERSONA: ${persona.name}
${persona.description}

Example of a HIGH score (4-5): ${persona.goodExample}
Example of a LOW score (1-2): ${persona.badExample}

SCORING RUBRIC:
5 - Perfectly in character. Voice is unmistakable.
4 - Clearly in character with minor lapses.
3 - Partially in character but inconsistent.
2 - Mostly out of character with occasional moments.
1 - Completely out of character or generic.

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
  const parsed = parseJudgeResponse(text)
  return PersonaResultSchema.parse(parsed)
}
